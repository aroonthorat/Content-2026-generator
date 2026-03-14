import React from 'react';

const ClapboardIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6l4-4M8 6l4-4M12 6l4-4M16 6l4-4" />
    <rect x="2" y="6" width="20" height="16" rx="2" strokeWidth={1.5} />
  </svg>
);

export default ClapboardIcon;
