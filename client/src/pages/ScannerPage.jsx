import React, { useMemo, useState } from 'react';
import api from '../utils/apiClient.js';
import LegalBanner from '../components/LegalBanner.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const ScannerPage = () => {
  const [targetIp, setTargetIp] = useState('');
  const [startPort, setStartPort] = useState('');
  const [endPort, setEndPort] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | running | completed | failed
  const [meta, setMeta] = useState(null); // { totalPorts, durationMs }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    setMeta(null);

    const ethicalAccepted = sessionStorage.getItem('ethicalAccepted') === 'true';
    const ethicalAcceptedAt = sessionStorage.getItem('ethicalAcceptedAt');

    if (!ethicalAccepted || !ethicalAcceptedAt) {
      setError('You must accept the Ethical Usage Agreement before scanning.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus('running');

    try {
      const totalPorts =
        Number(endPort) && Number(startPort)
          ? Number(endPort) - Number(startPort) + 1
          : 0;

      const startedAt = Date.now();

      const res = await api.post('/scans', {
        targetIp,
        startPort: Number(startPort),
        endPort: Number(endPort),
        ethicalAgreementAcceptedAt: ethicalAcceptedAt,
      });

      setProgress(100);
      setResults(res.data.openPorts || []);
      const durationMs = Date.now() - startedAt;
      setMeta({
        totalPorts,
        durationMs,
      });
      setStatus('completed');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Scan failed. Please verify the target and range, and try again.';
      setError(msg);
      setProgress(0);
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    if (!meta) return null;
    const openCount = results.length;
    const totalPorts = meta.totalPorts || 0;
    const closedCount = totalPorts > 0 ? Math.max(totalPorts - openCount, 0) : 0;
    const filteredCount = 0; // TCP connect scan cannot reliably distinguish filtered vs closed here
    return {
      openCount,
      closedCount,
      filteredCount,
      totalPorts,
      durationSeconds: (meta.durationMs / 1000).toFixed(2),
    };
  }, [meta, results]);

  const statusBadge = () => {
    if (status === 'running') {
      return (
        <span className="status-badge-running">
          <span className="text-[10px]">🟡</span>
          Running
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="status-badge-completed">
          <span className="text-[10px]">🟢</span>
          Completed
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="status-badge-failed">
          <span className="text-[10px]">🔴</span>
          Failed
        </span>
      );
    }
    return (
      <span className="status-badge-pending">
        <span className="text-[10px]">🔵</span>
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <LegalBanner />
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-textPrimary">TCP Connect Scanner</h2>
            <p className="text-xs text-textSecondary">
              Server-side TCP connect scans with strict rate limiting and input validation.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px]">
            {statusBadge()}
            {meta && (
              <span className="text-textSecondary">
                {summary?.totalPorts || 0} ports targeted
              </span>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4 md:items-end">
          <div className="md:col-span-2">
            <label className="label" htmlFor="targetIp">
              Target IPv4 Address
            </label>
            <input
              id="targetIp"
              type="text"
              className="input"
              placeholder="e.g. 203.0.113.10"
              value={targetIp}
              onChange={(e) => setTargetIp(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="startPort">
              Start Port
            </label>
            <input
              id="startPort"
              type="number"
              min={1}
              max={65535}
              className="input"
              value={startPort}
              onChange={(e) => setStartPort(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="endPort">
              End Port (max 1000 ports per scan)
            </label>
            <input
              id="endPort"
              type="number"
              min={1}
              max={65535}
              className="input"
              value={endPort}
              onChange={(e) => setEndPort(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-4 flex items-center justify-between">
            <div className="flex-1 space-y-1">
              {loading && (
                <div className="mb-1">
                  <LoadingSpinner label="Running TCP connect scan..." />
                </div>
              )}
              {(loading || progress > 0) && (
                <>
                  <div className="progress-track">
                    <div
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-textSecondary">
                    <span>{progress.toFixed(0)}%</span>
                    {meta && (
                      <span>
                        Scanned {meta.totalPorts ? Math.min(meta.totalPorts, progress / 100 * meta.totalPorts).toFixed(0) : 0}{' '}
                        / {meta.totalPorts} ports
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary ml-4"
              disabled={loading}
            >
              Start Scan
            </button>
          </div>
        </form>
        {error && <div className="error-card">{error}</div>}
      </section>
      <section className="card p-6">
        <h3 className="mb-3 text-sm font-semibold text-textPrimary">Scan Results</h3>
        {summary && (
          <div className="mb-4 grid gap-3 text-[11px] text-textSecondary md:grid-cols-4">
            <div className="rounded-lg bg-black/40 border border-emerald-900/60 p-3">
              <div className="text-[10px] uppercase tracking-wide text-textSecondary/70">
                Total Ports
              </div>
              <div className="mt-1 text-lg font-semibold text-accent">
                {summary.totalPorts}
              </div>
            </div>
            <div className="rounded-lg bg-black/40 border border-emerald-900/60 p-3">
              <div className="text-[10px] uppercase tracking-wide text-textSecondary/70">
                Open Ports
              </div>
              <div className="mt-1 text-lg font-semibold text-accent">
                {summary.openCount}
              </div>
            </div>
            <div className="rounded-lg bg-black/40 border border-emerald-900/60 p-3">
              <div className="text-[10px] uppercase tracking-wide text-textSecondary/70">
                Closed / Unreachable
              </div>
              <div className="mt-1 text-lg font-semibold text-textSecondary">
                {summary.closedCount}
              </div>
            </div>
            <div className="rounded-lg bg-black/40 border border-emerald-900/60 p-3">
              <div className="text-[10px] uppercase tracking-wide text-textSecondary/70">
                Duration
              </div>
              <div className="mt-1 text-lg font-semibold text-textSecondary">
                {summary.durationSeconds}s
              </div>
            </div>
          </div>
        )}
        {results.length === 0 ? (
          <p className="text-xs text-textSecondary">
            No open ports detected in the specified range. This can be expected on hardened systems,
            or you may need to adjust the authorized target and range.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-textPrimary">
              <thead className="border-b border-emerald-900 text-[11px] uppercase tracking-wide text-textSecondary">
                <tr>
                  <th className="px-3 py-2">Port</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.port} className="border-b border-emerald-950/60 hover:bg-emerald-900/10">
                    <td className="px-3 py-2 text-sm">{r.port}</td>
                    <td className="px-3 py-2 text-sm text-accent font-medium">Open</td>
                    <td className="px-3 py-2 text-sm">
                      <span className="relative group cursor-help">
                        {r.service}
                        <span className="pointer-events-none absolute z-10 mt-1 hidden w-56 rounded-md border border-emerald-800 bg-black/90 p-2 text-[10px] text-textSecondary shadow-glow-soft group-hover:block">
                          Common service on this port. Always validate and harden exposed services
                          according to your organization&apos;s policies.
                        </span>
                      </span>
                    </td>
                    <td
                      className={`px-3 py-2 text-sm font-medium ${
                        r.riskLevel === 'High'
                          ? 'text-danger'
                          : r.riskLevel === 'Medium'
                          ? 'text-yellow-400'
                          : 'text-accent'
                      }`}
                    >
                      {r.riskLevel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[11px] text-gray-500">
          Detected services and risk levels are indicative and simplified for educational purposes.
          Always perform a full risk assessment and follow your organization&apos;s policies.
        </p>
      </section>
    </div>
  );
};

export default ScannerPage;

