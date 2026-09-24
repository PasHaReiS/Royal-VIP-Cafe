import {
  BoardPoints,
  OpeningRollInfo,
  PlayerColor,
  TavlaState,
  TavlaTurnSnapshot,
  TURKISH_DICE_NAMES,
  ValidMoveOption,
} from '../types/tavla';

/**
 * Traditional Standard Turkish / International Backgammon Starting Setup:
 * Eksiksiz kural gereği her iki oyuncu için tam 15'er pul:
 * - 24'lü hane: 2 pul (Rakibin 1. hanesi, en arka köşe)
 * - 13'lü hane: 5 pul (Orta sol dış alan)
 * - 8'li hane:  3 pul (Kendi dış alanı)
 * - 6'lı hane:  5 pul (Kendi iç alanı)
 * Toplam: 2 + 5 + 3 + 5 = 15 pul.
 * 
 * Siyah oyuncu için tahta simetrisi (1'den 24'e doğru ilerler):
 * - 1. hane (Siyahın 24'lü hanesi):  2 pul
 * - 12. hane (Siyahın 13'lü hanesi): 5 pul
 * - 17. hane (Siyahın 8'li hanesi):  3 pul
 * - 19. hane (Siyahın 6'lı hanesi):  5 pul
 * Toplam: 2 + 5 + 3 + 5 = 15 pul.
 */
export function getInitialPoints(): BoardPoints {
  // 1-indexed, size 25
  const points: BoardPoints = Array(25).fill(null);

  // Beyaz pullar (24'ten 1'e doğru, kendi evi 1-6'ya ilerler)
  points[24] = { color: 'white', count: 2 };
  points[13] = { color: 'white', count: 5 };
  points[8]  = { color: 'white', count: 3 };
  points[6]  = { color: 'white', count: 5 };

  // Siyah pullar (1'den 24'e doğru, kendi evi 19-24'e ilerler)
  points[1]  = { color: 'black', count: 2 };
  points[12] = { color: 'black', count: 5 };
  points[17] = { color: 'black', count: 3 };
  points[19] = { color: 'black', count: 5 };

  return points;
}

export function rollSingleDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Tavla Başlangıç Zarı (Açılış Atışı):
 * - İki oyuncu da birer zar atar.
 * - Büyük zar atan oyuncu oyuna başlama hakkını kazanır.
 * - Zarlar eşit gelirse (1-1, 2-2, vb.), kural gereği eşitlik bozulana kadar zarlar tekrar atılır.
 * - İlk hamlede yeni zar ATILMAZ; açılışta atılan bu iki zar birleştirilerek ilk hamle yapılır.
 */
export function performOpeningToss(): {
  whiteDie: number;
  blackDie: number;
  winner: PlayerColor | null;
  isTie: boolean;
  diceName: string;
} {
  const whiteDie = rollSingleDie();
  const blackDie = rollSingleDie();

  if (whiteDie === blackDie) {
    return {
      whiteDie,
      blackDie,
      winner: null,
      isTie: true,
      diceName: `${whiteDie} - ${blackDie} (Eşitlik)`,
    };
  }

  const winner: PlayerColor = whiteDie > blackDie ? 'white' : 'black';
  const high = Math.max(whiteDie, blackDie);
  const low = Math.min(whiteDie, blackDie);
  const key = `${high}-${low}`;
  const diceName = TURKISH_DICE_NAMES[key] || `${high} - ${low}`;

  return {
    whiteDie,
    blackDie,
    winner,
    isTie: false,
    diceName,
  };
}

