import { DamaColor, DamaPiece, DamaVariant, DamaMove } from '../types/dama';

export interface DamaGameState {
  board: (DamaPiece | null)[][];
  currentTurn: DamaColor;
  variant: DamaVariant;
  winner: DamaColor | 'draw' | null;
  history: DamaMove[];
  capturedByWhite: number;
  capturedByBlack: number;
}

// Initial board setup for Türk Daması & Çapraz Dama
export function createInitialDamaBoard(variant: DamaVariant): (DamaPiece | null)[][] {
  const board: (DamaPiece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  if (variant === 'turk_damasi') {
    // Türk Daması: 16 White pieces on rows 5 and 6; 16 Black pieces on rows 1 and 2
    for (let c = 0; c < 8; c++) {
      board[1][c] = { id: `b_${1}_${c}`, color: 'black', type: 'man', row: 1, col: c };
      board[2][c] = { id: `b_${2}_${c}`, color: 'black', type: 'man', row: 2, col: c };
      board[5][c] = { id: `w_${5}_${c}`, color: 'white', type: 'man', row: 5, col: c };
      board[6][c] = { id: `w_${6}_${c}`, color: 'white', type: 'man', row: 6, col: c };
    }
  } else {
    // Çapraz Dama (Checkers): pieces on dark squares only
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) {
            board[r][c] = { id: `b_${r}_${c}`, color: 'black', type: 'man', row: r, col: c };
          } else if (r > 4) {
            board[r][c] = { id: `w_${r}_${c}`, color: 'white', type: 'man', row: r, col: c };
          }
        }
      }
    }
  }

  return board;
}

// Clone board helper
export function cloneDamaBoard(board: (DamaPiece | null)[][]): (DamaPiece | null)[][] {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

// Check if square is valid
export function isValidSquare(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// Generate all legal moves for current player
export function getLegalMoves(
  board: (DamaPiece | null)[][],
  turn: DamaColor,
  variant: DamaVariant
): DamaMove[] {
  if (variant === 'turk_damasi') {
    return getTurkishDamaMoves(board, turn);
  }
  return getCheckersMoves(board, turn);
}

// Türk Daması Move Generation with Mandatory Maximum Capture Rule
function getTurkishDamaMoves(board: (DamaPiece | null)[][], turn: DamaColor): DamaMove[] {
  const allCaptures: DamaMove[] = [];
  const normalMoves: DamaMove[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== turn) continue;

      const pieceCaptures = findTurkishCapturesForPiece(board, piece);
      if (pieceCaptures.length > 0) {
        allCaptures.push(...pieceCaptures);
      }
    }
  }

  // If any captures exist, Turkish Draughts requires MUST CAPTURE MAXIMUM PIECES!
  if (allCaptures.length > 0) {
    let maxCaptured = 0;
    allCaptures.forEach((m) => {
      const count = m.capturedPieces?.length || 0;
      if (count > maxCaptured) maxCaptured = count;
    });
    return allCaptures.filter((m) => (m.capturedPieces?.length || 0) === maxCaptured);
  }

  // If no captures exist, find normal 1-step moves
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== turn) continue;

      if (piece.type === 'man') {
        // Forward direction: White moves up (-1), Black moves down (+1)
        const forwardDir = turn === 'white' ? -1 : 1;
        const dirs = [
          { dr: forwardDir, dc: 0 },
          { dr: 0, dc: -1 },
          { dr: 0, dc: 1 },
        ];

        for (const { dr, dc } of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (isValidSquare(nr, nc) && board[nr][nc] === null) {
            const isPromotion = turn === 'white' ? nr === 0 : nr === 7;
            normalMoves.push({
              fromRow: r,
              fromCol: c,
              toRow: nr,
              toCol: nc,
              isPromotion,
            });
          }
        }
      } else {
        // Dama (King): moves any number of squares in 4 orthogonal directions
        const dirs = [
          { dr: -1, dc: 0 },
          { dr: 1, dc: 0 },
          { dr: 0, dc: -1 },
          { dr: 0, dc: 1 },
        ];

        for (const { dr, dc } of dirs) {
          let dist = 1;
          while (true) {
            const nr = r + dr * dist;
            const nc = c + dc * dist;
            if (!isValidSquare(nr, nc) || board[nr][nc] !== null) break;
            normalMoves.push({
              fromRow: r,
              fromCol: c,
              toRow: nr,
              toCol: nc,
            });
            dist++;
          }
        }
      }
    }
  }

  return normalMoves;
}

