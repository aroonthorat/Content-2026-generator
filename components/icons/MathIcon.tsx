
import React from 'react';

const MathIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M4 19l4-14l4 14l4-14" />
    <path d="M19 14h-3.5" />
    <path d="M19 10h-3.5" />
    <path d="M5 5h14" />
    <text x="16" y="20" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">x²</text>
  </svg>
);

export default MathIcon;
