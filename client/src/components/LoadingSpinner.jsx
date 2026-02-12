import React from 'react';

const LoadingSpinner = ({ label }) => (
  <div className="flex items-center gap-2 text-sm text-gray-300">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    {label && <span>{label}</span>}
  </div>
);

export default LoadingSpinner;

