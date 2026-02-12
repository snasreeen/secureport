import React, { useEffect, useState } from 'react';
import api from '../utils/apiClient.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../state/AuthContext.jsx';

const TabButton = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
      active ? 'bg-accent text-black' : 'bg-neutral-900 text-gray-300 border border-neutral-700'
    }`}
  >
    {label}
  </button>
);

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('flagged');
  const [flagged, setFlagged] = useState([]);
  const [recent, setRecent] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async (selectedTab) => {
    setLoading(true);
    setError('');
    try {
      if (selectedTab === 'flagged') {
        const res = await api.get('/admin/flagged-scans');
        setFlagged(res.data.scans || []);
      } else if (selectedTab === 'recent') {
        const res = await api.get('/admin/recent-scans');
        setRecent(res.data.scans || []);
      } else if (selectedTab === 'audit') {
        const res = await api.get('/admin/audit-logs');
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to load admin monitoring data. Ensure you have admin permissions.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  if (user?.role !== 'admin') {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white">Admin Monitoring</h2>
        <p className="mt-2 text-sm text-danger">
          You do not have permission to access this area. Admin role is required.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Admin Monitoring</h2>
            <p className="text-xs text-gray-400">
              Review suspicious scans, overall scan activity, and audit logs. Use this information
              to detect and respond to potential misuse of the platform.
            </p>
          </div>
          <div className="flex gap-2">
            <TabButton label="Flagged Scans" active={tab === 'flagged'} onClick={() => setTab('flagged')} />
            <TabButton label="Recent Scans" active={tab === 'recent'} onClick={() => setTab('recent')} />
            <TabButton label="Audit Logs" active={tab === 'audit'} onClick={() => setTab('audit')} />
          </div>
        </div>
        {error && <div className="error-text">{error}</div>}
        {loading && <LoadingSpinner label="Loading admin data..." />}

        {!loading && tab === 'flagged' && (
          <div className="space-y-3 text-xs text-gray-200">
            {flagged.length === 0 ? (
              <p className="text-gray-500">
                No scans are currently flagged as suspicious according to the server-side rules.
              </p>
            ) : (
              flagged.map((scan) => (
                <div
                  key={scan._id}
                  className="rounded-lg border border-danger/40 bg-danger/5 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-accent font-semibold">{scan.targetIp}</span>
                      <span className="text-gray-300">
                        Ports {scan.startPort}–{scan.endPort}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      User: {scan.user?.email || 'Unknown'} ·{' '}
                      {new Date(scan.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    <div>
                      <div className="text-[11px] text-gray-400">Reasons</div>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {(scan.suspiciousReasons || []).map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400">Open Ports</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {scan.openPorts?.map((p) => (
                          <span
                            key={p.port}
                            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[11px]"
                          >
                            {p.port} ({p.service})
                          </span>
                        )) || 'None'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400">Ethical Agreement</div>
                      <div className="mt-1 text-[11px] text-gray-400">
                        Accepted at{' '}
                        {scan.ethicalAgreementAcceptedAt
                          ? new Date(scan.ethicalAgreementAcceptedAt).toLocaleString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && tab === 'recent' && (
          <div className="space-y-2 text-xs text-gray-200">
            {recent.length === 0 ? (
              <p className="text-gray-500">No scans recorded.</p>
            ) : (
              <div className="max-h-[420px] overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/60">
                <table className="min-w-full text-left text-[11px]">
                  <thead className="border-b border-neutral-800 text-gray-400">
                    <tr>
                      <th className="px-3 py-2">When</th>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Target</th>
                      <th className="px-3 py-2">Ports</th>
                      <th className="px-3 py-2">Open</th>
                      <th className="px-3 py-2">Suspicious</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((scan) => (
                      <tr key={scan._id} className="border-b border-neutral-900">
                        <td className="px-3 py-2">
                          {new Date(scan.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-2">{scan.user?.email || 'Unknown'}</td>
                        <td className="px-3 py-2">{scan.targetIp}</td>
                        <td className="px-3 py-2">
                          {scan.startPort}–{scan.endPort}
                        </td>
                        <td className="px-3 py-2">{scan.openPorts?.length || 0}</td>
                        <td className="px-3 py-2">
                          {scan.suspicious ? (
                            <span className="text-danger font-semibold">Yes</span>
                          ) : (
                            <span className="text-accent">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'audit' && (
          <div className="space-y-2 text-[11px] text-gray-200">
            {logs.length === 0 ? (
              <p className="text-gray-500">No audit events recorded.</p>
            ) : (
              <div className="max-h-[420px] overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/60">
                <table className="min-w-full text-left">
                  <thead className="border-b border-neutral-800 text-gray-400">
                    <tr>
                      <th className="px-3 py-2">When</th>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Action</th>
                      <th className="px-3 py-2">Details</th>
                      <th className="px-3 py-2">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id} className="border-b border-neutral-900">
                        <td className="px-3 py-2">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-2">{log.user?.email || 'System'}</td>
                        <td className="px-3 py-2">{log.action}</td>
                        <td className="px-3 py-2">
                          <code className="rounded bg-neutral-900 px-2 py-1 text-[10px] text-gray-300">
                            {JSON.stringify(log.metadata || {}, null, 0)}
                          </code>
                        </td>
                        <td className="px-3 py-2">{log.ipAddress || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboardPage;

