import React from 'react';
import { OkeyTile } from '../types/okey';

// Opponent Top Istaka (Facing Player 2 - Selim Abi)
// Viewed from behind: Curved walnut istaka with mother-of-pearl mosaic medallion and brass end plates.
// Tiles on the top tier shelf peek slightly above the top wooden ridge of the rack.
export const OpponentTopIstaka: React.FC<{
  rackSlots?: (OkeyTile | null)[];
  tileCount?: number;
  playerName: string;
  isTurn: boolean;
}> = ({ rackSlots = [], tileCount = 14, playerName, isTurn }) => {
  const topTier = rackSlots.length > 0 ? rackSlots.slice(0, 14) : Array(14).fill(null);
  const totalOccupied = rackSlots.length > 0
    ? rackSlots.filter(Boolean).length
    : tileCount;

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
      {/* Top Edge Peeking Tile Heads (Sadece üst basamaktaki taşların hafifçe taşan tepeleri) */}
      <div className="w-[90%] flex items-end justify-between px-2 -mb-2 z-0 pointer-events-none h-4">
        {topTier.map((tile, idx) => {
          if (!tile) {
            return <div key={`top-gap-${idx}`} className="flex-1 max-w-[22px] sm:max-w-[26px] h-1" />;
          }

          return (
            <div
              key={`top-tile-peek-${idx}`}
              className="flex-1 max-w-[22px] sm:max-w-[26px] h-3.5 rounded-t-sm mx-[0.5px] border-t border-x border-[#bba486]"
              style={{
                background:
                  'linear-gradient(180deg, #fefcf7 0%, #f7efe1 35%, #ece0cb 75%, #d7c1a2 100%)',
                boxShadow: '0 -2px 3px rgba(15,8,4,0.65), inset 0 1px 0.5px #ffffff',
              }}
            >
              <div className="w-full h-[1.5px] bg-[#fbf6ec] rounded-t-xs" />
            </div>
          );
        })}
      </div>

      {/* Curved Oval Walnut Istaka Back Wall (Helena Wood Art Mozaik İşlemeli Masif Gövde) */}
      <div
        className={`relative w-full px-4 pt-3 pb-2 rounded-t-3xl rounded-b-xl border transition-all flex flex-col items-center justify-between helena-oval-istaka z-10 ${
          isTurn
            ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
            : 'border-[#381608] shadow-2xl'
        }`}
        style={{
          boxShadow:
            '0 20px 35px -5px rgba(0,0,0,0.95), inset 0 3px 2px rgba(255,215,160,0.5), inset 0 -4px 8px rgba(0,0,0,0.9)',
        }}
      >
        {/* Polished Lacquer Glow Reflection Arch */}
        <div className="absolute inset-x-8 top-1 h-[2px] bg-gradient-to-r from-transparent via-[#ffe8c2]/60 to-transparent pointer-events-none" />

        {/* Helena Wood Art Mother of Pearl & Geometric Mosaic Medallion Inlay */}
        <div className="flex items-center justify-center my-0.5 px-3 py-1 rounded-full helena-mosaic-crest border border-[#d4af37]/80 shadow-md">
          <div className="flex items-center gap-0.5 opacity-90 mr-2">
            <span className="text-[7px] text-[#fef3c7]">◆</span>
            <span className="text-[9px] text-[#f59e0b]">❖</span>
            <span className="text-[7px] text-[#fef3c7]">◆</span>
          </div>

          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#ffffff] via-[#f1ebd9] to-[#d8c39e] border border-[#a88237] shadow-inner flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#1a0802] border border-[#f5d58d] flex items-center justify-center text-[7px] text-[#f5d58d] font-bold">
              ✦
            </div>
          </div>

          <div className="flex items-center gap-0.5 opacity-90 ml-2">
            <span className="text-[7px] text-[#fef3c7]">◆</span>
            <span className="text-[9px] text-[#f59e0b]">❖</span>
            <span className="text-[7px] text-[#fef3c7]">◆</span>
          </div>
        </div>

        {/* Player Name & Luxury Brand Stamp */}
        <div className="flex items-center justify-between w-full px-2 text-[9px] font-mono tracking-widest text-[#f5d58d]/90 font-bold mt-1">
          <span className="text-[8px] tracking-normal text-[#e2b86e] font-serif-royal">
            HELENA WOOD ART
          </span>
          <span className="bg-black/50 px-2 py-0.5 rounded text-[8px] text-[#fcd34d] border border-white/5">
            {playerName} ({totalOccupied} Taş)
          </span>
        </div>

        {/* Solid Walnut Base Chamfer */}
        <div className="w-full h-2 mt-1.5 rounded-sm bg-gradient-to-r from-[#220c04] via-[#4f220d] to-[#220c04] shadow-inner border-t border-black/60" />

        {/* Left & Right Brass End Plates */}
        <div className="absolute left-1 top-2 bottom-2 w-3 rounded-l-md helena-brass-plate flex flex-col items-center justify-between py-1 text-[5px] font-mono font-black text-[#2e1804]">
          <span>•</span>
          <span className="scale-75 origin-center font-bold">H</span>
          <span>•</span>
        </div>
        <div className="absolute right-1 top-2 bottom-2 w-3 rounded-r-md helena-brass-plate flex flex-col items-center justify-between py-1 text-[5px] font-mono font-black text-[#2e1804]">
          <span>•</span>
          <span className="scale-75 origin-center font-bold">A</span>
          <span>•</span>
        </div>
      </div>
    </div>
  );
};

