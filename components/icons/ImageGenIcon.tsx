
import React from 'react';

const ImageGenIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
    <path d="M12 3v3m0 0l-1.5-1.5M12 6l1.5-1.5M19 12h3m-3 0l1.5-1.5M19 12l1.5 1.5" stroke="var(--color-accent)" />
  </svg>
);

export default ImageGenIcon;
