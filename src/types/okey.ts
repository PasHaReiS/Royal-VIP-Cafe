export type TileColor = 'red' | 'black' | 'blue' | 'yellow';

export type OkeyVariant = 'klasik' | 'yuzbir';

export interface OkeyTile {
  id: string; // unique identifier
  color: TileColor;
  number: number; // 1..13
  isFakeOkey: boolean; // Sahte Okey tile
}

export interface PlayerHand {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  rackSlots: (OkeyTile | null)[]; // 28 slots (2 rows of 14)
  score: number;
  penalties: number;
}

export interface MeldGroup {
  id?: string;
  type: 'seri' | 'grup' | 'cift';
  tiles: OkeyTile[];
  isValid: boolean;
  score?: number; // Sum of tile numbers
}

export interface PlayerOpenedMelds {
  playerIndex: number;
  playerName: string;
  playerAvatar: string;
  openType: 'seri' | 'cift';
  totalPoints: number;
  melds: MeldGroup[];
}

export interface CanakBreakEvent {
  isBroken: boolean;
  winnerIndex: number;
  winnerName: string;
  winnerAvatar: string;
  amount: number;
  reason: 'okey_atti' | 'cift' | 'elden';
}

export interface OkeyState {
  variant: OkeyVariant; // 'klasik' or 'yuzbir'
  deck: OkeyTile[];
  indicatorTile: OkeyTile; // Gösterge
  okeyTileColor: TileColor; // Color of the Okey
  okeyTileNumber: number; // Number of the Okey (Indicator + 1)
  players: PlayerHand[];
  currentTurnPlayerIndex: number; // 0: User, 1: Bot right, 2: Bot top, 3: Bot left
  hasDrawnThisTurn: boolean;
  discardPiles: OkeyTile[][]; // 4 players' discard trays
  lastDrawnFrom: 'deck' | 'discard' | null;
  winnerIndex: number | null;
  winType: 'normal' | 'okey_atti' | 'cift' | 'elden' | null;
  statusMessage: string;
  cafeDialogue: { sender: string; text: string; time: string }[];
  isThinking: boolean;
  selectedSlotIndex: number | null;
  // Çanak (Pot) system
  canakGold: number;
  canakBreakEvent: CanakBreakEvent | null;
  // 101 Okey specific states
  openedTableMelds: PlayerOpenedMelds[]; // Table melds opened in 101 Okey
  playerHasOpened: boolean[]; // [P0, P1, P2, P3] has opened
  playerPenaltyScores: number[]; // 101 round penalties
}