export function createInitialTavlaState(
  gameMode: 'vs_bot' | 'pass_and_play' = 'vs_bot',
  botDifficulty: 'amator' | 'orta' | 'master' = 'master',
  targetScore: number = 5,
  previousWinner?: PlayerColor | null
): TavlaState {
  if (previousWinner) {
    const winnerName =
      previousWinner === 'white'
        ? 'Beyaz'
        : gameMode === 'vs_bot'
        ? 'Haydar Usta'
        : 'Siyah';

    return {
      points: getInitialPoints(),
      bar: { white: 0, black: 0 },
      borneOff: { white: 0, black: 0 },
      currentTurn: previousWinner,
      phase: 'playing',
      openingRoll: {
        whiteDie: null,
        blackDie: null,
        winner: previousWinner,
        status: 'decided',
        tieCount: 0,
        message: `Önceki partiyi kazanan ${winnerName} kural gereği yeni partiye ilk zar atarak başlıyor.`,
      },
      dice: [],
      usedDice: [],
      turnHistory: [],
      turnReadyToEnd: false,
      selectedPoint: null,
      validDestinations: [],
      winner: null,
      lastWinner: previousWinner,
      winType: null,
      isRolling: false,
      gameMode,
      botDifficulty,
      lastMoveDesc: `Önceki partiyi kazanan ${winnerName} yeni partiye ilk zar atarak başlıyor!`,
      diceNameTurkish: '',
      scores: {
        white: 0,
        black: 0,
        targetScore,
      },
    };
  }

  return {
    points: getInitialPoints(),
    bar: { white: 0, black: 0 },
    borneOff: { white: 0, black: 0 },
    currentTurn: 'white',
    phase: 'opening_roll',
    openingRoll: {
      whiteDie: null,
      blackDie: null,
      winner: null,
      status: 'waiting',
      tieCount: 0,
      message: 'Tavla kuralları: Başlangıç zarlarını atarak kimin başlayacağını belirleyin.',
    },
    dice: [],
    usedDice: [],
    turnHistory: [],
    turnReadyToEnd: false,
    selectedPoint: null,
    validDestinations: [],
    winner: null,
    lastWinner: null,
    winType: null,
    isRolling: false,
    gameMode,
    botDifficulty,
    lastMoveDesc: 'Başlangıç zarlarını atarak kimin başlayacağını belirleyin.',
    diceNameTurkish: '',
    scores: {
      white: 0,
      black: 0,
      targetScore,
    },
  };
}

export function startNextRound(
  state: TavlaState,
  previousWinner?: PlayerColor | null
): TavlaState {
  const winner = previousWinner || state.winner || state.lastWinner;

  if (winner) {
    const winnerName =
      winner === 'white'
        ? 'Beyaz'
        : state.gameMode === 'vs_bot'
        ? 'Haydar Usta'
        : 'Siyah';

    return {
      ...state,
      points: getInitialPoints(),
      bar: { white: 0, black: 0 },
      borneOff: { white: 0, black: 0 },
      currentTurn: winner,
      phase: 'playing',
      openingRoll: {
        whiteDie: null,
        blackDie: null,
        winner,
        status: 'decided',
        tieCount: 0,
        message: `Önceki partiyi kazanan ${winnerName} kural gereği yeni partiye ilk zar atarak başlıyor.`,
      },
      dice: [],
      usedDice: [],
      turnHistory: [],
      turnReadyToEnd: false,
      selectedPoint: null,
      validDestinations: [],
      winner: null,
      lastWinner: winner,
      winType: null,
      isRolling: false,
      lastMoveDesc: `Önceki partiyi kazanan ${winnerName} yeni partiye ilk zar atarak başlıyor!`,
      diceNameTurkish: '',
    };
  }

  return {
    ...state,
    points: getInitialPoints(),
    bar: { white: 0, black: 0 },
    borneOff: { white: 0, black: 0 },
    currentTurn: 'white',
    phase: 'opening_roll',
    openingRoll: {
      whiteDie: null,
      blackDie: null,
      winner: null,
      status: 'waiting',
      tieCount: 0,
      message: 'Yeni parti için başlangıç zarları atılıyor. Büyük atan başlar!',
    },
    dice: [],
    usedDice: [],
    turnHistory: [],
    turnReadyToEnd: false,
    selectedPoint: null,
    validDestinations: [],
    winner: null,
    lastWinner: null,
    winType: null,
    isRolling: false,
    lastMoveDesc: 'Yeni parti için başlangıç zarlarını atın.',
    diceNameTurkish: '',
  };
}

