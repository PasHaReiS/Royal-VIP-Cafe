import React, { useMemo } from 'react';

export interface Tavla3DDiceProps {
  dice: number[];
  usedDice: boolean[];
  isRolling: boolean;
  onRoll?: () => void;
  canRoll: boolean;
  turnColor?: 'white' | 'black';
  isOpeningRoll?: boolean;
  openingRollData?: {
    whiteDie: number | null;
    blackDie: number | null;
    winner: 'white' | 'black' | null;
    status: 'waiting' | 'rolling' | 'tied' | 'decided';
    tieCount?: number;
  };
  whitePlayerName?: string;
  blackPlayerName?: string;
  previousWinnerName?: string;
}

// 6 faces of a standard cubic backgammon die
// 3x3 grid indices:
// 0 1 2
// 3 4 5
// 6 7 8
const PIP_CONFIGS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// Target 3D rotation to show the face pointing directly up towards camera
function getTargetFaceRotation(val: number): { x: number; y: number } {
  switch (val) {
    case 1:
      return { x: 0, y: 0 };
    case 6:
      return { x: 0, y: 180 };
    case 2:
      return { x: 0, y: -90 };
    case 5:
      return { x: 0, y: 90 };
    case 3:
      return { x: -90, y: 0 };
    case 4:
      return { x: 90, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

// Authentic Tournament Backgammon Die Face (13px miniature scale, high-gloss enamel pips, bone finish)
const DieFace: React.FC<{
  faceNum: number;
  transformStyle: string;
  isRedOne?: boolean;
}> = ({ faceNum, transformStyle, isRedOne }) => {
  const pips = PIP_CONFIGS[faceNum] || [4];

  return (
    <div
      className="absolute inset-0 backgammon-die-face grid grid-cols-3 grid-rows-3 p-[1px] gap-0 select-none overflow-hidden"
      style={{
        transform: transformStyle,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {Array.from({ length: 9 }).map((_, idx) => {
        const hasPip = pips.includes(idx);
        const isCenterRed = isRedOne && faceNum === 1 && idx === 4;

        return (
          <div key={idx} className="flex items-center justify-center">
            {hasPip && (
              <div
                className={`relative shrink-0 flex items-center justify-center ${
                  isCenterRed
                    ? 'w-[3.3px] h-[3.3px] die-pip-red shadow-xs'
                    : 'w-[2.2px] h-[2.2px] die-pip'
                }`}
              >
                {/* Authentic specular reflection glint on high-gloss enamel */}
                {isCenterRed && (
                  <span className="absolute top-[0.6px] left-[0.6px] w-[0.8px] h-[0.8px] rounded-full bg-white/95" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Tavla3DDice: React.FC<Tavla3DDiceProps> = ({
  dice,
  usedDice,
  isRolling,
  onRoll,
  canRoll,
  turnColor = 'white',
  isOpeningRoll = false,
  openingRollData,
  whitePlayerName = 'Beyaz',
  blackPlayerName = 'Siyah',
  previousWinnerName,
}) => {
  // Real backgammon tournament proportions: 11.5px cube (exact proportion to wooden checkers in photo)
  const cubeSize = 11.5; // px
  const halfSize = 5.75; // px

  // Natural scattered landing placements on the walnut wood surface (Photo-Accurate)
  // Notice: The dice NEVER sit in the dead center! They land separated naturally across the court, just like in the user's photo.
  const naturalPlacements = useMemo(() => {
    return [
      {
        leftPct: 67, // Off-center towards the right rail
        topPct: 43, // Middle-upper
        tiltZ: 14, // Natural resting tilt angle
      },
      {
        leftPct: 33, // Off-center towards the center bar
        topPct: 53, // Middle-lower
        tiltZ: -18, // Natural resting tilt angle
      },
      // In case of doubles (4 dice)
      {
        leftPct: 24,
        topPct: 42,
        tiltZ: 11,
      },
      {
        leftPct: 45,
        topPct: 56,
        tiltZ: -14,
      },
    ];
  }, []);

  const diceCount = dice.length;
  const isDoubles = diceCount === 4;

  // Active dice to render: if rolling, simulate 2 tumbling dice
  const activeDice = isRolling ? [3, 5] : dice;

  // Render Opening Roll Special Arena
  if (isOpeningRoll && openingRollData) {
    const isRollingOpening = isRolling || openingRollData.status === 'rolling';
    const hasDice = openingRollData.whiteDie !== null && openingRollData.blackDie !== null;
    const wDie = openingRollData.whiteDie || 3;
    const bDie = openingRollData.blackDie || 5;

    return (
      <div
        className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
        style={{ perspective: 700 }}
      >
        {/* Waiting to roll opening dice */}
        {openingRollData.status === 'waiting' && !isRollingOpening && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 pointer-events-auto bg-black/25 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#1b0c05]/90 border border-amber-400/50 shadow-2xl text-center max-w-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-100 ring-2 ring-amber-300 shadow" />
                <span className="text-[10px] text-amber-200 font-bold uppercase tracking-wider font-serif-royal">
                  Başlangıç Zarı
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-stone-900 ring-2 ring-amber-400 shadow" />
              </div>
              <p className="text-[10px] text-stone-300 leading-tight">
                İki oyuncu da birer zar atar; büyük atan ilk hamleyi yapar.
              </p>
              <button
                type="button"
                onClick={onRoll}
                title="Açılış zarlarını at"
                className="mt-1 px-4 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-amber-200 animate-pulse"
              >
                <span>🎲</span>
                <span>Zarları At & Başla</span>
              </button>
            </div>
          </div>
        )}

        {/* Tied Notification & Re-roll Button */}
        {openingRollData.status === 'tied' && !isRollingOpening && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 pointer-events-auto bg-black/25">
            <div className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-[#2a1005]/95 border border-amber-500/70 shadow-2xl text-center max-w-xs animate-in zoom-in-95">
              <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
                <span>⚠️</span>
                <span>Zarlar Eşit Geldi ({openingRollData.whiteDie} - {openingRollData.blackDie})</span>
              </div>
              <p className="text-[10px] text-stone-300">
                Tavla kuralı: Eşitlikte çift oynanamaz, eşitlik bozulana dek tekrar atılır.
              </p>
              <button
                type="button"
                onClick={onRoll}
                className="mt-1 px-3 py-1 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 shadow transition-all cursor-pointer animate-bounce"
              >
                Tekrar Zar At
              </button>
            </div>
          </div>
        )}

        {/* Display the 2 Opening Dice (One for White on the left, One for Black on the right) */}
        {(hasDice || isRollingOpening) && (
          <div className="relative w-full h-full pointer-events-none">
            {/* White Player's Die */}
            <div
              className="absolute pointer-events-none flex flex-col items-center"
              style={{
                left: '32%',
                top: '48%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Player Tag */}
              <div className="mb-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1e1008]/90 border border-stone-300/40 text-[9px] font-bold text-stone-100 shadow">
                <span className="w-2 h-2 rounded-full bg-stone-100 ring-1 ring-amber-400" />
                <span>{whitePlayerName}</span>
                {!isRollingOpening && openingRollData.winner === 'white' && (
                  <span className="text-amber-300 text-[10px]">👑</span>
                )}
              </div>

              {/* White Die Shadow */}
              <div
                className={`w-[17px] h-[5px] rounded-full tavla-die-shadow transition-all ${
                  isRollingOpening ? 'animate-tavla-shadow-1' : 'opacity-85'
                }`}
              />

              {/* White 3D Die */}
              <div
                className={`relative ${
                  isRollingOpening ? 'animate-tavla-throw-white-1' : 'transition-transform duration-500'
                } ${
                  openingRollData.winner === 'white'
                    ? 'ring-2 ring-amber-400 rounded-sm shadow-[0_0_12px_rgba(251,191,36,0.9)]'
                    : ''
                }`}
                style={{
                  width: cubeSize,
                  height: cubeSize,
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                  transform: isRollingOpening
                    ? undefined
                    : `rotateX(${getTargetFaceRotation(wDie).x}deg) rotateY(${getTargetFaceRotation(wDie).y}deg) rotateZ(12deg)`,
                }}
              >
                <DieFace faceNum={1} transformStyle={`translateZ(${halfSize}px)`} isRedOne={true} />
                <DieFace faceNum={6} transformStyle={`rotateY(180deg) translateZ(${halfSize}px)`} />
                <DieFace faceNum={2} transformStyle={`rotateY(90deg) translateZ(${halfSize}px)`} />
                <DieFace faceNum={5} transformStyle={`rotateY(-90deg) translateZ(${halfSize}px)`} />
                <DieFace faceNum={3} transformStyle={`rotateX(90deg) translateZ(${halfSize}px)`} />
                <DieFace faceNum={4} transformStyle={`rotateX(-90deg) translateZ(${halfSize}px)`} />
              </div>

              {!isRollingOpening && (
                <span className="mt-2 text-[11px] font-black text-amber-300 font-mono bg-black/70 px-1.5 py-0.2 rounded border border-amber-400/30">
                  {wDie}
                </span>
              )}
            </div>

            {/* Black Player's Die */}
            <div
              className="absolute pointer-events-none flex flex-col items-center"
              style={{
                left: '68%',
                top: '48%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Player Tag */}
              <div className="mb-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1e1008]/90 border border-stone-700/60 text-[9px] font-bold text-amber-200 shadow">
                <span className="w-2 h-2 rounded-full bg-stone-900 ring-1 ring-amber-400" />
                <span>{blackPlayerName}</span>
                {!isRollingOpening && openingRollData.winner === 'black' && (
                  <span className="text-amber-300 text-[10px]">👑</span>
                )}
              </div>

              {/* Black Die Shadow */}
              <div
                className={`w-[17px] h-[5px] rounded-full tavla-die-shadow transition-all ${
                  isRollingOpening ? 'animate-tavla-shadow-2' : 'opacity-85'
                }`}
              />

              {/* Black 3D Die */}
              <div
                className={`relative ${
                  isRollingOpening ? 'animate-tavla-throw-black-2' : 'transition-transform duration-500'
                } ${
                  openingRollData.winner === 'black'
                    ? 'ring-2 ring-amber-400 rounded-sm shadow-[0_0_12px_rgba(251,191,36,0.9)]'
                    : ''
                }`}
                style={{
                  width: cubeSize,
                  height: cubeSize,
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                  transform: isRollingOpening
                    ? undefined
                    : `rotateX(${getTargetFaceRotation(bDie).x}deg) rotateY(${getTargetFaceRotation(bDie).y}deg) rotateZ(-14deg)`,
                }}
              >
                <DieFace faceNum={1} transformStyle={`translateZ(${halfSize}px)`} isRedOne={true} />
                <DieFace faceNum={6} transformStyle={`rotateY(180deg) translateZ(${halfSize}px)`} />
                <DieFace faceNum={2} transformStyle={`rotateY(90deg) translateZ(${halfSize}px)`} />
                <DieFace faceNum={5} transformStyle={`rotateY(-90deg) translateZ(${halfSize}px)`} />
                <DieFace faceNum={3} transformStyle={`rotateX(90deg) translateZ(${halfSize}px)`} />
                <DieFace faceNum={4} transformStyle={`rotateX(-90deg) translateZ(${halfSize}px)`} />
              </div>

              {!isRollingOpening && (
                <span className="mt-2 text-[11px] font-black text-amber-300 font-mono bg-black/70 px-1.5 py-0.2 rounded border border-amber-400/30">
                  {bDie}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
      style={{ perspective: 700 }}
    >
      {/* 1. Clickable Prompt when waiting for roll */}
      {dice.length === 0 && !isRolling && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 pointer-events-auto">
          {previousWinnerName && (
            <div className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10px] font-bold text-amber-200 shadow-md backdrop-blur-xs flex items-center gap-1">
              <span>👑</span>
              <span>Önceki Kazanan Başlıyor: {previousWinnerName}</span>
            </div>
          )}
          <button
            onClick={canRoll ? onRoll : undefined}
            disabled={!canRoll}
            title={turnColor === 'white' ? 'Zarları Masaya At (Tıkla)' : 'Haydar Usta Atıyor...'}
            className={`px-3.5 py-1.5 rounded-full bg-black/65 hover:bg-black/85 border border-[#d4af37]/60 text-[#f5d58d] shadow-xl backdrop-blur-xs transition-all flex items-center gap-1.5 ${
              canRoll
                ? 'cursor-pointer hover:border-[#f5d58d] hover:scale-105 active:scale-95 animate-pulse'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <span className="text-xs">🎲</span>
            <span className="text-[10px] font-bold tracking-wide font-serif-royal">
              {turnColor === 'white'
                ? previousWinnerName
                  ? 'ZAR AT (İLK ZAR SİZDE)'
                  : 'ZAR AT'
                : 'HAYDAR USTA...'}
            </span>
          </button>
        </div>
      )}

      {/* 2. Interactive Backdrop: Clicking the court rolls the dice if ready */}
      {dice.length === 0 && canRoll && !isRolling && (
        <div
          onClick={onRoll}
          title="Tavla zarlarını masaya at"
          className="absolute inset-0 cursor-pointer pointer-events-auto"
        />
      )}

      {/* 3. Authentic Scattered Physical Dice on Walnut Wood Table */}
      {(dice.length > 0 || isRolling) && (
        <div className="relative w-full h-full pointer-events-none">
          {activeDice.map((val, idx) => {
            const isUsed = usedDice[idx] || false;
            const targetRot = getTargetFaceRotation(val);

            // Determine landing layout coordinates
            let placement = naturalPlacements[idx % naturalPlacements.length];
            if (isDoubles) {
              const doublesLayout = [
                { leftPct: 24, topPct: 45, tiltZ: 12 },
                { leftPct: 42, topPct: 55, tiltZ: -14 },
                { leftPct: 60, topPct: 43, tiltZ: 19 },
                { leftPct: 78, topPct: 53, tiltZ: -8 },
              ];
              placement = doublesLayout[idx % doublesLayout.length];
            }

            // Select throw animation based on current player
            const throwClass =
              turnColor === 'white'
                ? idx % 2 === 0
                  ? 'animate-tavla-throw-white-1'
                  : 'animate-tavla-throw-white-2'
                : idx % 2 === 0
                ? 'animate-tavla-throw-black-1'
                : 'animate-tavla-throw-black-2';

            const shadowClass =
              idx % 2 === 0 ? 'animate-tavla-shadow-1' : 'animate-tavla-shadow-2';

            return (
              <div
                key={idx}
                className="absolute transition-all duration-500 ease-out pointer-events-none"
                style={{
                  left: `${placement.leftPct}%`,
                  top: `${placement.topPct}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Contact Occlusion & Directional Wood Shadow */}
                <div
                  className={`absolute -bottom-1 -left-0.5 w-[17px] h-[5px] rounded-full tavla-die-shadow transition-all duration-300 pointer-events-none ${
                    isRolling
                      ? shadowClass
                      : isUsed
                      ? 'opacity-20 scale-75'
                      : 'opacity-85 scale-100'
                  }`}
                  style={{
                    transform: isRolling
                      ? undefined
                      : `rotate(${placement.tiltZ}deg)`,
                  }}
                />

                {/* 3D Precision Tournament Die (11.5px Cube matching photo proportions) */}
                <div
                  className={`relative pointer-events-none ${
                    isRolling ? throwClass : 'transition-transform duration-500'
                  } ${
                    isUsed
                      ? 'opacity-35 saturate-40 scale-90'
                      : 'hover:scale-110 cursor-default'
                  }`}
                  style={{
                    width: cubeSize,
                    height: cubeSize,
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                    transform: isRolling
                      ? undefined
                      : `rotateX(${targetRot.x}deg) rotateY(${targetRot.y}deg) rotateZ(${placement.tiltZ}deg)`,
                  }}
                >
                  {/* Face 1 (Front) - Classic Iconic Ruby Red Pipped Yek */}
                  <DieFace
                    faceNum={1}
                    transformStyle={`translateZ(${halfSize}px)`}
                    isRedOne={true}
                  />

                  {/* Face 6 (Back) */}
                  <DieFace
                    faceNum={6}
                    transformStyle={`rotateY(180deg) translateZ(${halfSize}px)`}
                  />

                  {/* Face 2 (Right) */}
                  <DieFace
                    faceNum={2}
                    transformStyle={`rotateY(90deg) translateZ(${halfSize}px)`}
                  />

                  {/* Face 5 (Left) */}
                  <DieFace
                    faceNum={5}
                    transformStyle={`rotateY(-90deg) translateZ(${halfSize}px)`}
                  />

                  {/* Face 3 (Top) */}
                  <DieFace
                    faceNum={3}
                    transformStyle={`rotateX(90deg) translateZ(${halfSize}px)`}
                  />

                  {/* Face 4 (Bottom) */}
                  <DieFace
                    faceNum={4}
                    transformStyle={`rotateX(-90deg) translateZ(${halfSize}px)`}
                  />
                </div>

                {/* Micro Used-Status Indicator */}
                {isUsed && !isRolling && (
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-black/90 border border-[#d4af37]/80 text-[7px] text-[#f5d58d] flex items-center justify-center font-bold shadow-md z-30 select-none">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
