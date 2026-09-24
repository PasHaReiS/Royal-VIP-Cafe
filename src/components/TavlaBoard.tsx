import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  TavlaState,
  PlayerColor,
  ValidMoveOption,
  BotDifficulty,
} from '../types/tavla';
import {
  createInitialTavlaState,
  startNextRound,
  rollDice,
  performOpeningToss,
  getValidDestinations,
  executeMove,
  undoLastMove,
  confirmTurnEnd,
  getBotBestMove,
  hasAnyLegalMoves,
} from '../services/tavlaEngine';
import { sounds } from '../services/soundEffects';
import {
  Dices,
  RotateCcw,
  Undo2,
  CheckCircle2,
  Users,
  User,
  Trophy,
  Sparkles,
  Zap,
  AlertCircle,
  BarChart3,
  Move,
  MousePointer,
  Target,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Tavla3DDice } from './Tavla3DDice';
import { CafeOrder } from './CafeWaiterModal';
import { CafeItemRealisticImage } from './CafeItemRealisticImage';
import { CarvedRosetteMedallion } from './CarvedRosetteMedallion';
import { CarvedBrassHinge } from './CarvedBrassHinge';
import { CarvedPointSpear } from './CarvedPointSpear';

import { UserProfile } from '../services/statsService';

interface TavlaBoardProps {
  activeOrders: CafeOrder[];
  onOpenStats?: () => void;
  onRecordStats?: (isWin: boolean, durationSeconds: number, extra?: { winType?: string }) => void;
  userProfile?: UserProfile;
}

