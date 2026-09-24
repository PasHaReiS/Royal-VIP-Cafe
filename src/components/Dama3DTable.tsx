import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Sparkles,
  Trophy,
  Eye,
  Crown,
  Swords,
  Clock,
  Compass,
  Layers,
  Palette,
  Award,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DamaThreeCanvas } from './three/DamaThreeCanvas';
import { sounds } from '../services/soundEffects';
import {
  DamaVariant,
  DamaColor,
  DamaPiece,
  DamaMove,
  DamaViewMode,
  DamaBoardTheme,
} from '../types/dama';
import {
  createInitialDamaBoard,
  getLegalMoves,
  applyDamaMove,
  getBestDamaMove,
} from '../services/damaEngine';
import { CafeOrder } from './CafeWaiterModal';

interface Dama3DTableProps {
  activeOrders?: CafeOrder[];
}

interface OpponentDef {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  title: string;
  difficulty: 'kolay' | 'orta' | 'usta';
  bio: string;
}

const DAMA_OPPONENTS: OpponentDef[] = [
  {
    id: 'haydar',
    name: 'Haydar Usta',
    avatar: '👨🏻‍🦱',
    rating: 1980,
    title: 'Dama Kıraathanesi Reisi',
    difficulty: 'usta',
    bio: 'Fevzipaşa kahvesinin namağlup dama üstadı. Çok taş yeme oyunlarını kaçırmaz.',
  },
  {
    id: 'selim',
    name: 'Büyükusta Selim Abi',
    avatar: '👴🏻',
    rating: 2100,
    title: 'Üstat',
    difficulty: 'usta',
    bio: 'Sabırlı, tahtayı baştan sona kontrol eder. Uçan damaları ölümcüldür.',
  },
  {
    id: 'murat',
    name: 'Murat Kaptan',
    avatar: '🧔🏻‍♂️',
    rating: 1550,
    title: 'Orta Seviye',
    difficulty: 'orta',
    bio: 'Hızlı hamle yapmayı sever, bazen taş bırakır.',
  },
];

