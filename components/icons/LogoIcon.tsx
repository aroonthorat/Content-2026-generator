
import React from 'react';
import { LogoVariant } from '../../types';

interface LogoIconProps {
  className?: string;
  variant?: LogoVariant;
}

const LogoIcon: React.FC<LogoIconProps> = ({ className, variant = 'DEFAULT' }) => {
  const renderVariant = () => {
    switch (variant) {
      case 'ATOM':
        return (
          <g strokeWidth="3" fill="none" strokeLinecap="round">
            <circle cx="50" cy="50" r="10" fill="var(--color-primary)" stroke="none" />
            <ellipse cx="50" cy="50" rx="40" ry="12" stroke="var(--color-accent)" transform="rotate(0 50 50)" />
            <ellipse cx="50" cy="50" rx="40" ry="12" stroke="var(--color-secondary)" transform="rotate(60 50 50)" />
            <ellipse cx="50" cy="50" rx="40" ry="12" stroke="var(--color-primary)" transform="rotate(120 50 50)" />
            <circle cx="15" cy="45" r="3" fill="var(--color-accent)" stroke="none" />
            <circle cx="85" cy="55" r="3" fill="var(--color-secondary)" stroke="none" />
          </g>
        );
      case 'BRAIN':
        return (
          <g strokeWidth="3" fill="none" stroke="var(--color-primary)" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 25 C 30 15, 10 30, 15 55 C 10 75, 30 90, 48 85" stroke="var(--color-secondary)" />
            <path d="M52 25 C 70 15, 90 30, 85 55 C 90 75, 70 90, 52 85" stroke="var(--color-primary)" />
            <path d="M50 25 V 85" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="30" cy="45" r="2" fill="var(--color-text-main)" stroke="none" />
            <circle cx="70" cy="45" r="2" fill="var(--color-text-main)" stroke="none" />
            <path d="M30 45 L 40 60 L 25 70" strokeWidth="2" opacity="0.6"/>
            <path d="M70 45 L 60 60 L 75 70" strokeWidth="2" opacity="0.6"/>
          </g>
        );
      case 'BOOK':
        return (
          <g strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 30 Q 50 40, 80 30 V 80 Q 50 90, 20 80 Z" stroke="var(--color-secondary)" fill="var(--color-surface)" />
            <path d="M50 40 V 90" stroke="var(--color-border)" strokeWidth="2" />
            <path d="M30 50 H 45" stroke="var(--color-text-sub)" strokeWidth="2" />
            <path d="M30 60 H 45" stroke="var(--color-text-sub)" strokeWidth="2" />
            <path d="M30 70 H 40" stroke="var(--color-text-sub)" strokeWidth="2" />
            <path d="M55 50 H 70" stroke="var(--color-text-sub)" strokeWidth="2" />
            <path d="M55 60 H 70" stroke="var(--color-text-sub)" strokeWidth="2" />
            <circle cx="80" cy="20" r="8" fill="var(--color-accent)" stroke="none" opacity="0.8" />
            <path d="M80 20 L 70 35" stroke="var(--color-accent)" strokeWidth="2" />
          </g>
        );
      case 'ROBOT':
        return (
          <g strokeWidth="3" fill="none" stroke="var(--color-primary)" strokeLinecap="round" strokeLinejoin="round">
            <rect x="25" y="30" width="50" height="45" rx="8" fill="var(--color-surface)" stroke="var(--color-primary)" />
            <path d="M35 30 V 15" stroke="var(--color-secondary)" />
            <path d="M65 30 V 15" stroke="var(--color-secondary)" />
            <circle cx="35" cy="10" r="5" fill="var(--color-accent)" stroke="none" />
            <circle cx="65" cy="10" r="5" fill="var(--color-accent)" stroke="none" />
            <circle cx="40" cy="50" r="6" fill="var(--color-secondary)" stroke="none" />
            <circle cx="60" cy="50" r="6" fill="var(--color-secondary)" stroke="none" />
            <path d="M40 70 H 60" stroke="var(--color-text-main)" strokeWidth="3" />
          </g>
        );
      case 'SPARK':
        return (
          <g strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
             <path d="M50 10 L 50 90" stroke="var(--color-primary)" strokeWidth="2" opacity="0.3" />
             <path d="M10 50 L 90 50" stroke="var(--color-primary)" strokeWidth="2" opacity="0.3" />
             <path d="M50 15 L 60 40 L 85 50 L 60 60 L 50 85 L 40 60 L 15 50 L 40 40 Z" fill="var(--color-accent)" stroke="var(--color-secondary)" />
             <circle cx="50" cy="50" r="5" fill="white" stroke="none" />
          </g>
        );
      case 'DEFAULT':
      default:
        return (
          <g fill="none">
             <defs>
               <linearGradient id="synapseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="var(--color-primary)" />
                 <stop offset="100%" stopColor="var(--color-secondary)" />
               </linearGradient>
             </defs>
             
             {/* Central Connection Lines - S Shape */}
             <path 
               d="M 25 75 C 25 25, 75 75, 75 25" 
               stroke="url(#synapseGradient)" 
               strokeWidth="8" 
               strokeLinecap="round" 
               filter="drop-shadow(0px 0px 4px var(--color-primary))"
             />
             
             {/* Main Nodes */}
             <circle cx="25" cy="75" r="12" fill="var(--color-primary)" />
             <circle cx="75" cy="25" r="12" fill="var(--color-secondary)" />
             
             {/* Outer Rings */}
             <circle cx="75" cy="25" r="18" stroke="var(--color-secondary)" strokeWidth="2" opacity="0.4" strokeDasharray="4 2" />
             <circle cx="25" cy="75" r="18" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" strokeDasharray="4 2" />
             
             {/* Connecting Particles */}
             <circle cx="50" cy="50" r="5" fill="var(--color-accent)" />
             <line x1="75" y1="25" x2="85" y2="15" stroke="var(--color-text-main)" strokeWidth="2" opacity="0.5" />
             <circle cx="85" cy="15" r="3" fill="var(--color-text-main)" />
             
             <line x1="25" y1="75" x2="15" y2="85" stroke="var(--color-text-main)" strokeWidth="2" opacity="0.5" />
             <circle cx="15" cy="85" r="3" fill="var(--color-text-main)" />
          </g>
        );
    }
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} aria-label="App Logo">
      {renderVariant()}
    </svg>
  );
};

export default LogoIcon;
