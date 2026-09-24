import React from 'react';

interface HelenaIstakaBackdropProps {
  className?: string;
}

export const HelenaIstakaBackdrop: React.FC<HelenaIstakaBackdropProps> = ({ className = '' }) => {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 1000 240"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Rich Walnut Grain Gradient */}
        <linearGradient id="walnutBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#431c0b" />
          <stop offset="12%" stopColor="#642f15" />
          <stop offset="35%" stopColor="#4a200d" />
          <stop offset="70%" stopColor="#321407" />
          <stop offset="100%" stopColor="#1a0802" />
        </linearGradient>

        {/* Lacquer Surface Highlight Arch */}
        <linearGradient id="lacquerSheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="25%" stopColor="rgba(255, 235, 195, 0.12)" />
          <stop offset="50%" stopColor="rgba(255, 245, 220, 0.35)" />
          <stop offset="75%" stopColor="rgba(255, 235, 195, 0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        {/* Realistic Brass Gradient */}
        <linearGradient id="brassPlate" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e5c578" />
          <stop offset="15%" stopColor="#ad8332" />
          <stop offset="50%" stopColor="#ffd885" />
          <stop offset="85%" stopColor="#875f1b" />
          <stop offset="100%" stopColor="#cda54d" />
        </linearGradient>

        {/* Mother of Pearl Rosette Gradient */}
        <radialGradient id="sedefGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#fdf7ea" />
          <stop offset="75%" stopColor="#e8d8be" />
          <stop offset="100%" stopColor="#bfa47d" />
        </radialGradient>

        {/* Deep Shelf Wood Recess */}
        <linearGradient id="shelfRecess" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0d0401" />
          <stop offset="20%" stopColor="#170702" />
          <stop offset="60%" stopColor="#220b04" />
          <stop offset="100%" stopColor="#0d0401" />
        </linearGradient>

        <filter id="shadowFilter" x="-5%" y="-5%" width="110%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.85" />
        </filter>
      </defs>

      {/* Main Oval Curved Istaka Silhouette */}
      {/* Top arc curves upward in center (from y=26 at ends to y=4 at center); Bottom arc curves downward */}
      <path
        d="M 12,28 Q 500,-12 988,28 L 992,230 Q 500,252 8,230 Z"
        fill="url(#walnutBody)"
        filter="url(#shadowFilter)"
      />

      {/* Surface Lacquer High-Gloss Arch Reflection */}
      <path
        d="M 24,30 Q 500,-2 976,30 Q 500,8 24,30 Z"
        fill="url(#lacquerSheen)"
      />

      {/* Carved Wood Rim / Top Chamfer Line */}
      <path
        d="M 14,29 Q 500,-8 986,29"
        fill="none"
        stroke="#8b451d"
        strokeWidth="3.5"
      />
      <path
        d="M 16,31 Q 500,-6 984,31"
        fill="none"
        stroke="#ffd99e"
        strokeWidth="1.2"
        opacity="0.65"
      />

      {/* ================= CENTER MOTHER-OF-PEARL & MOSAIC MEDALLION INLAY ================= */}
      {/* As shown on the Helena Wood Art okey set back and front arch */}
      <g transform="translate(500, 22)">
        {/* Carved Wood Inlay Frame */}
        <path
          d="M -130,0 C -90,-8 -40,-12 0,-12 C 40,-12 90,-8 130,0 C 90,8 40,12 0,12 C -40,12 -90,8 -130,0 Z"
          fill="#110502"
          stroke="#996515"
          strokeWidth="1.8"
        />

        {/* Left Wing Mosaic Inlay */}
        <g transform="translate(-65, 0)">
          {/* Diamond inlays */}
          <polygon points="-40,0 -32,-5 -24,0 -32,5" fill="#fcf6e8" stroke="#875f1b" strokeWidth="0.8" />
          <polygon points="-22,0 -14,-6 -6,0 -14,6" fill="#dfa13d" stroke="#5a3d0d" strokeWidth="0.8" />
          <polygon points="-4,0 4,-5 12,0 4,5" fill="#fcf6e8" stroke="#875f1b" strokeWidth="0.8" />
          {/* Connecting brass inlay line */}
          <line x1="-48" y1="0" x2="16" y2="0" stroke="#ffd700" strokeWidth="0.8" opacity="0.7" />
        </g>

        {/* Central Rosette / Sedef Yıldızı (Mother of Pearl Flower Star) */}
        <circle cx="0" cy="0" r="13" fill="url(#sedefGlow)" stroke="#996515" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="8" fill="#150602" stroke="#d4af37" strokeWidth="1" />
        {/* 8-Pointed Star Inlay */}
        <path
          d="M 0,-6 L 1.8,-1.8 L 6,0 L 1.8,1.8 L 0,6 L -1.8,1.8 L -6,0 L -1.8,-1.8 Z"
          fill="#fbf5e6"
        />

        {/* Right Wing Mosaic Inlay */}
        <g transform="translate(65, 0)">
          <polygon points="-12,0 -4,-5 4,0 -4,5" fill="#fcf6e8" stroke="#875f1b" strokeWidth="0.8" />
          <polygon points="6,0 14,-6 22,0 14,6" fill="#dfa13d" stroke="#5a3d0d" strokeWidth="0.8" />
          <polygon points="24,0 32,-5 40,0 32,5" fill="#fcf6e8" stroke="#875f1b" strokeWidth="0.8" />
          <line x1="-16" y1="0" x2="48" y2="0" stroke="#ffd700" strokeWidth="0.8" opacity="0.7" />
        </g>
      </g>

      {/* ================= LEFT BRASS PLATE WITH ENGRAVED HELENA ================= */}
      <g transform="translate(6, 26)">
        {/* Brass Plate Body with Curved Outer Contour */}
        <rect x="0" y="0" width="16" height="200" rx="3.5" fill="url(#brassPlate)" stroke="#533b11" strokeWidth="1.2" />
        {/* Top & Bottom Screws */}
        <circle cx="8" cy="12" r="3" fill="#2d1d07" stroke="#fff3b0" strokeWidth="0.6" />
        <line x1="6" y1="12" x2="10" y2="12" stroke="#fff3b0" strokeWidth="0.8" />

        <circle cx="8" cy="188" r="3" fill="#2d1d07" stroke="#fff3b0" strokeWidth="0.6" />
        <line x1="6" y1="188" x2="10" y2="188" stroke="#fff3b0" strokeWidth="0.8" />

        {/* Vertical Engraved HELENA Lettering */}
        <text
          x="8"
          y="42"
          textAnchor="middle"
          fill="#2b1a06"
          fontWeight="900"
          fontSize="9.5"
          fontFamily="serif"
          letterSpacing="2"
        >
          <tspan x="8" dy="0">H</tspan>
          <tspan x="8" dy="18">E</tspan>
          <tspan x="8" dy="18">L</tspan>
          <tspan x="8" dy="18">E</tspan>
          <tspan x="8" dy="18">N</tspan>
          <tspan x="8" dy="18">A</tspan>
        </text>
      </g>

      {/* ================= RIGHT BRASS PLATE WITH ENGRAVED HELENA ================= */}
      <g transform="translate(978, 26)">
        <rect x="0" y="0" width="16" height="200" rx="3.5" fill="url(#brassPlate)" stroke="#533b11" strokeWidth="1.2" />
        <circle cx="8" cy="12" r="3" fill="#2d1d07" stroke="#fff3b0" strokeWidth="0.6" />
        <line x1="6" y1="12" x2="10" y2="12" stroke="#fff3b0" strokeWidth="0.8" />

        <circle cx="8" cy="188" r="3" fill="#2d1d07" stroke="#fff3b0" strokeWidth="0.6" />
        <line x1="6" y1="188" x2="10" y2="188" stroke="#fff3b0" strokeWidth="0.8" />

        <text
          x="8"
          y="42"
          textAnchor="middle"
          fill="#2b1a06"
          fontWeight="900"
          fontSize="9.5"
          fontFamily="serif"
          letterSpacing="2"
        >
          <tspan x="8" dy="0">H</tspan>
          <tspan x="8" dy="18">E</tspan>
          <tspan x="8" dy="18">L</tspan>
          <tspan x="8" dy="18">E</tspan>
          <tspan x="8" dy="18">N</tspan>
          <tspan x="8" dy="18">A</tspan>
        </text>
      </g>

      {/* Bottom Wood Shadow & Ledge */}
      <path
        d="M 36,220 Q 500,242 964,220 L 968,226 Q 500,248 32,226 Z"
        fill="#120401"
      />
    </svg>
  );
};