// Opponent Side Istaka (For Murat Kaptan [Left] and Haydar Usta [Right])
// Matches the exact authentic Helena Wood Art rack styling of the top player,
// oriented vertically for side perspective:
// - Shows the back of the curved walnut istaka facing the table center
// - Only tiles in the upper shelf peek out slightly along the outer ridge
// - Left player has tile ridge along left/outer side, Right player along right/outer side
export const OpponentSideIstaka: React.FC<{
  position: 'left' | 'right';
  rackSlots?: (OkeyTile | null)[];
  playerName: string;
  isTurn: boolean;
}> = ({ position, rackSlots = [], playerName, isTurn }) => {
  const isLeft = position === 'left';
  const topTier = rackSlots.length > 0 ? rackSlots.slice(0, 14) : Array(14).fill(null);
  const occupiedCount = rackSlots.length > 0
    ? rackSlots.filter(Boolean).length
    : 14;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      title={`${playerName} Istakası`}
    >
      <div className={`relative flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-center`}>
        {/* Peeking Tile Tops (Sadece üst basamaktaki taşların ıstakadan hafifçe taşan üst kenarı) */}
        <div
          className={`flex flex-col justify-between py-1 pointer-events-none z-0 ${
            isLeft ? '-mr-2.5 pr-0.5' : '-ml-2.5 pl-0.5'
          } h-28 sm:h-32 md:h-36`}
        >
          {topTier.map((tile, idx) => {
            if (!tile) {
              return <div key={`side-gap-${idx}`} className="h-1 sm:h-1.5 w-1" />;
            }
            return (
              <div
                key={`side-tile-peek-${idx}`}
                className={`w-2.5 sm:w-3 h-1 sm:h-1.5 my-[0.5px] ${
                  isLeft ? 'rounded-l-sm border-l border-y' : 'rounded-r-sm border-r border-y'
                } border-[#bba486]`}
                style={{
                  background: isLeft
                    ? 'linear-gradient(90deg, #fefcf7 0%, #f7efe1 40%, #e5d5be 80%, #d5bf9f 100%)'
                    : 'linear-gradient(270deg, #fefcf7 0%, #f7efe1 40%, #e5d5be 80%, #d5bf9f 100%)',
                  boxShadow: isLeft
                    ? '-2px 0 3px rgba(15,8,4,0.65), inset 1px 0 0.5px #ffffff'
                    : '2px 0 3px rgba(15,8,4,0.65), inset -1px 0 0.5px #ffffff',
                }}
              >
                <div
                  className={`h-full w-[1.5px] bg-[#fbf6ec] ${
                    isLeft ? 'rounded-l-xs' : 'rounded-r-xs ml-auto'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Slender Vertical Curved Walnut Istaka Back Wall (Karşıdaki ıstaka gibi zarif, ince ve kavisli) */}
        <div
          className={`relative w-9 sm:w-10 md:w-11 h-32 sm:h-36 md:h-40 py-1.5 px-1 rounded-2xl border transition-all flex flex-col items-center justify-between helena-oval-istaka z-10 ${
            isTurn
              ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.6)]'
              : 'border-[#381608] shadow-2xl'
          }`}
          style={{
            boxShadow:
              '0 16px 28px rgba(0,0,0,0.95), inset 0 2px 2px rgba(255,215,160,0.4), inset 0 -3px 6px rgba(0,0,0,0.9)',
          }}
        >
          {/* Top Brass End Cap with screws */}
          <div className="w-full h-3 rounded-t-md helena-brass-plate flex items-center justify-between px-1 text-[5px] font-black text-[#2e1804]">
            <span>•</span>
            <span className="scale-90 font-serif-royal">H</span>
            <span>•</span>
          </div>

          {/* Vertical Helena Wood Art Mother of Pearl & Geometric Mosaic Medallion */}
          <div className="flex flex-col items-center justify-center my-auto py-1.5 px-0.5 rounded-full helena-mosaic-crest border border-[#d4af37]/80 shadow-md">
            <span className="text-[6px] text-[#fef3c7] leading-none mb-0.5">◆</span>
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#ffffff] via-[#f1ebd9] to-[#d8c39e] border border-[#a88237] shadow-inner flex items-center justify-center">
              <span className="text-[6px] text-[#1a0802] font-black leading-none">✦</span>
            </div>
            <span className="text-[6px] text-[#fef3c7] leading-none mt-0.5">◆</span>
          </div>

          {/* Player Name & Tile Count */}
          <div className="flex flex-col items-center w-full px-0.5 text-center">
            <span className="text-[8px] font-bold text-[#f5d58d] font-serif-royal truncate w-full">
              {playerName.split(' ')[0]}
            </span>
            <span className="text-[7px] font-mono text-[#d4af37] bg-black/50 px-1 py-0.2 rounded mt-0.5">
              {occupiedCount}T
            </span>
          </div>

          {/* Bottom Brass End Cap with screws */}
          <div className="w-full h-3 rounded-b-md helena-brass-plate flex items-center justify-between px-1 text-[5px] font-black text-[#2e1804]">
            <span>•</span>
            <span className="scale-90 font-serif-royal">A</span>
            <span>•</span>
          </div>
        </div>
      </div>
    </div>
  );
};
