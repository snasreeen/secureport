import { prisma } from '../lib/prisma.js';
import { runTcpConnectScan, validateScanInput } from '../services/scannerService.js';

const SUSPICIOUS_RANGE_THRESHOLD = 500; // large port span
const SUSPICIOUS_RECENT_SCAN_WINDOW_MIN = 10;
const SUSPICIOUS_RECENT_SCAN_COUNT = 5;
const SUSPICIOUS_REPEATED_TARGET_WINDOW_MIN = 30;

const evaluateSuspiciousScan = async ({ userId, targetIp, startPort, endPort }) => {
  const reasons = [];
  const rangeSize = endPort - startPort + 1;

  if (rangeSize >= SUSPICIOUS_RANGE_THRESHOLD) {
    reasons.push(`Large port range (${rangeSize} ports).`);
  }

  const now = new Date();
  const recentWindowStart = new Date(
    now.getTime() - SUSPICIOUS_RECENT_SCAN_WINDOW_MIN * 60 * 1000
  );
  const recentCount = await prisma.scan.count({
    where: {
      userId,
      createdAt: { gte: recentWindowStart },
    },
  });
  if (recentCount >= SUSPICIOUS_RECENT_SCAN_COUNT) {
    reasons.push(
      `High scan frequency (${recentCount} scans in last ${SUSPICIOUS_RECENT_SCAN_WINDOW_MIN} minutes).`
    );
  }

  const repeatedWindowStart = new Date(
    now.getTime() - SUSPICIOUS_REPEATED_TARGET_WINDOW_MIN * 60 * 1000
  );
  const repeatedTargetCount = await prisma.scan.count({
    where: {
      userId,
      targetIp,
      createdAt: { gte: repeatedWindowStart },
    },
  });
  if (repeatedTargetCount >= 3) {
    reasons.push(
      `Repeated target (${targetIp}) scanned ${repeatedTargetCount} times in last ${SUSPICIOUS_REPEATED_TARGET_WINDOW_MIN} minutes.`
    );
  }

  return reasons;
};

export const startScan = async (req, res, next) => {
  try {
    const { targetIp, startPort, endPort, ethicalAgreementAcceptedAt } = req.body;

    if (!ethicalAgreementAcceptedAt) {
      return res
        .status(400)
        .json({ message: 'Ethical agreement confirmation timestamp is required.' });
    }

    let ports;
    try {
      ports = validateScanInput({ targetIp, startPort, endPort });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    let lastProgress = 0;
    const openPorts = await runTcpConnectScan({
      targetIp,
      startPort: ports.s,
      endPort: ports.e,
      onProgress: ({ scanned, total }) => {
        const progress = Math.round((scanned / total) * 100);
        if (progress - lastProgress >= 10) {
          lastProgress = progress;
          // In a real-time environment, we might push progress via websockets.
        }
      },
    });

    const suspiciousReasons = await evaluateSuspiciousScan({
      userId: req.user.id,
      targetIp,
      startPort: ports.s,
      endPort: ports.e,
    });

    const log = await prisma.scan.create({
      data: {
        userId: req.user.id,
        targetIp,
        startPort: ports.s,
        endPort: ports.e,
        openPorts,
        ethicalAgreementAcceptedAt: new Date(ethicalAgreementAcceptedAt),
        suspicious: suspiciousReasons.length > 0,
        suspiciousReasons,
      },
    });

    await prisma.scanHistory.create({
      data: {
        userId: req.user.id,
        scanId: log.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'scan_created',
        metadata: {
          scanId: log.id,
          targetIp,
          startPort: ports.s,
          endPort: ports.e,
          openPortsCount: openPorts.length,
          suspicious: log.suspicious,
          suspiciousReasons,
        },
        ipAddress: req.ip,
      },
    });

    return res.json({
      scanId: log.id,
      targetIp,
      startPort: ports.s,
      endPort: ports.e,
      openPorts,
      createdAt: log.createdAt,
    });
  } catch (err) {
    return next(err);
  }
};

