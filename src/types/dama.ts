export type DamaVariant = 'turk_damasi' | 'capraz_dama';
export type DamaPieceType = 'man' | 'king';
export type DamaColor = 'white' | 'black';

export interface DamaPiece {
  id: string;
  color: DamaColor;
  type: DamaPieceType;
  row: number;
  col: number;
}

export interface DamaMove {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  capturedPieces?: { row: number; col: number; id: string }[];
  isPromotion?: boolean;
}

export type DamaViewMode = '3d-perspective' | '3d-isometric' | '3d-cinematic' | '2d-top';
export type DamaBoardTheme = 'masif-ceviz' | 'osmanli-sedef' | 'mermer-oniks';