export function rollDice(): { dice: number[]; name: string } {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;

  const key1 = `${Math.max(d1, d2)}-${Math.min(d1, d2)}`;
  const turkishName = TURKISH_DICE_NAMES[key1] || `${d1} - ${d2}`;

  if (d1 === d2) {
    return { dice: [d1, d1, d1, d1], name: `${turkishName} (Çift!)` };
  }
  return { dice: [d1, d2], name: turkishName };
}

export function isPointOpen(stack: BoardPoints[number], myColor: PlayerColor): boolean {
  if (!stack) return true;
  if (stack.color === myColor) return true;
  return stack.count <= 1; // 1 opponent piece can be hit (blot), 2+ is a block (kapı)
}

export function canBearOff(
  points: BoardPoints,
  barCount: number,
  myColor: PlayerColor
): boolean {
  if (barCount > 0) return false;

  // White bears off from 1..6 (moves down from 24)
  if (myColor === 'white') {
    for (let i = 7; i <= 24; i++) {
      if (points[i]?.color === 'white') return false;
    }
    return true;
  }

  // Black bears off from 19..24 (moves up from 1)
  for (let i = 1; i <= 18; i++) {
    if (points[i]?.color === 'black') return false;
  }
  return true;
}

export function getHighestOccupiedPoint(
  points: BoardPoints,
  myColor: PlayerColor
): number {
  if (myColor === 'white') {
    for (let i = 6; i >= 1; i--) {
      if (points[i]?.color === 'white') return i;
    }
    return 0;
  } else {
    for (let i = 19; i <= 24; i++) {
      if (points[i]?.color === 'black') return i;
    }
    return 25;
  }
}

// Single step target resolver
function resolveSingleStep(
  fromPos: number | 'bar',
  dieVal: number,
  points: BoardPoints,
  turn: PlayerColor,
  isHome: boolean,
  highestPoint: number
): number | null {
  if (fromPos === 'bar') {
    const target = turn === 'white' ? 25 - dieVal : dieVal;
    if (isPointOpen(points[target], turn)) return target;
    return null;
  }

  const target = turn === 'white' ? fromPos - dieVal : fromPos + dieVal;

  if (turn === 'white') {
    if (target >= 1) {
      return isPointOpen(points[target], turn) ? target : null;
    } else if (isHome) {
      if (target === 0 || fromPos === highestPoint) return 0;
    }
  } else {
    if (target <= 24) {
      return isPointOpen(points[target], turn) ? target : null;
    } else if (isHome) {
      if (target === 25 || fromPos === highestPoint) return 25;
    }
  }

  return null;
}

