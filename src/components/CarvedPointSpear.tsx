import React from 'react';

/**
 * CarvedPointSpear
 * Authentic reproduction of the handcrafted wood spear points from VK.jpeg.
 * 
 * Features:
 * - Scalloped circular flute base (oyuk kuyu yatağı) for checkers
 * - Elongated tapered blonde wood inlay spear (akçaağaç kakma)
 * - Carved trefoil / fleur-de-lis finial crown (üç yapraklı lale motifi) at the spear tip
 * - Warm walnut shading and fine woodcraft chiseled contours
 */
interface CarvedPointSpearProps {
  pointNumber: number;
  isTopRow: boolean;
  isPointDark: boolean;
}

export const CarvedPointSpear: React.FC<CarvedPointSpearProps> = ({
  pointNumber,
  isTopRow,
  isPointDark,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <svg
        viewBox="0 0 100 240"
        preserveAspectRatio="none"
        className="w-full h-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* Light Blonde Wood Inlay (Akçaağaç / Şimşir) */}
          <linearGradient id={`spear-light-${pointNumber}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d2ad72" />
            <stop offset="30%" stopColor="#f7e8c8" />
            <stop offset="70%" stopColor="#faecd2" />
            <stop offset="100%" stopColor="#caa468" />
          </linearGradient>

          {/* Warm Amber-Walnut Inlay for alternating points */}
          <linearGradient id={`spear-warm-${pointNumber}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a36e3e" />
            <stop offset="30%" stopColor="#e3b684" />
            <stop offset="70%" stopColor="#ebbda1" />
            <stop offset="100%" stopColor="#8d5628" />
          </linearGradient>

          {/* Chiseled drop shadow */}
          <filter id={`carve-shadow-${pointNumber}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0.5" dy="1" stdDeviation="0.8" floodColor="#120603" floodOpacity="0.85" />
          </filter>
        </defs>

        {isTopRow ? (
          /* TOP ROW POINTS: Spear points DOWN toward center, base at TOP */
          <g>
            {/* Scalloped Semicircular Flute Base at top border */}
            <path
              d="M 6,0 C 6,18 94,18 94,0 Z"
              fill="#220e06"
              opacity="0.85"
            />

            {/* Main Tapered Spear Body */}
            <polygon
              points="14,2 86,2 50,188"
              fill={isPointDark ? `url(#spear-warm-${pointNumber})` : `url(#spear-light-${pointNumber})`}
              stroke="#241107"
              strokeWidth="0.8"
            />

            {/* Longitudinal Center Grain Line */}
            <line
              x1="50"
              y1="4"
              x2="50"
              y2="185"
              stroke="#8a5c2d"
              strokeWidth="0.75"
              opacity="0.5"
            />

            {/* Carved Fleur-de-lis / Trefoil Finial Crown at the Tip (Facing Downwards) */}
            <g transform="translate(50, 192)">
              {/* Center Spearhead Leaf */}
              <path
                d="M 0,26 C -6,14 -4,4 0,0 C 4,4 6,14 0,26 Z"
                fill={isPointDark ? `url(#spear-warm-${pointNumber})` : `url(#spear-light-${pointNumber})`}
                stroke="#241107"
                strokeWidth="0.8"
              />
              {/* Left Outward Curling Leaf */}
              <path
                d="M -1,8 C -10,8 -16,14 -12,20 C -9,22 -4,18 0,14 Z"
                fill={isPointDark ? `url(#spear-warm-${pointNumber})` : `url(#spear-light-${pointNumber})`}
                stroke="#241107"
                strokeWidth="0.8"
              />
              {/* Right Outward Curling Leaf */}
              <path
                d="M 1,8 C 10,8 16,14 12,20 C 9,22 4,18 0,14 Z"
                fill={isPointDark ? `url(#spear-warm-${pointNumber})` : `url(#spear-light-${pointNumber})`}
                stroke="#241107"
                strokeWidth="0.8"
              />
              {/* Small Collar Ring */}
              <ellipse cx="0" cy="5" rx="5" ry="2" fill="#2d150b" />
            </g>
          </g>
        ) : (
          /* BOTTOM ROW POINTS: Spear points UP toward center, base at BOTTOM */
          <g>
            {/* Scalloped Semicircular Flute Base at bottom border */}
            <path
              d="M 6,240 C 6,222 94,222 94,240 Z"
              fill="#220e06"
              opacity="0.85"
            />

            {/* Main Tapered Spear Body */}
            <polygon
              points="14,238 86,238 50,52"
              fill={isPointDark ? `url(#spear-warm-${pointNumber})` : `url(#spear-light-${pointNumber})`}
              stroke="#241107"
              strokeWidth="0.8"
            />

            {/* Longitudinal Center Grain Line */}
            <line
              x1="50"
              y1="236"
              x2="50"
              y2="55"
              stroke="#8a5c2d"
              strokeWidth="0.75"
              opacity="0.5"
            />

            {/* Carved Fleur-de-lis / Trefoil Finial Crown at the Tip (Facing Upwards) */}
            <g transform="translate(50, 48)">
              {/* Center Spearhead Leaf */}
              <path
                d="M 0,-26 C -6,-14 -4,-4 0,0 C 4,-4 6,-14 0,-26 Z"
                fill={isPointDark ? `url(#spear-warm-${pointNumber})` : `url(#spear-light-${pointNumber})`}
                stroke="#241107"
                strokeWidth="0.8"
              />
              {/* Left Outward Curling Leaf */}
              <path
                d="M -1,-8 C -10,-8 -16,-14 -12,-20 C -9,-22 -4,-18 0,-14 Z"
                fill={isPointDark ? `url(#spear-warm-${pointNumber})` : `url(#spear-light-${pointNumber})`}
                stroke="#241107"
                strokeWidth="0.8"
              />
              {/* Right Outward Curling Leaf */}
              <path
                d="M 1,-8 C 10,-8 16,-14 12,-20 C 9,-22 4,-18 0,-14 Z"
                fill={isPointDark ? `url(#spear-warm-${pointNumber})` : `url(#spear-light-${pointNumber})`}
                stroke="#241107"
                strokeWidth="0.8"
              />
              {/* Small Collar Ring */}
              <ellipse cx="0" cy="-5" rx="5" ry="2" fill="#2d150b" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
