import React, { useState } from 'react';
import LegalBanner from '../components/LegalBanner.jsx';

const EthicalAgreementPage = () => {
  const [accepted, setAccepted] = useState(
    sessionStorage.getItem('ethicalAccepted') === 'true'
  );

  const handleChange = (e) => {
    const value = e.target.checked;
    setAccepted(value);
    sessionStorage.setItem('ethicalAccepted', value ? 'true' : 'false');
    if (value) {
      sessionStorage.setItem('ethicalAcceptedAt', new Date().toISOString());
    } else {
      sessionStorage.removeItem('ethicalAcceptedAt');
    }
  };

  return (
    <div className="space-y-6">
      <LegalBanner />
      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Ethical Usage Agreement</h2>
        <p className="text-sm text-gray-300">
          SecurePort is a{' '}
          <span className="font-semibold text-accent">
            secure, educational cybersecurity platform
          </span>{' '}
          demonstrating TCP port scanning principles with strict ethical enforcement, authentication
          controls, logging mechanisms, and misuse prevention safeguards.
        </p>
        <div className="space-y-2 text-sm text-gray-300">
          <p className="text-danger font-semibold">
            You must read and agree to the following conditions before initiating any scan:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              I will only scan systems and networks that I own or for which I have documented,
              explicit authorization to test.
            </li>
            <li>
              I understand that unauthorized scanning may be illegal and may violate organizational
              policies or regulations.
            </li>
            <li>
              I acknowledge that SecurePort logs my activity, including targets, port ranges, and
              timestamps, for accountability and misuse prevention.
            </li>
            <li>
              I will use any insights gained purely for defense, remediation, and risk reduction,
              not for exploitation.
            </li>
          </ul>
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm text-gray-100">
          <input
            type="checkbox"
            checked={accepted}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-accent focus:ring-accent"
          />
          <span>
            <span className="font-semibold">
              I confirm that I have authorization to scan any system I target with SecurePort.
            </span>{' '}
            I understand that unauthorized use is prohibited and may have legal consequences.
          </span>
        </label>
        <p className="mt-2 text-xs text-gray-400">
          The scan interface will remain disabled until this agreement is accepted. Acceptance
          timestamp is stored with each scan record.
        </p>
      </section>
    </div>
  );
};

export default EthicalAgreementPage;