// Get all legal destinations for a selected checker, INCLUDING COMBINED MULTI-DIE MOVES
export function getValidDestinations(
  source: number | 'bar',
  points: BoardPoints,
  bar: { white: number; black: number },
  dice: number[],
  usedDice: boolean[],
  turn: PlayerColor
): ValidMoveOption[] {
  // If player has broken checkers on the bar, ONLY the bar can move
  if (bar[turn] > 0 && source !== 'bar') {
    return [];
  }

  const available = dice
    .map((val, idx) => ({ val, idx }))
    .filter(({ idx }) => !usedDice[idx]);

  if (available.length === 0) return [];

  const moves: ValidMoveOption[] = [];
  const addedTargetKeys = new Set<string>();

  const isHome = canBearOff(points, bar[turn], turn);
  const highestPoint = isHome ? getHighestOccupiedPoint(points, turn) : 0;

  // 1. Single Die Moves (Always allowed for single checker step)
  const seenSingleVals = new Set<number>();
  for (const { val, idx } of available) {
    if (seenSingleVals.has(val)) continue;
    seenSingleVals.add(val);

    const target = resolveSingleStep(source, val, points, turn, isHome, highestPoint);
    if (target !== null) {
      const key = `single-${target}-${val}`;
      if (!addedTargetKeys.has(key)) {
        addedTargetKeys.add(key);
        moves.push({
          target,
          dieIndices: [idx],
          dieValues: [val],
          isCombined: false,
        });
      }
    }
  }

  // 2. Combined Multi-Die Moves:
  // CRITICAL TAVLA RULE: If player has MORE than 1 checker on the bar (bar[turn] > 1),
  // each remaining die must first be used to re-enter another checker from the bar!
  // One broken checker CANNOT take a combined double-die jump leaving the other broken checker stranded.
  // Both/all broken checkers must enter the board before any checker can consume multiple dice in one move.
  const allowCombined = bar[turn] <= 1;

  if (allowCombined) {
    // Combined 2-Die Moves (User can move both dice at once with one checker!)
    if (available.length >= 2) {
      for (let i = 0; i < available.length; i++) {
        for (let j = 0; j < available.length; j++) {
          if (i === j) continue;
          const d1 = available[i];
          const d2 = available[j];

          // Step 1: Hop with d1
          const intermediate = resolveSingleStep(source, d1.val, points, turn, isHome, highestPoint);
          if (intermediate === null || intermediate === 0 || intermediate === 25) continue;

          // Step 2: From intermediate, hop with d2
          const targetCombined = resolveSingleStep(intermediate, d2.val, points, turn, isHome, highestPoint);
          if (targetCombined !== null) {
            const key = `target-${targetCombined}`;
            const existing = moves.find((m) => m.target === targetCombined && m.isCombined);
            if (!existing) {
              moves.push({
                target: targetCombined,
                dieIndices: [d1.idx, d2.idx],
                dieValues: [d1.val, d2.val],
                isCombined: true,
                intermediateHop: intermediate,
              });
            }
          }
        }
      }
    }

    // 3. For Doubles: 3-die and 4-die hops if all available
    const isDoubles = dice.length === 4;
    if (isDoubles && available.length >= 3) {
      const val = available[0].val;
      const h1 = resolveSingleStep(source, val, points, turn, isHome, highestPoint);
      if (h1 !== null && h1 !== 0 && h1 !== 25) {
        const h2 = resolveSingleStep(h1, val, points, turn, isHome, highestPoint);
        if (h2 !== null && h2 !== 0 && h2 !== 25) {
          const h3 = resolveSingleStep(h2, val, points, turn, isHome, highestPoint);
          if (h3 !== null && !moves.some((m) => m.target === h3)) {
            moves.push({
              target: h3,
              dieIndices: [available[0].idx, available[1].idx, available[2].idx],
              dieValues: [val, val, val],
              isCombined: true,
              intermediateHop: h2,
            });
          }
        }
      }

      if (available.length === 4) {
        const h1_ = resolveSingleStep(source, val, points, turn, isHome, highestPoint);
        if (h1_ !== null && h1_ !== 0 && h1_ !== 25) {
          const h2_ = resolveSingleStep(h1_, val, points, turn, isHome, highestPoint);
          if (h2_ !== null && h2_ !== 0 && h2_ !== 25) {
            const h3_ = resolveSingleStep(h2_, val, points, turn, isHome, highestPoint);
            if (h3_ !== null && h3_ !== 0 && h3_ !== 25) {
              const h4_ = resolveSingleStep(h3_, val, points, turn, isHome, highestPoint);
              if (h4_ !== null && !moves.some((m) => m.target === h4_)) {
                moves.push({
                  target: h4_,
                  dieIndices: [available[0].idx, available[1].idx, available[2].idx, available[3].idx],
                  dieValues: [val, val, val, val],
                  isCombined: true,
                  intermediateHop: h3_,
                });
              }
            }
          }
        }
      }
    }
  }

  return moves;
}

