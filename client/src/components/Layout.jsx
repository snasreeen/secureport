import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import api from '../utils/apiClient.js';

const navLinkClasses = ({ isActive }) =>
  `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-accent text-black' : 'text-gray-300 hover:bg-neutral-800'
  }`;

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [environment, setEnvironment] = useState(null);

  useEffect(() => {
    const loadEnv = async () => {
      try {
        const res = await api.get('/health');
        setEnvironment(res.data?.environment || null);
      } catch {
        setEnvironment(null);
      }
    };
    loadEnv();
  }, []);

  const envLabel =
    environment === 'production' ? 'Production Mode' : environment ? 'Development Mode' : null;

  return (
    <div className="flex min-h-screen bg-background text-textPrimary">
      <aside className="flex w-64 flex-col border-r border-emerald-900 bg-black/40">
        <div className="flex items-center justify-between px-4 py-4 border-b border-emerald-900/80">
          <div>
            <div className="text-sm font-semibold text-accent tracking-wide">SecurePort</div>
            <div className="text-[11px] text-textSecondary">
              Ethical TCP Port Scanning
            </div>
          </div>
          {envLabel && (
            <span
              className={`badge-env ${
                environment === 'production' ? 'badge-env-prod' : ''
              }`}
            >
              {envLabel}
            </span>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <NavLink to="/dashboard" className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/ethical-agreement" className={navLinkClasses}>
            Ethical Agreement
          </NavLink>
          <NavLink to="/scanner" className={navLinkClasses}>
            Scanner
          </NavLink>
          <NavLink to="/history" className={navLinkClasses}>
            Scan History
          </NavLink>
          <NavLink to="/education" className={navLinkClasses}>
            AI Education
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClasses}>
              Admin Monitoring
            </NavLink>
          )}
        </nav>
        <div className="border-t border-emerald-900/80 p-4 text-xs text-textSecondary space-y-2">
          {user && (
            <div className="flex items-center justify-between">
              <span>{user.email}</span>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-textSecondary hover:text-danger"
              >
                Logout
              </button>
            </div>
          )}
          <p className="text-[11px] leading-snug text-danger">
            Use only on systems you own or are explicitly authorized to test. All activity is logged
            and monitored for abuse.
          </p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

