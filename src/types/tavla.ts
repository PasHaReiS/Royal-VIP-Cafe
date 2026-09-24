export type PlayerColor = 'white' | 'black';

export interface CheckerStack {
  color: PlayerColor;
  count: number;
}

export type BoardPoints = (CheckerStack | null)[]; // Index 1..24 (Index 0 unused for clarity)

export interface ValidMoveOption {
  target: number;
  dieIndices: number[]; // e.g. [0] for single, or [0, 1] for combined (e.g. 5+3)
  dieValues: number[];
  isCombined: boolean;
  intermediateHop?: number; // The intermediate point hopped over
}

export interface TavlaTurnSnapshot {
  points: BoardPoints;
  bar: { white: number; black: number };
  borneOff: { white: number; black: number };
  usedDice: boolean[];
  lastMoveDesc: string;
}

export type BotDifficulty = 'amator' | 'orta' | 'master';

export interface OpeningRollInfo {
  whiteDie: number | null;
  blackDie: number | null;
  winner: PlayerColor | null;
  status: 'waiting' | 'rolling' | 'tied' | 'decided';
  tieCount: number;
  message: string;
}

export interface TavlaState {
  points: BoardPoints;
  bar: {
    white: number;
    black: number;
  };
  borneOff: {
    white: number;
    black: number;
  };
  currentTurn: PlayerColor;
  phase: 'opening_roll' | 'playing';
  openingRoll: OpeningRollInfo;
  dice: number[]; // e.g. [5, 3] or [4, 4, 4, 4]
  usedDice: boolean[]; // tracks which dice are spent
  turnHistory: TavlaTurnSnapshot[]; // Stack of states within the current turn for UNDO
  selectedPoint: number | 'bar' | null;
  validDestinations: number[];
  winner: PlayerColor | null;
  lastWinner?: PlayerColor | null;
  winType: 'düz' | 'mars' | 'katmerli_mars' | null;
  isRolling: boolean;
  gameMode: 'vs_bot' | 'pass_and_play';
  botDifficulty: BotDifficulty;
  lastMoveDesc: string;
  diceNameTurkish: string;
  scores: {
    white: number;
    black: number;
    targetScore: number;
  };
  turnReadyToEnd: boolean; // When all dice used, player can inspect or undo before passing
}

export const TURKISH_DICE_NAMES: Record<string, string> = {
  '1-1': 'Hep Yek',
  '2-2': 'Dübara',
  '3-3': 'Düse',
  '4-4': 'Dörcihar',
  '5-5': 'Dübeş',
  '6-6': 'Düşeş',
  '2-1': 'İki Bir',
  '3-1': 'Severler Güzeli (Se Yek)',
  '3-2': 'Seba-i Dü',
  '4-1': 'Cihar-i Yek',
  '4-2': 'Cihar-i Dü',
  '4-3': 'Cihar-i Se',
  '5-1': 'Penc-ü Yek',
  '5-2': 'Penc-ü Dü',
  '5-3': 'Penc-ü Se',
  '5-4': 'Cihar-ü Penc',
  '6-1': 'Şeş-ü Yek',
  '6-2': 'Şeş-ü Dü',
  '6-3': 'Şeş-ü Se',
  '6-4': 'Şeş-ü Cihar',
  '6-5': 'Şeş-ü Beş',
};
