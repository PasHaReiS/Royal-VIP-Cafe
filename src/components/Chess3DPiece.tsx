import React from 'react';
import { PieceSymbol, Color } from 'chess.js';
import { ChessBoardTheme } from '../types/chess';

interface Chess3DPieceProps {
  type: PieceSymbol;
  color: Color;
  isSelected?: boolean;
  isLastMove?: boolean;
  isInCheck?: boolean;
  theme?: ChessBoardTheme;
}

export const Chess3DPiece: React.FC<Chess3DPieceProps> = ({
  type,
  color,
  isSelected = false,
  isLastMove = false,
  isInCheck = false,
  theme = 'masif-ceviz',
}) => {
  const isWhite = color === 'w';
  const idSuffix = `${color}_${type}_${theme}`;

  // Realistic height & scaling for Staunton hierarchy
  // King is tallest, Queen slightly shorter, Bishop & Knight intermediate, Rook sturdy, Pawn compact
  const pieceMetrics: Record<PieceSymbol, { viewBox: string; heightClass: string; shadowWidth: string }> = {
    k: { viewBox: '0 0 100 135', heightClass: 'h-[110%] -top-[20%]', shadowWidth: 'w-[75%]' },
    q: { viewBox: '0 0 100 130', heightClass: 'h-[104%] -top-[16%]', shadowWidth: 'w-[72%]' },
    b: { viewBox: '0 0 100 120', heightClass: 'h-[96%] -top-[10%]', shadowWidth: 'w-[68%]' },
    n: { viewBox: '0 0 100 118', heightClass: 'h-[92%] -top-[8%]', shadowWidth: 'w-[68%]' },
    r: { viewBox: '0 0 100 112', heightClass: 'h-[86%] -top-[4%]', shadowWidth: 'w-[70%]' },
    p: { viewBox: '0 0 100 100', heightClass: 'h-[72%] top-[6%]', shadowWidth: 'w-[62%]' },
  };

  const metric = pieceMetrics[type];

  // Shading palette
  const getThemePal = () => {
    if (theme === 'osmanli-sedef') {
      return {
        // Shimmering Mother of Pearl Ivory
        lightMain1: '#ffffff',
        lightMain2: '#fbf3e4',
        lightMain3: '#e5d1b1',
        lightMain4: '#baa079',
        lightCoreShadow: '#7a603c',
        lightHighlight: 'rgba(255,255,255,0.95)',
        lightStroke: '#614828',
        lightGoldAccent: '#f59e0b',
        // Imperial Ottoman Ebony & Brass
        darkMain1: '#4a3c33',
        darkMain2: '#2b211a',
        darkMain3: '#150e0a',
        darkMain4: '#060302',
        darkCoreShadow: '#000000',
        darkHighlight: 'rgba(255,215,0,0.5)',
        darkStroke: '#b8944d',
        darkGoldAccent: '#fbbf24',
      };
    } else if (theme === 'mermer-oniks') {
      return {
        // Polished White Carrara Marble
        lightMain1: '#ffffff',
        lightMain2: '#f1f5f9',
        lightMain3: '#cbd5e1',
        lightMain4: '#94a3b8',
        lightCoreShadow: '#475569',
        lightHighlight: 'rgba(255,255,255,0.95)',
        lightStroke: '#334155',
        lightGoldAccent: '#38bdf8',
        // Obsidian Black Onyx
        darkMain1: '#334155',
        darkMain2: '#1e293b',
        darkMain3: '#0f172a',
        darkMain4: '#020617',
        darkCoreShadow: '#000000',
        darkHighlight: 'rgba(56,189,248,0.4)',
        darkStroke: '#0ea5e9',
        darkGoldAccent: '#38bdf8',
      };
    }
    // Default: 'masif-ceviz' (Traditional Turned Boxwood vs Dark Anatolian Walnut)
    return {
      lightMain1: '#fffef9',
      lightMain2: '#faeed7',
      lightMain3: '#dfc294',
      lightMain4: '#b38e5c',
      lightCoreShadow: '#74542d',
      lightHighlight: 'rgba(255,255,255,0.9)',
      lightStroke: '#5a3d1e',
      lightGoldAccent: '#f59e0b',
      darkMain1: '#5c3823',
      darkMain2: '#3a2012',
      darkMain3: '#200f07',
      darkMain4: '#0c0502',
      darkCoreShadow: '#000000',
      darkHighlight: 'rgba(255,255,255,0.3)',
      darkStroke: '#1c0a03',
      darkGoldAccent: '#d97706',
    };
  };

  const pal = getThemePal();

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none transition-all duration-200 ${
        isSelected
          ? '-translate-y-3 scale-110 z-40'
          : 'hover:-translate-y-1 hover:scale-105 z-10'
      }`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D Directional Cast Shadow on Board Surface */}
      <div
        className={`absolute bottom-0 ${metric.shadowWidth} h-4 rounded-[50%] blur-[2px] transition-all duration-200 pointer-events-none ${
          isSelected
            ? 'opacity-40 scale-125 translate-x-3 translate-y-3 bg-black'
            : 'opacity-70 translate-x-2 translate-y-1 bg-black/85'
        }`}
        style={{
          boxShadow: '0 8px 16px rgba(0,0,0,0.9)',
          transform: isSelected
            ? 'skewX(-26deg) scaleY(0.65) scale(1.18)'
            : 'skewX(-22deg) scaleY(0.6)',
        }}
      />

      {/* Ground Contact Felt Base Rim */}
      <div
        className="absolute bottom-0 w-[60%] h-2.5 rounded-[50%] opacity-55 pointer-events-none"
        style={{
          background: isWhite ? '#382011' : '#030101',
          filter: 'blur(1px)',
        }}
      />

      {/* Check Danger Aura under King */}
      {isInCheck && (
        <div className="absolute inset-0 rounded-full border-2 border-red-500 bg-red-600/35 blur-[2px] shadow-[0_0_20px_rgba(239,68,68,0.95)] animate-ping pointer-events-none" />
      )}

      {/* Selected Piece Golden Floor Aura */}
      {isSelected && (
        <div className="absolute inset-0 rounded-full border-2 border-amber-400 bg-amber-400/25 blur-[1px] shadow-[0_0_18px_rgba(245,158,11,0.95)] pointer-events-none" />
      )}

      {/* Last Move Indicator Ring */}
      {isLastMove && !isSelected && (
        <div className="absolute inset-1.5 rounded-full border border-amber-400/50 bg-amber-400/15 pointer-events-none" />
      )}

      {/* 3D Staunton Piece Sculpt */}
      <div className={`absolute w-[94%] ${metric.heightClass} flex items-end justify-center pointer-events-auto`}>
        <svg
          viewBox={metric.viewBox}
          className="w-full h-full filter drop-shadow-[0_8px_10px_rgba(0,0,0,0.75)]"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            {/* Volumetric Cylindrical Gradient (Light from Top-Left ~10% to Bottom-Right ~90%) */}
            <linearGradient id={`piece_body_${idSuffix}`} x1="12%" y1="15%" x2="88%" y2="85%">
              {isWhite ? (
                <>
                  <stop offset="0%" stopColor={pal.lightMain1} />
                  <stop offset="28%" stopColor={pal.lightMain2} />
                  <stop offset="68%" stopColor={pal.lightMain3} />
                  <stop offset="92%" stopColor={pal.lightMain4} />
                  <stop offset="100%" stopColor={pal.lightCoreShadow} />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor={pal.darkMain1} />
                  <stop offset="30%" stopColor={pal.darkMain2} />
                  <stop offset="70%" stopColor={pal.darkMain3} />
                  <stop offset="90%" stopColor={pal.darkMain4} />
                  <stop offset="100%" stopColor={pal.darkCoreShadow} />
                </>
              )}
            </linearGradient>

            {/* Base Pedestal Thickness Cylinder Gradient */}
            <linearGradient id={`base_cylinder_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {isWhite ? (
                <>
                  <stop offset="0%" stopColor="#f5ecd8" />
                  <stop offset="35%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#c5a473" />
                  <stop offset="100%" stopColor="#634522" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#3d2619" />
                  <stop offset="35%" stopColor="#543622" />
                  <stop offset="70%" stopColor="#1a0d07" />
                  <stop offset="100%" stopColor="#020101" />
                </>
              )}
            </linearGradient>

            {/* Spherical Head Radial 3D Light */}
            <radialGradient id={`sphere_light_${idSuffix}`} cx="38%" cy="32%" r="62%">
              {isWhite ? (
                <>
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="45%" stopColor={pal.lightMain2} />
                  <stop offset="85%" stopColor={pal.lightMain4} />
                  <stop offset="100%" stopColor={pal.lightCoreShadow} />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#63412b" />
                  <stop offset="40%" stopColor={pal.darkMain2} />
                  <stop offset="85%" stopColor={pal.darkMain4} />
                  <stop offset="100%" stopColor="#000000" />
                </>
              )}
            </radialGradient>

            {/* 3D Specular Sheen Arc */}
            <linearGradient id={`specular_arc_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={isWhite ? '0.95' : '0.55'} />
              <stop offset="40%" stopColor="#ffffff" stopOpacity={isWhite ? '0.4' : '0.15'} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Gold Accents Gradient */}
            <radialGradient id={`gold_gem_${idSuffix}`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fff3a8" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="90%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
          </defs>

          {/* Master Piece Geometry */}
          <g
            fill={`url(#piece_body_${idSuffix})`}
            stroke={isWhite ? pal.lightStroke : pal.darkStroke}
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {/* ======================================================== */}
            {/* PAWN (Piyon)                                              */}
            {/* ======================================================== */}
            {type === 'p' && (
              <g>
                {/* 3D Stepped Base Cylinder Rim */}
                <ellipse cx="50" cy="94" rx="33" ry="8" fill={`url(#base_cylinder_${idSuffix})`} />
                <path d="M 17 93 C 17 87 25 83 31 82 L 69 82 C 75 83 83 87 83 93 Z" />
                {/* Lower Torus Ring */}
                <ellipse cx="50" cy="80" rx="25" ry="5.5" />
                {/* Tapered Stem */}
                <path d="M 28 80 C 35 62 38 52 38 43 L 62 43 C 62 52 65 62 72 80 Z" />
                {/* Collar Ring */}
                <ellipse cx="50" cy="42" rx="19" ry="4.5" />
                {/* Spherical Head with 3D Radial Lighting */}
                <circle cx="50" cy="24" r="16" fill={`url(#sphere_light_${idSuffix})`} />
                {/* Lathe Turned Top Peak */}
                <circle cx="50" cy="8" r="3" fill={`url(#gold_gem_${idSuffix})`} stroke="#854d0e" strokeWidth="1" />
              </g>
            )}

            {/* ======================================================== */}
            {/* ROOK (Kale)                                               */}
            {/* ======================================================== */}
            {type === 'r' && (
              <g>
                {/* Heavy Pedestal Base */}
                <ellipse cx="50" cy="106" rx="36" ry="8.5" fill={`url(#base_cylinder_${idSuffix})`} />
                <path d="M 15 104 C 15 97 24 93 30 92 L 70 92 C 76 93 85 97 85 104 Z" />
                <ellipse cx="50" cy="91" rx="29" ry="6" />
                {/* Fortified Tapered Tower Walls */}
                <path d="M 26 90 L 31 43 L 69 43 L 74 90 Z" />
                {/* Machicolated Cornice */}
                <ellipse cx="50" cy="42" rx="34" ry="6.5" />
                <rect x="18" y="24" width="64" height="18" rx="2" />
                {/* Crenellated Battlements with Inner Parapet Shadows */}
                <path
                  d="M 18 24 L 18 12 L 31 12 L 31 19 L 43 19 L 43 12 L 57 12 L 57 19 L 69 19 L 69 12 L 82 12 L 82 24 Z"
                  fill={`url(#piece_body_${idSuffix})`}
                />
                {/* Arrow Slit Window */}
                <rect
                  x="47"
                  y="55"
                  width="6"
                  height="16"
                  rx="3"
                  fill={isWhite ? '#5c3d1f' : '#040201'}
                  stroke="none"
                />
              </g>
            )}

            {/* ======================================================== */}
            {/* KNIGHT (At - Carved Stallion)                             */}
            {/* ======================================================== */}
            {type === 'n' && (
              <g>
                {/* Base Plinth */}
                <ellipse cx="50" cy="111" rx="35" ry="8.5" fill={`url(#base_cylinder_${idSuffix})`} />
                <path d="M 16 109 C 17 103 25 99 32 98 L 68 98 C 75 99 83 103 84 109 Z" />
                <ellipse cx="50" cy="97" rx="28" ry="5.5" />

                {/* Hand-Carved Stallion Head & Neck */}
                <path d="M 32 96 C 34 80 23 72 21 61 C 19 50 24 39 31 33 C 33 27 36 17 44 12 C 49 14 49 20 48 24 C 57 20 71 24 77 35 C 83 47 81 60 78 72 C 75 82 73 90 69 96 Z" />
                {/* Muzzle curvature */}
                <path d="M 31 33 C 29 41 35 48 44 49 C 53 50 57 43 54 37 Z" />
                {/* Nostril */}
                <ellipse cx="32" cy="40" rx="2" ry="3" fill={isWhite ? '#4a2e15' : '#030101'} stroke="none" />
                {/* Expressive Eye with Specular Point */}
                <circle cx="46" cy="31" r="3" fill={isWhite ? '#361d09' : '#eab308'} stroke="none" />
                <circle cx="47" cy="30" r="1" fill="#ffffff" stroke="none" />
                {/* Sculpted Mane Ridges */}
                <path
                  d="M 66 28 C 72 34 75 42 74 50 M 70 42 C 75 49 77 58 75 66 M 71 59 C 75 67 75 76 71 84"
                  fill="none"
                  stroke={isWhite ? '#947347' : '#573319'}
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* ======================================================== */}
            {/* BISHOP (Fil - Mitre)                                      */}
            {/* ======================================================== */}
            {type === 'b' && (
              <g>
                <ellipse cx="50" cy="113" rx="35" ry="8.5" fill={`url(#base_cylinder_${idSuffix})`} />
                <path d="M 17 111 C 18 104 25 100 31 99 L 69 99 C 75 100 82 104 83 111 Z" />
                <ellipse cx="50" cy="98" rx="28" ry="5.5" />
                {/* Stem */}
                <path d="M 29 97 C 36 78 40 70 40 59 L 60 59 C 60 70 64 78 71 97 Z" />
                {/* Neck Collar */}
                <ellipse cx="50" cy="58" rx="20" ry="5" />
                {/* Mitre Head */}
                <path d="M 30 54 C 28 39 34 24 50 16 C 66 24 72 39 70 54 Z" />
                {/* Top Finial Orb */}
                <circle cx="50" cy="11" r="5" fill={`url(#gold_gem_${idSuffix})`} stroke="#b45309" strokeWidth="1" />
                {/* Deep 3D Mitre Cleft (Slit) */}
                <path
                  d="M 45 28 L 62 42"
                  stroke={isWhite ? '#5c3d1f' : '#f59e0b'}
                  strokeWidth="3.4"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* ======================================================== */}
            {/* QUEEN (Vezir - Imperial Coronet)                          */}
            {/* ======================================================== */}
            {type === 'q' && (
              <g>
                <ellipse cx="50" cy="122" rx="37" ry="9" fill={`url(#base_cylinder_${idSuffix})`} />
                <path d="M 15 120 C 16 113 24 109 31 107 L 69 107 C 76 109 84 113 85 120 Z" />
                <ellipse cx="50" cy="106" rx="30" ry="6" />
                {/* Flared Gown Stem */}
                <path d="M 28 105 C 35 81 39 71 39 56 L 61 56 C 61 71 65 81 72 105 Z" />
                {/* Regal Collar */}
                <ellipse cx="50" cy="55" rx="23" ry="5.5" />
                {/* Multi-Spire Coronet */}
                <path d="M 25 54 C 23 40 19 30 16 25 L 29 35 L 41 23 L 50 17 L 59 23 L 71 35 L 84 25 C 81 30 77 40 75 54 Z" />
                {/* Golden Pearls on Crown Spires */}
                <circle cx="16" cy="24" r="3.5" fill={`url(#gold_gem_${idSuffix})`} stroke="#854d0e" strokeWidth="0.8" />
                <circle cx="29" cy="34" r="3.5" fill={`url(#gold_gem_${idSuffix})`} stroke="#854d0e" strokeWidth="0.8" />
                <circle cx="50" cy="15" r="4.5" fill={`url(#gold_gem_${idSuffix})`} stroke="#854d0e" strokeWidth="1" />
                <circle cx="71" cy="34" r="3.5" fill={`url(#gold_gem_${idSuffix})`} stroke="#854d0e" strokeWidth="0.8" />
                <circle cx="84" cy="24" r="3.5" fill={`url(#gold_gem_${idSuffix})`} stroke="#854d0e" strokeWidth="0.8" />
              </g>
            )}

            {/* ======================================================== */}
            {/* KING (Şah - Arched Crown & Royal Cross)                   */}
            {/* ======================================================== */}
            {type === 'k' && (
              <g>
                <ellipse cx="50" cy="126" rx="38" ry="9" fill={`url(#base_cylinder_${idSuffix})`} />
                <path d="M 14 124 C 15 117 23 113 30 111 L 70 111 C 77 113 85 117 86 124 Z" />
                <ellipse cx="50" cy="110" rx="31" ry="6.5" />
                {/* Majestic Body */}
                <path d="M 27 109 C 34 83 38 72 38 56 L 62 56 C 62 72 66 83 73 109 Z" />
                <ellipse cx="50" cy="55" rx="25" ry="6" />
                {/* Arched Imperial Crown */}
                <path d="M 24 54 C 21 40 27 27 50 22 C 73 27 79 40 76 54 Z" />
                {/* Central Royal Cross Finial */}
                <path
                  d="M 50 6 L 50 22 M 43 12 L 57 12"
                  stroke={`url(#gold_gem_${idSuffix})`}
                  strokeWidth="4.2"
                  strokeLinecap="square"
                />
              </g>
            )}
          </g>

          {/* Volumetric Specular Edge Arc (Left light rim reflection) */}
          <path
            d="M 36 24 C 28 48 30 76 32 94"
            fill="none"
            stroke={`url(#specular_arc_${idSuffix})`}
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity={isWhite ? '0.85' : '0.45'}
            pointerEvents="none"
          />
        </svg>
      </div>
    </div>
  );
};