// Check if current player has ANY legal move available
export function hasAnyLegalMoves(
  points: BoardPoints,
  bar: { white: number; black: number },
  dice: number[],
  usedDice: boolean[],
  turn: PlayerColor
): boolean {
  if (bar[turn] > 0) {
    const barMoves = getValidDestinations('bar', points, bar, dice, usedDice, turn);
    return barMoves.length > 0;
  }

  for (let i = 1; i <= 24; i++) {
    if (points[i]?.color === turn) {
      const moves = getValidDestinations(i, points, bar, dice, usedDice, turn);
      if (moves.length > 0) return true;
    }
  }
  return false;
}

// Execute move (single or combined multi-die)
export function executeMove(
  state: TavlaState,
  from: number | 'bar',
  to: number,
  moveOption: ValidMoveOption
): {
  newState: TavlaState;
  wasHit: boolean;
  moveDesc: string;
} {
  // Snapshot for UNDO
  const snapshot: TavlaTurnSnapshot = {
    points: state.points.map((p) => (p ? { ...p } : null)),
    bar: { ...state.bar },
    borneOff: { ...state.borneOff },
    usedDice: [...state.usedDice],
    lastMoveDesc: state.lastMoveDesc,
  };

  const points = state.points.map((p) => (p ? { ...p } : null));
  const bar = { ...state.bar };
  const borneOff = { ...state.borneOff };
  const usedDice = [...state.usedDice];
  const turn = state.currentTurn;
  const oppColor: PlayerColor = turn === 'white' ? 'black' : 'white';

  // Mark all dice involved as used
  for (const idx of moveOption.dieIndices) {
    usedDice[idx] = true;
  }

  let wasHit = false;

  // 1. Remove from source
  if (from === 'bar') {
    bar[turn]--;
  } else {
    const srcStack = points[from]!;
    if (srcStack.count === 1) {
      points[from] = null;
    } else {
      srcStack.count--;
    }
  }

  // 2. If combined move had an intermediate hop that hit an opponent blot
  if (moveOption.isCombined && moveOption.intermediateHop) {
    const interStack = points[moveOption.intermediateHop];
    if (interStack && interStack.color === oppColor && interStack.count === 1) {
      wasHit = true;
      bar[oppColor]++;
      points[moveOption.intermediateHop] = null;
    }
  }

  // 3. Add to destination
  let moveDesc = '';
  const totalVal = moveOption.dieValues.reduce((a, b) => a + b, 0);
  const combinedText = moveOption.isCombined
    ? ` (${moveOption.dieValues.join('+')} = ${totalVal} çift hamle)`
    : '';

  if (to === 0 || to === 25) {
    // Bear off
    borneOff[turn]++;
    moveDesc = `${turn === 'white' ? 'Beyaz' : 'Siyah'} pul topladı${combinedText} (${borneOff[turn]}/15).`;
  } else {
    const destStack = points[to];
    if (destStack && destStack.color === oppColor && destStack.count === 1) {
      // Hit!
      wasHit = true;
      bar[oppColor]++;
      points[to] = { color: turn, count: 1 };
      moveDesc = `${turn === 'white' ? 'Beyaz' : 'Siyah'} ${to}. hanedeki açık pulu kırdı!${combinedText}`;
    } else if (destStack && destStack.color === turn) {
      destStack.count++;
      moveDesc = `${turn === 'white' ? 'Beyaz' : 'Siyah'} ${to}. haneye kapı aldı${combinedText} (${destStack.count} pul).`;
    } else {
      points[to] = { color: turn, count: 1 };
      moveDesc = `${turn === 'white' ? 'Beyaz' : 'Siyah'} ${from === 'bar' ? 'kırıktan' : from + '.'} haneden ${to}. haneye ilerledi${combinedText}.`;
    }
  }

  // Check victory
  let winner: PlayerColor | null = null;
  let winType: 'düz' | 'mars' | 'katmerli_mars' | null = null;
  const scores = { ...state.scores };

  if (borneOff[turn] === 15) {
    winner = turn;
    const oppBorne = borneOff[oppColor];
    if (oppBorne === 0) {
      const oppHasInWinnerHome = checkOpponentInHome(points, bar, oppColor, turn);
      if (oppHasInWinnerHome) {
        winType = 'katmerli_mars';
        scores[turn] += 3;
      } else {
        winType = 'mars';
        scores[turn] += 2;
      }
    } else {
      winType = 'düz';
      scores[turn] += 1;
    }
  }

  // Determine if moves are exhausted
  const allDiceUsed = usedDice.every(Boolean);
  const remainingMoves = !allDiceUsed && hasAnyLegalMoves(points, bar, state.dice, usedDice, turn);
  const movesExhausted = allDiceUsed || !remainingMoves;

  const newState: TavlaState = {
    ...state,
    points,
    bar,
    borneOff,
    usedDice,
    turnHistory: [...state.turnHistory, snapshot],
    turnReadyToEnd: movesExhausted && !winner,
    selectedPoint: null,
    validDestinations: [],
    winner,
    lastWinner: winner || state.lastWinner,
    winType,
    lastMoveDesc: moveDesc,
    scores,
  };

  return { newState, wasHit, moveDesc };
}

