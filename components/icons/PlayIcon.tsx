
import React from 'react';

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || "h-6 w-6 text-white"}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      d="M6.3 4.91C5.36 4.35 4 5.09 4 6.17v11.66c0 1.08 1.36 1.82 2.3 1.26l9.92-5.83c.94-.55.94-1.97 0-2.52L6.3 4.91Z"
    />
  </svg>
);

export default PlayIcon;
