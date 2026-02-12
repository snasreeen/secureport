import React, { useEffect, useState } from 'react';
import api from '../utils/apiClient.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const HistoryPage = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const loadHistory = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/history');
      setScans(res.data.scans || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to load scan history.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setScans((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to delete scan record.';
      setError(msg);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/history/export/json', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'secureport-history.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to export scan history.';
      setError(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Scan History</h2>
            <p className="text-xs text-gray-400">
              View and manage your previous scans. Records include targets, port ranges, open ports,
              and ethical agreement timestamps.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={loadHistory}
              disabled={loading}
            >
              Refresh
            </button>
            <button
              type="button"
              className="btn-primary text-xs"
              onClick={handleExport}
              disabled={exporting || scans.length === 0}
            >
              {exporting ? 'Exporting…' : 'Export JSON'}
            </button>
          </div>
        </div>
        {error && <div className="error-text">{error}</div>}
        {loading ? (
          <LoadingSpinner label="Loading scan history..." />
        ) : scans.length === 0 ? (
          <p className="text-xs text-gray-500">
            No scans recorded yet. Once you perform an authorized scan, it will appear here with its
            details.
          </p>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <div
                key={scan._id}
                className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4 text-xs text-gray-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-accent font-semibold">{scan.targetIp}</span>
                    <span className="text-gray-400">
                      Ports {scan.startPort}–{scan.endPort}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">
                      {new Date(scan.createdAt).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      className="text-[11px] text-danger hover:underline"
                      onClick={() => handleDelete(scan._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div>
                    <div className="text-[11px] text-gray-500">Open Ports</div>
                    {scan.openPorts?.length ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {scan.openPorts.map((p) => (
                          <span
                            key={p.port}
                            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[11px]"
                          >
                            {p.port} ({p.service})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 text-[11px] text-gray-500">None detected</div>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500">Ethical Agreement</div>
                    <div className="mt-1 text-[11px] text-gray-400">
                      Accepted at{' '}
                      {scan.ethicalAgreementAcceptedAt
                        ? new Date(scan.ethicalAgreementAcceptedAt).toLocaleString()
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500">Notes</div>
                    <div className="mt-1 text-[11px] text-gray-500">
                      Records are stored for educational tracking and accountability. Delete entries
                      you no longer need.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HistoryPage;

