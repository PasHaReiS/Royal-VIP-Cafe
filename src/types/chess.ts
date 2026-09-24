export type ChessDifficulty = 'kolay' | 'orta' | 'usta';
export type ChessViewMode = '3d-perspective' | '3d-isometric' | '3d-cinematic' | '2d-top';
export type ChessBoardTheme = 'masif-ceviz' | 'osmanli-sedef' | 'mermer-oniks';

export interface ChessPlayer {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  title: string;
  personality: string;
}

export interface ChessMatchStats {
  whiteScore: number;
  blackScore: number;
  totalGames: number;
}
