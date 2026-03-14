
import React from 'react';

const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 4l6 2l-6 2l-2 6l-2-6l-6-2l6-2l2-6z" />
    <line x1="2" y1="22" x2="6.5" y2="17.5" />
    <line x1="9" y1="15" x2="9" y2="15" />
    <path d="M19 13l2 2l-2 2l-2-2z" />
  </svg>
);

export default WandIcon;
