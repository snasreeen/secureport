import React from 'react';
import LegalBanner from '../components/LegalBanner.jsx';
import { useAuth } from '../state/AuthContext.jsx';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <LegalBanner />
      <div className="grid gap-4 md:grid-cols-3">
        <section className="card col-span-2 p-5">
          <h2 className="mb-2 text-lg font-semibold text-white">Welcome</h2>
          <p className="text-sm text-gray-300">
            {user?.email
              ? `Hello ${user.email}, SecurePort is a defensive cybersecurity education platform demonstrating how TCP port scanning works in a controlled, ethical way.`
              : 'SecurePort is a defensive cybersecurity education platform demonstrating how TCP port scanning works in a controlled, ethical way.'}
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Before running any scan, you must confirm explicit authorization to test the target
            system. The platform enforces rate limits, logs all activity, and blocks disallowed
            ranges to reduce the risk of misuse.
          </p>
        </section>
        <section className="card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Quick Start</h3>
          <ol className="list-decimal space-y-1 pl-4 text-xs text-gray-300">
            <li>Review and accept the Ethical Agreement.</li>
            <li>Navigate to the Scanner to perform an authorized TCP connect scan.</li>
            <li>Review your scan history and export records as needed.</li>
            <li>Use the AI Education section to explore defensive concepts.</li>
          </ol>
        </section>
      </div>
      <section className="card p-5">
        <h3 className="mb-2 text-sm font-semibold text-white">Platform Overview</h3>
        <div className="grid gap-4 md:grid-cols-3 text-xs text-gray-300">
          <div>
            <div className="text-gray-400">Scan Type</div>
            <div className="font-semibold text-accent">TCP Connect (Server-side)</div>
            <p className="mt-1 text-gray-400">
              All scans are executed from the backend using Node&apos;s networking stack; no raw
              scanning logic is exposed to the browser.
            </p>
          </div>
          <div>
            <div className="text-gray-400">Security Controls</div>
            <div className="font-semibold text-accent">Rate Limits &amp; Validation</div>
            <p className="mt-1 text-gray-400">
              Input validation, IP range restrictions, and per-minute rate caps help prevent abuse
              and reduce impact on remote systems.
            </p>
          </div>
          <div>
            <div className="text-gray-400">Purpose</div>
            <div className="font-semibold text-accent">Defensive Education</div>
            <p className="mt-1 text-gray-400">
              The platform focuses strictly on explaining risks and controls; it does not provide
              exploit automation or offensive tooling.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

