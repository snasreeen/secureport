import net from 'net';
import validator from 'validator';

// Basic service mapping for education (not exhaustive)
const WELL_KNOWN_SERVICES = {
  20: { name: 'FTP Data', risk: 'Medium' },
  21: { name: 'FTP Control', risk: 'Medium' },
  22: { name: 'SSH', risk: 'Medium' },
  23: { name: 'Telnet', risk: 'High' },
  25: { name: 'SMTP', risk: 'Medium' },
  53: { name: 'DNS', risk: 'Medium' },
  80: { name: 'HTTP', risk: 'Medium' },
  110: { name: 'POP3', risk: 'Medium' },
  135: { name: 'MS RPC', risk: 'High' },
  139: { name: 'NetBIOS', risk: 'High' },
  143: { name: 'IMAP', risk: 'Medium' },
  389: { name: 'LDAP', risk: 'High' },
  443: { name: 'HTTPS', risk: 'Low' },
  445: { name: 'SMB', risk: 'High' },
  8080: { name: 'HTTP Proxy', risk: 'Medium' },
  3306: { name: 'MySQL', risk: 'Medium' },
  5432: { name: 'PostgreSQL', risk: 'Medium' },
  27017: { name: 'MongoDB', risk: 'Medium' },
  3389: { name: 'RDP', risk: 'High' },
};

const MAX_PORT_RANGE = 1000;
const SCAN_TIMEOUT_MS = 3000;
const MAX_CONCURRENCY = 50;

const isPrivateIPv4 = (ip) => {
  const octets = ip.split('.').map((x) => Number(x));
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
  if (ip.startsWith('127.')) return true;
  return false;
};

const isAlwaysBlocked = (ip) => ip === '0.0.0.0' || ip === '255.255.255.255';

export const validateScanInput = ({ targetIp, startPort, endPort }) => {
  if (!validator.isIP(targetIp, 4)) {
    throw new Error('Target IP must be a valid IPv4 address.');
  }

  if (isAlwaysBlocked(targetIp)) {
    throw new Error('Scanning this IP address is not permitted by this platform.');
  }

  const allowPrivateScan =
    process.env.ALLOW_PRIVATE_SCAN === 'true' && process.env.NODE_ENV !== 'production';

  if (!allowPrivateScan && isPrivateIPv4(targetIp)) {
    throw new Error('Scanning this IP range is not permitted by this platform.');
  }

  const s = Number(startPort);
  const e = Number(endPort);

  if (!Number.isInteger(s) || !Number.isInteger(e)) {
    throw new Error('Ports must be integers.');
  }
  if (s < 1 || e > 65535 || s > e) {
    throw new Error('Port range must be between 1 and 65535 and start <= end.');
  }

  const rangeSize = e - s + 1;
  if (rangeSize > MAX_PORT_RANGE) {
    throw new Error(`Maximum ${MAX_PORT_RANGE} ports per scan are allowed.`);
  }

  if (s === 1 && e === 65535) {
    throw new Error('Full range 1–65535 scans are not allowed.');
  }

  // Block privileged system ports only scans for demonstration (1–1023) in production
  if (process.env.NODE_ENV === 'production' && s < 1024 && e <= 1024) {
    throw new Error('Scanning only reserved system port ranges is not allowed.');
  }

  return { s, e };
};

const checkPortOpen = (host, port, timeoutMs) =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const safeResolve = (status) => {
      if (!resolved) {
        resolved = true;
        try {
          socket.destroy();
        } catch {
          // ignore
        }
        resolve(status);
      }
    };

    socket.setTimeout(timeoutMs);

    socket.once('connect', () => {
      safeResolve('open');
    });

    socket.once('timeout', () => {
      safeResolve('closed');
    });

    socket.once('error', () => {
      safeResolve('closed');
    });

    socket.once('close', () => {
      safeResolve('closed');
    });

    try {
      socket.connect(port, host);
    } catch {
      safeResolve('closed');
    }
  });

export const runTcpConnectScan = async ({ targetIp, startPort, endPort, onProgress }) => {
  const { s, e } = validateScanInput({ targetIp, startPort, endPort });
  const totalPorts = e - s + 1;
  const openPorts = [];
  let scanned = 0;

  const portsToScan = [];
  for (let p = s; p <= e; p += 1) {
    portsToScan.push(p);
  }

  const results = await new Promise((resolve) => {
    const statuses = {};
    let inFlight = 0;
    let index = 0;

    const launchNext = () => {
      if (index >= portsToScan.length && inFlight === 0) {
        resolve(statuses);
        return;
      }

      while (inFlight < MAX_CONCURRENCY && index < portsToScan.length) {
        const port = portsToScan[index];
        index += 1;
        inFlight += 1;

        checkPortOpen(targetIp, port, SCAN_TIMEOUT_MS)
          .then((status) => {
            statuses[port] = status;
          })
          .finally(() => {
            inFlight -= 1;
            scanned += 1;
            if (onProgress) {
              onProgress({ scanned, total: totalPorts });
            }
            launchNext();
          });
      }
    };

    launchNext();
  });

  Object.entries(results).forEach(([portStr, status]) => {
    if (status === 'open') {
      const port = Number(portStr);
      const serviceInfo = WELL_KNOWN_SERVICES[port] || { name: 'Unknown', risk: 'Low' };
      openPorts.push({
        port,
        service: serviceInfo.name,
        riskLevel: serviceInfo.risk,
      });
    }
  });

  return openPorts;
};

