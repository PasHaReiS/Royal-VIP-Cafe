import { Chess, Square, PieceSymbol, Color } from 'chess.js';

// Piece value mapping for AI evaluation
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional bonuses (encouraging center control and piece development)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

export function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let pieceVal = PIECE_VALUES[piece.type];
      const squareIndex = r * 8 + c;

      if (piece.type === 'p') {
        pieceVal += piece.color === 'w' ? PAWN_TABLE[squareIndex] : PAWN_TABLE[63 - squareIndex];
      } else if (piece.type === 'n') {
        pieceVal += piece.color === 'w' ? KNIGHT_TABLE[squareIndex] : KNIGHT_TABLE[63 - squareIndex];
      }

      if (piece.color === 'w') {
        score += pieceVal;
      } else {
        score -= pieceVal;
      }
    }
  }

  return score;
}

// Bot move finder with depth and evaluation
export function getBestChessMove(
  chess: Chess,
  difficulty: 'kolay' | 'orta' | 'usta'
): { from: string; to: string; promotion?: string } | null {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  if (difficulty === 'kolay') {
    // 30% chance best capture, 70% random
    const captures = legalMoves.filter((m) => m.captured);
    if (captures.length > 0 && Math.random() < 0.4) {
      const m = captures[Math.floor(Math.random() * captures.length)];
      return { from: m.from, to: m.to, promotion: m.promotion };
    }
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { from: randomMove.from, to: randomMove.to, promotion: randomMove.promotion };
  }

  const turn = chess.turn(); // 'w' or 'b'
  let bestScore = turn === 'w' ? -Infinity : Infinity;
  let bestMove = legalMoves[0];

  for (const move of legalMoves) {
    chess.move(move);
    let score = evaluateBoard(chess);

    // If opponent is in check
    if (chess.isCheck()) {
      score += turn === 'w' ? 40 : -40;
    }
    // If checkmate
    if (chess.isCheckmate()) {
      score += turn === 'w' ? 10000 : -10000;
    }

    chess.undo();

    // Add small random noise for personality variation
    score += (Math.random() - 0.5) * 8;

    if (turn === 'w') {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion || 'q' };
}

// Opponent Dialogue Generator based on situation
export function getOpponentDialogue(
  situation: 'start' | 'check' | 'capture' | 'blunder' | 'thinking' | 'victory' | 'defeat',
  opponentName: string
): string {
  const dialogues: Record<string, string[]> = {
    start: [
      `${opponentName}: "Tahtaya hoş geldin! Masif ceviz tahtada güzel bir parti olsun."`,
      `${opponentName}: "Beyaz başlar, oyun başlar. Bakalım bugün taktiğin ne?"`,
      `${opponentName}: "Kahveni yudumla, satranç aceleye gelmez."`,
    ],
    check: [
      `${opponentName}: "Şah! Şahını koru bakalım, kaçış nerede?"`,
      `${opponentName}: "Dikkat! Şahına göz diktim, nefes aldırmam."`,
      `${opponentName}: "Şah çekildi! Bu hamleyi beklemiyordun herhalde?"`,
    ],
    capture: [
      `${opponentName}: "Güzel taşı aldın... Ama benim planım başka!"`,
      `${opponentName}: "O taşı feda ettim sayılır, arkasından ne gelecek izle!"`,
      `${opponentName}: "Tokmak gibi vurdun taşı tahtaya, tebrikler."`,
    ],
    thinking: [
      `${opponentName} sakallarını sıvazlayarak tahtayı derinlemesine inceliyor...`,
      `${opponentName} çayından bir yudum alıp 3 hamle sonrasını hesaplıyor...`,
      `${opponentName} piyon yapısını tartıyor...`,
    ],
    victory: [
      `${opponentName}: "Mat! Güzel maçtı, rövanşı beklerim."`,
      `${opponentName}: "Şah ve mat! Bu taktiği yıllar önce Kapalıçarşı'da öğrenmiştim."`,
    ],
    defeat: [
      `${opponentName}: "Şapka çıkarıyorum, mükemmel bir mat hamlesiydi!"`,
      `${opponentName}: "Tebrikler usta, eline sağlık. Hak edilmiş bir zafer!"`,
    ],
  };

  const list = dialogues[situation] || dialogues.thinking;
  return list[Math.floor(Math.random() * list.length)];
}