// Undo Last Move within the current turn
export function undoLastMove(state: TavlaState): TavlaState {
  if (state.turnHistory.length === 0) return state;

  const history = [...state.turnHistory];
  const lastSnapshot = history.pop()!;

  return {
    ...state,
    points: lastSnapshot.points.map((p) => (p ? { ...p } : null)),
    bar: { ...lastSnapshot.bar },
    borneOff: { ...lastSnapshot.borneOff },
    usedDice: [...lastSnapshot.usedDice],
    turnHistory: history,
    selectedPoint: null,
    validDestinations: [],
    winner: null,
    winType: null,
    turnReadyToEnd: false,
    lastMoveDesc: 'Son hamle geri alındı.',
  };
}

// Confirm end of turn and pass to other player
export function confirmTurnEnd(state: TavlaState): TavlaState {
  const oppColor: PlayerColor = state.currentTurn === 'white' ? 'black' : 'white';
  return {
    ...state,
    currentTurn: oppColor,
    dice: [],
    usedDice: [],
    turnHistory: [],
    turnReadyToEnd: false,
    selectedPoint: null,
    validDestinations: [],
    diceNameTurkish: '',
    lastMoveDesc: `Sıra ${oppColor === 'white' ? 'Beyaz' : 'Siyah'}'a geçti. Zarları atın.`,
  };
}

function checkOpponentInHome(
  points: BoardPoints,
  bar: { white: number; black: number },
  oppColor: PlayerColor,
  winnerColor: PlayerColor
): boolean {
  if (bar[oppColor] > 0) return true;
  if (winnerColor === 'white') {
    for (let i = 1; i <= 6; i++) {
      if (points[i]?.color === oppColor) return true;
    }
  } else {
    for (let i = 19; i <= 24; i++) {
      if (points[i]?.color === oppColor) return true;
    }
  }
  return false;
}

