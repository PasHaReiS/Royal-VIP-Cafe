import React from 'react';

/**
 * CarvedBrassHinge
 * Exact reproduction of the ornate antique Ottoman/Caucasian filigree brass hinge
 * seen connecting the two board wings along the center bar in VK.jpeg.
 */
export const CarvedBrassHinge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative select-none pointer-events-none w-9 h-11 sm:w-11 sm:h-13 flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
      >
        <defs>
          <linearGradient id="brass-aged-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3de9a" />
            <stop offset="35%" stopColor="#c89f55" />
            <stop offset="70%" stopColor="#966d2c" />
            <stop offset="100%" stopColor="#5e4115" />
          </linearGradient>

          <linearGradient id="brass-pin" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#543c16" />
            <stop offset="50%" stopColor="#e8cf8d" />
            <stop offset="100%" stopColor="#3d2a0d" />
          </linearGradient>

          <radialGradient id="screw-head" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#e3c683" />
            <stop offset="60%" stopColor="#876025" />
            <stop offset="100%" stopColor="#3b270a" />
          </radialGradient>
        </defs>

        {/* Left Wing Plate (Ornate Scalloped Bracket with filigree cutouts) */}
        <path
          d="M 47,12 C 40,12 28,14 20,24 C 14,32 16,42 22,50 C 15,58 14,68 20,76 C 28,86 40,88 47,88 Z"
          fill="url(#brass-aged-gold)"
          stroke="#3d280d"
          strokeWidth="1.5"
        />

        {/* Right Wing Plate (Symmetrical Scalloped Bracket) */}
        <path
          d="M 53,12 C 60,12 72,14 80,24 C 86,32 84,42 78,50 C 85,58 86,68 80,76 C 72,86 60,88 53,88 Z"
          fill="url(#brass-aged-gold)"
          stroke="#3d280d"
          strokeWidth="1.5"
        />

        {/* Filigree Cutouts (Openwork Lace Carvings) */}
        <ellipse cx="32" cy="34" rx="4.5" ry="6" fill="#1b0e06" opacity="0.9" />
        <ellipse cx="68" cy="34" rx="4.5" ry="6" fill="#1b0e06" opacity="0.9" />
        <ellipse cx="32" cy="66" rx="4.5" ry="6" fill="#1b0e06" opacity="0.9" />
        <ellipse cx="68" cy="66" rx="4.5" ry="6" fill="#1b0e06" opacity="0.9" />
        <circle cx="23" cy="50" r="3.5" fill="#1b0e06" opacity="0.9" />
        <circle cx="77" cy="50" r="3.5" fill="#1b0e06" opacity="0.9" />

        {/* Brass Screws (Countersunk Slotted Screws) */}
        <g>
          {/* Top-Left screw */}
          <circle cx="38" cy="22" r="3.5" fill="url(#screw-head)" stroke="#2b1a07" strokeWidth="0.8" />
          <line x1="36" y1="20" x2="40" y2="24" stroke="#1d1003" strokeWidth="1" />

          {/* Bottom-Left screw */}
          <circle cx="38" cy="78" r="3.5" fill="url(#screw-head)" stroke="#2b1a07" strokeWidth="0.8" />
          <line x1="36" y1="76" x2="40" y2="80" stroke="#1d1003" strokeWidth="1" />

          {/* Top-Right screw */}
          <circle cx="62" cy="22" r="3.5" fill="url(#screw-head)" stroke="#2b1a07" strokeWidth="0.8" />
          <line x1="60" y1="20" x2="64" y2="24" stroke="#1d1003" strokeWidth="1" />

          {/* Bottom-Right screw */}
          <circle cx="62" cy="78" r="3.5" fill="url(#screw-head)" stroke="#2b1a07" strokeWidth="0.8" />
          <line x1="60" y1="76" x2="64" y2="80" stroke="#1d1003" strokeWidth="1" />
        </g>

        {/* Center Knuckle Cylinder Barrel (Hinge Pin) */}
        <rect
          x="46"
          y="8"
          width="8"
          height="84"
          rx="3"
          fill="url(#brass-pin)"
          stroke="#2d1d07"
          strokeWidth="1.2"
        />

        {/* Knuckle Grooves */}
        <line x1="46" y1="26" x2="54" y2="26" stroke="#251605" strokeWidth="1" />
        <line x1="46" y1="46" x2="54" y2="46" stroke="#251605" strokeWidth="1" />
        <line x1="46" y1="66" x2="54" y2="66" stroke="#251605" strokeWidth="1" />
      </svg>
    </div>
  );
};