// Recursive capture finder for Turkish Draughts piece
function findTurkishCapturesForPiece(
  board: (DamaPiece | null)[][],
  piece: DamaPiece,
  capturedSoFar: { row: number; col: number; id: string }[] = [],
  originRow: number = piece.row,
  originCol: number = piece.col
): DamaMove[] {
  const result: DamaMove[] = [];
  const opponentColor: DamaColor = piece.color === 'white' ? 'black' : 'white';

  if (piece.type === 'man') {
    // Man captures: forward, left, right (never backward)
    const forwardDir = piece.color === 'white' ? -1 : 1;
    const dirs = [
      { dr: forwardDir, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];

    for (const { dr, dc } of dirs) {
      const midR = piece.row + dr;
      const midC = piece.col + dc;
      const landR = piece.row + dr * 2;
      const landC = piece.col + dc * 2;

      if (isValidSquare(landR, landC)) {
        const midPiece = board[midR][midC];
        const landPiece = board[landR][landC];

        if (
          midPiece &&
          midPiece.color === opponentColor &&
          !capturedSoFar.some((c) => c.row === midR && c.col === midC) &&
          (landPiece === null || (landR === originRow && landC === originCol))
        ) {
          // Valid jump
          const newCaptured = [...capturedSoFar, { row: midR, col: midC, id: midPiece.id }];
          const isPromotion = piece.color === 'white' ? landR === 0 : landR === 7;

          // Temporary move piece
          const nextPiece: DamaPiece = {
            ...piece,
            row: landR,
            col: landC,
            type: isPromotion ? 'king' : piece.type,
          };

          // Recursively find chain captures
          const subCaptures = findTurkishCapturesForPiece(
            board,
            nextPiece,
            newCaptured,
            originRow,
            originCol
          );

          if (subCaptures.length > 0) {
            result.push(...subCaptures);
          } else {
            result.push({
              fromRow: originRow,
              fromCol: originCol,
              toRow: landR,
              toCol: landC,
              capturedPieces: newCaptured,
              isPromotion,
            });
          }
        }
      }
    }
  } else {
    // Dama (King) captures: any distance along 4 orthogonal directions
    const dirs = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];

    for (const { dr, dc } of dirs) {
      let step = 1;
      let targetPiece: DamaPiece | null = null;
      let targetRow = -1;
      let targetCol = -1;

      while (true) {
        const checkR = piece.row + dr * step;
        const checkC = piece.col + dc * step;
        if (!isValidSquare(checkR, checkC)) break;

        const cell = board[checkR][checkC];
        if (cell !== null) {
          if (cell.color === piece.color) {
            break; // Blocked by own piece
          } else if (targetPiece === null) {
            // Found first enemy piece along this ray
            if (capturedSoFar.some((c) => c.row === checkR && c.col === checkC)) {
              break; // already captured
            }
            targetPiece = cell;
            targetRow = checkR;
            targetCol = checkC;
          } else {
            break; // Two enemy pieces in a row cannot be jumped
          }
        } else if (targetPiece !== null) {
          // Landing square after enemy piece
          const newCaptured = [
            ...capturedSoFar,
            { row: targetRow, col: targetCol, id: targetPiece.id },
          ];
          const nextKing: DamaPiece = {
            ...piece,
            row: checkR,
            col: checkC,
          };

          const subCaptures = findTurkishCapturesForPiece(
            board,
            nextKing,
            newCaptured,
            originRow,
            originCol
          );

          if (subCaptures.length > 0) {
            result.push(...subCaptures);
          } else {
            result.push({
              fromRow: originRow,
              fromCol: originCol,
              toRow: checkR,
              toCol: checkC,
              capturedPieces: newCaptured,
            });
          }
        }
        step++;
      }
    }
  }

  return result;
}