// AI Bot Evaluator for Haydar Usta (Black pieces)
// Supports 3 authentic difficulty modes:
// 1. 'amator' (Çırak Haydar): Casual, occasionally makes blunders, misses hits, or moves randomly.
// 2. 'orta' (Kalfa Haydar): Solid player, prioritizes basic safety, making gates and hitting open checkers.
// 3. 'master' (Büyük Usta Haydar): Master tactician, calculates blot exposure probability, primes (arka arkaya kapı),
//    anchors in opponent territory, traps opponent, bears off with maximum speed and security.
export function getBotBestMove(state: TavlaState): { from: number | 'bar'; to: number; moveOption: ValidMoveOption } | null {
  const turn = state.currentTurn;
  const oppColor: PlayerColor = turn === 'white' ? 'black' : 'white';
  const difficulty = state.botDifficulty || 'master';

  const candidates: {
    from: number | 'bar';
    to: number;
    moveOption: ValidMoveOption;
    score: number;
  }[] = [];

  const checkSource = (src: number | 'bar') => {
    const destinations = getValidDestinations(
      src,
      state.points,
      state.bar,
      state.dice,
      state.usedDice,
      turn
    );

    for (const d of destinations) {
      let score = 0;

      if (difficulty === 'amator') {
        // Amatör / Çırak: High randomness, small heuristics
        if (d.target === 25 || d.target === 0) {
          score += 40;
        } else {
          const destStack = state.points[d.target];
          if (destStack && destStack.color === oppColor && destStack.count === 1) {
            score += Math.random() > 0.4 ? 50 : 10; // sometimes overlooks hitting
          }
          if (destStack && destStack.color === turn && destStack.count === 1) {
            score += 25;
          }
          score += Math.random() * 60; // random impulse plays
        }
      } else if (difficulty === 'orta') {
        // Orta / Kalfa: Good standard play
        if (d.target === 25 || d.target === 0) {
          score += 85;
        } else {
          const destStack = state.points[d.target];
          if (destStack && destStack.color === oppColor && destStack.count === 1) {
            score += 90; // Hit blot
          }
          if (destStack && destStack.color === turn && destStack.count === 1) {
            score += 65; // Make gate
          }
          if (src === 'bar') {
            score += 60;
          } else if (typeof src === 'number' && src <= 6 && d.target > 6) {
            score += 40; // Escape back checkers
          }
          if (!d.isCombined) {
            score += 25;
          }
          score += d.dieValues.reduce((a, b) => a + b, 0) * 1.2;
          score += Math.random() * 12;
        }
      } else {
        // Master / Büyük Usta (Grandmaster Tavla Strategy):
        if (d.target === 25 || d.target === 0) {
          score += 120; // Bear off
        } else {
          const destStack = state.points[d.target];

          // 1. Hitting opponent blot (Vurma)
          if (destStack && destStack.color === oppColor && destStack.count === 1) {
            // Very high priority, especially deep in opponent territory or home board
            score += 140;
            if (d.target >= 19) score += 40; // Hit in bot's inner board (mars risk for opponent)
          }

          // 2. Making a point / gate (Kapı Alma)
          if (destStack && destStack.color === turn && destStack.count === 1) {
            score += 90;
            // Golden points in Tavla: points 5, 7, 20 (opp's 5)
            if (d.target === 20 || d.target === 19 || d.target === 7) {
              score += 35;
            }
          }

          // 3. Escaping runners from opponent's inner board (1 to 6)
          if (src === 'bar') {
            score += 80;
            // Prefer safe point when entering
            if (destStack && destStack.color === turn) score += 30;
          } else if (typeof src === 'number' && src <= 6) {
            if (d.target > 6) {
              score += 65; // escaping runner
            }
          }

          // 4. Leaving an exposed blot penalty (Açık Verme Cezası)
          // If moving leaves the source point with count 1 (blot), penalize unless it was already a blot
          if (typeof src === 'number') {
            const srcStack = state.points[src];
            if (srcStack && srcStack.count === 2) {
              score -= 35; // breaking a solid gate
            }
          }

          // 5. Priming bonus (Blockading 4-6 consecutive points)
          if (d.target >= 12 && d.target <= 23) {
            score += 20;
          }

          // 6. Prefer single-die distinct moves for visual clarity
          if (!d.isCombined) {
            score += 20;
          }

          score += d.dieValues.reduce((a, b) => a + b, 0) * 1.5;
          score += Math.random() * 4; // slight tie-breaker
        }
      }

      candidates.push({
        from: src,
        to: d.target,
        moveOption: d,
        score,
      });
    }
  };

  if (state.bar[turn] > 0) {
    checkSource('bar');
  } else {
    for (let i = 1; i <= 24; i++) {
      if (state.points[i]?.color === turn) {
        checkSource(i);
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}
