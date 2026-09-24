import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import {
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Eye,
  Flag,
  Lightbulb,
  Clock,
  Swords,
  ChevronRight,
  Flame,
  Award,
  Compass,
  Palette,
  Layers,
  ScrollText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Chess3DPiece } from './Chess3DPiece';
import { ChessThreeCanvas } from './three/ChessThreeCanvas';
import { sounds } from '../services/soundEffects';
import {
  getBestChessMove,
  getOpponentDialogue,
  evaluateBoard,
} from '../services/chessEngine';
import { ChessDifficulty, ChessViewMode, ChessBoardTheme } from '../types/chess';
import { CafeOrder } from './CafeWaiterModal';

interface Chess3DTableProps {
  onBackToLobby?: () => void;
  activeOrders?: CafeOrder[];
}

interface OpponentDef {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  title: string;
  difficulty: ChessDifficulty;
  bio: string;
}

const OPPONENTS: OpponentDef[] = [
  {
    id: 'selim',
    name: 'Büyükusta Selim Abi',
    avatar: '👴🏻',
    rating: 2150,
    title: 'FM / Kahve Ustası',
    difficulty: 'usta',
    bio: 'Kapalıçarşı’nın 40 yıllık satranç üstadı. Derin hesap yapar, taş feda etmekten çekinmez.',
  },
  {
    id: 'haydar',
    name: 'Haydar Usta',
    avatar: '👨🏻‍🦱',
    rating: 1720,
    title: 'Taktisyen',
    difficulty: 'orta',
    bio: 'Agresif ve hızlı hamleleri sever. Göz açıp kapayıncaya kadar taşları değişir.',
  },
  {
    id: 'murat',
    name: 'Murat Kaptan',
    avatar: '🧔🏻‍♂️',
    rating: 1450,
    title: 'Klasik Oyuncu',
    difficulty: 'kolay',
    bio: 'Sağlam savunma kurar, sakin oynar. Hata yapmanızı bekler.',
  },
];

