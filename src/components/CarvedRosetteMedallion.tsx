import React from 'react';

/**
 * CarvedRosetteMedallion
 * Exact reproduction of the circular carved wood medallion (Güneş Kursu / Rozet)
 * seen in the user's uploaded backgammon photo (VK.jpeg).
 * 
 * Features:
 * - 16 radiating floral petal spokes (16 dilimli güneş çarkı)
 * - Concentric carved double rings with bevel shadows
 * - Flowing Ottoman/Caucasian Rumi & arabesque floral vine scrollwork (kıvrımdal oymaları)
 * - Natural blonde maple/ash inlay against deep dark walnut grain
 */
export const CarvedRosetteMedallion: React.FC<{ size?: number; className?: string }> = ({
  size = 170,
  className = '',
}) => {
  return (
    <div
      className={`relative rounded-full select-none pointer-events-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Wood tones matching the photo */}
          <radialGradient id="medallion-walnut-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3c1e11" />
            <stop offset="70%" stopColor="#281309" />
            <stop offset="100%" stopColor="#1a0b05" />
          </radialGradient>

          <radialGradient id="inlay-blonde-wood" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fdf5e2" />
            <stop offset="45%" stopColor="#eedcb7" />
            <stop offset="85%" stopColor="#d5ba89" />
            <stop offset="100%" stopColor="#b4935e" />
          </radialGradient>

          <linearGradient id="carved-groove-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#130703" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4a2614" stopOpacity="0.3" />
          </linearGradient>

          {/* Single Petal Definition for the 16-Spoke Central Sunburst */}
          <path
            id="sunburst-spoke"
            d="M 97,78 C 96,62 98,44 100,42 C 102,44 104,62 103,78 C 102,82 98,82 97,78 Z"
            fill="url(#inlay-blonde-wood)"
            stroke="#261208"
            strokeWidth="0.8"
          />

          {/* Rumi Arabesque Vine Scroll Motif */}
          <g id="rumi-vine-segment">
            <path
              d="M 100,24 C 112,24 122,29 128,37 C 124,38 120,36 116,33 C 110,29 104,28 100,28 C 96,28 90,29 84,33 C 80,36 76,38 72,37 C 78,29 88,24 100,24 Z"
              fill="url(#inlay-blonde-wood)"
              stroke="#1f0e06"
              strokeWidth="0.6"
            />
            {/* Curving leaf curl */}
            <path
              d="M 112,30 C 116,27 122,28 125,32 C 121,34 116,33 112,30 Z"
              fill="#dfc392"
            />
            <path
              d="M 88,30 C 84,27 78,28 75,32 C 79,34 84,33 88,30 Z"
              fill="#dfc392"
            />
          </g>
        </defs>

        {/* Outer Circular Chiseled Groove (Photo exact outer perimeter) */}
        <circle cx="100" cy="100" r="96" fill="url(#medallion-walnut-bg)" stroke="#140602" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="94" fill="none" stroke="#d5ba89" strokeWidth="1.2" opacity="0.85" />
        <circle cx="100" cy="100" r="91" fill="none" stroke="#1f0d06" strokeWidth="1" />

        {/* Swirling Rumi Vine / Arabesque Band (Kıvrımdal Halka) */}
        <g opacity="0.95">
          <use href="#rumi-vine-segment" />
          <use href="#rumi-vine-segment" transform="rotate(45 100 100)" />
          <use href="#rumi-vine-segment" transform="rotate(90 100 100)" />
          <use href="#rumi-vine-segment" transform="rotate(135 100 100)" />
          <use href="#rumi-vine-segment" transform="rotate(180 100 100)" />
          <use href="#rumi-vine-segment" transform="rotate(225 100 100)" />
          <use href="#rumi-vine-segment" transform="rotate(270 100 100)" />
          <use href="#rumi-vine-segment" transform="rotate(315 100 100)" />
        </g>

        {/* Intermediate Chiseled Inlay Ring */}
        <circle cx="100" cy="100" r="62" fill="none" stroke="#170904" strokeWidth="2" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="#ecdcb7" strokeWidth="1.6" opacity="0.9" />
        <circle cx="100" cy="100" r="58" fill="none" stroke="#1f0e07" strokeWidth="1.2" />

        {/* 16 Radiating Sunburst Petal Spokes (16 Dilimli Güneş Kursu) */}
        <g id="spokes-group">
          {Array.from({ length: 16 }).map((_, i) => (
            <use
              key={i}
              href="#sunburst-spoke"
              transform={`rotate(${i * 22.5} 100 100)`}
            />
          ))}
        </g>

        {/* Inner Hub Ring */}
        <circle cx="100" cy="100" r="23" fill="none" stroke="#1a0b05" strokeWidth="1.8" />
        <circle cx="100" cy="100" r="21" fill="none" stroke="#e8d5ae" strokeWidth="1.4" opacity="0.9" />

        {/* Central Raised Turned Wooden Button (Merkez Göbek) */}
        <circle cx="100" cy="100" r="16" fill="url(#inlay-blonde-wood)" stroke="#2d150b" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="11" fill="url(#medallion-walnut-bg)" stroke="#1a0b05" strokeWidth="1" />
        <circle cx="100" cy="100" r="5" fill="#fdf5e2" opacity="0.8" />
      </svg>
    </div>
  );
};
