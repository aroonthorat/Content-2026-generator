
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 3v3m0 12v3M5 12H2m20 0h-3M7.07 7.07l1.41 1.41M15.52 15.52l1.41 1.41M7.07 16.93l1.41-1.41M15.52 8.48l1.41-1.41M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
  </svg>
);

export default SparklesIcon;
