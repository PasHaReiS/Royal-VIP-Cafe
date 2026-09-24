import {
  OkeyState,
  OkeyTile,
  PlayerHand,
  TileColor,
  OkeyVariant,
  MeldGroup,
  PlayerOpenedMelds,
  CanakBreakEvent,
} from '../types/okey';

export const TILE_COLORS: TileColor[] = ['red', 'black', 'blue', 'yellow'];

// Generate full 106-tile Okey set
export function createOkeyDeck(): OkeyTile[] {
  const deck: OkeyTile[] = [];
  let idCounter = 1;

  // 2 sets of numbers 1..13 in 4 colors = 104 tiles
  for (let set = 1; set <= 2; set++) {
    for (const color of TILE_COLORS) {
      for (let num = 1; num <= 13; num++) {
        deck.push({
          id: `tile_${color}_${num}_${set}_${idCounter++}`,
          color,
          number: num,
          isFakeOkey: false,
        });
      }
    }
  }

  // 2 Fake Okeys (Sahte Okey)
  deck.push({
    id: `fake_okey_1_${idCounter++}`,
    color: 'black', // Default display symbol
    number: 0, // Sahte Okey indicator
    isFakeOkey: true,
  });
  deck.push({
    id: `fake_okey_2_${idCounter++}`,
    color: 'black',
    number: 0,
    isFakeOkey: true,
  });

  return shuffle(deck);
}

export function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function isRealOkey(
  tile: OkeyTile,
  okeyColor: TileColor,
  okeyNumber: number
): boolean {
  if (tile.isFakeOkey) return false;
  return tile.color === okeyColor && tile.number === okeyNumber;
}

// Get the effective value of a tile (taking into account Fake Okey representing the replaced number)
export function getEffectiveTile(
  tile: OkeyTile,
  okeyColor: TileColor,
  okeyNumber: number
): { color: TileColor; number: number; isWildcard: boolean } {
  if (tile.isFakeOkey) {
    return { color: okeyColor, number: okeyNumber, isWildcard: false };
  }
  if (isRealOkey(tile, okeyColor, okeyNumber)) {
    return { color: tile.color, number: tile.number, isWildcard: true };
  }
  return { color: tile.color, number: tile.number, isWildcard: false };
}

// Get face value of a tile for 101 scoring
export function getTileFaceValue(
  tile: OkeyTile,
  okeyColor: TileColor,
  okeyNumber: number
): number {
  if (tile.isFakeOkey) return okeyNumber;
  if (isRealOkey(tile, okeyColor, okeyNumber)) return okeyNumber;
  return tile.number;
}