// Standard Checkers (Çapraz Dama)
function getCheckersMoves(board: (DamaPiece | null)[][], turn: DamaColor): DamaMove[] {
  const captures: DamaMove[] = [];
  const normalMoves: DamaMove[] = [];
  const opponentColor: DamaColor = turn === 'white' ? 'black' : 'white';

  // Check captures first
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== turn) continue;

      const dirs =
        piece.type === 'king'
          ? [
              { dr: -1, dc: -1 },
              { dr: -1, dc: 1 },
              { dr: 1, dc: -1 },
              { dr: 1, dc: 1 },
            ]
          : turn === 'white'
          ? [
              { dr: -1, dc: -1 },
              { dr: -1, dc: 1 },
            ]
          : [
              { dr: 1, dc: -1 },
              { dr: 1, dc: 1 },
            ];

      for (const { dr, dc } of dirs) {
        const midR = r + dr;
        const midC = c + dc;
        const landR = r + dr * 2;
        const landC = c + dc * 2;

        if (isValidSquare(landR, landC)) {
          const midPiece = board[midR][midC];
          const landPiece = board[landR][landC];

          if (midPiece && midPiece.color === opponentColor && landPiece === null) {
            const isPromotion =
              piece.type === 'man' && (turn === 'white' ? landR === 0 : landR === 7);
            captures.push({
              fromRow: r,
              fromCol: c,
              toRow: landR,
              toCol: landC,
              capturedPieces: [{ row: midR, col: midC, id: midPiece.id }],
              isPromotion,
            });
          }
        }
      }
    }
  }

  if (captures.length > 0) {
    return captures;
  }

  // Normal moves
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== turn) continue;

      const dirs =
        piece.type === 'king'
          ? [
              { dr: -1, dc: -1 },
              { dr: -1, dc: 1 },
              { dr: 1, dc: -1 },
              { dr: 1, dc: 1 },
            ]
          : turn === 'white'
          ? [
              { dr: -1, dc: -1 },
              { dr: -1, dc: 1 },
            ]
          : [
              { dr: 1, dc: -1 },
              { dr: 1, dc: 1 },
            ];

      for (const { dr, dc } of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (isValidSquare(nr, nc) && board[nr][nc] === null) {
          const isPromotion = piece.type === 'man' && (turn === 'white' ? nr === 0 : nr === 7);
          normalMoves.push({
            fromRow: r,
            fromCol: c,
            toRow: nr,
            toCol: nc,
            isPromotion,
          });
        }
      }
    }
  }

  return normalMoves;
}

// Apply a move to board
export function applyDamaMove(
  board: (DamaPiece | null)[][],
  move: DamaMove
): {
  newBoard: (DamaPiece | null)[][];
  capturedCount: number;
} {
  const newBoard = cloneDamaBoard(board);
  const piece = newBoard[move.fromRow][move.fromCol]!;

  newBoard[move.fromRow][move.fromCol] = null;

  // Remove captured pieces
  if (move.capturedPieces && move.capturedPieces.length > 0) {
    move.capturedPieces.forEach((c) => {
      newBoard[c.row][c.col] = null;
    });
  }

  const isNowKing = piece.type === 'king' || move.isPromotion;
  newBoard[move.toRow][move.toCol] = {
    ...piece,
    row: move.toRow,
    col: move.toCol,
    type: isNowKing ? 'king' : 'man',
  };

  return {
    newBoard,
    capturedCount: move.capturedPieces?.length || 0,
  };
}

// AI Bot decision for Dama
export function getBestDamaMove(
  board: (DamaPiece | null)[][],
  turn: DamaColor,
  variant: DamaVariant,
  difficulty: 'kolay' | 'orta' | 'usta'
): DamaMove | null {
  const legalMoves = getLegalMoves(board, turn, variant);
  if (legalMoves.length === 0) return null;

  if (difficulty === 'kolay') {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Score each move
  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    let score = 0;
    // Captures are heavily rewarded
    score += (move.capturedPieces?.length || 0) * 100;
    // Promotion
    if (move.isPromotion) score += 80;

    // Advance towards opponent
    if (turn === 'black') {
      score += move.toRow * 2;
    } else {
      score += (7 - move.toRow) * 2;
    }

    // Prefer center control
    const centerDist = Math.abs(3.5 - move.toCol);
    score -= centerDist * 3;

    // Small random factor for natural variety
    score += Math.random() * 5;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