export const Chess3DTable: React.FC<Chess3DTableProps> = ({ activeOrders = [] }) => {
  const [chessInstance] = useState(() => new Chess());
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick((t) => t + 1);

  // Game Settings
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentDef>(OPPONENTS[0]);
  const [isPassAndPlay, setIsPassAndPlay] = useState(false);
  const [viewMode, setViewMode] = useState<ChessViewMode>('3d-perspective');
  const [boardTheme, setBoardTheme] = useState<ChessBoardTheme>('masif-ceviz');
  const [targetMatchScore, setTargetMatchScore] = useState<number>(3);
  const [matchScore, setMatchScore] = useState<{ white: number; black: number }>({
    white: 0,
    black: 0,
  });

  // Turn & Selection State
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMovesForSelected, setLegalMovesForSelected] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [hintMove, setHintMove] = useState<{ from: string; to: string } | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [showNotationDrawer, setShowNotationDrawer] = useState(false);

  // Dialogue & Atmosphere
  const [dialogue, setDialogue] = useState<string>(
    `${OPPONENTS[0].name}: "VIP masif ceviz 3D masamıza hoş geldiniz! İlk hamle beyazın, buyurun usta hamlenizi yapın."`
  );

  // Promotion Modal
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  // Timers (in seconds)
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  // Victory Overlay
  const [gameOverModal, setGameOverModal] = useState<{
    title: string;
    subtitle: string;
    winner: 'white' | 'black' | 'draw';
  } | null>(null);

  // Real-time Tactical Evaluation score
  const evalScore = evaluateBoard(chessInstance);
  // Normalize eval for bar (-1000 to +1000 converted to percentage 0% to 100%)
  const whiteAdvantagePct = Math.min(
    95,
    Math.max(5, Math.round(50 + (evalScore / 800) * 45))
  );

  // Timer Tick
  useEffect(() => {
    if (!timerActive || gameOverModal) return;
    const interval = setInterval(() => {
      if (chessInstance.turn() === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            handleTimeOut('white');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            handleTimeOut('black');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, chessInstance.turn(), gameOverModal]);

  const handleTimeOut = (loserColor: 'white' | 'black') => {
    sounds.playLossFanfare();
    const winner = loserColor === 'white' ? 'black' : 'white';
    setMatchScore((prev) => ({
      ...prev,
      [winner]: prev[winner] + 1,
    }));
    setGameOverModal({
      title: 'Süre Doldu!',
      subtitle:
        loserColor === 'white'
          ? 'Süreniz bitti, Siyah kazandı.'
          : 'Rakibin süresi bitti, Beyaz kazandı!',
      winner,
    });
  };

  // Bot Turn Trigger
  useEffect(() => {
    if (isPassAndPlay) return;
    if (chessInstance.turn() === 'b' && !chessInstance.isGameOver()) {
      setIsThinking(true);
      setDialogue(getOpponentDialogue('thinking', selectedOpponent.name));

      const thinkDuration = Math.floor(Math.random() * 850) + 700;
      const timeout = setTimeout(() => {
        const best = getBestChessMove(chessInstance, selectedOpponent.difficulty);
        if (best) {
          const moveRes = chessInstance.move({
            from: best.from,
            to: best.to,
            promotion: best.promotion || 'q',
          });

          if (moveRes) {
            setLastMove({ from: best.from, to: best.to });
            setHintMove(null);
            if (moveRes.captured) {
              sounds.playChessCapture();
              setDialogue(getOpponentDialogue('capture', selectedOpponent.name));
            } else {
              sounds.playChessMove();
            }

            if (chessInstance.isCheck()) {
              sounds.playChessCheck();
              setDialogue(getOpponentDialogue('check', selectedOpponent.name));
            }
          }
        }
        setIsThinking(false);
        forceUpdate();
        checkGameStatus();
      }, thinkDuration);

      return () => clearTimeout(timeout);
    }
  }, [chessInstance.turn(), isPassAndPlay, selectedOpponent]);

  // Check game over
  const checkGameStatus = () => {
    if (chessInstance.isCheckmate()) {
      const winner = chessInstance.turn() === 'w' ? 'black' : 'white';
      const isPlayerWin = winner === 'white';

      if (isPlayerWin) {
        sounds.playVictoryFanfare();
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
        setDialogue(getOpponentDialogue('defeat', selectedOpponent.name));
      } else {
        sounds.playLossFanfare();
        setDialogue(getOpponentDialogue('victory', selectedOpponent.name));
      }

      setMatchScore((prev) => {
        const updated = { ...prev, [winner]: prev[winner] + 1 };
        return updated;
      });

      setGameOverModal({
        title: isPlayerWin ? 'Tebrikler! Şah ve Mat!' : 'Şah ve Mat Oldunuz!',
        subtitle: isPlayerWin
          ? `${selectedOpponent.name} şahını savunamadı ve mat oldu.`
          : `${selectedOpponent.name} sizi ustaca mat etti.`,
        winner,
      });
    } else if (chessInstance.isDraw()) {
      sounds.playTavlaGatePass();
      setGameOverModal({
        title: 'Berabere!',
        subtitle: chessInstance.isStalemate()
          ? 'Pat (Hamle kalmadı, berabere).'
          : 'Yetersiz malzeme veya hamle tekrarı ile berabere.',
        winner: 'draw',
      });
    }
  };

  // Square Click Handler
  const handleSquareClick = (square: Square) => {
    if (gameOverModal) return;
    if (!isPassAndPlay && chessInstance.turn() === 'b') return;

    if (!timerActive) setTimerActive(true);

    const pieceOnSquare = chessInstance.get(square);

    // If already selected, check if clicked on target square
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
        return;
      }

      const moves = chessInstance.moves({ square: selectedSquare, verbose: true });
      const targetMove = moves.find((m) => m.to === square);

      if (targetMove) {
        const movingPiece = chessInstance.get(selectedSquare);
        const isPromotion =
          movingPiece?.type === 'p' && (square.endsWith('8') || square.endsWith('1'));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        executeMove(selectedSquare, square);
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
        setHintMove(null);
        return;
      }

      if (pieceOnSquare && pieceOnSquare.color === chessInstance.turn()) {
        setSelectedSquare(square);
        const newMoves = chessInstance.moves({ square, verbose: true });
        setLegalMovesForSelected(newMoves.map((m) => m.to));
        sounds.playChessMove();
        return;
      }

      setSelectedSquare(null);
      setLegalMovesForSelected([]);
      return;
    }

    // Select piece
    if (pieceOnSquare && pieceOnSquare.color === chessInstance.turn()) {
      setSelectedSquare(square);
      const moves = chessInstance.moves({ square, verbose: true });
      setLegalMovesForSelected(moves.map((m) => m.to));
      sounds.playChessMove();
    }
  };

  // Execute Move
  const executeMove = (from: Square, to: Square, promotionPiece: PieceSymbol = 'q') => {
    const moveRes = chessInstance.move({
      from,
      to,
      promotion: promotionPiece,
    });

    if (moveRes) {
      setLastMove({ from, to });
      setHintMove(null);
      if (moveRes.captured) {
        sounds.playChessCapture();
      } else {
        sounds.playChessMove();
      }

      if (chessInstance.isCheck()) {
        sounds.playChessCheck();
      }

      forceUpdate();
      checkGameStatus();
    }
  };

  // Promotion choice
  const handleSelectPromotion = (p: PieceSymbol) => {
    if (pendingPromotion) {
      executeMove(pendingPromotion.from, pendingPromotion.to, p);
      setPendingPromotion(null);
      setSelectedSquare(null);
      setLegalMovesForSelected([]);
    }
  };

  // Grandmaster Hint Button
  const handleRequestHint = () => {
    if (isThinking || gameOverModal) return;
    const best = getBestChessMove(chessInstance, 'usta');
    if (best) {
      setHintMove({ from: best.from, to: best.to });
      sounds.playBonusBeep();
      setDialogue(
        `Büyükusta Selim Abi: "Konumu analiz ettim! ${best.from.toUpperCase()} karesindeki taşını ${best.to.toUpperCase()} karesine sürmeni tavsiye ederim."`
      );
    }
  };

  // Restart Hand / Match
  const handleRestartGame = () => {
    chessInstance.reset();
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setLastMove(null);
    setHintMove(null);
    setGameOverModal(null);
    setPendingPromotion(null);
    setWhiteTime(600);
    setBlackTime(600);
    setTimerActive(false);
    setDialogue(`${selectedOpponent.name}: "Yeni parti başladı. Taşlar yerine dizildi, iyi oyunlar!"`);
    sounds.playChessMove();
    forceUpdate();
  };

  // Undo Move
  const handleUndoMove = () => {
    if (isThinking || gameOverModal) return;
    chessInstance.undo();
    if (!isPassAndPlay) chessInstance.undo();
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setHintMove(null);
    sounds.playChessMove();
    forceUpdate();
  };

  // Format timer
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Captured pieces calculation
  const getCapturedPieces = () => {
    const history = chessInstance.history({ verbose: true });
    const whiteCaptured: PieceSymbol[] = [];
    const blackCaptured: PieceSymbol[] = [];

    history.forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') {
          blackCaptured.push(m.captured);
        } else {
          whiteCaptured.push(m.captured);
        }
      }
    });

    return { whiteCaptured, blackCaptured };
  };

  const { whiteCaptured, blackCaptured } = getCapturedPieces();
  const boardMatrix = chessInstance.board();
  const moveHistory = chessInstance.history();

  // 3D Board and Piece Transform styling based on Camera View Mode
  const getCameraStyle = () => {
    switch (viewMode) {
      case '3d-isometric':
        return {
          boardTransform: 'rotateX(48deg) rotateZ(-16deg) scale(0.96)',
          pieceCounterTransform: 'rotateZ(16deg) rotateX(-48deg)',
          depthShadow: '0 45px 75px -10px rgba(0,0,0,0.95), 0 20px 30px rgba(0,0,0,0.85)',
          perspective: '1300px',
        };
      case '3d-cinematic':
        return {
          boardTransform: 'rotateX(62deg) scale(0.95)',
          pieceCounterTransform: 'rotateX(-62deg)',
          depthShadow: '0 50px 85px -10px rgba(0,0,0,0.98), 0 25px 40px rgba(0,0,0,0.9)',
          perspective: '1100px',
        };
      case '2d-top':
        return {
          boardTransform: 'rotateX(0deg) rotateZ(0deg) scale(1)',
          pieceCounterTransform: 'none',
          depthShadow: '0 20px 40px rgba(0,0,0,0.85)',
          perspective: 'none',
        };
      case '3d-perspective':
      default:
        return {
          boardTransform: 'rotateX(52deg) scale(0.97)',
          pieceCounterTransform: 'rotateX(-52deg)',
          depthShadow: '0 42px 70px -10px rgba(0,0,0,0.95), 0 18px 30px rgba(0,0,0,0.85)',
          perspective: '1200px',
        };
    }
  };

  const camera = getCameraStyle();

  // Board square styling based on theme
  const getSquareStyles = (isDark: boolean) => {
    if (boardTheme === 'osmanli-sedef') {
      return {
        background: isDark
          ? 'linear-gradient(135deg, #2b1f18 0%, #150d09 100%)'
          : 'linear-gradient(135deg, #fdfbf7 0%, #e8dcbf 100%)',
        border: '1px solid rgba(200, 157, 86, 0.25)',
      };
    } else if (boardTheme === 'mermer-oniks') {
      return {
        background: isDark
          ? 'linear-gradient(135deg, #273549 0%, #0d1520 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #d8e2ec 100%)',
        border: '1px solid rgba(148, 163, 184, 0.25)',
      };
    }
    // Default: 'masif-ceviz'
    return {
      background: isDark
        ? 'linear-gradient(135deg, #61361c 0%, #3e200e 100%)'
        : 'linear-gradient(135deg, #f5e6d0 0%, #d8ba92 100%)',
      border: '1px solid rgba(120, 80, 40, 0.25)',
    };
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-2 px-1 sm:px-4 max-w-7xl mx-auto">
      {/* ======================================================== */}
      {/* TOP CONTROL BAR: Opponents, Clocks, Score & 3D Tools     */}
      {/* ======================================================== */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#170e08]/95 via-[#23150c]/95 to-[#170e08]/95 border border-[#c89d56]/40 p-3 rounded-2xl shadow-2xl mb-3 backdrop-blur-md">
        {/* Opponent Profile & Thinking Beacon */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-3xl sm:text-4xl filter drop-shadow-md">
              {selectedOpponent.avatar}
            </span>
            {isThinking && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-[#f5d58d]">
                {selectedOpponent.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                {selectedOpponent.title}
              </span>
            </div>
            <div className="text-xs text-[#baa68c] flex items-center gap-2">
              <span>ELO: {selectedOpponent.rating}</span>
              <span>•</span>
              <span className="text-amber-200/90 font-medium">
                {isThinking ? '🧠 Derin hesap yapıyor...' : 'Hamlenizi bekliyor'}
              </span>
            </div>
          </div>
        </div>

        {/* Match Score Display */}
        <div className="flex items-center gap-4 bg-[#1a0f08]/90 px-4 py-1.5 rounded-xl border border-[#c89d56]/35 shadow-inner">
          <div className="text-center">
            <div className="text-[10px] text-[#baa68c] font-bold uppercase tracking-wider">
              {isPassAndPlay ? '1. Oyuncu' : 'Siz (Beyaz)'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {matchScore.white}
            </div>
          </div>
          <div className="text-xs font-bold text-[#c89d56] px-1 flex flex-col items-center">
            <Trophy className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
            <span>İlk {targetMatchScore}</span>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-[#baa68c] font-bold uppercase tracking-wider">
              {isPassAndPlay ? '2. Oyuncu' : selectedOpponent.name.split(' ')[0]}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {matchScore.black}
            </div>
          </div>
        </div>

        {/* 3D Camera Controls & Master Hint */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3D Camera View Selector */}
          <div className="flex items-center bg-[#24130a] rounded-xl border border-[#c89d56]/40 p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('3d-perspective')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === '3d-perspective'
                  ? 'bg-[#c89d56] text-[#140803] shadow'
                  : 'text-[#baa68c] hover:text-[#f5d58d]'
              }`}
              title="Derin 3D Perspektif"
            >
              <Compass className="w-3 h-3" />
              <span className="hidden sm:inline">Derin 3D</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d-isometric')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === '3d-isometric'
                  ? 'bg-[#c89d56] text-[#140803] shadow'
                  : 'text-[#baa68c] hover:text-[#f5d58d]'
              }`}
              title="VIP Masaüstü İzometrik Bakış"
            >
              <Layers className="w-3 h-3" />
              <span>İzometrik</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d-cinematic')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === '3d-cinematic'
                  ? 'bg-[#c89d56] text-[#140803] shadow'
                  : 'text-[#baa68c] hover:text-[#f5d58d]'
              }`}
              title="Sinematik Göz Hizası"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Sinematik</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d-top')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === '2d-top'
                  ? 'bg-[#c89d56] text-[#140803] shadow'
                  : 'text-[#baa68c] hover:text-[#f5d58d]'
              }`}
              title="Klasik 2D Kuşbakışı"
            >
              2D
            </button>
          </div>

          {/* Board Theme Switcher */}
          <button
            type="button"
            onClick={() => {
              setBoardTheme((prev) =>
                prev === 'masif-ceviz'
                  ? 'osmanli-sedef'
                  : prev === 'osmanli-sedef'
                  ? 'mermer-oniks'
                  : 'masif-ceviz'
              );
              sounds.playButtonWoodClick();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#24130a] hover:bg-[#341b0e] border border-[#c89d56]/40 text-xs text-[#f5d58d] transition-all cursor-pointer shadow"
            title="Ahşap & Mermer Temasını Değiştir"
          >
            <Palette className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline font-semibold">
              {boardTheme === 'masif-ceviz'
                ? 'Masif Ceviz'
                : boardTheme === 'osmanli-sedef'
                ? 'Osmanlı Sedef'
                : 'Mermer Oniks'}
            </span>
          </button>

          {/* Grandmaster Hint Button */}
          <button
            type="button"
            onClick={handleRequestHint}
            disabled={isThinking || chessInstance.isGameOver()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow disabled:opacity-40"
            title="Büyükusta Selim Abi'den Taktik İpucu İste"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Usta İpucu</span>
          </button>

          {/* Notation Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowNotationDrawer((p) => !p)}
            className="p-1.5 rounded-xl bg-[#24130a] hover:bg-[#341b0e] border border-[#c89d56]/40 text-[#f5d58d] transition-all cursor-pointer"
            title="PGN Hamle Geçmişini Göster / Gizle"
          >
            <ScrollText className="w-4 h-4 text-amber-300" />
          </button>

          {/* Undo */}
          <button
            type="button"
            onClick={handleUndoMove}
            disabled={isThinking || chessInstance.history().length === 0}
            className="p-1.5 rounded-xl bg-[#24130a] hover:bg-[#341b0e] disabled:opacity-40 border border-[#c89d56]/40 text-[#f5d58d] transition-all cursor-pointer"
            title="Hamleyi Geri Al"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
          </button>

          {/* New Game */}
          <button
            type="button"
            onClick={handleRestartGame}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yeni Parti</span>
          </button>
        </div>
      </div>

      {/* Opponent Live Dialogue Balloon */}
      <div className="w-full max-w-2xl bg-[#1e130a]/90 border border-[#c89d56]/35 px-4 py-2 rounded-xl text-center text-xs sm:text-sm text-[#f5d58d] font-serif italic mb-2 shadow-lg flex items-center justify-center gap-2">
        <span className="text-amber-400 text-base">“</span>
        <span>{dialogue}</span>
        <span className="text-amber-400 text-base">”</span>
      </div>

      {/* ======================================================== */}
      {/* 3D ARENA CONTAINER (Table, Board, Side Piece Gutters)    */}
      {/* ======================================================== */}
      <div
        className="w-full flex items-center justify-center my-3 relative"
        style={{
          perspective: camera.perspective,
          perspectiveOrigin: '50% 40%',
        }}
      >
        {/* Left Side: Real-time Tactical Advantage Evaluation Bar */}
        <div className="hidden lg:flex flex-col items-center mr-6 self-center bg-[#170e08]/90 border border-[#c89d56]/40 rounded-xl p-2 shadow-2xl">
          <div className="text-[10px] font-bold text-[#c89d56] mb-1 text-center">GÜÇ DENGESİ</div>
          <div className="relative w-4 h-64 bg-zinc-900 rounded-full overflow-hidden border border-white/20 flex flex-col justify-end shadow-inner">
            {/* White advantage gauge (fills from bottom) */}
            <div
              className="w-full bg-gradient-to-t from-amber-100 to-white transition-all duration-500"
              style={{ height: `${whiteAdvantagePct}%` }}
            />
            {/* Center line marker */}
            <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-red-500/80 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="mt-1.5 text-[11px] font-mono font-bold text-amber-300">
            {evalScore > 0 ? `+${(evalScore / 100).toFixed(1)}` : (evalScore / 100).toFixed(1)}
          </div>
        </div>

        {/* 3D Master Board Container */}
        <div
          className="relative transition-all duration-700 ease-out"
          style={{
            boxShadow: camera.depthShadow,
          }}
        >
          {/* Physical 3D Wooden Slab Edges */}
          <div
            className="absolute -bottom-6 inset-x-0 h-7 rounded-b-2xl flex items-center justify-center border-b-2 border-r-2 border-l-2 border-black/80 pointer-events-none z-10"
            style={{
              background:
                'linear-gradient(to bottom, #2b170c 0%, #150904 60%, #080302 100%)',
              boxShadow: '0 12px 20px rgba(0,0,0,0.9)',
            }}
          >
            <div className="px-4 py-0.5 rounded bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 border border-amber-300/80 text-[10px] font-bold text-black tracking-widest uppercase shadow">
              KAPALIÇARŞI 3D MASİF SATRANÇ
            </div>
          </div>

          {/* Master Wooden Board Case Frame */}
          <div
            className="relative p-2 sm:p-4 rounded-2xl border-4 border-[#3a1f10] shadow-2xl"
            style={{
              background:
                boardTheme === 'osmanli-sedef'
                  ? 'radial-gradient(circle at 50% 30%, #35251d 0%, #1a100a 70%, #090503 100%)'
                  : boardTheme === 'mermer-oniks'
                  ? 'radial-gradient(circle at 50% 30%, #2e3a4e 0%, #171f2b 70%, #0b0f15 100%)'
                  : 'radial-gradient(circle at 50% 30%, #442413 0%, #2b1409 70%, #130702 100%)',
              boxShadow:
                'inset 0 4px 14px rgba(255,255,255,0.2), inset 0 -10px 20px rgba(0,0,0,0.85)',
            }}
          >
            {/* Brass Inlaid Ornamental Corners */}
            <div className="absolute top-2 left-2 w-7 h-7 border-t-2 border-l-2 border-amber-400/90 rounded-tl-lg pointer-events-none z-10" />
            <div className="absolute top-2 right-2 w-7 h-7 border-t-2 border-r-2 border-amber-400/90 rounded-tr-lg pointer-events-none z-10" />
            <div className="absolute bottom-2 left-2 w-7 h-7 border-b-2 border-l-2 border-amber-400/90 rounded-bl-lg pointer-events-none z-10" />
            <div className="absolute bottom-2 right-2 w-7 h-7 border-b-2 border-r-2 border-amber-400/90 rounded-br-lg pointer-events-none z-10" />

            {/* Top Bar: Black Opponent Clock & Captured Black Pieces */}
            <div className="flex items-center justify-between px-3 mb-2.5 text-xs text-[#baa68c]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#f5d58d] text-sm">
                  {isPassAndPlay ? '2. Oyuncu (Siyah)' : selectedOpponent.name}
                </span>
                <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg border border-amber-500/30 text-amber-300 font-mono font-bold shadow-inner">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatTime(blackTime)}</span>
                </div>
              </div>

              {/* Captured Pieces by White (Black pieces lost) */}
              <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 h-6">
                {blackCaptured.length === 0 ? (
                  <span className="text-[10px] text-zinc-500 italic">Taş kaybı yok</span>
                ) : (
                  blackCaptured.map((p, idx) => (
                    <span key={idx} className="text-xs font-bold text-zinc-200 font-mono">
                      {p.toUpperCase()}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Real WebGL 3D Interactive Staunton Board - Widened & Expanded Viewport */}
            <div className="w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] lg:w-[680px] lg:h-[680px] xl:w-[740px] xl:h-[740px] rounded-xl overflow-hidden shadow-2xl relative border-2 border-black/80 bg-stone-950/80">
              <ChessThreeCanvas
                board={boardMatrix}
                selectedSquare={selectedSquare}
                legalMoves={legalMovesForSelected}
                lastMove={lastMove}
                hintMove={hintMove}
                theme={boardTheme}
                viewMode={viewMode}
                turn={chessInstance.turn()}
                isCheck={chessInstance.isCheck()}
                isPlayerTurn={isPassAndPlay || chessInstance.turn() === 'w'}
                onSquareClick={handleSquareClick}
              />
            </div>

            {/* Bottom Bar: White Player Clock & Captured White Pieces */}
            <div className="flex items-center justify-between px-3 mt-2.5 text-xs text-[#baa68c]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#f5d58d] text-sm">
                  {isPassAndPlay ? '1. Oyuncu (Beyaz)' : 'Siz (Beyaz)'}
                </span>
                <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg border border-amber-500/30 text-amber-300 font-mono font-bold shadow-inner">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatTime(whiteTime)}</span>
                </div>
              </div>

              {/* Captured Pieces by Black (White pieces lost) */}
              <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 h-6">
                {whiteCaptured.length === 0 ? (
                  <span className="text-[10px] text-zinc-500 italic">Taş kaybı yok</span>
                ) : (
                  whiteCaptured.map((p, idx) => (
                    <span key={idx} className="text-xs font-bold text-amber-200 font-mono">
                      {p.toUpperCase()}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Move Notation Drawer (Optional) */}
        {showNotationDrawer && (
          <div className="hidden xl:flex flex-col ml-6 w-52 bg-[#1b1009]/95 border border-[#c89d56]/40 rounded-xl p-3 shadow-2xl h-80">
            <div className="flex items-center justify-between border-b border-[#c89d56]/20 pb-2 mb-2">
              <span className="font-bold text-xs text-[#f5d58d]">Hamle Notasyonu</span>
              <span className="text-[10px] text-[#baa68c] font-mono">
                {moveHistory.length} hamle
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-xs font-mono text-[#ded3c3] pr-1">
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5 border-b border-white/5">
                  <span className="text-[#a89582] w-6">{idx + 1}.</span>
                  <span className="font-semibold text-amber-200 w-16">{moveHistory[idx * 2]}</span>
                  <span className="text-zinc-300 w-16">
                    {moveHistory[idx * 2 + 1] || '...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#24130a] border-2 border-amber-400 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold text-[#f5d58d] mb-4 font-serif">
              Piyonu Terfi Ettirin
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { type: 'q' as PieceSymbol, label: 'Vezir' },
                { type: 'r' as PieceSymbol, label: 'Kale' },
                { type: 'b' as PieceSymbol, label: 'Fil' },
                { type: 'n' as PieceSymbol, label: 'At' },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => handleSelectPromotion(type)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#341b0e] hover:bg-[#4a2714] border border-[#c89d56]/50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-14">
                    <Chess3DPiece type={type} color="w" theme={boardTheme} />
                  </div>
                  <span className="text-xs font-bold text-[#f5d58d] group-hover:text-amber-300 mt-1">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Victory / Game Over Modal */}
      {gameOverModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center animate-in zoom-in-95">
          <div className="bg-gradient-to-b from-[#2b170c] via-[#1a0f08] to-[#120703] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_60px_rgba(245,158,11,0.6)]">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-3 animate-bounce" />
            <h2 className="text-2xl sm:text-3xl font-black text-[#f5d58d] mb-2 font-serif">
              {gameOverModal.title}
            </h2>
            <p className="text-sm text-[#baa68c] mb-6 leading-relaxed">
              {gameOverModal.subtitle}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRestartGame}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl transition-all cursor-pointer"
              >
                Rövanş Oyna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
