import React from 'react';
import { DamaColor, DamaPieceType, DamaBoardTheme } from '../types/dama';
import { Crown } from 'lucide-react';

interface Dama3DPieceProps {
  color: DamaColor;
  type: DamaPieceType;
  isSelected?: boolean;
  isMandatoryCapture?: boolean;
  theme?: DamaBoardTheme;
}

export const Dama3DPiece: React.FC<Dama3DPieceProps> = ({
  color,
  type,
  isSelected = false,
  isMandatoryCapture = false,
  theme = 'masif-ceviz',
}) => {
  const isWhite = color === 'white';
  const isKing = type === 'king';
  const idSuffix = `${color}_${type}_${theme}`;

  // Palette definitions
  const getThemePalette = () => {
    if (theme === 'osmanli-sedef') {
      return {
        // Shimmering Mother of Pearl Ivory
        faceStart: '#ffffff',
        faceMid: '#faebd7',
        faceEnd: '#d8c29d',
        sideGradStart: '#bfa072',
        sideGradEnd: '#614828',
        stroke: '#8a6a3e',
        innerRim: '#ecd7b7',
        goldAccent: '#f59e0b',
        // Imperial Ottoman Ebony & Gold
        darkFaceStart: '#4a3c33',
        darkFaceMid: '#241a14',
        darkFaceEnd: '#0d0705',
        darkSideStart: '#20150f',
        darkSideEnd: '#020101',
        darkStroke: '#b8944d',
        darkInnerRim: '#3e2d22',
        darkGoldAccent: '#fbbf24',
      };
    } else if (theme === 'mermer-oniks') {
      return {
        // Polished White Carrara Marble
        faceStart: '#ffffff',
        faceMid: '#e2e8f0',
        faceEnd: '#94a3b8',
        sideGradStart: '#94a3b8',
        sideGradEnd: '#475569',
        stroke: '#475569',
        innerRim: '#f1f5f9',
        goldAccent: '#38bdf8',
        // Obsidian Black Onyx
        darkFaceStart: '#334155',
        darkFaceMid: '#1e293b',
        darkFaceEnd: '#020617',
        darkSideStart: '#0f172a',
        darkSideEnd: '#000000',
        darkStroke: '#0284c7',
        darkInnerRim: '#1e293b',
        darkGoldAccent: '#38bdf8',
      };
    }
    // Default: 'masif-ceviz' (Turned Boxwood vs Anatolian Walnut)
    return {
      faceStart: '#fffdf5',
      faceMid: '#faeed7',
      faceEnd: '#c7a36f',
      sideGradStart: '#b38a52',
      sideGradEnd: '#5a3d1e',
      stroke: '#6d4c26',
      innerRim: '#f4e3c3',
      goldAccent: '#f59e0b',
      darkFaceStart: '#5a3721',
      darkFaceMid: '#341d10',
      darkFaceEnd: '#130804',
      darkSideStart: '#2c150b',
      darkSideEnd: '#050201',
      darkStroke: '#1c0a03',
      darkInnerRim: '#462716',
      darkGoldAccent: '#d97706',
    };
  };

  const pal = getThemePalette();

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center transition-all duration-200 select-none ${
        isSelected
          ? '-translate-y-3.5 scale-110 z-40'
          : 'hover:-translate-y-1 hover:scale-105 z-10'
      }`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D Directional Cast Shadow on the board underneath */}
      <div
        className={`absolute bottom-0 w-[84%] h-4 rounded-[50%] blur-[2px] transition-all duration-200 pointer-events-none ${
          isSelected
            ? 'opacity-40 scale-125 translate-x-3 translate-y-3 bg-black'
            : 'opacity-70 translate-x-2 translate-y-1 bg-black/85'
        }`}
        style={{
          boxShadow: isKing ? '0 10px 18px rgba(0,0,0,0.95)' : '0 6px 12px rgba(0,0,0,0.85)',
          transform: isSelected
            ? 'skewX(-26deg) scaleY(0.65) scale(1.18)'
            : 'skewX(-22deg) scaleY(0.6)',
        }}
      />

      {/* Mandatory Capture Warning Beacon */}
      {isMandatoryCapture && !isSelected && (
        <div className="absolute inset-0 rounded-full border-2 border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.95)] animate-pulse pointer-events-none z-0" />
      )}

      {/* Golden Aura on Selected */}
      {isSelected && (
        <div className="absolute -inset-1.5 rounded-full border-2 border-amber-400 bg-amber-400/25 blur-[1px] shadow-[0_0_18px_rgba(245,158,11,0.95)] pointer-events-none z-0" />
      )}

      {/* ======================================================== */}
      {/* 3D VOLUMETRIC CYLINDRICAL CHECKER RENDERING              */}
      {/* ======================================================== */}
      <div className="relative w-[88%] h-[88%] flex items-center justify-center pointer-events-auto">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full filter drop-shadow-[0_8px_8px_rgba(0,0,0,0.7)]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Top Face Radial Incline */}
            <radialGradient
              id={`face_grad_${idSuffix}`}
              cx="35%"
              cy="35%"
              r="65%"
              fx="30%"
              fy="30%"
            >
              {isWhite ? (
                <>
                  <stop offset="0%" stopColor={pal.faceStart} />
                  <stop offset="45%" stopColor={pal.faceMid} />
                  <stop offset="85%" stopColor={pal.faceEnd} />
                  <stop offset="100%" stopColor={pal.sideGradStart} />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor={pal.darkFaceStart} />
                  <stop offset="45%" stopColor={pal.darkFaceMid} />
                  <stop offset="85%" stopColor={pal.darkFaceEnd} />
                  <stop offset="100%" stopColor={pal.darkSideStart} />
                </>
              )}
            </radialGradient>

            {/* Cylindrical Side Edge (Extrusion Height) */}
            <linearGradient id={`side_grad_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {isWhite ? (
                <>
                  <stop offset="0%" stopColor="#f5ecd8" />
                  <stop offset="25%" stopColor="#ffffff" />
                  <stop offset="65%" stopColor={pal.sideGradStart} />
                  <stop offset="100%" stopColor={pal.sideGradEnd} />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#442616" />
                  <stop offset="25%" stopColor="#5c3822" />
                  <stop offset="65%" stopColor={pal.darkSideStart} />
                  <stop offset="100%" stopColor={pal.darkSideEnd} />
                </>
              )}
            </linearGradient>

            {/* Specular Highlight Arc */}
            <linearGradient id={`specular_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={isWhite ? '0.9' : '0.45'} />
              <stop offset="40%" stopColor="#ffffff" stopOpacity={isWhite ? '0.35' : '0.1'} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Gold Crown Seal Radial */}
            <radialGradient id={`gold_seal_${idSuffix}`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fff3a8" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="90%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
          </defs>

          {isKing ? (
            /* ======================================================== */
            /* CROWNED DAMA: DOUBLE-STACKED CHECKER ("Çift Katlı Pul")   */
            /* ======================================================== */
            <g>
              {/* --- LOWER DISC (Base Tier) --- */}
              {/* Bottom Rim Depth */}
              <ellipse cx="50" cy="74" rx="42" ry="15" fill="#000000" opacity="0.6" />

              {/* Lower Disc Cylindrical Side Wall (Extrusion from y=58 to y=70) */}
              <path
                d="M 8 58 L 8 68 C 8 77 92 77 92 68 L 92 58 Z"
                fill={`url(#side_grad_${idSuffix})`}
                stroke={isWhite ? pal.stroke : pal.darkStroke}
                strokeWidth="1.5"
              />

              {/* Lower Disc Top Face */}
              <ellipse
                cx="50"
                cy="58"
                rx="42"
                ry="15"
                fill={`url(#face_grad_${idSuffix})`}
                stroke={isWhite ? pal.stroke : pal.darkStroke}
                strokeWidth="1.5"
              />

              {/* --- UPPER DISC (Stacked 2nd Tier Checker) --- */}
              {/* Drop Shadow of Upper Disc onto Lower Disc */}
              <ellipse cx="50" cy="54" rx="40" ry="14" fill="#000000" opacity="0.45" />

              {/* Upper Disc Cylindrical Side Wall (Extrusion from y=38 to y=48) */}
              <path
                d="M 10 38 L 10 48 C 10 57 90 57 90 48 L 90 38 Z"
                fill={`url(#side_grad_${idSuffix})`}
                stroke={isWhite ? '#a67c42' : '#f59e0b'}
                strokeWidth="2"
              />

              {/* Upper Disc Top Face */}
              <ellipse
                cx="50"
                cy="38"
                rx="40"
                ry="14"
                fill={`url(#face_grad_${idSuffix})`}
                stroke={isWhite ? '#a67c42' : '#f59e0b'}
                strokeWidth="2"
              />

              {/* Concentric Lathe Grooves on Top Disc */}
              <ellipse
                cx="50"
                cy="38"
                rx="33"
                ry="11.5"
                fill="none"
                stroke={isWhite ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}
                strokeWidth="1.2"
              />
              <ellipse
                cx="50"
                cy="38"
                rx="25"
                ry="8.5"
                fill="none"
                stroke={isWhite ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}
                strokeWidth="1.2"
              />

              {/* Center Royal Ottoman Crown Plaque (Embossed Gold Medallion) */}
              <ellipse
                cx="50"
                cy="38"
                rx="18"
                ry="7.5"
                fill={`url(#gold_seal_${idSuffix})`}
                stroke="#ffd700"
                strokeWidth="1.5"
              />
              <ellipse
                cx="50"
                cy="38"
                rx="14"
                ry="5.5"
                fill="none"
                stroke="#fff8b5"
                strokeWidth="0.8"
              />

              {/* Mini Crown Icon inside Seal */}
              <path
                d="M 43 40 L 41 35 L 45 37 L 50 33 L 55 37 L 59 35 L 57 40 Z"
                fill="#3d2206"
                stroke="#ffe885"
                strokeWidth="0.7"
                strokeLinejoin="round"
              />

              {/* Specular Glaze Sheen on Upper Disc */}
              <path
                d="M 18 36 C 24 30 38 27 54 28"
                fill="none"
                stroke={`url(#specular_${idSuffix})`}
                strokeWidth="3"
                strokeLinecap="round"
                pointerEvents="none"
              />
            </g>
          ) : (
            /* ======================================================== */
            /* STANDARD 3D DAMA CHECKER (SINGLE TURNED DISC)             */
            /* ======================================================== */
            <g>
              {/* Bottom Contact Rim Depth */}
              <ellipse cx="50" cy="62" rx="44" ry="16" fill="#000000" opacity="0.6" />

              {/* Cylindrical Side Edge Extrusion (Vertical Height ~14px from y=48 to y=60) */}
              <path
                d="M 6 48 L 6 60 C 6 70 94 70 94 60 L 94 48 Z"
                fill={`url(#side_grad_${idSuffix})`}
                stroke={isWhite ? pal.stroke : pal.darkStroke}
                strokeWidth="1.8"
              />

              {/* Top Beveled Face */}
              <ellipse
                cx="50"
                cy="48"
                rx="44"
                ry="16"
                fill={`url(#face_grad_${idSuffix})`}
                stroke={isWhite ? pal.stroke : pal.darkStroke}
                strokeWidth="1.8"
              />

              {/* Outer Lathe Turned Groove Ring 1 */}
              <ellipse
                cx="50"
                cy="48"
                rx="36"
                ry="13"
                fill="none"
                stroke={isWhite ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)'}
                strokeWidth="1.5"
              />

              {/* Middle Lathe Turned Groove Ring 2 */}
              <ellipse
                cx="50"
                cy="48"
                rx="27"
                ry="9.5"
                fill="none"
                stroke={isWhite ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.22)'}
                strokeWidth="1.4"
              />

              {/* Center Turned Dimple Plaque */}
              <ellipse
                cx="50"
                cy="48"
                rx="15"
                ry="5.5"
                fill={isWhite ? '#dfc599' : '#1c0c05'}
                stroke={isWhite ? '#a68250' : '#4a2b16'}
                strokeWidth="1.2"
              />

              {/* Center Pip */}
              <ellipse
                cx="50"
                cy="48"
                rx="6"
                ry="2.5"
                fill={isWhite ? '#ffffff' : '#030101'}
                opacity={isWhite ? '0.85' : '0.6'}
              />

              {/* Specular Highlight Arc on Beveled Rim */}
              <path
                d="M 15 45 C 24 37 40 34 58 35"
                fill="none"
                stroke={`url(#specular_${idSuffix})`}
                strokeWidth="3.5"
                strokeLinecap="round"
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