export const Dama3DTable: React.FC<Dama3DTableProps> = ({ activeOrders = [] }) => {
  const [variant, setVariant] = useState<DamaVariant>('turk_damasi');
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentDef>(DAMA_OPPONENTS[0]);
  const [board, setBoard] = useState<(DamaPiece | null)[][]>(() =>
    createInitialDamaBoard('turk_damasi')
  );
  const [currentTurn, setCurrentTurn] = useState<DamaColor>('white');
  const [viewMode, setViewMode] = useState<DamaViewMode>('3d-perspective');
  const [boardTheme, setBoardTheme] = useState<DamaBoardTheme>('masif-ceviz');

  const [selectedPiece, setSelectedPiece] = useState<DamaPiece | null>(null);
  const [legalMoves, setLegalMoves] = useState<DamaMove[]>([]);
  const [lastMove, setLastMove] = useState<DamaMove | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // Match score
  const [matchScore, setMatchScore] = useState<{ white: number; black: number }>({
    white: 0,
    black: 0,
  });
  const [targetScore] = useState<number>(3);

  // History for undo
  const [history, setHistory] = useState<
    { board: (DamaPiece | null)[][]; turn: DamaColor }[]
  >([]);

  // Dialogue
  const [dialogue, setDialogue] = useState<string>(
    `${DAMA_OPPONENTS[0].name}: "VIP masif torna Türk Daması masamıza hoş geldiniz! Çok taş yeme kuralına dikkat edin, buyurun."`
  );

  // Victory modal
  const [victoryModal, setVictoryModal] = useState<{
    winner: DamaColor;
    message: string;
  } | null>(null);

  // Calculate legal moves whenever board or turn changes
  useEffect(() => {
    const moves = getLegalMoves(board, currentTurn, variant);
    setLegalMoves(moves);

    // Check game over
    if (moves.length === 0) {
      const winner: DamaColor = currentTurn === 'white' ? 'black' : 'white';
      sounds.playVictoryFanfare();
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
      setMatchScore((prev) => ({ ...prev, [winner]: prev[winner] + 1 }));
      setVictoryModal({
        winner,
        message:
          winner === 'white'
            ? 'Tebrikler! Rakibin hiçbir hamlesi kalmadı, partiyi ustaca kazandınız!'
            : `Hamleniz kalmadı! ${selectedOpponent.name} partiyi kazandı.`,
      });
      return;
    }

    // Bot Turn
    if (currentTurn === 'black') {
      setIsThinking(true);
      const thinkTime = Math.floor(Math.random() * 800) + 650;

      const timer = setTimeout(() => {
        const botMove = getBestDamaMove(board, 'black', variant, selectedOpponent.difficulty);
        if (botMove) {
          executeMove(botMove, true);
        }
        setIsThinking(false);
      }, thinkTime);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, board, variant]);

  // Execute Move
  const executeMove = (move: DamaMove, isBot: boolean = false) => {
    setHistory((prev) => [...prev, { board, turn: currentTurn }]);

    const { newBoard, capturedCount } = applyDamaMove(board, move);
    setBoard(newBoard);
    setLastMove(move);
    setSelectedPiece(null);

    // Audio Feedback
    if (capturedCount > 0) {
      if (capturedCount > 1) {
        sounds.playDamaJump();
        setDialogue(
          isBot
            ? `${selectedOpponent.name}: "Tam ${capturedCount} taş birden aldım! Dama böyle oynanır!"`
            : `Müthiş kombo! ${capturedCount} taşı birden tahtadan sildiniz!`
        );
      } else {
        sounds.playDamaMove();
      }
    } else {
      sounds.playDamaMove();
    }

    if (move.isPromotion) {
      sounds.playDamaCrown();
      setDialogue(
        isBot
          ? `${selectedOpponent.name}: "Pulun Dama oldu! Artık uçan hamlelerle tahtaya hükmediyorum."`
          : 'Tebrikler! Pulunuz DAMA oldu! Uçan kale gibi tüm hat boyunca hareket edebilirsiniz.'
      );
    }

    setCurrentTurn((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  // Square Click
  const handleSquareClick = (r: number, c: number) => {
    if (currentTurn !== 'white' || isThinking || victoryModal) return;

    const clickedPiece = board[r][c];

    // If target of legal move
    if (selectedPiece) {
      const validMove = legalMoves.find(
        (m) =>
          m.fromRow === selectedPiece.row &&
          m.fromCol === selectedPiece.col &&
          m.toRow === r &&
          m.toCol === c
      );

      if (validMove) {
        executeMove(validMove, false);
        return;
      }
    }

    // Select piece
    if (clickedPiece && clickedPiece.color === 'white') {
      const hasMoves = legalMoves.some(
        (m) => m.fromRow === r && m.fromCol === c
      );
      if (hasMoves) {
        setSelectedPiece(clickedPiece);
        sounds.playDamaMove();
      } else {
        // If has no legal moves because another piece has mandatory capture
        const hasAnyCapture = legalMoves.some(
          (m) => (m.capturedPieces?.length || 0) > 0
        );
        if (hasAnyCapture) {
          sounds.playBonusBeep();
          setDialogue(
            `${selectedOpponent.name}: "Türk Daması kuralı: Taş yemek mecburidir! Kırmızı halkayla parlayan taşla oynamalısın."`
          );
        }
      }
    } else {
      setSelectedPiece(null);
    }
  };

  // Reset Game
  const handleResetGame = () => {
    setBoard(createInitialDamaBoard(variant));
    setCurrentTurn('white');
    setSelectedPiece(null);
    setLastMove(null);
    setHistory([]);
    setVictoryModal(null);
    setDialogue(
      variant === 'turk_damasi'
        ? `${selectedOpponent.name}: "Taşlar yeniden dizildi. Beyaz başlar, hürmetler!"`
        : `${selectedOpponent.name}: "Çapraz dama başladı. İyi olan kazansın!"`
    );
    sounds.playDamaMove();
  };

  // Undo Move
  const handleUndo = () => {
    if (isThinking || history.length < 2) return;
    const previousState = history[history.length - 2];
    setBoard(previousState.board);
    setCurrentTurn('white');
    setHistory((prev) => prev.slice(0, -2));
    setSelectedPiece(null);
    setLastMove(null);
    sounds.playDamaMove();
  };

  // Count pieces remaining
  let whitePiecesCount = 0;
  let blackPiecesCount = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color === 'white') whitePiecesCount++;
      if (board[r][c]?.color === 'black') blackPiecesCount++;
    }
  }

  // 3D Camera styles
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
        ? 'linear-gradient(135deg, #593119 0%, #3a1c0b 100%)'
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
        {/* Opponent Profile & Live Status */}
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
              <span>Kalan Taş: {blackPiecesCount}</span>
              <span>•</span>
              <span className="text-amber-200/90 font-medium">
                {isThinking ? '🧠 Hesaplıyor...' : 'Hamlenizi bekliyor'}
              </span>
            </div>
          </div>
        </div>

        {/* Match Score Display */}
        <div className="flex items-center gap-4 bg-[#1a0f08]/90 px-4 py-1.5 rounded-xl border border-[#c89d56]/35 shadow-inner">
          <div className="text-center">
            <div className="text-[10px] text-[#baa68c] font-bold uppercase tracking-wider">
              Siz (Beyaz)
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {matchScore.white}
            </div>
          </div>
          <div className="text-xs font-bold text-[#c89d56] px-1 flex flex-col items-center">
            <Trophy className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
            <span>Hedef: {targetScore}</span>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-[#baa68c] font-bold uppercase tracking-wider">
              {selectedOpponent.name.split(' ')[0]}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {matchScore.black}
            </div>
          </div>
        </div>

        {/* 3D Camera Controls & Variant Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Variant Selector */}
          <div className="flex items-center bg-[#24130a] rounded-xl border border-[#c89d56]/40 p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setVariant('turk_damasi');
                setBoard(createInitialDamaBoard('turk_damasi'));
                sounds.playButtonWoodClick();
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                variant === 'turk_damasi'
                  ? 'bg-[#c89d56] text-[#140803] shadow'
                  : 'text-[#baa68c] hover:text-[#f5d58d]'
              }`}
            >
              Türk Daması
            </button>
            <button
              type="button"
              onClick={() => {
                setVariant('capraz_dama');
                setBoard(createInitialDamaBoard('capraz_dama'));
                sounds.playButtonWoodClick();
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                variant === 'capraz_dama'
                  ? 'bg-[#c89d56] text-[#140803] shadow'
                  : 'text-[#baa68c] hover:text-[#f5d58d]'
              }`}
            >
              Çapraz Dama
            </button>
          </div>

          {/* 3D Camera Mode */}
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
              onClick={() => setViewMode('2d-top')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === '2d-top'
                  ? 'bg-[#c89d56] text-[#140803] shadow'
                  : 'text-[#baa68c] hover:text-[#f5d58d]'
              }`}
              title="2D Kuşbakışı"
            >
              2D
            </button>
          </div>

          {/* Board Theme */}
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

          {/* Undo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={isThinking || history.length < 2}
            className="p-1.5 rounded-xl bg-[#24130a] hover:bg-[#341b0e] disabled:opacity-40 border border-[#c89d56]/40 text-[#f5d58d] transition-all cursor-pointer"
            title="Hamleyi Geri Al"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleResetGame}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yeni Parti</span>
          </button>
        </div>
      </div>

      {/* Opponent Dialogue Balloon */}
      <div className="w-full max-w-2xl bg-[#1e130a]/90 border border-[#c89d56]/35 px-4 py-2 rounded-xl text-center text-xs sm:text-sm text-[#f5d58d] font-serif italic mb-2 shadow-lg flex items-center justify-center gap-2">
        <span className="text-amber-400 text-base">“</span>
        <span>{dialogue}</span>
        <span className="text-amber-400 text-base">”</span>
      </div>

      {/* ======================================================== */}
      {/* 3D ARENA CONTAINER (Table, Board, Slab Extrusion)        */}
      {/* ======================================================== */}
      <div
        className="w-full flex items-center justify-center my-3 relative"
        style={{
          perspective: camera.perspective,
          perspectiveOrigin: '50% 40%',
        }}
      >
        {/* Left Side: Captured Black Pieces Tray */}
        <div className="hidden lg:flex flex-col items-center mr-6 self-center bg-[#170e08]/90 border border-[#c89d56]/40 rounded-xl p-2.5 shadow-2xl">
          <div className="text-[10px] font-bold text-[#c89d56] mb-1.5 text-center">ALINAN TAŞLAR</div>
          <div className="w-12 h-64 bg-[#110703] rounded-lg border border-white/10 p-1 flex flex-col items-center justify-end gap-1 overflow-hidden shadow-inner">
            {Array.from({ length: 16 - blackPiecesCount }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-3 rounded-full bg-gradient-to-b from-[#2b170c] to-[#0a0402] border border-[#f59e0b]/40 shadow-sm"
              />
            ))}
          </div>
          <div className="mt-1 text-[11px] font-bold text-amber-300">
            {16 - blackPiecesCount} Taş
          </div>
        </div>

        {/* 3D Master Board Container */}
        <div
          className="relative transition-all duration-700 ease-out"
          style={{
            boxShadow: camera.depthShadow,
          }}
        >
          {/* Front Bevel Lip with Brass Plaque */}
          <div
            className="absolute -bottom-6 inset-x-0 h-7 rounded-b-2xl flex items-center justify-center border-b-2 border-r-2 border-l-2 border-black/80 pointer-events-none z-10"
            style={{
              background:
                'linear-gradient(to bottom, #2b170c 0%, #150904 60%, #080302 100%)',
              boxShadow: '0 12px 20px rgba(0,0,0,0.9)',
            }}
          >
            <div className="px-4 py-0.5 rounded bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 border border-amber-300/80 text-[10px] font-bold text-black tracking-widest uppercase shadow">
              VIP KAPALIÇARŞI 3D TÜRK DAMASI MASASI
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
            {/* Brass Inlaid Corners */}
            <div className="absolute top-2 left-2 w-7 h-7 border-t-2 border-l-2 border-amber-400/90 rounded-tl-lg pointer-events-none z-10" />
            <div className="absolute top-2 right-2 w-7 h-7 border-t-2 border-r-2 border-amber-400/90 rounded-tr-lg pointer-events-none z-10" />
            <div className="absolute bottom-2 left-2 w-7 h-7 border-b-2 border-l-2 border-amber-400/90 rounded-bl-lg pointer-events-none z-10" />
            <div className="absolute bottom-2 right-2 w-7 h-7 border-b-2 border-r-2 border-amber-400/90 rounded-br-lg pointer-events-none z-10" />

            {/* Top Bar: Opponent Info */}
            <div className="flex items-center justify-between px-3 mb-2.5 text-xs text-[#baa68c]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#f5d58d] text-sm">
                  {selectedOpponent.name} (Siyah Pullar)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-amber-300 border border-amber-500/20 font-bold">
                  {blackPiecesCount} Pul
                </span>
              </div>
            </div>

            {/* Real WebGL 3D Interactive Dama Board - Widened & Expanded Viewport */}
            <div className="w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] lg:w-[680px] lg:h-[680px] xl:w-[740px] xl:h-[740px] rounded-xl overflow-hidden shadow-2xl relative border-2 border-black/80 bg-stone-950/80">
              <DamaThreeCanvas
                board={board}
                selectedPiece={selectedPiece}
                legalMoves={legalMoves}
                mandatoryCaptures={legalMoves
                  .filter((m) => (m.capturedPieces?.length || 0) > 0)
                  .map((m) => ({ row: m.fromRow, col: m.fromCol }))}
                lastMove={lastMove}
                theme={boardTheme}
                viewMode={viewMode}
                currentTurn={currentTurn}
                isPlayerTurn={currentTurn === 'white' && !isThinking}
                onSquareClick={handleSquareClick}
              />
            </div>

            {/* Bottom Bar: Player Info */}
            <div className="flex items-center justify-between px-3 mt-2.5 text-xs text-[#baa68c]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#f5d58d] text-sm">
                  Siz (Beyaz Pullar)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-amber-300 border border-amber-500/20">
                  {whitePiecesCount} Pul
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Captured White Pieces Tray */}
        <div className="hidden lg:flex flex-col items-center ml-6 self-center bg-[#170e08]/90 border border-[#c89d56]/40 rounded-xl p-2.5 shadow-2xl">
          <div className="text-[10px] font-bold text-[#c89d56] mb-1.5 text-center">RAKİBİN ALDIĞI</div>
          <div className="w-12 h-64 bg-[#110703] rounded-lg border border-white/10 p-1 flex flex-col items-center justify-end gap-1 overflow-hidden shadow-inner">
            {Array.from({ length: 16 - whitePiecesCount }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-3 rounded-full bg-gradient-to-b from-[#f5e6d0] to-[#bba072] border border-[#a67c42]/60 shadow-sm"
              />
            ))}
          </div>
          <div className="mt-1 text-[11px] font-bold text-amber-300">
            {16 - whitePiecesCount} Taş
          </div>
        </div>
      </div>

      {/* Victory Modal */}
      {victoryModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center animate-in zoom-in-95">
          <div className="bg-gradient-to-b from-[#2b170c] via-[#1a0f08] to-[#120703] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_60px_rgba(245,158,11,0.6)]">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-3 animate-bounce" />
            <h2 className="text-2xl sm:text-3xl font-black text-[#f5d58d] mb-2 font-serif">
              {victoryModal.winner === 'white' ? 'Tebrikler, Kazandınız!' : 'Haydar Usta Kazandı!'}
            </h2>
            <p className="text-sm text-[#baa68c] mb-6 leading-relaxed">
              {victoryModal.message}
            </p>
            <button
              type="button"
              onClick={handleResetGame}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl transition-all cursor-pointer"
            >
              Rövanş Oyna
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