// Initial deal and state creation
export function createInitialOkeyState(
  variant: OkeyVariant = 'klasik',
  initialCanak: number = 600
): OkeyState {
  const fullDeck = createOkeyDeck();

  // Draw indicator (Gösterge) - must not be a fake okey
  let indicatorIdx = fullDeck.findIndex((t) => !t.isFakeOkey);
  if (indicatorIdx === -1) indicatorIdx = 0;
  const [indicatorTile] = fullDeck.splice(indicatorIdx, 1);

  // The OKEY is the same color, +1 of indicator (13 wraps to 1)
  const okeyColor = indicatorTile.color;
  const okeyNumber = indicatorTile.number === 13 ? 1 : indicatorTile.number + 1;

  // 4 Players: 0 is User, 1 is Haydar Usta (Right), 2 is Selim Abi (Top), 3 is Murat Kaptan (Left)
  const players: PlayerHand[] = [
    {
      id: 'player_0',
      name: 'Siz (VIP Oyuncu)',
      avatar: '👑',
      isBot: false,
      rackSlots: Array(28).fill(null),
      score: 20,
      penalties: 0,
    },
    {
      id: 'player_1',
      name: 'Haydar Usta',
      avatar: '🧔🏻‍♂️',
      isBot: true,
      rackSlots: Array(28).fill(null),
      score: 20,
      penalties: 0,
    },
    {
      id: 'player_2',
      name: 'Selim Abi',
      avatar: '👓',
      isBot: true,
      rackSlots: Array(28).fill(null),
      score: 20,
      penalties: 0,
    },
    {
      id: 'player_3',
      name: 'Murat Kaptan',
      avatar: '⚓',
      isBot: true,
      rackSlots: Array(28).fill(null),
      score: 20,
      penalties: 0,
    },
  ];

  // Starter (player 0) receives 15 tiles, others receive 14
  // Player 0: First 14 tiles go to Top Shelf (slots 0..13), 15th starter tile goes to Bottom Shelf (slot 14)
  const counts = [15, 14, 14, 14];
  counts.forEach((count, pIdx) => {
    const dealt = fullDeck.splice(0, count);
    if (pIdx === 0 && count === 15) {
      for (let i = 0; i < 14; i++) {
        players[pIdx].rackSlots[i] = dealt[i];
      }
      players[pIdx].rackSlots[14] = dealt[14];
    } else {
      const sortedBotHand = sortHandRuns(dealt, okeyColor, okeyNumber);
      players[pIdx].rackSlots = sortedBotHand;
    }
  });

  const variantTitle = variant === 'yuzbir' ? '101 (YüzBir) Okey' : 'Klasik Okey';

  return {
    variant,
    deck: fullDeck,
    indicatorTile,
    okeyTileColor: okeyColor,
    okeyTileNumber: okeyNumber,
    players,
    currentTurnPlayerIndex: 0, // Starter plays first with 15 tiles
    hasDrawnThisTurn: true, // Starter starts already with 15 tiles, must discard 1
    discardPiles: [[], [], [], []],
    lastDrawnFrom: null,
    winnerIndex: null,
    winType: null,
    statusMessage:
      variant === 'yuzbir'
        ? 'Sıra sizde: 15 taşınız var, başlamak için 1 taşınızı sağ tarafınıza atın.'
        : 'Sıra sizde: 15 taşınız var, başlamak için 1 taşınızı sağ tarafınıza atın.',
    cafeDialogue: [
      {
        sender: 'Garson Rıza',
        text: `Masaya taze tavşan kanı çaylar geldi. Afiyet olsun beyler!`,
        time: 'Az önce',
      },
      {
        sender: 'Haydar Usta',
        text: `Hadi bismillah! Gösterge: ${indicatorTile.color} ${indicatorTile.number}. Okeyimiz ${okeyColor} ${okeyNumber}!`,
        time: 'Şimdi',
      },
    ],
    isThinking: false,
    selectedSlotIndex: null,
    canakGold: initialCanak,
    canakBreakEvent: null,
    openedTableMelds: [],
    playerHasOpened: [false, false, false, false],
    playerPenaltyScores: [0, 0, 0, 0],
  };
}

// Auto-sort Hand by Colors and Runs (Seri Diz)
export function sortHandRuns(
  tiles: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): (OkeyTile | null)[] {
  const regularTiles = tiles.filter((t) => !isRealOkey(t, okeyColor, okeyNumber) && !t.isFakeOkey);
  const fakeOkeys = tiles.filter((t) => t.isFakeOkey);
  const realOkeys = tiles.filter((t) => isRealOkey(t, okeyColor, okeyNumber));

  // Sort regulars by color, then number
  regularTiles.sort((a, b) => {
    if (a.color !== b.color) {
      return TILE_COLORS.indexOf(a.color) - TILE_COLORS.indexOf(b.color);
    }
    return a.number - b.number;
  });

  const sortedAll = [...regularTiles, ...fakeOkeys, ...realOkeys];
  const newSlots: (OkeyTile | null)[] = Array(28).fill(null);
  // Keep first 14 tiles in top row (0..13) and 15th tile on bottom row (slot 14)
  sortedAll.forEach((t, i) => {
    if (i < 14) {
      newSlots[i] = t;
    } else if (i === 14) {
      newSlots[14] = t; // Slot 14 is the first slot of bottom row
    } else if (i < 28) {
      newSlots[i] = t;
    }
  });
  return newSlots;
}

