
import React from 'react';

const CreditCardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={1.5}
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="6" y2="15" strokeWidth="3" strokeLinecap="round"/>
    <line x1="10" y1="15" x2="16" y2="15" />
  </svg>
);

export default CreditCardIcon;