export const TavlaBoard: React.FC<TavlaBoardProps> = ({
  activeOrders,
  onOpenStats,
  onRecordStats,
  userProfile,
}) => {
  const [state, setState] = useState<TavlaState>(() => createInitialTavlaState('vs_bot'));
  const [lastWinner, setLastWinner] = useState<PlayerColor | null>(null);
  const [selectedSource, setSelectedSource] = useState<number | 'bar' | null>(null);
  const [validMoves, setValidMoves] = useState<ValidMoveOption[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Puanlı Oyun Ayarları (3, 5, 7 veya Manuel Puan)
  const [targetScore, setTargetScore] = useState<number>(5);
  const [showPointsModal, setShowPointsModal] = useState<boolean>(false);
  const [manualScoreVal, setManualScoreVal] = useState<string>('5');

  // Interaction Mode: 'drag' (Sürükle-Bırak) veya 'click' (Seç & Taşı)
  const [interactionMode, setInteractionMode] = useState<'drag' | 'click'>('drag');

  const [draggedSource, setDraggedSource] = useState<number | 'bar' | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<number | null>(null);
  const gameStartTimeRef = React.useRef<number>(Date.now());
  const hasRecordedWinRef = React.useRef<boolean>(false);

  // Set of points that have at least one legal move with current dice
  const movablePointIndices = React.useMemo(() => {
    if (state.winner || state.phase !== 'playing' || state.dice.length === 0 || state.isRolling) return new Set<number | 'bar'>();
    if (state.gameMode === 'vs_bot' && state.currentTurn === 'black') return new Set<number | 'bar'>();

    const turn = state.currentTurn;
    const set = new Set<number | 'bar'>();

    if (state.bar[turn] > 0) {
      const moves = getValidDestinations(
        'bar',
        state.points,
        state.bar,
        state.dice,
        state.usedDice,
        turn
      );
      if (moves.length > 0) set.add('bar');
      return set;
    }

    for (let i = 1; i <= 24; i++) {
      const stack = state.points[i];
      if (stack && stack.color === turn && stack.count > 0) {
        const moves = getValidDestinations(
          i,
          state.points,
          state.bar,
          state.dice,
          state.usedDice,
          turn
        );
        if (moves.length > 0) {
          set.add(i);
        }
      }
    }
    return set;
  }, [state.points, state.bar, state.dice, state.usedDice, state.currentTurn, state.isRolling, state.winner, state.gameMode, state.phase]);

  // Update valid moves when selectedSource or dice change
  useEffect(() => {
    if (selectedSource === null || state.dice.length === 0) {
      setValidMoves([]);
      return;
    }

    const moves = getValidDestinations(
      selectedSource,
      state.points,
      state.bar,
      state.dice,
      state.usedDice,
      state.currentTurn
    );
    setValidMoves(moves);
  }, [selectedSource, state.points, state.bar, state.dice, state.usedDice, state.currentTurn]);

  // Victory celebration & Stats Recording
  useEffect(() => {
    if (state.winner) {
      setLastWinner(state.winner);
      sounds.playVictory();
      confetti({
        particleCount: 140,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f6f0e2', '#e6c387', '#b85025'],
      });

      if (!hasRecordedWinRef.current && onRecordStats) {
        hasRecordedWinRef.current = true;
        const durationSec = Math.max(15, Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
        const isUserWinner = state.winner === 'white';
        // Determine if mars or katmerli mars occurred
        const loserColor = state.winner === 'white' ? 'black' : 'white';
        const loserBorneOff = state.borneOff[loserColor];
        let winType = 'normal';
        if (loserBorneOff === 0) {
          const loserHasInWinnerHomeOrBar =
            state.bar[loserColor] > 0 ||
            (loserColor === 'black'
              ? state.points.slice(1, 7).some((p) => p && p.color === 'black')
              : state.points.slice(19, 25).some((p) => p && p.color === 'white'));
          winType = loserHasInWinnerHomeOrBar ? 'katmerli_mars' : 'mars';
        }
        onRecordStats(isUserWinner, durationSec, { winType });
      }
    }
  }, [state.winner, state.borneOff, state.bar, state.points, onRecordStats]);

  // Keyboard shortcut for Undo (Ctrl+Z or Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.turnHistory.length]);

  // Handle Opening Roll Logic (Eksiksiz Tavla Başlangıç Zarı)
  const handleOpeningRoll = useCallback(() => {
    if (state.isRolling || state.phase !== 'opening_roll') return;

    sounds.playDiceRoll();
    setSelectedSource(null);
    setState((prev) => ({
      ...prev,
      isRolling: true,
      openingRoll: {
        ...prev.openingRoll,
        status: 'rolling',
        message: 'Açılış zarları atılıyor...',
      },
    }));

    setTimeout(() => {
      const toss = performOpeningToss();

      if (toss.isTie) {
        sounds.playDiceRoll();
        setState((prev) => ({
          ...prev,
          isRolling: false,
          openingRoll: {
            whiteDie: toss.whiteDie,
            blackDie: toss.blackDie,
            winner: null,
            status: 'tied',
            tieCount: prev.openingRoll.tieCount + 1,
            message: `Zarlar eşit (${toss.whiteDie} - ${toss.blackDie}) geldi! Tavla kuralları gereği başlangıç zarları tekrar atılıyor...`,
          },
          lastMoveDesc: `Açılış zarları eşit (${toss.whiteDie} - ${toss.blackDie}) geldi! Eşitlik bozulana kadar tekrar atılıyor.`,
        }));
      } else {
        const winner = toss.winner!;
        const winnerName =
          winner === 'white'
            ? (userProfile?.name || 'Beyaz')
            : (state.gameMode === 'vs_bot'
                ? state.botDifficulty === 'amator'
                  ? 'Çırak'
                  : state.botDifficulty === 'orta'
                  ? 'Kalfa'
                  : 'Haydar Usta'
                : 'Siyah');

        const high = Math.max(toss.whiteDie, toss.blackDie);
        const low = Math.min(toss.whiteDie, toss.blackDie);

        sounds.playVictory();

        setState((prev) => ({
          ...prev,
          isRolling: false,
          openingRoll: {
            whiteDie: toss.whiteDie,
            blackDie: toss.blackDie,
            winner,
            status: 'decided',
            tieCount: prev.openingRoll.tieCount,
            message: `${winnerName} daha büyük zar attı (${high} > ${low}) ve oyuna başlama hakkı kazandı!`,
          },
          lastMoveDesc: `${winnerName} büyük zarla oyuna başladı: ${toss.diceName} (${high} - ${low})`,
        }));

        // After 1400ms visual celebration, transition to 'playing' phase.
        // Kural: Açılışta atılan iki zar BİRLEŞTİRİLEREK ilk hamlede oynanır!
        setTimeout(() => {
          setState((prev) => {
            if (prev.phase !== 'opening_roll') return prev;

            const initialDice = [high, low];
            const usedDice = [false, false];

            return {
              ...prev,
              phase: 'playing',
              currentTurn: winner,
              dice: initialDice,
              usedDice,
              turnHistory: [],
              turnReadyToEnd: false,
              diceNameTurkish: toss.diceName,
              lastMoveDesc: `${winnerName} oyuna başladı! Açılış zarları: ${toss.diceName} (${high} ve ${low}) ile ilk hamleyi yapın.`,
            };
          });
        }, 1400);
      }
    }, 1150);
  }, [state.isRolling, state.phase, state.gameMode, state.botDifficulty, userProfile?.name]);

  // Automatic re-roll when opening toss ties
  useEffect(() => {
    if (state.phase === 'opening_roll' && state.openingRoll.status === 'tied' && !state.isRolling) {
      const tieTimer = setTimeout(() => {
        handleOpeningRoll();
      }, 1500);
      return () => clearTimeout(tieTimer);
    }
  }, [state.phase, state.openingRoll.status, state.isRolling, handleOpeningRoll]);

  // Handle Regular Dice Rolling (Only during active 'playing' phase)
  const handleRollDice = useCallback(() => {
    if (state.isRolling || state.phase !== 'playing' || state.dice.length > 0 || state.winner) return;

    sounds.playDiceRoll();
    setSelectedSource(null);
    setState((prev) => ({ ...prev, isRolling: true }));

    setTimeout(() => {
      const { dice, name } = rollDice();
      const usedDice = dice.map(() => false);

      setState((prev) => {
        const canMove = hasAnyLegalMoves(prev.points, prev.bar, dice, usedDice, prev.currentTurn);
        if (!canMove) {
          // Keep dice on board so the player can see the roll and understand why no moves exist
          return {
            ...prev,
            dice,
            usedDice,
            turnHistory: [],
            turnReadyToEnd: true,
            diceNameTurkish: name,
            isRolling: false,
            lastMoveDesc: `${name} geldi fakat ${prev.currentTurn === 'white' ? 'Beyaz' : 'Haydar Usta'} için oynanacak yasal hamle yok (Geleve)!`,
          };
        }

        // Auto-select bar if player has broken checkers waiting to enter
        if (prev.bar[prev.currentTurn] > 0) {
          setSelectedSource('bar');
        }

        return {
          ...prev,
          dice,
          usedDice,
          turnHistory: [],
          turnReadyToEnd: false,
          diceNameTurkish: name,
          isRolling: false,
          lastMoveDesc: `${prev.currentTurn === 'white' ? 'Beyaz' : 'Haydar Usta'} zar attı: ${name}`,
        };
      });
    }, 1150);
  }, [state.isRolling, state.phase, state.dice.length, state.winner]);

  // Bot Turn Automation (Haydar Usta - Only in 'playing' phase)
  useEffect(() => {
    if (
      state.gameMode === 'vs_bot' &&
      state.phase === 'playing' &&
      state.currentTurn === 'black' &&
      !state.winner &&
      !state.isRolling
    ) {
      // 1. If bot hasn't rolled yet, roll after a natural thinking pause
      if (state.dice.length === 0) {
        const rollTimer = setTimeout(() => {
          handleRollDice();
        }, 850);
        return () => clearTimeout(rollTimer);
      }

      // 2. If all moves finished or no legal moves possible (geleve),
      // pause naturally so human player can comfortably observe the result before switching turn
      if (state.turnReadyToEnd) {
        const endTimer = setTimeout(() => {
          setState((current) => confirmTurnEnd(current));
        }, 1100);
        return () => clearTimeout(endTimer);
      }

      // 3. Bot executes the next move step-by-step with guaranteed synchronization
      const moveTimer = setTimeout(() => {
        const best = getBotBestMove(state);
        if (best) {
          const { newState, wasHit } = executeMove(
            state,
            best.from,
            best.to,
            best.moveOption
          );
          sounds.playCheckerMove(wasHit);

          // CRITICAL FIX: ALWAYS commit newState into state!
          // This guarantees that every checker visibly moves on the board,
          // sounds play, and no moves are ever skipped or dropped.
          setState(newState);
        } else {
          // If no legal moves remain for unused dice, mark turn as ready to end
          setState((current) => ({
            ...current,
            turnReadyToEnd: true,
            lastMoveDesc: 'Kalan zarla oynanacak yasal kapı yok (Geleve).',
          }));
        }
      }, 750);

      return () => clearTimeout(moveTimer);
    }
  }, [state, handleRollDice]);

  // Handle clicking a point or checker (Only active when interactionMode === 'click')
  const handleSelectPoint = (pointIndex: number | 'bar') => {
    if (interactionMode !== 'click') return;
    if (state.phase !== 'playing' || state.winner || state.dice.length === 0) return;
    if (state.gameMode === 'vs_bot' && state.currentTurn === 'black') return;

    const turn = state.currentTurn;

    if (state.bar[turn] > 0 && pointIndex !== 'bar') {
      sounds.playCheckerSelect();
      setSelectedSource('bar');
      return;
    }

    if (pointIndex === 'bar') {
      if (state.bar[turn] > 0) {
        setSelectedSource('bar');
        sounds.playCheckerSelect();
      }
      return;
    }

    const stack = state.points[pointIndex];
    if (stack && stack.color === turn) {
      if (selectedSource === pointIndex) {
        setSelectedSource(null);
      } else {
        setSelectedSource(pointIndex);
        sounds.playCheckerSelect();
      }
    } else if (selectedSource !== null) {
      const moveOpt = validMoves.find((m) => m.target === pointIndex);
      if (moveOpt) {
        handleExecuteMove(moveOpt);
      }
    }
  };

  // Execute move from a specific source (supports both click selection and direct drag & drop)
  const handleExecuteMoveFromSource = (
    from: number | 'bar',
    moveOption: ValidMoveOption
  ) => {
    const { newState, wasHit } = executeMove(
      state,
      from,
      moveOption.target,
      moveOption
    );

    sounds.playCheckerMove(wasHit);
    setState(newState);
    setSelectedSource(null);
    setDraggedSource(null);
    setDragOverTarget(null);
  };

  // Execute single or double move using active selectedSource
  const handleExecuteMove = (moveOption: ValidMoveOption) => {
    if (selectedSource === null) return;
    handleExecuteMoveFromSource(selectedSource, moveOption);
  };

  // Drag and drop event handlers for Checkers (Only active when interactionMode === 'drag')
  const handleDragStartPoint = (e: React.DragEvent, source: number | 'bar') => {
    if (interactionMode !== 'drag') {
      e.preventDefault();
      return;
    }
    if (state.phase !== 'playing' || state.winner || state.dice.length === 0) {
      e.preventDefault();
      return;
    }
    if (state.gameMode === 'vs_bot' && state.currentTurn === 'black') {
      e.preventDefault();
      return;
    }

    const turn = state.currentTurn;
    // If broken checkers in bar, only bar can be dragged
    if (state.bar[turn] > 0 && source !== 'bar') {
      e.preventDefault();
      return;
    }

    if (source === 'bar') {
      if (state.bar[turn] <= 0) {
        e.preventDefault();
        return;
      }
    } else {
      const stack = state.points[source];
      if (!stack || stack.color !== turn || stack.count <= 0) {
        e.preventDefault();
        return;
      }
    }

    // Set active selection and drag source
    setSelectedSource(source);
    setDraggedSource(source);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', source.toString());
  };

  const handleDragOverTarget = (e: React.DragEvent, target: number) => {
    // Check if this target is among the valid moves for the currently dragged source
    if (draggedSource !== null) {
      const isLegal = validMoves.some((m) => m.target === target);
      if (isLegal) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverTarget !== target) {
          setDragOverTarget(target);
        }
      }
    }
  };

  const handleDragLeaveTarget = () => {
    setDragOverTarget(null);
  };

  const handleDropOnTarget = (e: React.DragEvent, target: number) => {
    e.preventDefault();
    setDragOverTarget(null);

    const sourceData = e.dataTransfer.getData('text/plain');
    const source: number | 'bar' | null =
      sourceData === 'bar'
        ? 'bar'
        : sourceData !== ''
        ? parseInt(sourceData, 10)
        : draggedSource;

    setDraggedSource(null);

    if (source === null) return;

    // Find valid move option for this target
    const moves = getValidDestinations(
      source,
      state.points,
      state.bar,
      state.dice,
      state.usedDice,
      state.currentTurn
    );

    const matchMove = moves.find((m) => m.target === target);
    if (matchMove) {
      handleExecuteMoveFromSource(source, matchMove);
    }
  };

  const handleDragEnd = () => {
    setDraggedSource(null);
    setDragOverTarget(null);
  };

  // Undo Last Move
  const handleUndo = () => {
    if (state.turnHistory.length === 0) return;
    sounds.playCheckerMove(false);
    const reverted = undoLastMove(state);
    setState(reverted);
    setSelectedSource(null);
  };

  // Confirm End of Turn
  const handleConfirmTurnEnd = () => {
    sounds.playCheckerMove(false);
    const nextState = confirmTurnEnd(state);
    setState(nextState);
    setSelectedSource(null);
  };

  const handlePromptReset = () => {
    setShowResetConfirm(true);
  };

  // Next round in match (Skorları koruyarak yeni tahta kur - Bir önceki partiyi kazanan ilk zar atarak başlar)
  const handleNextRound = () => {
    const winner = state.winner || state.lastWinner || lastWinner;
    const currentScores = state.scores;
    const nextState = startNextRound(state, winner);
    setState({
      ...nextState,
      scores: currentScores,
    });
    if (winner) setLastWinner(winner);
    setSelectedSource(null);
    gameStartTimeRef.current = Date.now();
    hasRecordedWinRef.current = false;
  };

  // Set new target match score / Yeni Parti Başlat (Kural: Önceki kazanan varsa ilk zar atarak o başlar)
  const handleSetTargetScore = (newTarget: number) => {
    const target = Math.max(1, Math.min(50, newTarget));
    setTargetScore(target);
    const winner = state.winner || state.lastWinner || lastWinner;
    const nextInitial = createInitialTavlaState(
      state.gameMode,
      state.botDifficulty,
      target,
      winner // Bir önceki oyunu kazanan oyuncu yeni partiye ilk zar atarak başlar
    );
    setState(nextInitial);
    if (winner) setLastWinner(winner);
    setSelectedSource(null);
    setShowPointsModal(false);
    gameStartTimeRef.current = Date.now();
    hasRecordedWinRef.current = false;
  };

  const handleConfirmReset = () => {
    const winner = state.winner || state.lastWinner || lastWinner;
    const nextInitial = createInitialTavlaState(
      state.gameMode,
      state.botDifficulty,
      targetScore,
      winner // Oyun sıfırlandığında bir önceki kazanan varsa ilk zar atarak o başlar
    );
    setState(nextInitial);
    if (winner) setLastWinner(winner);
    setSelectedSource(null);
    setShowResetConfirm(false);
    gameStartTimeRef.current = Date.now();
    hasRecordedWinRef.current = false;
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleChangeMode = (mode: 'vs_bot' | 'pass_and_play') => {
    setLastWinner(null);
    setState(createInitialTavlaState(mode, state.botDifficulty));
    setSelectedSource(null);
    gameStartTimeRef.current = Date.now();
    hasRecordedWinRef.current = false;
  };

  const handleChangeDifficulty = (difficulty: BotDifficulty) => {
    setState((prev) => ({
      ...prev,
      botDifficulty: difficulty,
    }));
  };

  // Render Triangle Point (Fluidly responsive, 100% fits width and height, pre-carved resting flutes)
  const renderPoint = (pointNumber: number, isTopRow: boolean) => {
    const stack = state.points[pointNumber];
    const isSelected = selectedSource === pointNumber;
    const moveOption = validMoves.find((m) => m.target === pointNumber);
    const isPointDark = pointNumber % 2 === 0;
    const isMovable = movablePointIndices.has(pointNumber);
    const isHumanTurn = state.gameMode === 'pass_and_play' || state.currentTurn === 'white';

    const isDragTarget = dragOverTarget === pointNumber;
    const isBeingDragged = draggedSource === pointNumber;

    return (
      <button
        key={pointNumber}
        type="button"
        onDragOver={(e) => handleDragOverTarget(e, pointNumber)}
        onDragLeave={handleDragLeaveTarget}
        onDrop={(e) => handleDropOnTarget(e, pointNumber)}
        onClick={() => {
          if (moveOption) {
            handleExecuteMove(moveOption);
          } else {
            handleSelectPoint(pointNumber);
          }
        }}
        aria-label={`${pointNumber}. hane`}
        className={`relative flex-1 min-w-0 h-32 sm:h-40 md:h-48 flex flex-col items-center justify-between py-1 transition-all select-none cursor-pointer ${
          isSelected ? 'bg-amber-400/25 ring-2 ring-amber-400 z-20' : ''
        } ${
          isDragTarget
            ? 'ring-2 ring-amber-300 bg-amber-400/40 z-30 shadow-2xl scale-102'
            : moveOption
            ? 'ring-2 ring-[#f5d58d] bg-amber-400/30 cursor-pointer z-30 shadow-lg'
            : isMovable && !selectedSource && isHumanTurn
            ? 'hover:brightness-125 cursor-pointer'
            : ''
        }`}
      >
        {/* Natural Carved Spear Points with Fleur-de-lis finial crowns (VK.jpeg) */}
        <CarvedPointSpear
          pointNumber={pointNumber}
          isTopRow={isTopRow}
          isPointDark={isPointDark}
        />

        {/* Valid Destination Indicator / Combined Move Badge */}
        {moveOption && (
          <div
            className={`absolute ${
              isTopRow ? 'bottom-2' : 'top-2'
            } z-30 pointer-events-none flex flex-col items-center`}
          >
            {moveOption.isCombined ? (
              <div className="flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 text-[9px] sm:text-[10px] font-black text-black shadow-md border border-amber-300 animate-bounce">
                <Zap className="w-2.5 h-2.5 text-black fill-black" />
                <span>Çift: +{moveOption.dieValues.reduce((a, b) => a + b, 0)}</span>
              </div>
            ) : (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#f5d58d] bg-[#c89d56]/70 animate-ping" />
            )}
          </div>
        )}

        {/* 3D Tournament Checkers Column - Symmetrically Stacked Against Outer Board Rim */}
        <div
          className={`absolute left-0 right-0 z-10 flex items-center ${
            isTopRow
              ? 'top-1 flex-col'
              : 'bottom-1 flex-col-reverse'
          }`}
        >
          {stack &&
            Array.from({ length: Math.min(stack.count, 5) }).map((_, i) => {
              const isPlayableChecker = i === Math.min(stack.count, 5) - 1;
              const canDragChecker = isPlayableChecker && isMovable && isHumanTurn && interactionMode === 'drag';

              return (
                <div
                  key={i}
                  draggable={canDragChecker}
                  onDragStart={(e) => {
                    if (canDragChecker) {
                      e.stopPropagation();
                      handleDragStartPoint(e, pointNumber);
                    }
                  }}
                  onDragEnd={handleDragEnd}
                  className={`relative shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs select-none transition-all ${
                    canDragChecker ? 'cursor-grab active:cursor-grabbing' : ''
                  } ${
                    isTopRow
                      ? i > 0
                        ? '-mt-2.5 sm:-mt-3 md:-mt-3.5'
                        : ''
                      : i > 0
                      ? '-mb-2.5 sm:-mb-3 md:-mb-3.5'
                      : ''
                  } ${
                    stack.color === 'white'
                      ? 'checker-white-iran text-[#2b180d]'
                      : 'checker-black-iran text-[#e6d8c4]'
                  } ${
                    isBeingDragged && isPlayableChecker
                      ? 'opacity-40 scale-95'
                      : isSelected && isPlayableChecker
                      ? 'ring-2 ring-[#f5d58d] shadow-2xl z-20 brightness-125 scale-105'
                      : isMovable && isPlayableChecker && !selectedSource && isHumanTurn
                      ? interactionMode === 'drag'
                        ? 'ring-2 ring-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.7)] hover:scale-105'
                        : 'ring-2 ring-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.7)] animate-pulse'
                      : ''
                  }`}
                >
                  {i === 4 && stack.count > 5 ? (
                    <span className="relative z-10 text-[9px] sm:text-[10px] font-black drop-shadow text-amber-900 bg-amber-200/90 rounded-full px-1 pointer-events-none">
                      {stack.count}
                    </span>
                  ) : null}
                </div>
              );
            })}
        </div>

        {/* Point Number - Symmetrically Placed at Spear Tip facing Center */}
        <span
          className={`absolute left-0 right-0 text-center z-10 text-[9px] sm:text-[10px] font-mono font-medium text-[#b59f8c]/70 select-none ${
            isTopRow ? 'bottom-1' : 'top-1'
          }`}
        >
          {pointNumber}
        </span>
      </button>
    );
  };

  const isHumanTurn = state.gameMode === 'pass_and_play' || state.currentTurn === 'white';
  const canUndo = state.turnHistory.length > 0 && isHumanTurn && !state.winner;

  const bearOffWhiteMove = validMoves.find((m) => m.target === 0);
  const bearOffBlackMove = validMoves.find((m) => m.target === 25);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2.5">
      {/* Top Controls Header: Compact, Sleek, Never pushes board out */}
      <div className="p-2 sm:p-3 rounded-2xl bg-[#1a0c06] border border-[#c89d56]/30 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        {/* Game Mode & Difficulty Switches */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#261208] p-1 rounded-xl border border-[#c89d56]/20">
            <button
              onClick={() => handleChangeMode('vs_bot')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                state.gameMode === 'vs_bot'
                  ? 'bg-[#c89d56] text-[#120a06] shadow'
                  : 'text-[#c4b5a3] hover:text-[#f4ecd8]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>
                {state.botDifficulty === 'amator'
                  ? 'Çırak (Amatör)'
                  : state.botDifficulty === 'orta'
                  ? 'Kalfa (Orta)'
                  : 'Haydar Usta (Master)'}
              </span>
            </button>
            <button
              onClick={() => handleChangeMode('pass_and_play')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                state.gameMode === 'pass_and_play'
                  ? 'bg-[#c89d56] text-[#120a06] shadow'
                  : 'text-[#c4b5a3] hover:text-[#f4ecd8]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2 Kişilik</span>
            </button>
          </div>

          {/* Bot Difficulty Selector (Only visible in vs_bot mode) */}
          {state.gameMode === 'vs_bot' && (
            <div className="flex items-center gap-1 bg-[#220f06] p-0.5 rounded-lg border border-[#c89d56]/20 text-[11px]">
              <span className="px-1 text-[#9d8a78] text-[10px] hidden sm:inline">Zorluk:</span>
              <button
                type="button"
                onClick={() => handleChangeDifficulty('amator')}
                title="Amatör Seviye: Kolay, eğlenceli ve rahat oyun"
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  state.botDifficulty === 'amator'
                    ? 'bg-amber-600/80 text-amber-100 shadow font-bold'
                    : 'text-[#a89582] hover:text-amber-200'
                }`}
              >
                Amatör
              </button>
              <button
                type="button"
                onClick={() => handleChangeDifficulty('orta')}
                title="Orta Seviye: Dengeli ve temkinli oyun"
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  state.botDifficulty === 'orta'
                    ? 'bg-amber-600/80 text-amber-100 shadow font-bold'
                    : 'text-[#a89582] hover:text-amber-200'
                }`}
              >
                Orta
              </button>
              <button
                type="button"
                onClick={() => handleChangeDifficulty('master')}
                title="Master Seviye: Büyük Haydar Usta! Kapı alır, açık kollamaz, taktiksel tavla oynar"
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  state.botDifficulty === 'master'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow'
                    : 'text-[#a89582] hover:text-amber-200'
                }`}
              >
                Master
              </button>
            </div>
          )}
          {/* Mode Switcher: Sürükle-Bırak vs Seç & Taşı */}
          <div className="flex items-center bg-[#220f06] p-0.5 rounded-lg border border-[#c89d56]/20 text-xs">
            <button
              type="button"
              onClick={() => {
                setInteractionMode('drag');
                setSelectedSource(null);
              }}
              title="Sürükle & Bırak Modu: Pulu doğrudan hedef haneye sürükleyip bırakarak oynayın"
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-all ${
                interactionMode === 'drag'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow'
                  : 'text-[#a89582] hover:text-amber-200'
              }`}
            >
              <Move className="w-3 h-3" />
              <span>Sürükle-Bırak</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInteractionMode('click');
                setSelectedSource(null);
              }}
              title="Seç & Taşı Modu: Önce oynamak istediğiniz pula, ardından hedef haneye tıklayın"
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-all ${
                interactionMode === 'click'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow'
                  : 'text-[#a89582] hover:text-amber-200'
              }`}
            >
              <MousePointer className="w-3 h-3" />
              <span>Seç & Taşı</span>
            </button>
          </div>
        </div>

        {/* Current Turn and Match Score */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Match Scoreboard Target Selector Button */}
          <button
            type="button"
            onClick={() => setShowPointsModal(true)}
            title="3, 5, 7 veya Manuel Tavla Puan Ayarı"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#241107] border border-amber-400/40 text-amber-300 hover:text-amber-200 hover:bg-[#34180a] transition-all text-xs font-bold cursor-pointer shadow-sm"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>{targetScore} SAYILIK MAÇ</span>
            <SlidersHorizontal className="w-3 h-3 opacity-70" />
          </button>

          <div className="flex items-center gap-1.5 text-xs bg-[#241107] px-2.5 py-1 rounded-xl border border-[#c89d56]/20">
            {state.currentTurn === 'white' && userProfile ? (
              <span className="text-sm">{userProfile.avatar}</span>
            ) : (
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  state.currentTurn === 'white' ? 'bg-[#fdf8ed]' : 'bg-[#3d180b]'
                }`}
              />
            )}
            <span className="font-semibold text-[#f5d58d]">
              {state.currentTurn === 'white'
                ? (userProfile ? userProfile.name : 'Beyaz')
                : state.gameMode === 'vs_bot'
                ? state.botDifficulty === 'amator'
                  ? 'Çırak'
                  : state.botDifficulty === 'orta'
                  ? 'Kalfa'
                  : 'Haydar Usta'
                : 'Siyah'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#d8c8b6] bg-[#1a0a03] px-2.5 py-1 rounded-xl border border-white/10 font-mono">
            <span>Beyaz: <strong className="text-amber-300 font-bold">{state.scores.white}</strong>/{targetScore}</span>
            <span>-</span>
            <span>Siyah: <strong className="text-amber-300 font-bold">{state.scores.black}</strong>/{targetScore}</span>
          </div>

          {onOpenStats && (
            <button
              type="button"
              onClick={onOpenStats}
              title="Kazanma/Kaybetme Oranları ve İstatistikler"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#241107] border border-[#c89d56]/30 text-amber-200/90 hover:text-amber-100 hover:bg-[#381a0b] hover:border-[#c89d56] transition-all text-xs font-semibold shadow-sm cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">İstatistik</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePromptReset}
            title="Masayı Yeniden Başlat"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#241107] border border-[#c89d56]/30 text-amber-200/90 hover:text-amber-100 hover:bg-[#381a0b] hover:border-[#c89d56] transition-all text-xs font-semibold shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Yeniden Başlat</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Resetting the Game */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1e0f08] border border-[#c89d56]/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#f5d58d] font-serif-royal">
                Oyunu Yeniden Başlat?
              </h3>
              <p className="text-xs text-[#c4b5a3] mt-1.5 leading-relaxed">
                Mevcut tavla oyunu ve tahtadaki hamleler sıfırlanacaktır.
                {(state.lastWinner || lastWinner) ? (
                  <span className="block mt-1 text-amber-300 font-medium">
                    Tavla kuralı gereği bir önceki partiyi kazanan oyuncu ({((state.lastWinner || lastWinner) === 'white') ? (userProfile?.name || 'Beyaz') : (state.gameMode === 'vs_bot' ? 'Haydar Usta' : 'Siyah')}) yeni partiye ilk zar atarak başlayacaktır.
                  </span>
                ) : null}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCancelReset}
                className="flex-1 px-3 py-2 rounded-xl bg-[#2d170c] border border-[#c89d56]/20 text-[#c4b5a3] hover:text-[#f4ecd8] hover:bg-[#381d0f] text-xs font-semibold transition-all cursor-pointer"
              >
                İptal (Vazgeç)
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Evet, Yenile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MUSEUM-GRADE IRANIAN CEDARWOOD & KHATAM-KÂRI BACKGAMMON TABLE
          100% Fits viewport without cut-offs or horizontal scrolling
          ========================================================================= */}
      <div className="relative p-2 sm:p-3 md:p-4 rounded-3xl iran-sedir-casing border-4 border-[#331106] shadow-2xl overflow-hidden">
        {/* Top-Right Player Corner Avatar Badge */}
        {userProfile && (
          <button
            type="button"
            onClick={onOpenStats}
            title={`${userProfile.name} (${userProfile.title}) - İstatistikleri & Avatarı Aç`}
            className="absolute top-2 right-2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#200f07]/90 hover:bg-[#34180b] border border-[#c89d56]/40 hover:border-[#c89d56] transition-all shadow-lg backdrop-blur-sm cursor-pointer group"
          >
            <span className="text-base sm:text-lg group-hover:scale-110 transition-transform">
              {userProfile.avatar}
            </span>
            <div className="flex flex-col text-left leading-tight hidden xs:flex">
              <span className="text-[10px] font-bold text-[#f5d58d]">{userProfile.name}</span>
              <span className="text-[8px] text-[#b8a796]">{userProfile.title}</span>
            </div>
          </button>
        )}

        {/* 4 Antique Persian Cast Brass Corner Rivets */}
        <div className="absolute top-1.5 left-1.5 w-5 h-5 brass-corner-bracket rounded-tl flex items-center justify-center text-[9px] text-[#4d3209] font-black z-20 pointer-events-none">
          ✦
        </div>
        <div className="absolute top-1.5 right-1.5 w-5 h-5 brass-corner-bracket rounded-tr flex items-center justify-center text-[9px] text-[#4d3209] font-black z-20 pointer-events-none">
          ✦
        </div>
        <div className="absolute bottom-1.5 left-1.5 w-5 h-5 brass-corner-bracket rounded-bl flex items-center justify-center text-[9px] text-[#4d3209] font-black z-20 pointer-events-none">
          ✦
        </div>
        <div className="absolute bottom-1.5 right-1.5 w-5 h-5 brass-corner-bracket rounded-br flex items-center justify-center text-[9px] text-[#4d3209] font-black z-20 pointer-events-none">
          ✦
        </div>

        {/* Khatam-Kâri Inner Marquetry Frame */}
        <div className="p-1.5 rounded-2xl bg-[#1a0a04] border border-[#d4af37]/40 shadow-inner">
          <div className="h-1 w-full khatam-ribbon-h rounded-sm mb-1" />

          {/* Playing Surface: Authentic Backgammon Field with Continuous Vertical BAR */}
          <div className="relative iran-sedir-surface rounded-xl border border-[#d4af37]/30 flex items-stretch shadow-2xl overflow-hidden w-full">
            {/* 0. Outer Left Checker Holding Groove (Yan Pul Yuvası - VK.jpeg) */}
            <div className="w-4 sm:w-5 bg-[#140602] border-r border-[#2d1206] shadow-[inset_0_0_8px_rgba(0,0,0,0.9)] flex flex-col justify-between py-2 items-center shrink-0">
              <div className="w-2 h-14 rounded-full bg-black/60 shadow-inner" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#c89d56]/40 shadow" />
              <div className="w-2 h-14 rounded-full bg-black/60 shadow-inner" />
            </div>

            {/* 1. Outer Left Quadrant Column (Points 13-18 on top, Points 12-7 on bottom) */}
            <div className="flex flex-col flex-1 min-w-0 border-r border-[#0d0402] bg-[#1e0b04] relative overflow-hidden">
              {/* Authentic Handcrafted Wood Rosette Medallion in Left Court (VK.jpeg) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <CarvedRosetteMedallion size={165} className="opacity-95" />
              </div>

              {/* Top row of Outer Left: 13 to 18 */}
              <div className="flex items-stretch w-full relative z-10">
                {[13, 14, 15, 16, 17, 18].map((pt) => renderPoint(pt, true))}
              </div>

              {/* Center Wooden Inlay Seam between points */}
              <div className="h-px w-full bg-[#0c0301] shadow-[0_1px_0_rgba(212,175,55,0.12)] relative z-10" />

              {/* Bottom row of Outer Left: 12 to 7 */}
              <div className="flex items-stretch w-full relative z-10">
                {[12, 11, 10, 9, 8, 7].map((pt) => renderPoint(pt, false))}
              </div>
            </div>

            {/* 2. Center BAR Column (Natural Walnut Divider with 2 Antique Filigree Brass Hinges - Exact match to VK.jpeg) */}
            <div className="w-12 sm:w-14 md:w-16 bg-[#251208] border-x border-[#180a04] shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] flex flex-col items-center justify-between p-1 shrink-0 relative overflow-visible z-20">
              {/* Upper Bar Section & Upper Antique Brass Hinge */}
              <div className="flex flex-col items-center w-full">
                <CarvedBrassHinge className="mt-1" />

                {/* Broken Black Checkers */}
                {state.bar.black > 0 && (
                  <button
                    onClick={() => handleSelectPoint('bar')}
                    className={`relative mt-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full checker-black-iran flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer ${
                      selectedSource === 'bar' && state.currentTurn === 'black'
                        ? 'ring-2 ring-amber-400 scale-105'
                        : movablePointIndices.has('bar') && state.currentTurn === 'black'
                        ? 'ring-2 ring-amber-300 animate-pulse'
                        : ''
                    }`}
                  >
                    <span className="relative z-10 text-amber-200 pointer-events-none">{state.bar.black}</span>
                  </button>
                )}
              </div>

              {/* Natural Walnut Vertical Grain Inlay Seam */}
              <div className="my-auto h-12 w-0.5 bg-black/40 shadow-[1px_0_0_rgba(255,255,255,0.06)]" />

              {/* Lower Bar Section & Lower Antique Brass Hinge */}
              <div className="flex flex-col items-center w-full">
                {/* Broken White Checkers */}
                {state.bar.white > 0 && (
                  <button
                    draggable={state.currentTurn === 'white' && movablePointIndices.has('bar') && interactionMode === 'drag'}
                    onDragStart={(e) => handleDragStartPoint(e, 'bar')}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleSelectPoint('bar')}
                    className={`relative mb-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full checker-white-iran flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer ${
                      draggedSource === 'bar'
                        ? 'opacity-40 scale-95'
                        : selectedSource === 'bar' && state.currentTurn === 'white'
                        ? 'ring-2 ring-amber-400 scale-105'
                        : movablePointIndices.has('bar') && state.currentTurn === 'white'
                        ? 'ring-2 ring-amber-300 animate-pulse'
                        : ''
                    }`}
                  >
                    <span className="relative z-10 text-amber-950 pointer-events-none">{state.bar.white}</span>
                  </button>
                )}

                <CarvedBrassHinge className="mb-1" />
              </div>
            </div>

            {/* 3. Home Right Quadrant Column (Points 19-24 on top, Points 6-1 on bottom) */}
            <div className="flex flex-col flex-1 min-w-0 border-l border-[#0d0402] bg-[#1e0b04] relative overflow-hidden">
              {/* Authentic Handcrafted Wood Rosette Medallion in Right Court (VK.jpeg) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <CarvedRosetteMedallion size={165} className="opacity-95" />
              </div>

              {/* Top row of Home Right: 19 to 24 */}
              <div className="flex items-stretch w-full relative z-10">
                {[19, 20, 21, 22, 23, 24].map((pt) => renderPoint(pt, true))}
              </div>

              {/* Center Wooden Inlay Seam between points */}
              <div className="h-px w-full bg-[#0c0301] shadow-[0_1px_0_rgba(212,175,55,0.12)] relative z-10" />

              {/* Bottom row of Home Right: 6 to 1 */}
              <div className="flex items-stretch w-full relative z-10">
                {[6, 5, 4, 3, 2, 1].map((pt) => renderPoint(pt, false))}
              </div>

              {/* Authentic Tavla Dice Arena inside the Board (full right table court) */}
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                <Tavla3DDice
                  dice={state.dice}
                  usedDice={state.usedDice}
                  isRolling={state.isRolling}
                  onRoll={state.phase === 'opening_roll' ? handleOpeningRoll : handleRollDice}
                  canRoll={
                    !state.isRolling &&
                    !state.winner &&
                    (state.phase === 'opening_roll' ||
                      (state.dice.length === 0 && !(state.gameMode === 'vs_bot' && state.currentTurn === 'black')))
                  }
                  turnColor={state.currentTurn}
                  isOpeningRoll={state.phase === 'opening_roll'}
                  openingRollData={state.openingRoll}
                  whitePlayerName={userProfile ? userProfile.name : 'Beyaz'}
                  blackPlayerName={
                    state.gameMode === 'vs_bot'
                      ? state.botDifficulty === 'amator'
                        ? 'Çırak'
                        : state.botDifficulty === 'orta'
                        ? 'Kalfa'
                        : 'Haydar Usta'
                      : 'Siyah'
                  }
                  previousWinnerName={
                    (state.lastWinner || lastWinner)
                      ? (state.lastWinner || lastWinner) === 'white'
                        ? (userProfile ? userProfile.name : 'Beyaz')
                        : state.gameMode === 'vs_bot'
                        ? (state.botDifficulty === 'amator' ? 'Çırak' : state.botDifficulty === 'orta' ? 'Kalfa' : 'Haydar Usta')
                        : 'Siyah'
                      : undefined
                  }
                />
              </div>
            </div>

            {/* 4. Bear-Off Gutter Column (Black Bear-off on top, White Bear-off on bottom) */}
            <div className="w-11 sm:w-13 md:w-14 bg-[#100401] border-l border-[#d4af37]/40 flex flex-col justify-between p-1 shrink-0">
              {/* Black Bear-Off Tray (Top) */}
              <div className="flex flex-col items-center pt-1">
                <span className="text-[8px] sm:text-[9px] text-[#a69280] font-bold text-center leading-tight mb-1 font-serif-royal">
                  Siyah
                </span>
                <div className="font-mono font-bold text-xs sm:text-sm text-[#f5d58d]">
                  {state.borneOff.black}/15
                </div>

                {bearOffBlackMove && (
                  <button
                    onClick={() => handleExecuteMove(bearOffBlackMove)}
                    className="mt-1.5 px-1 py-1 bg-amber-500/30 border border-amber-400 rounded text-[9px] text-[#f5d58d] font-bold animate-pulse cursor-pointer"
                  >
                    Topla
                  </button>
                )}
              </div>

              {/* Middle Gutter Seam */}
              <div className="h-px w-full bg-[#0c0301] shadow-[0_1px_0_rgba(212,175,55,0.12)] my-2" />

              {/* White Bear-Off Tray (Bottom) */}
              <div
                onDragOver={(e) => {
                  if (bearOffWhiteMove) {
                    handleDragOverTarget(e, 0);
                  }
                }}
                onDragLeave={handleDragLeaveTarget}
                onDrop={(e) => {
                  if (bearOffWhiteMove) {
                    handleDropOnTarget(e, 0);
                  }
                }}
                className={`flex flex-col items-center pb-1 rounded-b transition-all ${
                  dragOverTarget === 0
                    ? 'bg-amber-400/40 ring-2 ring-amber-300'
                    : ''
                }`}
              >
                {bearOffWhiteMove && (
                  <button
                    onClick={() => handleExecuteMove(bearOffWhiteMove)}
                    className="mb-1.5 px-1 py-1 bg-amber-500/30 border border-amber-400 rounded text-[9px] text-[#f5d58d] font-bold animate-pulse cursor-pointer"
                  >
                    Topla
                  </button>
                )}

                <div className="font-mono font-bold text-xs sm:text-sm text-[#f5d58d]">
                  {state.borneOff.white}/15
                </div>
                <span className="text-[8px] sm:text-[9px] text-[#a69280] font-bold text-center leading-tight mt-1 font-serif-royal">
                  Beyaz
                </span>
              </div>
            </div>
          </div>

          <div className="h-1 w-full khatam-ribbon-h rounded-sm mt-1" />
        </div>

        {/* Victory Celebration Modal */}
        {state.winner && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 animate-in zoom-in-95">
            <Trophy className="w-12 h-12 text-[#c89d56] mb-2 animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-black font-serif-royal gold-gradient-text uppercase tracking-widest">
              {state.scores.white >= targetScore || state.scores.black >= targetScore
                ? '🏆 MAÇ ŞAMPİYONU!'
                : state.winType === 'katmerli_mars'
                ? 'KATMERLİ MARS (+3 PUAN)!'
                : state.winType === 'mars'
                ? 'MARS OLDU (+2 PUAN)!'
                : 'EL BİTTİ (+1 PUAN)!'}
            </h2>
            <p className="text-xs sm:text-sm text-[#e6d8c4] mt-1.5 max-w-sm">
              {state.scores.white >= targetScore
                ? `Tebrikler! ${targetScore} sayılık tavla maçını muhteşem bir zaferle kazandınız!`
                : state.scores.black >= targetScore
                ? `Haydar Usta ${targetScore} sayıya ulaşarak maçın şampiyonu oldu!`
                : state.winner === 'white'
                ? 'Tebrikler! Bu eli aldınız, skor tablosuna puanınız eklendi.'
                : 'Haydar Usta bu eli kazandı ve puanını yazdırdı.'}
            </p>

            <div className="mt-3 p-2 bg-[#240e05] border border-[#c89d56]/40 rounded-xl text-xs text-[#f5d58d] font-mono">
              Maç Durumu: Beyaz <b className="text-amber-300">{state.scores.white}</b> - <b className="text-amber-300">{state.scores.black}</b> Siyah (Hedef: {targetScore})
            </div>

            <div className="flex items-center gap-3 mt-4">
              {state.scores.white < targetScore && state.scores.black < targetScore ? (
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="px-5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#d4af37] to-[#b38528] text-[#120a06] hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
                >
                  Sonraki Ele Geç (Skor Korunur)
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => handleSetTargetScore(targetScore)}
                className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-black/50 border border-white/20 text-stone-200 hover:text-white hover:bg-black/70 transition-all shadow cursor-pointer"
              >
                Yeni Maç Başlat
              </button>
            </div>
          </div>
        )}

        {/* Puanlı Tavla Hedef Ayarı Modalı (3, 5, 7 veya Manuel Sayı) */}
        {showPointsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#1e0f08] border border-[#c89d56]/50 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#c89d56]/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-[#f5d58d] font-serif-royal">
                    Puanlı Tavla Maçı Ayarı
                  </h3>
                </div>
                <button
                  onClick={() => setShowPointsModal(false)}
                  className="p-1 rounded-lg text-white/50 hover:text-white bg-black/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#c4b5a3]">
                Hedef puana ilk ulaşan oyuncu maçın şampiyonu olur. Normal bitiş 1 sayı, Mars 2 sayı, Katmerli Mars 3 sayı kazandırır.
              </p>

              {/* Quick Select Buttons: 3, 5, 7 */}
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSetTargetScore(num)}
                    className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      targetScore === num
                        ? 'bg-amber-600/40 border-amber-400 text-amber-200 shadow-md font-bold'
                        : 'bg-black/30 border-white/10 text-stone-300 hover:border-amber-400/40'
                    }`}
                  >
                    <span className="text-base font-black font-mono">{num} SAYI</span>
                    <span className="text-[9px] text-stone-400">
                      {num === 3 ? 'Kısa' : num === 5 ? 'Klasik' : 'Turnuva'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Manuel Puan Girişi */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#f5d58d]">
                  Manuel Puan Girişi:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={manualScoreVal}
                    onChange={(e) => setManualScoreVal(e.target.value)}
                    placeholder="Örn: 9 veya 11"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e0704] border border-[#c89d56]/40 text-amber-200 font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseInt(manualScoreVal, 10);
                      if (!isNaN(num) && num > 0) {
                        handleSetTargetScore(num);
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow cursor-pointer transition-all"
                  >
                    Uygula
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowPointsModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-stone-300 hover:text-white"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          LOWER CONSOLE: İRAN SEDİR TAVLA, ZAR AT, HAMLE VE SIRA KONTROLLERİ
          (Tavlanın dışında, hemen altında konumlandırılmış ahşap kontrol paneli)
          ========================================================================= */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-[#170702] via-[#260f06] to-[#170702] border border-[#d4af37]/35 flex flex-wrap items-center justify-between gap-2 shadow-2xl">
        {/* Left: İran Sedir Tavla title & Dice Name / Last Move Status */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-full sm:max-w-[48%]">
          <div className="w-8 h-8 rounded-xl bg-[#2e1307] border border-[#d4af37]/40 flex items-center justify-center text-sm shadow-inner shrink-0">
            <Sparkles className="w-4 h-4 text-[#c89d56]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold font-serif-royal gold-gradient-text">
                İran Sedir Tavla
              </span>
              {state.diceNameTurkish && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#f5d58d] px-1.5 py-0.5 rounded bg-[#3b190a] border border-[#c89d56]/40 shadow-sm">
                  {state.diceNameTurkish}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#a99786] truncate">
              {state.lastMoveDesc}
            </span>
          </div>
        </div>

        {/* Right: Zar At Button, Geri Al, Sırayı Tamamla & Cafe Orders */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* 1. Opening Roll Button (Açılış Zarı At) */}
          {state.phase === 'opening_roll' && !state.winner && (
            <button
              type="button"
              onClick={handleOpeningRoll}
              disabled={state.isRolling}
              className="px-3.5 sm:px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#d4af37] via-[#f7dba1] to-[#b38528] text-[#1a0e05] shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer border border-[#fff2c8]/60 animate-pulse"
            >
              <Dices className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${state.isRolling ? 'animate-spin' : ''}`} />
              <span>
                {state.isRolling
                  ? 'Açılış Zarları Atılıyor...'
                  : state.openingRoll.status === 'tied'
                  ? 'Eşitlik: Tekrar Zar At'
                  : '🎲 Başlangıç Zarını At'}
              </span>
            </button>
          )}

          {/* 2. Regular Turn Zar At Button (when waiting to roll in playing phase) */}
          {state.phase === 'playing' && state.dice.length === 0 && !state.winner && (
            <button
              type="button"
              onClick={handleRollDice}
              disabled={
                state.isRolling ||
                (state.gameMode === 'vs_bot' && state.currentTurn === 'black')
              }
              className="px-3.5 sm:px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#d4af37] via-[#f7dba1] to-[#b38528] text-[#1a0e05] shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer border border-[#fff2c8]/60 animate-pulse"
            >
              <Dices className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${state.isRolling ? 'animate-spin' : ''}`} />
              <span>
                {state.isRolling
                  ? 'Atılıyor...'
                  : state.currentTurn === 'white'
                  ? 'Zar At'
                  : 'Haydar Usta Atıyor...'}
              </span>
            </button>
          )}

          {/* Hamleyi Geri Al Button */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="Son hamleyi geri al (Ctrl+Z)"
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow active:scale-95 ${
              canUndo
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white ring-1 ring-amber-400 cursor-pointer animate-pulse'
                : 'bg-[#220e06] text-[#6b5648] border border-[#c89d56]/15 opacity-40 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Geri Al</span>
            {state.turnHistory.length > 0 && (
              <span className="text-[10px] ml-0.5">({state.turnHistory.length})</span>
            )}
          </button>

          {/* Sırayı Tamamla (Bitir) Button */}
          {state.turnReadyToEnd && isHumanTurn && !state.winner && (
            <button
              onClick={handleConfirmTurnEnd}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white shadow-md active:scale-95 animate-bounce cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sırayı Bitir</span>
            </button>
          )}

          {/* Cafe Tea / Coffee Orders */}
          <div className="flex items-center gap-1.5 ml-1">
            {activeOrders.map((ord) => (
              <button
                key={ord.id}
                type="button"
                title={`${ord.name} (Tıkla - Yudumla)`}
                onClick={() => {
                  sounds.playTeaService();
                }}
                className="cursor-pointer hover:scale-115 transition-transform"
              >
                <CafeItemRealisticImage itemId={ord.id} size="sm" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Play, Setup Rules & Starting Dice Rules Info Bar */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-[#1a0c06]/90 border border-[#c89d56]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] sm:text-xs text-[#a99887]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Zap className="w-3.5 h-3.5 text-[#c89d56] shrink-0" />
          <span>
            {interactionMode === 'drag' ? (
              <>
                <strong className="text-amber-300">Sürükle-Bırak:</strong> Pulu hedef üçgen haneye veya toplama alanına taşıyın.
              </>
            ) : (
              <>
                <strong className="text-amber-300">Seç & Taşı:</strong> Önce pula, sonra hedef haneye tıklayın.
              </>
            )}
          </span>
          <span className="text-amber-500/50 hidden md:inline">|</span>
          <span className="text-amber-200/90 text-[10px] sm:text-[11px] font-medium hidden md:inline">
            Dizilim: 24'lü (2), 13'lü (5), 8'li (3), 6'lı (5 pul) • Açılış: Büyük atan başlar ve atılan zarları birleştirir.
          </span>
        </div>
        <div className="text-[#f5d58d] font-semibold shrink-0">
          {state.currentTurn === 'white' ? 'Hedef: 1-6 Evine Topla' : 'Hedef: 19-24 Evine Topla'}
        </div>
      </div>
    </div>
  );
};
