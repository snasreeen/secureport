import React from 'react';

const LegalBanner = () => (
  <div className="card border-danger/40 bg-danger/5 p-4 text-sm text-gray-100">
    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-danger">
      Legal & Ethical Use Only
    </div>
    <p className="text-xs leading-relaxed text-gray-200">
      SecurePort is an educational platform designed to demonstrate TCP port scanning principles.
      You may only scan systems you own or are explicitly authorized to test. Unauthorized scanning
      may be illegal. All scans are logged with user identity, timestamps, and targets.
    </p>
  </div>
);

export default LegalBanner;