// Auto-sort Hand by Pairs (Çift Diz)
export function sortHandPairs(
  tiles: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): (OkeyTile | null)[] {
  const map = new Map<string, OkeyTile[]>();

  tiles.forEach((tile) => {
    const key = tile.isFakeOkey
      ? `fake_${okeyColor}_${okeyNumber}`
      : `${tile.color}_${tile.number}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tile);
  });

  const pairs: OkeyTile[] = [];
  const singles: OkeyTile[] = [];

  map.forEach((group) => {
    while (group.length >= 2) {
      pairs.push(group.shift()!);
      pairs.push(group.shift()!);
    }
    if (group.length === 1) {
      singles.push(group.shift()!);
    }
  });

  const arranged = [...pairs, ...singles];
  const newSlots: (OkeyTile | null)[] = Array(28).fill(null);
  // Keep first 14 tiles in top row (0..13) and 15th tile on bottom row (slot 14)
  arranged.forEach((t, i) => {
    if (i < 14) {
      newSlots[i] = t;
    } else if (i === 14) {
      newSlots[14] = t; // Bottom row first slot
    } else if (i < 28) {
      newSlots[i] = t;
    }
  });
  return newSlots;
}

// Check if a group of tiles forms a valid Run (Seri)
export function isValidRun(
  tiles: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): boolean {
  if (tiles.length < 3) return false;

  // Separate wildcards (real okeys) and fixed tiles
  const wildcards = tiles.filter((t) => isRealOkey(t, okeyColor, okeyNumber));
  const fixed = tiles
    .filter((t) => !isRealOkey(t, okeyColor, okeyNumber))
    .map((t) => getEffectiveTile(t, okeyColor, okeyNumber));

  if (fixed.length === 0) return true; // all wildcards is trivially valid

  // All fixed tiles must have the same color
  const color = fixed[0].color;
  if (!fixed.every((f) => f.color === color)) return false;

  // Check if they can be ordered in consecutive numbers
  const fixedNums = fixed.map((f) => f.number).sort((a, b) => a - b);

  // Check duplicates
  for (let i = 0; i < fixedNums.length - 1; i++) {
    if (fixedNums[i] === fixedNums[i + 1]) return false;
  }

  // 1 can come after 13: e.g. 11, 12, 13, 1
  const minNum = fixedNums[0];
  const maxNum = fixedNums[fixedNums.length - 1];

  let wildcardCount = wildcards.length;
  // Standard run check
  let neededWildcards = 0;
  for (let i = 0; i < fixedNums.length - 1; i++) {
    const diff = fixedNums[i + 1] - fixedNums[i] - 1;
    neededWildcards += diff;
  }

  if (neededWildcards <= wildcardCount) {
    const totalSpan = maxNum - minNum + 1 + (wildcardCount - neededWildcards);
    if (totalSpan >= tiles.length && totalSpan <= 13) return true;
  }

  // Check 13-1 wrapping run: e.g. 11, 12, 13, 1
  if (fixedNums.includes(1) && fixedNums.some((n) => n >= 10)) {
    const highNums = fixedNums.filter((n) => n >= 10);
    // 1 treated as 14
    let wrapNeeded = 0;
    for (let i = 0; i < highNums.length - 1; i++) {
      wrapNeeded += highNums[i + 1] - highNums[i] - 1;
    }
    wrapNeeded += 13 - highNums[highNums.length - 1]; // gap to 13
    if (wrapNeeded <= wildcardCount) return true;
  }

  return false;
}

// Check if a group of tiles forms a valid Set (Grup / Farklı Renk Aynı Numara)
export function isValidSet(
  tiles: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): boolean {
  if (tiles.length < 3 || tiles.length > 4) return false;

  const fixed = tiles
    .filter((t) => !isRealOkey(t, okeyColor, okeyNumber))
    .map((t) => getEffectiveTile(t, okeyColor, okeyNumber));

  if (fixed.length === 0) return true;

  const num = fixed[0].number;
  if (!fixed.every((f) => f.number === num)) return false;

  // Colors must be distinct
  const colors = new Set(fixed.map((f) => f.color));
  if (colors.size !== fixed.length) return false;

  return true;
}

// Check if a list of 14 tiles can be a winning hand (7 pairs or valid partitions of melds)
export function checkWinningHand(
  tiles: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): { isWin: boolean; type: 'normal' | 'cift' | null; description: string } {
  if (tiles.length !== 14) {
    return { isWin: false, type: null, description: 'Elde tam 14 taş olmalıdır.' };
  }

  // 1. Check Çifte (7 pairs)
  if (checkSevenPairs(tiles, okeyColor, okeyNumber)) {
    return { isWin: true, type: 'cift', description: 'Tebrikler! 7 Çift ile Okey bitti!' };
  }

  // 2. Check Standard Melds partition
  if (canPartitionIntoMelds(tiles, okeyColor, okeyNumber)) {
    return { isWin: true, type: 'normal', description: 'Tebrikler! Tüm perleriniz eksiksiz tamamlandı!' };
  }

  return { isWin: false, type: null, description: 'Eliniz henüz tam perlere ayrılmadı.' };
}

// Check if 14 tiles form 7 valid pairs
function checkSevenPairs(
  tiles: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): boolean {
  const wildcards = tiles.filter((t) => isRealOkey(t, okeyColor, okeyNumber)).length;
  const regularCounts = new Map<string, number>();

  tiles
    .filter((t) => !isRealOkey(t, okeyColor, okeyNumber))
    .forEach((t) => {
      const eff = getEffectiveTile(t, okeyColor, okeyNumber);
      const key = `${eff.color}_${eff.number}`;
      regularCounts.set(key, (regularCounts.get(key) || 0) + 1);
    });

  let pairsFormed = 0;
  let remainingSingles = 0;

  regularCounts.forEach((count) => {
    pairsFormed += Math.floor(count / 2);
    if (count % 2 === 1) remainingSingles++;
  });

  // Each wildcard can pair with a single, or two wildcards form a pair
  let wcLeft = wildcards;
  const matchedSingles = Math.min(remainingSingles, wcLeft);
  pairsFormed += matchedSingles;
  wcLeft -= matchedSingles;
  pairsFormed += Math.floor(wcLeft / 2);

  return pairsFormed >= 7;
}

// Partition search for valid standard melds
function canPartitionIntoMelds(
  tiles: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): boolean {
  // Sort tiles to group like elements together
  const sorted = [...tiles].sort((a, b) => {
    const ea = getEffectiveTile(a, okeyColor, okeyNumber);
    const eb = getEffectiveTile(b, okeyColor, okeyNumber);
    if (ea.isWildcard) return 1;
    if (eb.isWildcard) return -1;
    if (ea.color !== eb.color) return ea.color.localeCompare(eb.color);
    return ea.number - eb.number;
  });

  return searchMelds(sorted, okeyColor, okeyNumber);
}

function searchMelds(
  remaining: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): boolean {
  if (remaining.length === 0) return true;
  if (remaining.length < 3) return false;

  const first = remaining[0];

  // Try forming a group or run with 'first' and other tiles
  for (let size = 3; size <= Math.min(5, remaining.length); size++) {
    const combinations = getCombinations(remaining.slice(1), size - 1);
    for (const combo of combinations) {
      const candidateMeld = [first, ...combo];
      if (
        isValidRun(candidateMeld, okeyColor, okeyNumber) ||
        isValidSet(candidateMeld, okeyColor, okeyNumber)
      ) {
        // Remove used tiles from remaining
        const candidateIds = new Set(candidateMeld.map((t) => t.id));
        const rest = remaining.filter((t) => !candidateIds.has(t.id));
        if (searchMelds(rest, okeyColor, okeyNumber)) {
          return true;
        }
      }
    }
  }

  return false;
}

function getCombinations<T>(array: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (array.length < k) return [];
  const head = array[0];
  const tail = array.slice(1);
  const withHead = getCombinations(tail, k - 1).map((c) => [head, ...c]);
  const withoutHead = getCombinations(tail, k);
  return [...withHead, ...withoutHead];
}

// Bot Decision Making for Okey - Pure and safe state return
export function playBotTurn(state: OkeyState): {
  drawnFrom: 'deck' | 'discard';
  drawnTile: OkeyTile;
  discardedTile: OkeyTile;
  botComment: string;
  hasFinished: boolean;
  newBotSlots: (OkeyTile | null)[];
} {
  const pIdx = state.currentTurnPlayerIndex;
  const bot = state.players[pIdx];
  const leftPlayerIdx = (pIdx + 3) % 4;
  const leftDiscard = state.discardPiles[leftPlayerIdx] || [];
  const lastDiscarded = leftDiscard.length > 0 ? leftDiscard[leftDiscard.length - 1] : null;

  let drawnFrom: 'deck' | 'discard' = 'deck';
  let drawnTile: OkeyTile;

  // Inspect existing tiles safely
  const currentTiles = bot.rackSlots.filter((t): t is OkeyTile => t !== null);

  // Evaluate if left discard is attractive
  let wantsDiscard = false;
  if (lastDiscarded) {
    if (isRealOkey(lastDiscarded, state.okeyTileColor, state.okeyTileNumber)) {
      wantsDiscard = true; // Always pick up Okey if thrown!
    } else {
      // Check if it forms a match with 2 existing tiles
      for (let i = 0; i < currentTiles.length; i++) {
        for (let j = i + 1; j < currentTiles.length; j++) {
          const testGroup = [lastDiscarded, currentTiles[i], currentTiles[j]];
          if (
            isValidRun(testGroup, state.okeyTileColor, state.okeyTileNumber) ||
            isValidSet(testGroup, state.okeyTileColor, state.okeyTileNumber)
          ) {
            wantsDiscard = true;
            break;
          }
        }
        if (wantsDiscard) break;
      }
    }
  }

  if (wantsDiscard && lastDiscarded && leftDiscard.length > 0) {
    drawnFrom = 'discard';
    drawnTile = lastDiscarded;
  } else {
    drawnFrom = 'deck';
    drawnTile = state.deck[0] || lastDiscarded || currentTiles[0];
  }

  const allTiles = [...currentTiles, drawnTile];

  // Evaluate which tile to discard (pick the one with least connectivity)
  let bestDiscardIdx = 0;
  let minScore = Infinity;

  allTiles.forEach((tile, idx) => {
    // Never discard Okey unless finishing!
    if (isRealOkey(tile, state.okeyTileColor, state.okeyTileNumber)) {
      return;
    }

    let connectivity = 0;
    allTiles.forEach((other, oIdx) => {
      if (idx === oIdx) return;
      if (other.color === tile.color && Math.abs(other.number - tile.number) <= 2) {
        connectivity += 3;
      }
      if (other.number === tile.number && other.color !== tile.color) {
        connectivity += 3;
      }
    });

    if (connectivity < minScore) {
      minScore = connectivity;
      bestDiscardIdx = idx;
    }
  });

  const [discardedTile] = allTiles.splice(bestDiscardIdx, 1);

  // Put remaining tiles back into bot slots, sorted logically into runs & groups so their rack is realistically organized
  const sortedTiles = sortHandRuns(allTiles, state.okeyTileColor, state.okeyTileNumber);
  const newBotSlots = sortedTiles;

  // Check if bot finishes
  const winCheck = checkWinningHand(allTiles, state.okeyTileColor, state.okeyTileNumber);

  // Generate authentic cafe banter
  const comments = [
    'Taşlar fena gelmedi ama ortadan devam.',
    'Gözüm arkada kalmadı, bu taşı salıyorum.',
    'Hadi bakalım Haydar Usta, perler yavaş yavaş toplanıyor.',
    'Bu taşa dikkat edin derim beyler!',
    'Rıza bize bir çay tazele hele!',
    'Ortadan çektik, bakalım şansımız ne diyecek.',
  ];
  const botComment = comments[Math.floor(Math.random() * comments.length)];

  return {
    drawnFrom,
    drawnTile,
    discardedTile,
    botComment,
    hasFinished: winCheck.isWin,
    newBotSlots,
  };
}

// Check if a sequence of tiles is a valid pair (Çift)
export function isValidPair(
  tiles: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): boolean {
  if (tiles.length !== 2) return false;
  const [t1, t2] = tiles;
  const isJoker1 = isRealOkey(t1, okeyColor, okeyNumber);
  const isJoker2 = isRealOkey(t2, okeyColor, okeyNumber);

  if (isJoker1 || isJoker2) return true;

  const eff1 = getEffectiveTile(t1, okeyColor, okeyNumber);
  const eff2 = getEffectiveTile(t2, okeyColor, okeyNumber);

  return eff1.color === eff2.color && eff1.number === eff2.number;
}

// Calculate sum of tile face values in a meld
export function calculateMeldScore(
  tiles: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): number {
  return tiles.reduce((acc, t) => acc + getTileFaceValue(t, okeyColor, okeyNumber), 0);
}

// Find all disjoint valid melds (runs & sets) in a player's hand and calculate 101 points
export function findHand101Melds(
  tiles: OkeyTile[],
  okeyColor: TileColor,
  okeyNumber: number
): {
  melds: MeldGroup[];
  totalPoints: number;
  canOpenSeri: boolean;
  pairs: MeldGroup[];
  pairCount: number;
  canOpenCift: boolean;
} {
  const available = [...tiles];
  const melds: MeldGroup[] = [];
  let totalPoints = 0;

  // 1. Find pairs (Çiftler)
  const pairTilesMap = new Map<string, OkeyTile[]>();
  tiles.forEach((t) => {
    const eff = getEffectiveTile(t, okeyColor, okeyNumber);
    const key = isRealOkey(t, okeyColor, okeyNumber) ? 'joker' : `${eff.color}_${eff.number}`;
    if (!pairTilesMap.has(key)) pairTilesMap.set(key, []);
    pairTilesMap.get(key)!.push(t);
  });

  const pairs: MeldGroup[] = [];
  const jokers = pairTilesMap.get('joker') || [];
  pairTilesMap.delete('joker');

  pairTilesMap.forEach((grp) => {
    while (grp.length >= 2) {
      pairs.push({
        type: 'cift',
        tiles: [grp.shift()!, grp.shift()!],
        isValid: true,
      });
    }
  });

  // Use remaining singles with jokers
  const singles: OkeyTile[] = [];
  pairTilesMap.forEach((grp) => {
    if (grp.length === 1) singles.push(grp[0]);
  });
  while (jokers.length > 0 && singles.length > 0) {
    pairs.push({
      type: 'cift',
      tiles: [singles.shift()!, jokers.shift()!],
      isValid: true,
    });
  }
  while (jokers.length >= 2) {
    pairs.push({
      type: 'cift',
      tiles: [jokers.shift()!, jokers.shift()!],
      isValid: true,
    });
  }

  // 2. Find Runs (Seriler - same color consecutive)
  for (const color of TILE_COLORS) {
    const colorTiles = available.filter(
      (t) => t.color === color && !t.isFakeOkey && !isRealOkey(t, okeyColor, okeyNumber)
    );
    colorTiles.sort((a, b) => a.number - b.number);

    // Group consecutive sequences
    let currentRun: OkeyTile[] = [];
    for (let i = 0; i < colorTiles.length; i++) {
      const tile = colorTiles[i];
      if (currentRun.length === 0) {
        currentRun.push(tile);
      } else {
        const last = currentRun[currentRun.length - 1];
        if (tile.number === last.number + 1) {
          currentRun.push(tile);
        } else if (tile.number === last.number) {
          // duplicate number in same color, skip for this run
          continue;
        } else {
          if (currentRun.length >= 3) {
            melds.push({
              type: 'seri',
              tiles: [...currentRun],
              isValid: true,
              score: calculateMeldScore(currentRun, okeyColor, okeyNumber),
            });
            // remove from available
            const usedIds = new Set(currentRun.map((t) => t.id));
            for (let j = available.length - 1; j >= 0; j--) {
              if (usedIds.has(available[j].id)) available.splice(j, 1);
            }
          }
          currentRun = [tile];
        }
      }
    }
    if (currentRun.length >= 3) {
      melds.push({
        type: 'seri',
        tiles: [...currentRun],
        isValid: true,
        score: calculateMeldScore(currentRun, okeyColor, okeyNumber),
      });
      const usedIds = new Set(currentRun.map((t) => t.id));
      for (let j = available.length - 1; j >= 0; j--) {
        if (usedIds.has(available[j].id)) available.splice(j, 1);
      }
    }
  }

  // 3. Find Sets (Gruplar - same number, different colors)
  for (let num = 1; num <= 13; num++) {
    const sameNumTiles = available.filter(
      (t) =>
        getTileFaceValue(t, okeyColor, okeyNumber) === num &&
        !isRealOkey(t, okeyColor, okeyNumber)
    );
    // Distinct colors
    const uniqueByColor: OkeyTile[] = [];
    const seenColors = new Set<string>();
    sameNumTiles.forEach((t) => {
      if (!seenColors.has(t.color)) {
        seenColors.add(t.color);
        uniqueByColor.push(t);
      }
    });

    if (uniqueByColor.length >= 3) {
      const setMeld = uniqueByColor.slice(0, 4);
      melds.push({
        type: 'grup',
        tiles: setMeld,
        isValid: true,
        score: calculateMeldScore(setMeld, okeyColor, okeyNumber),
      });
      const usedIds = new Set(setMeld.map((t) => t.id));
      for (let j = available.length - 1; j >= 0; j--) {
        if (usedIds.has(available[j].id)) available.splice(j, 1);
      }
    }
  }

  totalPoints = melds.reduce((acc, m) => acc + (m.score || 0), 0);

  return {
    melds,
    totalPoints,
    canOpenSeri: totalPoints >= 101,
    pairs,
    pairCount: pairs.length,
    canOpenCift: pairs.length >= 5,
  };
}

// Check if a tile can be appended/processed into an open table meld
export function canAppendTileToMeld(
  tile: OkeyTile,
  meld: MeldGroup,
  okeyColor: TileColor,
  okeyNumber: number
): { canAppend: boolean; position: 'start' | 'end' | 'any'; newTiles: OkeyTile[] } {
  const isJoker = isRealOkey(tile, okeyColor, okeyNumber);
  const effTile = getEffectiveTile(tile, okeyColor, okeyNumber);

  if (meld.type === 'grup') {
    if (meld.tiles.length >= 4) return { canAppend: false, position: 'any', newTiles: meld.tiles };
    const firstNum = getEffectiveTile(meld.tiles[0], okeyColor, okeyNumber).number;
    if (effTile.number !== firstNum && !isJoker) return { canAppend: false, position: 'any', newTiles: meld.tiles };
    const existingColors = new Set(
      meld.tiles.map((t) => getEffectiveTile(t, okeyColor, okeyNumber).color)
    );
    if (!existingColors.has(effTile.color) || isJoker) {
      return { canAppend: true, position: 'end', newTiles: [...meld.tiles, tile] };
    }
  }

  if (meld.type === 'seri') {
    const firstTile = meld.tiles[0];
    const lastTile = meld.tiles[meld.tiles.length - 1];
    const firstEff = getEffectiveTile(firstTile, okeyColor, okeyNumber);
    const lastEff = getEffectiveTile(lastTile, okeyColor, okeyNumber);

    if (effTile.color === firstEff.color || isJoker) {
      // Append at end
      if (effTile.number === lastEff.number + 1 || (lastEff.number === 13 && effTile.number === 1)) {
        return { canAppend: true, position: 'end', newTiles: [...meld.tiles, tile] };
      }
      // Append at start
      if (effTile.number === firstEff.number - 1) {
        return { canAppend: true, position: 'start', newTiles: [tile, ...meld.tiles] };
      }
    }
  }

  return { canAppend: false, position: 'any', newTiles: meld.tiles };
}

// Extended Bot Turn with 101 Okey opening and processing logic
export function playBotTurnExtended(state: OkeyState): {
  drawnFrom: 'deck' | 'discard';
  drawnTile: OkeyTile;
  discardedTile: OkeyTile;
  botComment: string;
  hasFinished: boolean;
  winType: 'normal' | 'okey_atti' | 'cift' | 'elden' | null;
  newBotSlots: (OkeyTile | null)[];
  openedMeldsByBot: PlayerOpenedMelds | null;
  updatedTableMelds: PlayerOpenedMelds[];
  isCanakBroken: boolean;
} {
  const pIdx = state.currentTurnPlayerIndex;
  const bot = state.players[pIdx];
  const leftPlayerIdx = (pIdx + 3) % 4;
  const leftDiscard = state.discardPiles[leftPlayerIdx] || [];
  const lastDiscarded = leftDiscard.length > 0 ? leftDiscard[leftDiscard.length - 1] : null;

  let drawnFrom: 'deck' | 'discard' = 'deck';
  let drawnTile: OkeyTile;

  const currentTiles = bot.rackSlots.filter((t): t is OkeyTile => t !== null);

  let wantsDiscard = false;
  if (lastDiscarded) {
    if (isRealOkey(lastDiscarded, state.okeyTileColor, state.okeyTileNumber)) {
      wantsDiscard = true;
    } else {
      for (let i = 0; i < currentTiles.length; i++) {
        for (let j = i + 1; j < currentTiles.length; j++) {
          const testGroup = [lastDiscarded, currentTiles[i], currentTiles[j]];
          if (
            isValidRun(testGroup, state.okeyTileColor, state.okeyTileNumber) ||
            isValidSet(testGroup, state.okeyTileColor, state.okeyTileNumber)
          ) {
            wantsDiscard = true;
            break;
          }
        }
        if (wantsDiscard) break;
      }
    }
  }

  if (wantsDiscard && lastDiscarded && leftDiscard.length > 0) {
    drawnFrom = 'discard';
    drawnTile = lastDiscarded;
  } else {
    drawnFrom = 'deck';
    drawnTile = state.deck[0] || lastDiscarded || currentTiles[0];
  }

  let handTiles = [...currentTiles, drawnTile];
  let openedMeldsByBot: PlayerOpenedMelds | null = null;
  let updatedTableMelds = [...state.openedTableMelds];
  const hasBotOpenedBefore = state.playerHasOpened[pIdx];

  // 101 Okey Logic: If 101 mode, check if bot can open or append
  if (state.variant === 'yuzbir') {
    if (!hasBotOpenedBefore) {
      const meldEval = findHand101Melds(handTiles, state.okeyTileColor, state.okeyTileNumber);
      if (meldEval.canOpenSeri && meldEval.melds.length > 0) {
        openedMeldsByBot = {
          playerIndex: pIdx,
          playerName: bot.name,
          playerAvatar: bot.avatar,
          openType: 'seri',
          totalPoints: meldEval.totalPoints,
          melds: meldEval.melds,
        };
        updatedTableMelds.push(openedMeldsByBot);
        // Remove opened tiles from bot hand
        const openedTileIds = new Set(meldEval.melds.flatMap((m) => m.tiles.map((t) => t.id)));
        handTiles = handTiles.filter((t) => !openedTileIds.has(t.id));
      } else if (meldEval.canOpenCift && meldEval.pairs.length >= 5) {
        openedMeldsByBot = {
          playerIndex: pIdx,
          playerName: bot.name,
          playerAvatar: bot.avatar,
          openType: 'cift',
          totalPoints: meldEval.pairs.length * 2,
          melds: meldEval.pairs.slice(0, 5),
        };
        updatedTableMelds.push(openedMeldsByBot);
        const openedTileIds = new Set(openedMeldsByBot.melds.flatMap((m) => m.tiles.map((t) => t.id)));
        handTiles = handTiles.filter((t) => !openedTileIds.has(t.id));
      }
    } else {
      // Bot has already opened: Try to process tiles onto table melds (İşleme)
      for (let i = handTiles.length - 1; i >= 0; i--) {
        const tile = handTiles[i];
        let wasAppended = false;
        for (const playerMeldEntry of updatedTableMelds) {
          for (const meld of playerMeldEntry.melds) {
            const appendCheck = canAppendTileToMeld(tile, meld, state.okeyTileColor, state.okeyTileNumber);
            if (appendCheck.canAppend) {
              meld.tiles = appendCheck.newTiles;
              handTiles.splice(i, 1);
              wasAppended = true;
              break;
            }
          }
          if (wasAppended) break;
        }
      }
    }
  }

  // Discard 1 tile from remaining hand
  let bestDiscardIdx = 0;
  let minScore = Infinity;

  handTiles.forEach((tile, idx) => {
    if (isRealOkey(tile, state.okeyTileColor, state.okeyTileNumber) && handTiles.length > 1) {
      return;
    }
    let connectivity = 0;
    handTiles.forEach((other, oIdx) => {
      if (idx === oIdx) return;
      if (other.color === tile.color && Math.abs(other.number - tile.number) <= 2) {
        connectivity += 3;
      }
      if (other.number === tile.number && other.color !== tile.color) {
        connectivity += 3;
      }
    });
    if (connectivity < minScore) {
      minScore = connectivity;
      bestDiscardIdx = idx;
    }
  });

  const [discardedTile] = handTiles.splice(bestDiscardIdx, 1);

  // Remaining slots for bot
  const sortedTiles = sortHandRuns(handTiles, state.okeyTileColor, state.okeyTileNumber);
  const newBotSlots = sortedTiles;

  // Check finish
  let hasFinished = false;
  let winType: 'normal' | 'okey_atti' | 'cift' | 'elden' | null = null;
  let isCanakBroken = false;

  if (state.variant === 'yuzbir') {
    if (handTiles.length === 0) {
      hasFinished = true;
      if (isRealOkey(discardedTile, state.okeyTileColor, state.okeyTileNumber)) {
        winType = 'okey_atti';
        isCanakBroken = true;
      } else if (!hasBotOpenedBefore) {
        winType = 'elden';
        isCanakBroken = true;
      } else {
        winType = 'normal';
      }
    }
  } else {
    const winCheck = checkWinningHand(
      [...handTiles, discardedTile].slice(0, 14),
      state.okeyTileColor,
      state.okeyTileNumber
    );
    if (winCheck.isWin) {
      hasFinished = true;
      if (isRealOkey(discardedTile, state.okeyTileColor, state.okeyTileNumber)) {
        winType = 'okey_atti';
        isCanakBroken = true;
      } else if (winCheck.type === 'cift') {
        winType = 'cift';
        isCanakBroken = true;
      } else {
        winType = 'normal';
      }
    }
  }

  const comments = [
    openedMeldsByBot
      ? `Elim 101'i gördü beyler! Perlerimi açıyorum, ${openedMeldsByBot.totalPoints} puan!`
      : 'Taşlar fena gelmedi ama ortadan devam.',
    isCanakBroken
      ? 'GÜÜÜÜM! Çanağı kırdım beyler, helali hoş olsun!'
      : 'Gözüm arkada kalmadı, bu taşı salıyorum.',
    'Hadi bakalım Haydar Usta, perler yavaş yavaş toplanıyor.',
    'Bu taşa dikkat edin derim beyler!',
    'Rıza bize bir çay tazele hele!',
    'Ortadan çektik, bakalım şansımız ne diyecek.',
  ];
  const botComment = comments[Math.floor(Math.random() * comments.length)];

  return {
    drawnFrom,
    drawnTile,
    discardedTile,
    botComment,
    hasFinished,
    winType,
    newBotSlots,
    openedMeldsByBot,
    updatedTableMelds,
    isCanakBroken,
  };
}

