import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  OkeyState,
  OkeyTile,
  TileColor,
  OkeyVariant,
  MeldGroup,
  PlayerOpenedMelds,
  CanakBreakEvent,
} from '../types/okey';
import {
  createInitialOkeyState,
  isRealOkey,
  sortHandRuns,
  sortHandPairs,
  checkWinningHand,
  playBotTurnExtended,
  findHand101Melds,
  canAppendTileToMeld,
  calculateMeldScore,
} from '../services/okeyEngine';
import { sounds } from '../services/soundEffects';
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Trophy,
  Layers,
  Crown,
  CheckCircle,
  BarChart3,
  AlertCircle,
  Move,
  MousePointer,
  Disc3,
  SlidersHorizontal,
  Flame,
  Check,
  X,
  Target,
  Minimize2,
  Maximize2,
  Coins,
  Info,
  Lock,
  Unlock,
  MessageSquare,
} from 'lucide-react';
import { CafeOrder } from './CafeWaiterModal';
import { CafeItemRealisticImage } from './CafeItemRealisticImage';
import { OpponentTopIstaka, OpponentSideIstaka } from './RealisticIstaka';
import { HelenaIstakaBackdrop } from './HelenaIstakaBackdrop';
import { UserProfile } from '../services/statsService';

interface OkeyTableProps {
  activeOrders?: CafeOrder[];
  onOpenRules: () => void;
  onOpenStats?: () => void;
  onRecordStats?: (isWin: boolean, durationSeconds: number, extra?: { winType?: string }) => void;
  userProfile?: UserProfile;
  isScreenLocked?: boolean;
  onToggleScreenLock?: () => void;
  onOpenWaiter?: () => void;
  onOpenRoomsLobby?: () => void;
}

export const OkeyTable: React.FC<OkeyTableProps> = ({
  activeOrders = [],
  onOpenRules,
  onOpenStats,
  onRecordStats,
  userProfile,
  isScreenLocked: isScreenLockedProp,
  onToggleScreenLock,
  onOpenWaiter,
  onOpenRoomsLobby,
}) => {
  const [state, setState] = useState<OkeyState>(() => createInitialOkeyState('klasik', 600));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isFinishingAttempt, setIsFinishingAttempt] = useState<boolean>(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showCanakInfo, setShowCanakInfo] = useState<boolean>(false);
  const gameStartTimeRef = React.useRef<number>(Date.now());
  const hasRecordedWinRef = React.useRef<boolean>(false);

  // Puanlı Oyun (Match Points Mode: 11, 22 veya Manuel Sayı)
  const [matchTarget, setMatchTarget] = useState<number>(11);
  const [matchScores, setMatchScores] = useState<number[]>([11, 11, 11, 11]);
  const [showPointsModal, setShowPointsModal] = useState<boolean>(false);
  const [manualInputVal, setManualInputVal] = useState<string>('11');

  // Center Elevator Disc Animation State
  const [isElevating, setIsElevating] = useState<boolean>(false);

  // Interaction Mode: 'drag' (Sürükle-Bırak) veya 'click' (Seç & Taşı)
  const [interactionMode, setInteractionMode] = useState<'drag' | 'click'>('drag');

  // Drag and Drop State
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [isDragOverDiscard, setIsDragOverDiscard] = useState<boolean>(false);

  // Single-screen viewport fit mode & Screen Lock state
  const [internalScreenLocked, setInternalScreenLocked] = useState<boolean>(true);
  const isLocked = isScreenLockedProp !== undefined ? isScreenLockedProp : internalScreenLocked;
  const [isCompactFit, setIsCompactFit] = useState<boolean>(true);

  // Quick Chat modal state (in single-screen locked mode)
  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  const handleToggleScreenLock = () => {
    if (onToggleScreenLock) {
      onToggleScreenLock();
    } else {
      setInternalScreenLocked((prev) => !prev);
    }
  };

  // Keep isCompactFit true when screen is locked to guarantee clean single-screen fit
  useEffect(() => {
    if (isLocked) {
      setIsCompactFit(true);
    }
  }, [isLocked]);

  // Double-tap / fast tap tracker for instant tile discard
  const lastSlotClickRef = useRef<{ slot: number; time: number } | null>(null);

  // Live 101 Melds Evaluation for Player 0 (User)
  const user101Eval = useMemo(() => {
    const rackTiles = state.players[0].rackSlots.filter((t): t is OkeyTile => t !== null);
    return findHand101Melds(rackTiles, state.okeyTileColor, state.okeyTileNumber);
  }, [state.players, state.okeyTileColor, state.okeyTileNumber]);

  // Victory celebration, Score Deduction & Stats Recording
  useEffect(() => {
    if (state.winnerIndex !== null) {
      if (state.canakBreakEvent) {
        sounds.playCanakKirma();
        confetti({
          particleCount: 220,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#ffd700', '#ffb700', '#ffffff', '#e6c387', '#38bdf8'],
        });
      } else {
        sounds.playVictory();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#c89d56', '#e6c387', '#38bdf8', '#ef4444'],
        });
      }

      // Deduct points from non-winners (normal = 2, okey/çift/elden = 4)
      const penalty =
        state.winType === 'okey_atti' ||
        state.winType === 'cift' ||
        state.winType === 'elden'
          ? 4
          : 2;
      const winner = state.winnerIndex;
      setMatchScores((prev) =>
        prev.map((sc, i) => (i === winner ? sc : Math.max(0, sc - penalty)))
      );

      if (!hasRecordedWinRef.current && onRecordStats) {
        hasRecordedWinRef.current = true;
        const durationSec = Math.max(20, Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
        const isUserWinner = state.winnerIndex === 0;
        onRecordStats(isUserWinner, durationSec, {
          winType: state.winType ? state.winType : undefined,
        });
      }
    }
  }, [state.winnerIndex, state.winType, state.canakBreakEvent, onRecordStats]);

  // Turn management for Bots (Player 1, 2, 3) - Fast & smooth automated play with 101 and Canak support
  useEffect(() => {
    const currentIdx = state.currentTurnPlayerIndex;
    if (currentIdx !== 0 && state.winnerIndex === null) {
      setState((prev) => ({ ...prev, isThinking: true }));

      // Bot thinking delay (550ms) so user can see what Haydar Usta / opponents are doing
      const thinkTimer = setTimeout(() => {
        setState((prev) => {
          if (prev.currentTurnPlayerIndex === 0 || prev.winnerIndex !== null) {
            return { ...prev, isThinking: false };
          }

          const botIdx = prev.currentTurnPlayerIndex;
          const {
            drawnFrom,
            discardedTile,
            botComment,
            hasFinished,
            winType,
            newBotSlots,
            openedMeldsByBot,
            updatedTableMelds,
            isCanakBroken,
          } = playBotTurnExtended(prev);

          sounds.playOkeyTileTap();

          const nextPlayerIdx = (botIdx + 1) % 4;

          // Update deck and discard piles immutably
          const newDeck = drawnFrom === 'deck' ? prev.deck.slice(1) : prev.deck;
          const leftPlayerIdx = (botIdx + 3) % 4;
          const updatedDiscardPiles = prev.discardPiles.map((pile, idx) => {
            if (drawnFrom === 'discard' && idx === leftPlayerIdx) {
              return pile.slice(0, -1);
            }
            if (idx === botIdx) {
              return [...pile, discardedTile];
            }
            return pile;
          });

          const updatedPlayers = prev.players.map((p, idx) =>
            idx === botIdx ? { ...p, rackSlots: newBotSlots } : p
          );

          const newDialogue = [
            {
              sender: prev.players[botIdx].name,
              text: botComment,
              time: 'Şimdi',
            },
            ...prev.cafeDialogue.slice(0, 6),
          ];

          const updatedPlayerHasOpened = prev.playerHasOpened.map((hasOp, idx) =>
            idx === botIdx ? (openedMeldsByBot ? true : hasOp) : hasOp
          );

          if (hasFinished) {
            const canakEvent: CanakBreakEvent | null = isCanakBroken
              ? {
                  isBroken: true,
                  winnerIndex: botIdx,
                  winnerName: prev.players[botIdx].name,
                  winnerAvatar: prev.players[botIdx].avatar,
                  amount: prev.canakGold,
                  reason: winType === 'okey_atti' ? 'okey_atti' : winType === 'cift' ? 'cift' : 'elden',
                }
              : null;

            return {
              ...prev,
              players: updatedPlayers,
              deck: newDeck,
              discardPiles: updatedDiscardPiles,
              openedTableMelds: updatedTableMelds,
              playerHasOpened: updatedPlayerHasOpened,
              winnerIndex: botIdx,
              winType: winType || 'normal',
              canakBreakEvent: canakEvent,
              statusMessage: isCanakBroken
                ? `💥 ${prev.players[botIdx].name} ÇANAĞI KIRDI! (${prev.canakGold} Altın Kazandı!)`
                : `${prev.players[botIdx].name} elini bitirdi!`,
              cafeDialogue: newDialogue,
              isThinking: false,
            };
          }

          return {
            ...prev,
            players: updatedPlayers,
            deck: newDeck,
            discardPiles: updatedDiscardPiles,
            openedTableMelds: updatedTableMelds,
            playerHasOpened: updatedPlayerHasOpened,
            currentTurnPlayerIndex: nextPlayerIdx,
            hasDrawnThisTurn: nextPlayerIdx === 0 ? false : true,
            statusMessage: openedMeldsByBot
              ? `${prev.players[botIdx].name} ${openedMeldsByBot.totalPoints} puanla per açtı! Sıra ${prev.players[nextPlayerIdx].name}'de.`
              : botIdx === 1
              ? 'Haydar Usta taşını attı. Selim Abi oynuyor...'
              : botIdx === 2
              ? 'Selim Abi taşını attı. Murat Kaptan oynuyor...'
              : nextPlayerIdx === 0
              ? 'Murat Kaptan taşını solunuza (yandan) attı. Sıra sizde! Ortadan çekin veya solunuzdaki taşı alın.'
              : `${prev.players[botIdx].name} taş attı. ${prev.players[nextPlayerIdx].name} oynuyor...`,
            cafeDialogue: newDialogue,
            isThinking: false,
          };
        });
      }, 550);

      return () => clearTimeout(thinkTimer);
    }
  }, [state.currentTurnPlayerIndex, state.winnerIndex]);

  // Player action: Draw from Blind Deck (Ortadan Çek)
  const handleDrawFromDeck = () => {
    if (state.currentTurnPlayerIndex !== 0 || state.hasDrawnThisTurn || state.winnerIndex !== null)
      return;
    if (state.deck.length === 0) return;

    sounds.playOkeyTileTap();
    const newDeck = [...state.deck];
    const drawnTile = newDeck.shift()!;

    // Find first empty slot in rack
    const userRack = [...state.players[0].rackSlots];
    const emptySlotIdx = userRack.findIndex((s) => s === null);
    if (emptySlotIdx !== -1) {
      userRack[emptySlotIdx] = drawnTile;
    }

    setState((prev) => ({
      ...prev,
      deck: newDeck,
      players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: userRack } : p)),
      hasDrawnThisTurn: true,
      lastDrawnFrom: 'deck',
      statusMessage: 'Ortadan taş çektiniz. Istakanızı düzenleyin ve istenmeyen 1 taşı atın.',
    }));
  };

  // Player action: Draw from Discard (Yandan Murat Kaptan'ın Attığı Taşı Al)
  const handleDrawFromDiscard = () => {
    if (state.currentTurnPlayerIndex !== 0 || state.hasDrawnThisTurn || state.winnerIndex !== null)
      return;
    const leftDiscard = state.discardPiles[3]; // Murat Kaptan is left
    if (leftDiscard.length === 0) return;

    sounds.playOkeyTileTap();
    const newLeftDiscard = [...leftDiscard];
    const drawnTile = newLeftDiscard.pop()!;

    const userRack = [...state.players[0].rackSlots];
    const emptySlotIdx = userRack.findIndex((s) => s === null);
    if (emptySlotIdx !== -1) {
      userRack[emptySlotIdx] = drawnTile;
    }

    setState((prev) => ({
      ...prev,
      discardPiles: prev.discardPiles.map((p, i) => (i === 3 ? newLeftDiscard : p)),
      players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: userRack } : p)),
      hasDrawnThisTurn: true,
      lastDrawnFrom: 'discard',
      statusMessage: "Murat Kaptan'ın attığı taşı aldınız. Şimdi elinizden 1 taş atın.",
    }));
  };

  // Player action: Discard tile from specific slot
  const handleDiscardSlot = (slotIdx: number) => {
    if (state.currentTurnPlayerIndex !== 0 || !state.hasDrawnThisTurn) return;

    const userRack = [...state.players[0].rackSlots];
    const tileToDiscard = userRack[slotIdx];
    if (!tileToDiscard) return;

    sounds.playOkeyTileTap();
    userRack[slotIdx] = null;

    const updatedUserDiscard = [...state.discardPiles[0], tileToDiscard];

    setState((prev) => ({
      ...prev,
      players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: userRack } : p)),
      discardPiles: prev.discardPiles.map((p, i) => (i === 0 ? updatedUserDiscard : p)),
      selectedSlotIndex: null,
      currentTurnPlayerIndex: 1, // Pass to Haydar Usta
      hasDrawnThisTurn: false,
      statusMessage: "Taşınızı sağ tarafınıza (Haydar Usta'ya) attınız. Haydar Usta düşünüyor...",
    }));

    setSelectedSlot(null);
    setFinishError(null);
  };

  // Player action: Discard selected tile (Taş At)
  const handleDiscardSelected = () => {
    if (selectedSlot === null) return;
    handleDiscardSlot(selectedSlot);
  };

  // Player action: Click/Tap directly on discard pile zone (Atılacak noktaya dokunarak taş atma)
  const handleDiscardAreaClick = () => {
    if (state.currentTurnPlayerIndex !== 0) {
      setFinishError('Sıra sizde değil, rakiplerin oynamasını bekleyin.');
      return;
    }
    if (!state.hasDrawnThisTurn) {
      setFinishError('Önce ortadaki desteden veya solunuzdaki oyuncudan taş çekmelisiniz.');
      return;
    }
    if (selectedSlot === null) {
      setFinishError('Lütfen önce ıstakanızdan atmak istediğiniz taşa dokunun, ardından buraya basarak atabilirsiniz.');
      return;
    }
    setFinishError(null);
    handleDiscardSlot(selectedSlot);
  };

  // Drag & Drop Handlers (HTML5 Drag and Drop)
  const handleDragStart = (e: React.DragEvent, slotIdx: number) => {
    // If interaction mode is 'click', disable dragging individual tiles
    if (interactionMode !== 'drag') {
      e.preventDefault();
      return;
    }
    if (!state.players[0].rackSlots[slotIdx]) {
      e.preventDefault();
      return;
    }
    setDraggedSlot(slotIdx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', slotIdx.toString());
  };

  const handleDragOverSlot = (e: React.DragEvent, targetSlotIdx: number) => {
    if (interactionMode !== 'drag') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlot !== targetSlotIdx) {
      setDragOverSlot(targetSlotIdx);
    }
  };

  const handleDropOnSlot = (e: React.DragEvent, targetSlotIdx: number) => {
    if (interactionMode !== 'drag') return;
    e.preventDefault();
    setDragOverSlot(null);
    const sourceSlotStr = e.dataTransfer.getData('text/plain');
    const sourceSlot = sourceSlotStr !== '' ? parseInt(sourceSlotStr, 10) : draggedSlot;
    setDraggedSlot(null);

    if (sourceSlot === null || isNaN(sourceSlot) || sourceSlot === targetSlotIdx) {
      return;
    }

    // Normal slot swap or place
    const userRack = [...state.players[0].rackSlots];
    const temp = userRack[targetSlotIdx];
    userRack[targetSlotIdx] = userRack[sourceSlot];
    userRack[sourceSlot] = temp;

    sounds.playOkeyTileSlide();
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: userRack } : p)),
    }));
    setSelectedSlot(null);
  };

  const handleDragEnd = () => {
    setDraggedSlot(null);
    setDragOverSlot(null);
    setIsDragOverDiscard(false);
  };

  // Discard drop zone handlers (Sürükleyip taş atma)
  const handleDragOverDiscard = (e: React.DragEvent) => {
    if (interactionMode !== 'drag') return;
    // Only valid to discard if it's user's turn and they have drawn 15 tiles
    if (state.currentTurnPlayerIndex === 0 && state.hasDrawnThisTurn) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsDragOverDiscard(true);
    }
  };

  const handleDragLeaveDiscard = () => {
    setIsDragOverDiscard(false);
  };

  const handleDropOnDiscard = (e: React.DragEvent) => {
    if (interactionMode !== 'drag') return;
    e.preventDefault();
    setIsDragOverDiscard(false);
    if (state.currentTurnPlayerIndex !== 0 || !state.hasDrawnThisTurn) return;

    const sourceSlotStr = e.dataTransfer.getData('text/plain');
    const sourceSlot = sourceSlotStr !== '' ? parseInt(sourceSlotStr, 10) : draggedSlot;
    setDraggedSlot(null);

    if (sourceSlot === null || isNaN(sourceSlot)) return;

    const userRack = [...state.players[0].rackSlots];
    const tileToDiscard = userRack[sourceSlot];
    if (!tileToDiscard) return;

    sounds.playOkeyTileTap();
    userRack[sourceSlot] = null;
    const updatedUserDiscard = [...state.discardPiles[0], tileToDiscard];

    setState((prev) => ({
      ...prev,
      players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: userRack } : p)),
      discardPiles: prev.discardPiles.map((p, i) => (i === 0 ? updatedUserDiscard : p)),
      selectedSlotIndex: null,
      currentTurnPlayerIndex: 1, // Pass to Haydar Usta
      hasDrawnThisTurn: false,
      statusMessage: "Taşınızı sağ tarafınıza (Haydar Usta'ya) attınız. Haydar Usta düşünüyor...",
    }));

    setSelectedSlot(null);
  };

  // Move or swap tiles inside Istaka / Double-click to discard
  const handleSlotClick = (slotIdx: number) => {
    // If it's user's turn to discard, double-tap discards the tile immediately
    const now = Date.now();
    if (
      state.currentTurnPlayerIndex === 0 &&
      state.hasDrawnThisTurn &&
      lastSlotClickRef.current &&
      lastSlotClickRef.current.slot === slotIdx &&
      now - lastSlotClickRef.current.time < 450 &&
      state.players[0].rackSlots[slotIdx] !== null
    ) {
      lastSlotClickRef.current = null;
      handleDiscardSlot(slotIdx);
      return;
    }
    lastSlotClickRef.current = { slot: slotIdx, time: now };

    // Single slot swap / selection (Active in both modes for maximum convenience)
    if (selectedSlot === null) {
      // First click: select slot if it has a tile
      if (state.players[0].rackSlots[slotIdx] !== null) {
        setSelectedSlot(slotIdx);
        sounds.playOkeyTileTap();
      }
    } else {
      // Second click: swap or move
      if (selectedSlot === slotIdx) {
        setSelectedSlot(null);
        sounds.playOkeyTileSlide();
      } else {
        const userRack = [...state.players[0].rackSlots];
        const temp = userRack[slotIdx];
        userRack[slotIdx] = userRack[selectedSlot];
        userRack[selectedSlot] = temp;

        sounds.playOkeyTileSlide();
        setState((prev) => ({
          ...prev,
          players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: userRack } : p)),
        }));
        setSelectedSlot(null);
      }
    }
  };

  // Auto-Sort: Runs (Seri Diz)
  const handleSortRuns = () => {
    sounds.playOkeyTileTap();
    const currentTiles = state.players[0].rackSlots.filter((t): t is OkeyTile => t !== null);
    const sorted = sortHandRuns(currentTiles, state.okeyTileColor, state.okeyTileNumber);

    setState((prev) => ({
      ...prev,
      players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: sorted } : p)),
    }));
    setSelectedSlot(null);
  };

  // Auto-Sort: Pairs (Çift Diz)
  const handleSortPairs = () => {
    sounds.playOkeyTileTap();
    const currentTiles = state.players[0].rackSlots.filter((t): t is OkeyTile => t !== null);
    const sorted = sortHandPairs(currentTiles, state.okeyTileColor, state.okeyTileNumber);

    setState((prev) => ({
      ...prev,
      players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: sorted } : p)),
    }));
    setSelectedSlot(null);
  };

  // 101 Okey: Per Açma (Seri veya Çift)
  const handleOpenHand101 = (type: 'seri' | 'cift') => {
    if (state.currentTurnPlayerIndex !== 0 || !state.hasDrawnThisTurn) {
      setFinishError('Önce sıranızda ortadan veya yandan taş çekmelisiniz.');
      return;
    }

    if (type === 'seri') {
      if (!user101Eval.canOpenSeri || user101Eval.melds.length === 0) {
        setFinishError(
          `Perlerinizin toplamı ${user101Eval.totalPoints} puan. 101 barajını geçmek için en az 101 puan değerinde per oluşturmalısınız!`
        );
        return;
      }

      // Collect all tile IDs in the melds
      const openedTileIds = new Set(user101Eval.melds.flatMap((m) => m.tiles.map((t) => t.id)));
      const newRack = state.players[0].rackSlots.map((t) => (t && openedTileIds.has(t.id) ? null : t));

      const newEntry: PlayerOpenedMelds = {
        playerIndex: 0,
        playerName: userProfile?.name || 'Siz (VIP Oyuncu)',
        playerAvatar: userProfile?.avatar || '👑',
        openType: 'seri',
        totalPoints: user101Eval.totalPoints,
        melds: user101Eval.melds,
      };

      sounds.playVictory();
      setState((prev) => ({
        ...prev,
        players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: newRack } : p)),
        openedTableMelds: [...prev.openedTableMelds, newEntry],
        playerHasOpened: [true, prev.playerHasOpened[1], prev.playerHasOpened[2], prev.playerHasOpened[3]],
        statusMessage: `Tebrikler! ${user101Eval.totalPoints} puanla elinizi masaya açtınız! Artık elinizdeki uygun taşları masadaki perlere işleyebilirsiniz.`,
      }));
      setFinishError(null);
    } else {
      if (!user101Eval.canOpenCift || user101Eval.pairs.length < 5) {
        setFinishError(
          `Elinizde ${user101Eval.pairCount} çift var. Çift açabilmek için en az 5 çiftiniz olmalı!`
        );
        return;
      }

      const openedPairs = user101Eval.pairs.slice(0, 5);
      const openedTileIds = new Set(openedPairs.flatMap((m) => m.tiles.map((t) => t.id)));
      const newRack = state.players[0].rackSlots.map((t) => (t && openedTileIds.has(t.id) ? null : t));

      const newEntry: PlayerOpenedMelds = {
        playerIndex: 0,
        playerName: userProfile?.name || 'Siz (VIP Oyuncu)',
        playerAvatar: userProfile?.avatar || '👑',
        openType: 'cift',
        totalPoints: openedPairs.length * 2,
        melds: openedPairs,
      };

      sounds.playVictory();
      setState((prev) => ({
        ...prev,
        players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: newRack } : p)),
        openedTableMelds: [...prev.openedTableMelds, newEntry],
        playerHasOpened: [true, prev.playerHasOpened[1], prev.playerHasOpened[2], prev.playerHasOpened[3]],
        statusMessage: `Harika! 5 çift ile masaya açtınız!`,
      }));
      setFinishError(null);
    }
  };

  // 101 Okey: Masadaki Pere Taş İşleme
  const handleAppendTileToMeld = (targetPlayerIndex: number, meldIndex: number) => {
    if (selectedSlot === null) {
      setFinishError('Lütfen önce ıstakanızdan masaya işlemek istediğiniz taşı seçin.');
      return;
    }
    const tile = state.players[0].rackSlots[selectedSlot];
    if (!tile) return;

    if (!state.playerHasOpened[0]) {
      setFinishError('Masaya taş işleyebilmek için önce kendi elinizi (101 puan veya 5 çift) açmış olmalısınız.');
      return;
    }

    const playerMeldsEntry = state.openedTableMelds.find((p) => p.playerIndex === targetPlayerIndex);
    if (!playerMeldsEntry || !playerMeldsEntry.melds[meldIndex]) return;

    const targetMeld = playerMeldsEntry.melds[meldIndex];
    const check = canAppendTileToMeld(tile, targetMeld, state.okeyTileColor, state.okeyTileNumber);

    if (check.canAppend && check.newTiles) {
      sounds.playOkeyTileTap();
      const updatedTable = state.openedTableMelds.map((entry) => {
        if (entry.playerIndex === targetPlayerIndex) {
          const updatedMelds = entry.melds.map((m, mIdx) => {
            if (mIdx === meldIndex) {
              return {
                ...m,
                tiles: check.newTiles!,
                score: calculateMeldScore(check.newTiles!, state.okeyTileColor, state.okeyTileNumber),
              };
            }
            return m;
          });
          const newTotalPoints = updatedMelds.reduce((sum, m) => sum + (m.score || 0), 0);
          return {
            ...entry,
            melds: updatedMelds,
            totalPoints: newTotalPoints,
          };
        }
        return entry;
      });

      const newRack = [...state.players[0].rackSlots];
      newRack[selectedSlot] = null;

      setState((prev) => ({
        ...prev,
        players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: newRack } : p)),
        openedTableMelds: updatedTable,
        statusMessage: `${tile.color} ${tile.number} taşı ${playerMeldsEntry.playerName}'in perine başarıyla işlendi!`,
      }));
      setSelectedSlot(null);
      setFinishError(null);
    } else {
      setFinishError('Bu taş seçilen pere işlenemiyor. Renk ve sayı sırasının uyması gerekir.');
    }
  };

  // Check & Declare Finish (Okeyi Bitir & Çanak Kır)
  const handleDeclareFinish = () => {
    if (state.currentTurnPlayerIndex !== 0 || !state.hasDrawnThisTurn) {
      setFinishError('Önce sıranızda taş çekmeli ve 15 taşa sahip olmalısınız.');
      return;
    }
    if (selectedSlot === null) {
      setFinishError('Lütfen ortaya bitiş taşı olarak atacağınız 15. taşı seçin.');
      return;
    }

    const userRack = [...state.players[0].rackSlots];
    const discardCandidate = userRack[selectedSlot];
    if (!discardCandidate) return;

    const remainingTiles = userRack
      .filter((_, idx) => idx !== selectedSlot)
      .filter((t): t is OkeyTile => t !== null);

    const isOkeyDiscard = isRealOkey(discardCandidate, state.okeyTileColor, state.okeyTileNumber);

    if (state.variant === 'yuzbir') {
      // 101 Okey finish conditions:
      // Condition 1: Player already opened, and this discard empties their rack
      if (remainingTiles.length === 0) {
        userRack[selectedSlot] = null;
        const winType = isOkeyDiscard ? 'okey_atti' : 'normal';
        const isCanakBroken = isOkeyDiscard;

        const canakEvent: CanakBreakEvent | null = isCanakBroken
          ? {
              isBroken: true,
              winnerIndex: 0,
              winnerName: userProfile?.name || 'Siz (VIP Oyuncu)',
              winnerAvatar: userProfile?.avatar || '👑',
              amount: state.canakGold,
              reason: 'okey_atti',
            }
          : null;

        setState((prev) => ({
          ...prev,
          players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: userRack } : p)),
          winnerIndex: 0,
          winType,
          canakBreakEvent: canakEvent,
          statusMessage: isOkeyDiscard
            ? `💥 İNANILMAZ! OKEY ATARAK ÇANAĞI KIRDINIZ! (+${prev.canakGold} Altın)`
            : 'Tebrikler! 101 Okeyde elinizi tamamlayarak bitirdiniz!',
        }));
        setFinishError(null);
        return;
      }

      // Condition 2: Elden Bitme (User hasn't opened yet, but all 14 tiles form complete winning hand!)
      const winCheck = checkWinningHand(remainingTiles, state.okeyTileColor, state.okeyTileNumber);
      if (winCheck.isWin) {
        userRack[selectedSlot] = null;
        const winType = isOkeyDiscard ? 'okey_atti' : winCheck.type === 'cift' ? 'cift' : 'elden';
        // Elden bitme always breaks Çanak!
        const canakEvent: CanakBreakEvent = {
          isBroken: true,
          winnerIndex: 0,
          winnerName: userProfile?.name || 'Siz (VIP Oyuncu)',
          winnerAvatar: userProfile?.avatar || '👑',
          amount: state.canakGold,
          reason: winType,
        };

        setState((prev) => ({
          ...prev,
          players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: userRack } : p)),
          winnerIndex: 0,
          winType,
          canakBreakEvent: canakEvent,
          statusMessage: `💥 MUHTEŞEM! 101'de ELDEN BİTİP ÇANAĞI KIRDINIZ! (+${prev.canakGold} Altın)`,
        }));
        setFinishError(null);
        return;
      }

      setFinishError(
        'Eliniz henüz tam bitişe hazır değil. Kalan taşlarınızı per olarak açın veya masadaki perlere işleyin.'
      );
    } else {
      // Klasik Okey finish conditions
      const winCheck = checkWinningHand(remainingTiles, state.okeyTileColor, state.okeyTileNumber);

      if (winCheck.isWin) {
        const winType = isOkeyDiscard ? 'okey_atti' : winCheck.type || 'normal';
        const isCanakBroken = isOkeyDiscard || winCheck.type === 'cift';

        userRack[selectedSlot] = null;
        const canakEvent: CanakBreakEvent | null = isCanakBroken
          ? {
              isBroken: true,
              winnerIndex: 0,
              winnerName: userProfile?.name || 'Siz (VIP Oyuncu)',
              winnerAvatar: userProfile?.avatar || '👑',
              amount: state.canakGold,
              reason: isOkeyDiscard ? 'okey_atti' : 'cift',
            }
          : null;

        setState((prev) => ({
          ...prev,
          players: prev.players.map((p, i) => (i === 0 ? { ...p, rackSlots: userRack } : p)),
          winnerIndex: 0,
          winType,
          canakBreakEvent: canakEvent,
          statusMessage: isOkeyDiscard
            ? `💥 İNANILMAZ! OKEY ATARAK ÇANAĞI KIRDINIZ! (+${prev.canakGold} Altın)`
            : winCheck.type === 'cift'
            ? `💥 7 ÇİFT İLE BİTİP ÇANAĞI KIRDINIZ! (+${prev.canakGold} Altın)`
            : 'Tebrikler! Elinizdeki perlerle Okeyi kazandınız!',
        }));
        setFinishError(null);
      } else {
        setFinishError(
          'Eliniz henüz tam kurallara uygun 14 per veya 7 çift oluşturmuyor. Lütfen taşlarınızı kontrol edin.'
        );
      }
    }
  };

  // Switch between Klasik and 101 YüzBir variants
  const handleSwitchVariant = (newVariant: OkeyVariant) => {
    if (newVariant === state.variant) return;
    sounds.playOkeyTileTap();
    setState(createInitialOkeyState(newVariant, state.canakGold || 600));
    setSelectedSlot(null);
    setFinishError(null);
    gameStartTimeRef.current = Date.now();
    hasRecordedWinRef.current = false;
  };

  // Close Canak modal and claim rewards
  const handleClaimCanakReward = () => {
    setState((prev) => ({
      ...prev,
      canakBreakEvent: null,
    }));
  };

  // Gösterge declaration bonus
  const handleDeclareGosterge = () => {
    const userTiles = state.players[0].rackSlots.filter((t): t is OkeyTile => t !== null);
    const hasGosterge = userTiles.some(
      (t) => t.color === state.indicatorTile.color && t.number === state.indicatorTile.number
    );

    if (hasGosterge) {
      sounds.playVictory();
      setMatchScores((prev) =>
        prev.map((sc, i) => (i === 0 ? sc : Math.max(0, sc - 1)))
      );
      setState((prev) => ({
        ...prev,
        statusMessage: 'Göstergeyi açtınız! Tüm rakiplerden 1 ceza puanı düşüldü.',
        players: prev.players.map((p, i) => (i !== 0 ? { ...p, score: p.score - 1 } : p)),
      }));
    } else {
      setFinishError('Elinizde açılan Gösterge taşı bulunmuyor.');
    }
  };

  // Center Elevator Disc Trigger (Asansör Diski & Taş Karıştırıcı)
  const handleTriggerElevator = () => {
    if (isElevating) return;
    setIsElevating(true);
    sounds.playElevatorShuffle();
    setTimeout(() => {
      setIsElevating(false);
      setState((prev) => ({
        ...prev,
        statusMessage: 'Otomatik masanın asansör diski taşları başarıyla karıştırdı!',
      }));
    }, 2200);
  };

  // Next Round in ongoing Match (Sonraki Ele Geç - Puanlar Korunur, Çanak Güncellenir)
  const handleNextRound = () => {
    setIsElevating(true);
    sounds.playElevatorShuffle();
    setTimeout(() => {
      setIsElevating(false);
      const nextCanak = state.canakBreakEvent ? 500 : (state.canakGold || 600) + 150;
      setState(createInitialOkeyState(state.variant || 'klasik', nextCanak));
      setSelectedSlot(null);
      setFinishError(null);
      gameStartTimeRef.current = Date.now();
      hasRecordedWinRef.current = false;
    }, 1800);
  };

  // Set new target match score (11, 22 veya manuel sayı)
  const handleSetTargetScore = (newTarget: number) => {
    const target = Math.max(3, Math.min(99, newTarget));
    setMatchTarget(target);
    setMatchScores([target, target, target, target]);
    setState(createInitialOkeyState());
    setSelectedSlot(null);
    setFinishError(null);
    setShowPointsModal(false);
    gameStartTimeRef.current = Date.now();
    hasRecordedWinRef.current = false;
  };

  // Reset Game Confirmation Handlers
  const handlePromptReset = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    handleSetTargetScore(matchTarget);
    setShowResetConfirm(false);
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  // Render a single stone with authentic rustic handcrafted bone / aged boxwood look, recessed carved face & engraved numeral
  const renderTile = (
    tile: OkeyTile,
    isSelected: boolean = false,
    small: boolean = false
  ) => {
    const isJoker = isRealOkey(tile, state.okeyTileColor, state.okeyTileNumber);

    // Authentic rustic mineral dye pigments
    const colorClasses: Record<TileColor, string> = {
      red: 'text-[#b91c1c]',
      black: 'text-[#1c1917]',
      blue: 'text-[#1d4ed8]',
      yellow: 'text-[#b45309]',
    };

    const sizeClasses = small
      ? isCompactFit
        ? 'w-6 sm:w-7 h-8 sm:h-9 rounded-xs py-0.5'
        : 'w-7 sm:w-8 h-10 sm:h-11 rounded-sm py-1'
      : isCompactFit
      ? 'w-7.5 sm:w-8.5 md:w-9.5 h-11 sm:h-12 md:h-13 rounded-md py-0.5 sm:py-1'
      : 'w-9 sm:w-11 md:w-12 h-14 sm:h-16 md:h-17 rounded-md py-1 sm:py-1.5';

    const numberClasses = small
      ? isCompactFit
        ? 'text-xs font-serif font-black tracking-tight'
        : 'text-sm sm:text-base font-serif font-black tracking-tight'
      : isCompactFit
      ? 'text-base sm:text-lg md:text-xl font-serif font-black tracking-tight'
      : 'text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-tight';

    return (
      <div
        className={`relative okey-stone select-none transition-all flex flex-col items-center justify-between pointer-events-none ${sizeClasses} ${
          isSelected
            ? isCompactFit
              ? 'ring-2 ring-amber-400 -translate-y-2.5 scale-105 shadow-2xl border-[#d4af37] z-30'
              : 'ring-2 ring-amber-400 -translate-y-3.5 scale-105 shadow-2xl border-[#d4af37] z-30'
            : 'shadow-md border-[#bda88c]'
        }`}
        style={{
          boxShadow: isSelected
            ? '0 16px 26px -3px rgba(15,8,4,0.9), inset 0 2px 1.5px #ffffff, 0 0 0 2px #d4af37, inset 0 -3.5px 3px rgba(135,95,55,0.65)'
            : '0 4px 8px -1px rgba(15,8,4,0.7), 0 2px 4px rgba(20,10,5,0.55), inset 0 1.5px 1px #ffffff, inset 0 -3px 2px rgba(140,105,70,0.65)',
        }}
      >
        {/* Subtle authentic rustic recessed face groove (Taşın el oyması iç yuvası) */}
        <div className="w-full flex-1 flex flex-col items-center justify-center relative px-0.5 pt-0.5">
          <div className="w-full h-full rounded-[4px] bg-gradient-to-b from-black/[0.04] via-transparent to-black/[0.05] border border-black/[0.05] shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.12),inset_0_-1px_1px_rgba(255,255,255,0.7)] flex flex-col items-center justify-center relative overflow-hidden">
            {tile.isFakeOkey ? (
              <div className="flex flex-col items-center justify-center leading-none py-0.5 select-none">
                {/* Ornate Engraved Seljuk 8-Pointed Star Rosette */}
                <svg
                  className={`text-[#5a2e15] drop-shadow-[0_1px_0_rgba(255,255,255,0.85)] ${
                    small
                      ? 'w-3 h-3'
                      : isCompactFit
                      ? 'w-4 h-4 sm:w-4.5 sm:h-4.5'
                      : 'w-5 h-5 sm:w-6 sm:h-6'
                  }`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l2.35 4.7 5.25-1.4-1.4 5.25 4.7 2.35-4.7 2.35 1.4 5.25-5.25-1.4L12 22l-2.35-4.7-5.25 1.4 1.4-5.25L1.1 12.9l4.7-2.35-1.4-5.25 5.25 1.4L12 2z" opacity="0.95" />
                  <circle cx="12" cy="12" r="3.2" fill="#fdfaf3" stroke="#5a2e15" strokeWidth="0.8" />
                  <circle cx="12" cy="12" r="1.4" fill="#5a2e15" />
                </svg>
                <span
                  className={`font-serif font-black tracking-widest text-[#4a2410] uppercase mt-0.5 ${
                    small
                      ? 'text-[5px]'
                      : isCompactFit
                      ? 'text-[6.5px] sm:text-[7.5px]'
                      : 'text-[8px] sm:text-[9px]'
                  }`}
                  style={{ textShadow: '0 1px 0 rgba(255,255,255,0.9)' }}
                >
                  SAHTE
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center select-none">
                <span
                  className={`drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] ${
                    colorClasses[tile.color]
                  } ${numberClasses}`}
                  style={{
                    textShadow: '0 1px 0 rgba(255,255,255,0.95), 0 -1px 0.5px rgba(0,0,0,0.3)',
                    filter: 'contrast(1.18)',
                  }}
                >
                  {tile.number}
                </span>
                {/* Authentic tactile colored circle dot under tile numbers 6 and 9 for orientation */}
                {(tile.number === 6 || tile.number === 9) && (
                  <div
                    className={`rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,0.65),0_1px_0_rgba(255,255,255,0.9)] ${
                      isCompactFit ? 'mt-0 w-1 h-1' : 'mt-0.5 w-1.5 h-1.5'
                    } ${
                      tile.color === 'red'
                        ? 'bg-[#b91c1c]'
                        : tile.color === 'black'
                        ? 'bg-[#1c1917]'
                        : tile.color === 'blue'
                        ? 'bg-[#1d4ed8]'
                        : 'bg-[#b45309]'
                    }`}
                  />
                )}
              </div>
            )}

            {/* Real Okey Identifier Badge (Antik Pirinç Mühür) */}
            {isJoker && (
              <div
                className={`absolute -top-1 -right-1 px-1 py-0.2 rounded bg-gradient-to-r from-[#d4af37] via-[#f7e4a8] to-[#b38a25] text-[#2c1508] font-serif font-black uppercase tracking-tighter border border-[#8a6519] shadow-md flex items-center gap-0.5 ${
                  small || isCompactFit ? 'text-[6px] px-0.5' : 'text-[7.5px]'
                }`}
              >
                <span className="text-[6px] sm:text-[7px]">👑</span>
                <span>OKEY</span>
              </div>
            )}
          </div>
        </div>

        {/* Realistic rustic bottom grip groove */}
        <div className="w-2/3 h-[1.5px] bg-[#c4b196]/80 rounded-full mb-0.5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.25)]" />
      </div>
    );
  };

  return (
    <div className={`w-full max-w-6xl mx-auto flex flex-col transition-all select-none ${
      isCompactFit
        ? 'w-full justify-between gap-1'
        : 'gap-3'
    }`}>
      {/* Table Header */}
      <div className={`rounded-2xl bg-[#1b120c] border border-[#c89d56]/30 flex flex-wrap items-center justify-between shadow-xl transition-all shrink-0 ${
        isCompactFit ? 'py-1 px-2.5 sm:px-4 gap-1.5 sm:gap-2' : 'p-3 sm:p-4 gap-4'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-[#c89d56]" />
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-[#f5d58d] font-serif-royal">
              4'lü Okey Masası
            </h2>
          </div>

          {/* Okey Variant Switcher: Klasik vs 101 */}
          <div className="flex items-center bg-[#251307] p-0.5 rounded-xl border border-[#c89d56]/40 shadow-inner">
            <button
              type="button"
              onClick={() => handleSwitchVariant('klasik')}
              className={`px-2 sm:px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                state.variant === 'klasik'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow'
                  : 'text-[#d4beaa] hover:text-white'
              }`}
            >
              🀄 Klasik
            </button>
            <button
              type="button"
              onClick={() => handleSwitchVariant('yuzbir')}
              className={`px-2 sm:px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                state.variant === 'yuzbir'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow ring-1 ring-emerald-300/40'
                  : 'text-[#d4beaa] hover:text-white'
              }`}
            >
              <span>💯 101</span>
              <span className="text-[8px] bg-emerald-950/90 text-emerald-300 px-1 py-0.2 rounded font-mono font-bold">
                YENİ
              </span>
            </button>
          </div>

          <span className="hidden lg:inline text-[11px] text-[#b09e8c]">
            Kalan Deste: <strong className="text-[#f5d58d]">{state.deck.length}</strong> Taş
          </span>

          {/* Active Cafe Orders in Okey Table Header */}
          {activeOrders.length > 0 && (
            <div className="flex items-center gap-1.5 ml-1 border-l border-[#c89d56]/20 pl-2">
              {activeOrders.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  title={`${ord.name} (Tıkla - Yudumla)`}
                  onClick={() => sounds.playTeaService()}
                  className="cursor-pointer hover:scale-115 transition-transform"
                >
                  <CafeItemRealisticImage itemId={ord.id} size="sm" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Çaycı / Garson Çağır Butonu */}
          {onOpenWaiter && (
            <button
              type="button"
              onClick={() => {
                sounds.playWaiterBell();
                onOpenWaiter();
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs border border-amber-300 shadow cursor-pointer transition-all active:scale-95 shrink-0"
              title="Çaycıyı Masaya Çağır (Çay, Kahve, İkramlar)"
            >
              <span className="text-sm">☕</span>
              <span className="font-extrabold tracking-wide">Çaycı</span>
            </button>
          )}

          {/* Sayfa Sabitleme Toggle (Tek Ekrana Kilitle / Serbest Kaydırma) */}
          <button
            type="button"
            onClick={handleToggleScreenLock}
            title={
              isLocked
                ? 'Sayfa ekrana sabitlendi (Kaydırmayı açmak için tıklayın)'
                : 'Masa ve ıstakayı tek ekrana kilitle ve sabitle'
            }
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
              isLocked
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30 ring-1 ring-amber-400/40'
                : 'bg-[#271810] text-[#d4c5b3] border-[#c89d56]/30 hover:text-white'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">Sayfa Sabit</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-stone-400" />
                <span>Sayfayı Sabitle</span>
              </>
            )}
          </button>

          {/* Single-Screen Fit Toggle */}
          <button
            type="button"
            onClick={() => setIsCompactFit(!isCompactFit)}
            title={
              isCompactFit
                ? 'Genişletilmiş görünüme geç'
                : 'Masa ve ıstakayı tek ekrana sığdır'
            }
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
              isCompactFit
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/90 ring-1 ring-emerald-400/40'
                : 'bg-[#271810] text-[#d4c5b3] border-[#c89d56]/30 hover:text-white'
            }`}
          >
            {isCompactFit ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold hidden sm:inline">Tek Ekran</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Genişlet</span>
              </>
            )}
          </button>

          {onOpenStats && (
            <button
              type="button"
              onClick={onOpenStats}
              title="Kazanma/Kaybetme Oranları ve İstatistikler"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#271810] border border-[#c89d56]/30 text-amber-200/90 hover:text-amber-100 hover:bg-[#381a0b] hover:border-[#c89d56] transition-all cursor-pointer shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">İstatistik</span>
            </button>
          )}
          <button
            onClick={onOpenRules}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#271810] border border-[#c89d56]/20 text-[#d4c5b3] hover:text-[#f4ecd8] transition-colors cursor-pointer"
          >
            Kurallar
          </button>
          <button
            type="button"
            onClick={handlePromptReset}
            title="Masayı Yeniden Kur"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#271810] border border-[#c89d56]/30 text-amber-200/90 hover:text-amber-100 hover:bg-[#381a0b] transition-colors cursor-pointer text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Yeniden Kur</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Okey Game */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1e0f08] border border-[#c89d56]/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#f5d58d] font-serif-royal">
                Okey Masasını Yeniden Kur?
              </h3>
              <p className="text-xs text-[#c4b5a3] mt-1.5 leading-relaxed">
                Mevcut taş dağıtımı ve ıstakadaki taşlar sıfırlanıp 106 taş yeniden karıştırılacaktır. Devam etmek istiyor musunuz?
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
                Evet, Yeniden Kur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Okey Table Felt Area - Exact Design from User's Photos (Koyu Füme/Yeşil Çuha, Masif Koyu Ceviz Kasa, 4 Eğimli Istaka) */}
      <div className={`relative okey-master-table felt-green flex flex-col justify-between transition-all ${
        isCompactFit
          ? 'p-1.5 sm:p-2.5 min-h-0 rounded-2xl flex-1'
          : 'p-4 sm:p-6 min-h-[500px] rounded-3xl'
      }`}>
        {/* Automatic table drawer indicators on all 4 corners (Fotoğraftaki otomatik okey masası çekmece hatları) */}
        <div className="absolute top-2 left-4 text-[9px] text-[#f5d58d]/40 font-mono tracking-widest uppercase pointer-events-none">
          RASTER AUTOMATIC
        </div>
        <div className="absolute top-2 right-4 text-[9px] text-[#f5d58d]/40 font-mono tracking-widest uppercase pointer-events-none">
          PRO-SERIES
        </div>

        {/* Top-Right Table Corner Player Avatar Profile */}
        {userProfile && (
          <button
            type="button"
            onClick={onOpenStats}
            title={`${userProfile.name} (${userProfile.title}) - Profil ve İstatistikleri Aç`}
            className={`absolute top-2 sm:top-3 right-2 sm:right-3 z-20 flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-[#0e1d13]/90 hover:bg-[#162d1e] border border-[#c89d56]/40 hover:border-[#c89d56] transition-all shadow-xl backdrop-blur-sm cursor-pointer group ${
              isCompactFit ? 'px-2 py-1' : 'px-3 py-1.5'
            }`}
          >
            <span className={`${isCompactFit ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} group-hover:scale-110 transition-transform`}>
              {userProfile.avatar}
            </span>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-[#f5d58d]">{userProfile.name}</span>
              <span className="text-[9px] text-[#9db2a5]">{userProfile.title}</span>
            </div>
          </button>
        )}

        {/* Puanlı Oyun Skorbordu (Match Scoreboard Bar: 11 / 22 veya Manuel Sayı) */}
        <div className={`z-20 w-full max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-1.5 rounded-xl bg-[#0d1a11]/90 border border-[#c89d56]/30 shadow-lg backdrop-blur-md transition-all ${
          isCompactFit ? 'mb-1 px-2.5 py-1 text-[11px]' : 'mb-2 px-3 py-1.5 text-xs rounded-2xl'
        }`}>
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="text-xs font-black font-serif-royal text-[#f5d58d] tracking-wide">
              {matchTarget} PUANLIK MAÇ
            </span>
            <button
              type="button"
              onClick={() => setShowPointsModal(true)}
              className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-[#223928] hover:bg-[#2e4d36] text-amber-300 font-semibold border border-amber-400/30 transition-all cursor-pointer flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Puan Ayarla (11 / 22 / Manuel)</span>
            </button>

            {onOpenRoomsLobby && (
              <button
                type="button"
                onClick={onOpenRoomsLobby}
                className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-amber-950/70 hover:bg-amber-900 text-amber-300 font-bold border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                title="Canlı & Sesli Okey Odaları Salonunu Aç"
              >
                <span>🏛️</span>
                <span>Odalar Salonu</span>
              </button>
            )}
          </div>

          {/* 4 Players' Remaining Match Points */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                state.currentTurnPlayerIndex === 0
                  ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                  : 'bg-black/30 border-white/10 text-stone-300'
              }`}
            >
              <span>{userProfile?.avatar || '👤'} Siz:</span>
              <span className="font-bold text-amber-300">{matchScores[0]}</span>
            </div>

            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                state.currentTurnPlayerIndex === 1
                  ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                  : 'bg-black/30 border-white/10 text-stone-300'
              }`}
            >
              <span>{state.players[1].avatar} Haydar:</span>
              <span className="font-bold text-amber-300">{matchScores[1]}</span>
            </div>

            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                state.currentTurnPlayerIndex === 2
                  ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                  : 'bg-black/30 border-white/10 text-stone-300'
              }`}
            >
              <span>{state.players[2].avatar} Selim:</span>
              <span className="font-bold text-amber-300">{matchScores[2]}</span>
            </div>

            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                state.currentTurnPlayerIndex === 3
                  ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                  : 'bg-black/30 border-white/10 text-stone-300'
              }`}
            >
              <span>{state.players[3].avatar} Murat:</span>
              <span className="font-bold text-amber-300">{matchScores[3]}</span>
            </div>
          </div>
        </div>

        {/* Unified 3-Column Table Compass Grid: Sol Oyuncu (Murat) | Orta Masa Çuhası & Discard Yuvaları | Sağ Oyuncu (Haydar) */}
        <div className="flex flex-row items-center justify-between z-10 w-full transition-all my-0.5 gap-1 sm:gap-2">
          {/* 1. SOL OYUNCU (West): Murat Kaptan (Dikey Kompakt Sütun - Genişliği sabit, asla sağa taşma yapmaz) */}
          <div className="flex flex-col items-center bg-[#122116]/90 rounded-2xl border border-[#c89d56]/30 shadow-md p-1 sm:p-1.5 shrink-0 transition-transform scale-90 sm:scale-95 origin-left gap-1">
            <div
              className={`p-1 sm:p-1.5 rounded-xl bg-[#152319]/90 border transition-all flex flex-col items-center w-full ${
                state.currentTurnPlayerIndex === 3
                  ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg'
                  : 'border-[#c89d56]/20'
              }`}
            >
              <span className="text-base sm:text-xl">{state.players[3].avatar}</span>
              <span className="font-bold text-[10px] sm:text-xs text-[#f5d58d] mt-0.5 whitespace-nowrap">{state.players[3].name}</span>
              <span className="text-[9px] text-[#9db2a5]">Maç: {matchScores[3]}</span>

              {/* İkram for Murat Kaptan */}
              {activeOrders.length > 0 ? (
                <button
                  type="button"
                  onClick={() => sounds.playTeaService()}
                  className="mt-1 flex items-center gap-1 bg-[#231409]/95 px-1.5 py-0.5 rounded-lg border border-[#c89d56]/40 hover:border-amber-400 transition-all cursor-pointer shadow-sm active:scale-95"
                  title={`Murat Kaptan'ın İkramı: ${activeOrders[0].name} (Tıkla - Yudumla)`}
                >
                  <CafeItemRealisticImage itemId={activeOrders[0].id} size="sm" />
                  <span className="text-[8px] text-amber-200 font-medium hidden sm:inline">{activeOrders[0].name}</span>
                </button>
              ) : onOpenWaiter && (
                <button
                  type="button"
                  onClick={onOpenWaiter}
                  className="mt-1 flex items-center gap-0.5 bg-black/40 px-1 py-0.5 rounded text-[8px] text-amber-300/80 hover:text-amber-200 border border-white/5 cursor-pointer"
                  title="Murat Kaptan'a İkram Ismarla"
                >
                  <span>☕</span>
                  <span className="hidden sm:inline">İkram</span>
                </button>
              )}
            </div>
            <OpponentSideIstaka
              position="left"
              rackSlots={state.players[3].rackSlots}
              playerName={state.players[3].name}
              isTurn={state.currentTurnPlayerIndex === 3}
            />
          </div>

          {/* ORTA SÜTUN: Karşı Masa & Çuha Üzerindeki Discard Alanları */}
          <div className="flex-1 min-w-0 flex flex-col items-center justify-between mx-0.5 sm:mx-1.5 py-0.5 h-full gap-1">
            {/* 1. Üst Satır: Selim'in Attığı (Sol) | Selim Abi & Istakası (Orta) | Haydar'ın Attığı (Sağ) */}
            <div className="flex items-center justify-between w-full px-0.5 sm:px-1 gap-1">
              {/* Selim'in Attığı Taş (Sol-Üst: Murat Alır) */}
              <div className="flex items-center gap-1 sm:gap-1.5 bg-[#142317]/90 border border-[#c89d56]/30 rounded-xl px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-md">
                <div className="flex flex-col text-left">
                  <span className="text-[7.5px] sm:text-[8.5px] text-[#f5d58d] font-bold leading-tight whitespace-nowrap">Selim Attı</span>
                  <span className="text-[6.5px] sm:text-[7px] text-[#9db2a5] whitespace-nowrap">⬅ Murat alır</span>
                </div>
                {state.discardPiles[2].length > 0 ? (
                  renderTile(state.discardPiles[2][state.discardPiles[2].length - 1], false, true)
                ) : (
                  <div className="border border-dashed border-white/20 rounded flex items-center justify-center text-[7px] text-white/30 bg-black/20 w-6 h-8">
                    Boş
                  </div>
                )}
              </div>

              {/* Karşımızdaki Oyuncu: Selim Abi (Player 2) */}
              <div className="flex flex-col items-center scale-90 sm:scale-95 origin-top">
                <div
                  className={`px-2.5 py-0.5 rounded-xl bg-[#152319]/90 border transition-all flex items-center gap-1.5 ${
                    state.currentTurnPlayerIndex === 2
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg'
                      : 'border-[#c89d56]/20'
                  }`}
                >
                  <span className="text-base sm:text-lg">{state.players[2].avatar}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[11px] sm:text-xs text-[#f5d58d]">{state.players[2].name}</span>
                    <span className="text-[9px] text-[#9db2a5]">({matchScores[2]}p)</span>
                    {state.currentTurnPlayerIndex === 2 && (
                      <span className="text-[7.5px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 animate-pulse font-bold">
                        Sıra
                      </span>
                    )}
                  </div>

                  {/* İkram for Selim Abi */}
                  {activeOrders.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => sounds.playTeaService()}
                      className="ml-1 flex items-center gap-1 bg-[#231409]/95 px-1.5 py-0.5 rounded-lg border border-[#c89d56]/40 hover:border-amber-400 transition-all cursor-pointer shadow-sm active:scale-95"
                      title={`Selim Abi'nin İkramı: ${activeOrders[0].name} (Tıkla - Yudumla)`}
                    >
                      <CafeItemRealisticImage itemId={activeOrders[0].id} size="sm" />
                      <span className="text-[8px] text-amber-200 font-medium hidden sm:inline">{activeOrders[0].name}</span>
                    </button>
                  ) : onOpenWaiter && (
                    <button
                      type="button"
                      onClick={onOpenWaiter}
                      className="ml-1 flex items-center gap-0.5 bg-black/40 px-1 py-0.5 rounded text-[8px] text-amber-300/80 hover:text-amber-200 border border-white/5 cursor-pointer"
                      title="Selim Abi'ye İkram Ismarla"
                    >
                      <span>☕</span>
                      <span className="hidden sm:inline">İkram</span>
                    </button>
                  )}
                </div>

                {/* Selim Abi's Solid Wooden Istaka */}
                <OpponentTopIstaka
                  rackSlots={state.players[2].rackSlots}
                  tileCount={state.players[2].rackSlots.filter(Boolean).length || 14}
                  playerName={state.players[2].name}
                  isTurn={state.currentTurnPlayerIndex === 2}
                />
              </div>

              {/* Haydar'ın Attığı Taş (Sağ-Üst: Selim Alır) */}
              <div className="flex items-center gap-1 sm:gap-1.5 bg-[#142317]/90 border border-[#c89d56]/30 rounded-xl px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-md">
                {state.discardPiles[1].length > 0 ? (
                  renderTile(state.discardPiles[1][state.discardPiles[1].length - 1], false, true)
                ) : (
                  <div className="border border-dashed border-white/20 rounded flex items-center justify-center text-[7px] text-white/30 bg-black/20 w-6 h-8">
                    Boş
                  </div>
                )}
                <div className="flex flex-col text-right">
                  <span className="text-[7.5px] sm:text-[8.5px] text-[#f5d58d] font-bold leading-tight whitespace-nowrap">Haydar Attı</span>
                  <span className="text-[6.5px] sm:text-[7px] text-[#9db2a5] whitespace-nowrap">⬆ Selim alır</span>
                </div>
              </div>
            </div>

            {/* 2. Orta Konsol: Deste, Gösterge Taşı, VIP Çanak, Asansör Karıştırıcı */}
            <div
              className={`relative flex flex-col items-center rounded-3xl okey-table-center-disc border-2 border-[#5a2e16]/80 shadow-2xl transition-all my-0.5 ${
                isElevating ? 'animate-elevator-shuffle' : ''
              } ${isCompactFit ? 'p-1.5 sm:p-2 scale-95 sm:scale-100 origin-center' : 'p-2 sm:p-3'}`}
            >
              {isElevating && (
                <div className="absolute inset-0 rounded-3xl border-2 border-amber-400/80 animate-ping pointer-events-none" />
              )}

              <div className={`flex items-center justify-center ${isCompactFit ? 'gap-2 sm:gap-3.5' : 'gap-4 sm:gap-6'}`}>
                {/* 1. Orta Deste (Draw Pile) */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#b5cbbe] mb-0.5 tracking-wider">
                    Orta Deste
                  </span>
                  <button
                    onClick={handleDrawFromDeck}
                    disabled={
                      state.currentTurnPlayerIndex !== 0 ||
                      state.hasDrawnThisTurn ||
                      state.winnerIndex !== null ||
                      isElevating
                    }
                    className={`rounded-md okey-stone-back shadow-2xl flex flex-col items-center justify-between py-1 transition-all cursor-pointer ${
                      isCompactFit
                        ? 'w-8 sm:w-9 h-11.5 sm:h-13'
                        : 'w-9 sm:w-11 md:w-12 h-14 sm:h-16 md:h-17'
                    } ${
                      state.currentTurnPlayerIndex === 0 && !state.hasDrawnThisTurn
                        ? 'ring-2 ring-amber-400 -translate-y-1 scale-105 animate-pulse'
                        : 'hover:scale-102 active:scale-95'
                    }`}
                    style={{
                      boxShadow:
                        '0 6px 0 #9e8466, 0 12px 18px rgba(15,8,4,0.85), inset 0 1.5px 1px #ffffff',
                    }}
                    title={
                      state.currentTurnPlayerIndex === 0 && !state.hasDrawnThisTurn
                        ? 'Ortadan Taş Çek'
                        : 'Orta Deste'
                    }
                  >
                    <span className="text-[7px] font-mono text-amber-950/70 font-black">
                      {state.deck.length}
                    </span>
                    <div className="w-5 h-6 rounded border border-[#b8a892]/80 flex flex-col items-center justify-center bg-black/5 shadow-inner">
                      <span className="text-[10px] text-[#6d4f34] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] font-serif font-bold">❖</span>
                    </div>
                    <span className="text-[6px] text-[#705a41] font-mono font-bold">TAŞ</span>
                  </button>
                </div>

                {/* 2. GÖSTERGE TAŞI (Elin Göstergesi - Tam ve Eksiksiz %100 Görünüm) */}
                <div className="flex flex-col items-center bg-[#14261a]/95 border border-amber-400/50 rounded-xl px-2 py-1 shadow-lg ring-1 ring-amber-400/30">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-black text-[#f5d58d] tracking-wider">
                      Gösterge
                    </span>
                    <span className="text-[7px] bg-amber-400/25 text-amber-300 px-1 py-0.2 rounded font-bold border border-amber-400/40">
                      -1 Puan
                    </span>
                  </div>
                  <div className="my-0.5 flex items-center justify-center">
                    {renderTile(state.indicatorTile, false, false)}
                  </div>
                  <button
                    type="button"
                    onClick={handleDeclareGosterge}
                    disabled={state.currentTurnPlayerIndex !== 0}
                    title="Elinizde bu gösterge taşı varsa gösterip rakiplerden 1 puan düşün"
                    className="text-[7.5px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#2b180d] hover:bg-amber-700 text-amber-200 border border-amber-500/40 transition-all cursor-pointer shadow-sm disabled:opacity-40 mt-0.5"
                  >
                    Göstergeyi Aç
                  </button>
                </div>

                {/* 3. VIP Çanak (Pot) Display */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5 mb-0.5">
                    <span className="text-[8px] sm:text-[9px] uppercase font-black text-amber-300 tracking-wider">
                      Çanak
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCanakInfo(true)}
                      title="Çanak Kırma Kuralları"
                      className="text-amber-400/80 hover:text-amber-200 cursor-pointer"
                    >
                      <Info className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCanakInfo(true)}
                    title="Çanak Kasası"
                    className={`rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-2 relative overflow-hidden group shadow-xl ${
                      isCompactFit
                        ? 'w-10 sm:w-11.5 h-11.5 sm:h-13'
                        : 'w-13 sm:w-16 h-14 sm:h-16'
                    } bg-gradient-to-b from-[#422006] via-[#241203] to-[#120801] border-amber-400/80 hover:border-amber-300 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.35)]`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                    <span className="text-sm sm:text-base drop-shadow-md select-none">🏺</span>
                    <div className="flex items-center gap-0.5 text-[8px] sm:text-[10px] font-black text-amber-300 font-mono leading-none mt-0.5">
                      <span>{state.canakGold}</span>
                      <span className="text-[7px] text-amber-400">🪙</span>
                    </div>
                  </button>
                </div>

                {/* 4. Elevator Trigger Button (Asansör Diski & Taş Karıştırıcı) */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#b5cbbe] mb-0.5 tracking-wider">
                    Asansör
                  </span>
                  <button
                    type="button"
                    onClick={handleTriggerElevator}
                    disabled={isElevating}
                    title="Otomatik Masanın Asansör Diskini Çalıştır ve Taşları Karıştır"
                    className={`rounded-full flex flex-col items-center justify-center transition-all cursor-pointer border-2 ${
                      isCompactFit
                        ? 'w-9 h-9 sm:w-10 sm:h-10'
                        : 'w-12 h-12 sm:w-14 sm:h-14'
                    } ${
                      isElevating
                        ? 'bg-amber-600/50 border-amber-300 ring-4 ring-amber-400/50 scale-95 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                        : 'bg-[#2b160b] hover:bg-[#3d1f0f] border-[#c89d56]/50 hover:border-[#c89d56] shadow-lg hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Disc3 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 ${isElevating ? 'animate-spin' : ''}`} />
                    <span className="text-[6.5px] sm:text-[7px] font-bold text-[#f5d58d] mt-0.5 tracking-tighter uppercase">
                      {isElevating ? 'Karışıyor' : 'Karıştır'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Waiter Orders on table */}
              {activeOrders.length > 0 && (
                <div className="mt-1 pt-1 border-t border-white/10 flex items-center justify-center gap-1.5">
                  <span className="text-[8px] text-[#8fa898]">İkramlar:</span>
                  {activeOrders.map((ord) => (
                    <span key={ord.id} title={ord.name} className="text-base sm:text-lg">
                      {ord.icon}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 101 OKEY: Yere Açılan Perler Masası (Table Opened Melds Panel) */}
            {state.variant === 'yuzbir' && (
              <div
                className={`w-full max-w-xs sm:max-w-sm rounded-2xl bg-[#0f1d13]/95 border border-[#c89d56]/40 shadow-xl overflow-hidden transition-all ${
                  isCompactFit ? 'p-1.5' : 'p-2 sm:p-2.5'
                }`}
              >
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400 font-bold text-[11px] sm:text-xs">🀄 Yere Açılan Perler</span>
                    <span className="text-[8px] bg-emerald-900/60 text-emerald-300 font-mono px-1 py-0.2 rounded border border-emerald-500/30">
                      101
                    </span>
                  </div>
                  <span className="text-[9px] text-[#9db2a5] font-mono">
                    {state.openedTableMelds.length > 0
                      ? `${state.openedTableMelds.length} Oyuncu Açtı`
                      : 'Henüz Açan Yok'}
                  </span>
                </div>

                {state.openedTableMelds.length === 0 ? (
                  <div className="py-1.5 px-2 text-center text-[9px] sm:text-[10px] text-[#8fa898] italic bg-black/20 rounded-xl border border-dashed border-white/10">
                    Henüz kimse elini açmadı. 101 puan barajını aşarak perlerinizi ilk açan siz olun!
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-32 sm:max-h-40 overflow-y-auto pr-1">
                    {state.openedTableMelds.map((openedEntry) => (
                      <div
                        key={openedEntry.playerIndex}
                        className="p-1 rounded-xl bg-black/35 border border-[#c89d56]/20 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#f5d58d] flex items-center gap-1">
                            <span>{openedEntry.playerAvatar}</span>
                            <span>{openedEntry.playerName}</span>
                            <span className="text-[8px] text-amber-300 font-mono">
                              ({openedEntry.openType === 'cift' ? '5 Çift' : `${openedEntry.totalPoints} Puan`})
                            </span>
                          </span>
                        </div>

                        {/* Melds groups */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {openedEntry.melds.map((meld, meldIdx) => {
                            const selectedTile =
                              selectedSlot !== null ? state.players[0].rackSlots[selectedSlot] : null;
                            const appendCheck =
                              selectedTile && state.playerHasOpened[0]
                                ? canAppendTileToMeld(
                                    selectedTile,
                                    meld,
                                    state.okeyTileColor,
                                    state.okeyTileNumber
                                  )
                                : { canAppend: false };

                            return (
                              <div
                                key={meldIdx}
                                className={`flex items-center gap-0.5 p-0.5 rounded-lg transition-all ${
                                  appendCheck.canAppend
                                    ? 'bg-emerald-950/90 border-2 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg animate-pulse'
                                    : 'bg-[#18281d] border border-white/10'
                                }`}
                              >
                                {meld.tiles.map((t) => (
                                  <div key={t.id} className="scale-65 sm:scale-75 origin-center -mx-1.5">
                                    {renderTile(t, false, true)}
                                  </div>
                                ))}

                                {appendCheck.canAppend && (
                                  <button
                                    type="button"
                                    onClick={() => handleAppendTileToMeld(openedEntry.playerIndex, meldIdx)}
                                    title="Seçili taşı bu pere işle"
                                    className="ml-1 text-[8px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 px-1.5 py-0.5 rounded shadow cursor-pointer uppercase transition-transform active:scale-90 shrink-0"
                                  >
                                    + İşle
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Alt Satır: BANA ATILAN TAŞ (Sol) & SİZİN ATTIĞINIZ TAŞ (Sağ) */}
            <div className="flex items-center justify-between w-full px-1 sm:px-2 gap-2 mt-0.5">
              {/* BANA ATILAN TAŞ (YANDAN ALINAN) - GÖSTERİŞLİ, NET, EKSİKSİZ %100 GÖRÜNÜR */}
              <div className="flex items-center gap-2 bg-[#152e1f]/95 border-2 border-emerald-500/70 shadow-xl rounded-2xl p-1.5 ring-1 ring-emerald-400/40">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] sm:text-[10px] text-emerald-300 font-black tracking-tight leading-tight">Bana Atılan Taş</span>
                  <span className="text-[7.5px] text-emerald-400 font-bold">(Yandan Alınan)</span>
                  <span className="text-[6.5px] text-emerald-300/80 font-mono mt-0.5">Murat attı ⬇</span>
                </div>
                {state.discardPiles[3].length > 0 ? (
                  <div
                    onClick={handleDrawFromDiscard}
                    className={`cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      state.currentTurnPlayerIndex === 0 && !state.hasDrawnThisTurn
                        ? 'ring-2 ring-emerald-400 rounded-md animate-pulse shadow-lg scale-105'
                        : ''
                    }`}
                    title="Murat Kaptan'ın solunuza attığı taşı alın"
                  >
                    {renderTile(
                      state.discardPiles[3][state.discardPiles[3].length - 1],
                      false,
                      false
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-emerald-500/40 rounded-md flex items-center justify-center text-[8px] text-emerald-300/50 bg-black/20 w-8.5 h-12">
                    Boş
                  </div>
                )}
              </div>

              {/* SİZİN ATTIĞINIZ TAŞ (TAŞ ATMA YERİ) - GÖSTERİŞLİ, NET, EKSİKSİZ %100 GÖRÜNÜR */}
              <div
                onClick={handleDiscardAreaClick}
                onDragOver={handleDragOverDiscard}
                onDragLeave={handleDragLeaveDiscard}
                onDrop={handleDropOnDiscard}
                className={`flex items-center gap-2 rounded-2xl p-1.5 transition-all shadow-xl select-none relative ${
                  isDragOverDiscard
                    ? 'bg-amber-900/90 border-2 border-amber-400 ring-4 ring-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.8)] scale-105'
                    : state.currentTurnPlayerIndex === 0 && state.hasDrawnThisTurn
                    ? selectedSlot !== null
                      ? 'bg-amber-950/95 border-2 border-amber-400 ring-4 ring-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.85)] cursor-pointer scale-[1.03] animate-pulse'
                      : 'bg-[#1c2e21]/95 border-2 border-amber-400/70 hover:border-amber-400 ring-2 ring-amber-400/40 cursor-pointer hover:scale-[1.02]'
                    : 'bg-[#1c2e21]/95 border-2 border-[#c89d56]/40'
                }`}
                title={
                  state.currentTurnPlayerIndex === 0 && state.hasDrawnThisTurn
                    ? selectedSlot !== null
                      ? 'Seçili taşı buraya atmak için dokunun!'
                      : 'Istakanızdan bir taşa dokunup seçtikten sonra buraya basarak atabilirsiniz.'
                    : 'Sizin taş atma alanınız (Haydar Usta tarafı)'
                }
              >
                {state.discardPiles[0].length > 0 ? (
                  renderTile(
                    state.discardPiles[0][state.discardPiles[0].length - 1],
                    false,
                    false
                  )
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-md flex flex-col items-center justify-center text-[8px] transition-all w-8.5 h-12 ${
                      isDragOverDiscard
                        ? 'border-amber-300 bg-amber-400/20 text-amber-200 font-bold'
                        : state.currentTurnPlayerIndex === 0 && state.hasDrawnThisTurn
                        ? selectedSlot !== null
                          ? 'border-amber-300 bg-amber-500/30 text-amber-100 font-bold'
                          : 'border-amber-400/60 text-amber-300/80 bg-amber-950/20'
                        : 'border-white/20 text-white/30 bg-black/20'
                    }`}
                  >
                    <span>{isDragOverDiscard ? 'Bırak!' : selectedSlot !== null ? 'Dokun!' : 'Boş'}</span>
                    {state.currentTurnPlayerIndex === 0 && state.hasDrawnThisTurn && (
                      <span className="text-[6.5px] opacity-75 mt-0.5">Taş At</span>
                    )}
                  </div>
                )}
                <div className="flex flex-col text-right">
                  <span className="text-[9px] sm:text-[10px] text-[#f5d58d] font-black tracking-tight leading-tight">Sizin Attığınız</span>
                  <span className="text-[7.5px] text-amber-300 font-bold">(Taş Atma Yeri)</span>
                  <span className="text-[6.5px] text-[#9db2a5] font-mono mt-0.5">➡ Haydar alır</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SAĞ OYUNCU (East): Haydar Usta (Dikey Kompakt Sütun - Genişliği sabit ~60px, ASLA ekrandan dışarı taşmaz!) */}
          <div className="flex flex-col items-center bg-[#122116]/90 rounded-2xl border border-[#c89d56]/30 shadow-md p-1 sm:p-1.5 shrink-0 transition-transform scale-90 sm:scale-95 origin-right gap-1">
            <div
              className={`p-1 sm:p-1.5 rounded-xl bg-[#152319]/90 border transition-all flex flex-col items-center w-full ${
                state.currentTurnPlayerIndex === 1
                  ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg'
                  : 'border-[#c89d56]/20'
              }`}
            >
              <span className="text-base sm:text-xl">{state.players[1].avatar}</span>
              <span className="font-bold text-[10px] sm:text-xs text-[#f5d58d] mt-0.5 whitespace-nowrap">{state.players[1].name}</span>
              <span className="text-[9px] text-[#9db2a5]">Maç: {matchScores[1]}</span>

              {/* İkram for Haydar Usta */}
              {activeOrders.length > 0 ? (
                <button
                  type="button"
                  onClick={() => sounds.playTeaService()}
                  className="mt-1 flex items-center gap-1 bg-[#231409]/95 px-1.5 py-0.5 rounded-lg border border-[#c89d56]/40 hover:border-amber-400 transition-all cursor-pointer shadow-sm active:scale-95"
                  title={`Haydar Usta'nın İkramı: ${activeOrders[0].name} (Tıkla - Yudumla)`}
                >
                  <CafeItemRealisticImage itemId={activeOrders[0].id} size="sm" />
                  <span className="text-[8px] text-amber-200 font-medium hidden sm:inline">{activeOrders[0].name}</span>
                </button>
              ) : onOpenWaiter && (
                <button
                  type="button"
                  onClick={onOpenWaiter}
                  className="mt-1 flex items-center gap-0.5 bg-black/40 px-1 py-0.5 rounded text-[8px] text-amber-300/80 hover:text-amber-200 border border-white/5 cursor-pointer"
                  title="Haydar Usta'ya İkram Ismarla"
                >
                  <span>☕</span>
                  <span className="hidden sm:inline">İkram</span>
                </button>
              )}
            </div>
            <OpponentSideIstaka
              position="right"
              rackSlots={state.players[1].rackSlots}
              playerName={state.players[1].name}
              isTurn={state.currentTurnPlayerIndex === 1}
            />
          </div>
        </div>

        {/* Victory & Round Result Overlay Modal */}
        {state.winnerIndex !== null && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <Trophy className="w-16 h-16 text-[#c89d56] mb-3 animate-bounce" />
            <h2 className="text-3xl font-black font-serif-royal gold-gradient-text uppercase tracking-widest">
              {state.winType === 'okey_atti'
                ? 'OKEY ATTI!'
                : state.winType === 'cift'
                ? 'ÇİFTE BİTİRİLDİ!'
                : 'OYUN BİTTİ!'}
            </h2>
            <p className="text-sm text-[#e6d8c4] mt-2 max-w-md">
              {state.winnerIndex === 0
                ? 'Muhteşem bir oyun çıkardınız! Elinizdeki tüm perleri tamamlayarak masayı aldınız!'
                : `${state.players[state.winnerIndex].name} oyunu bitirdi!`}
            </p>

            {/* Score deduction summary */}
            <div className="mt-4 p-3 rounded-2xl bg-[#142318] border border-amber-400/40 text-xs flex flex-col gap-1.5 max-w-sm w-full">
              <span className="font-bold text-amber-300">
                Ceza Puanı: {state.winType === 'okey_atti' || state.winType === 'cift' ? '-4 Puan (Çifte Ceza!)' : '-2 Puan'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300 pt-1 border-t border-white/10">
                <div>Siz: <b className="text-amber-300">{matchScores[0]} Puan</b></div>
                <div>Haydar: <b className="text-amber-300">{matchScores[1]} Puan</b></div>
                <div>Selim: <b className="text-amber-300">{matchScores[2]} Puan</b></div>
                <div>Murat: <b className="text-amber-300">{matchScores[3]} Puan</b></div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleNextRound}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#d4af37] to-[#b38528] text-[#120a06] hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Sonraki Ele Geç (Puanlar Korunur)
              </button>

              <button
                type="button"
                onClick={() => handleSetTargetScore(matchTarget)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-black/40 border border-white/20 text-stone-300 hover:text-white hover:bg-black/60 transition-all cursor-pointer"
              >
                Yeni Maç Başlat
              </button>
            </div>
          </div>
        )}

        {/* Puanlı Oyun Hedef Ayarı Modalı (11, 22 veya Manuel Sayı) */}
        {showPointsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#16271a] border border-[#c89d56]/50 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#c89d56]/20 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-[#f5d58d] font-serif-royal">
                    Puanlı Okey Masası Ayarı
                  </h3>
                </div>
                <button
                  onClick={() => setShowPointsModal(false)}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white bg-black/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#c4b5a3]">
                Her oyuncu seçilen hedef puan ile başlar. Biten oyuncu hariç diğer oyunculardan standart 2 puan, Okey veya Çift ile bitişte 4 puan düşülür.
              </p>

              {/* Quick Select Buttons: 11 and 22 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSetTargetScore(11)}
                  className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    matchTarget === 11
                      ? 'bg-amber-600/30 border-amber-400 text-amber-200 shadow-md font-bold'
                      : 'bg-black/30 border-white/10 text-stone-300 hover:border-amber-400/40'
                  }`}
                >
                  <span className="text-lg font-black font-mono">11 PUAN</span>
                  <span className="text-[10px] text-stone-400">Klasik Hızlı Maç</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetTargetScore(22)}
                  className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    matchTarget === 22
                      ? 'bg-amber-600/30 border-amber-400 text-amber-200 shadow-md font-bold'
                      : 'bg-black/30 border-white/10 text-stone-300 hover:border-amber-400/40'
                  }`}
                >
                  <span className="text-lg font-black font-mono">22 PUAN</span>
                  <span className="text-[10px] text-stone-400">Uzun Turnuva Maçı</span>
                </button>
              </div>

              {/* Manuel Puan Girişi */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#f5d58d]">
                  Manuel Sayı Girişi:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="3"
                    max="99"
                    value={manualInputVal}
                    onChange={(e) => setManualInputVal(e.target.value)}
                    placeholder="Örn: 15 veya 30"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e1d13] border border-[#c89d56]/40 text-amber-200 font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseInt(manualInputVal, 10);
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

      {/* Player Istaka Top Control Bar (Tuşlar ve Durum) */}
      <div className={`flex flex-wrap items-center justify-between rounded-xl bg-[#1d120a] border border-[#c89d56]/40 shadow-lg max-w-5xl mx-auto w-full transition-all ${
        isCompactFit ? 'gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5' : 'gap-2 px-3 sm:px-5 py-2'
      }`}>
        <div className="flex items-center gap-2">
          {userProfile && (
            <span className={`${isCompactFit ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>{userProfile.avatar}</span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-[#f5d58d] uppercase tracking-wider font-serif-royal drop-shadow-sm">
              {userProfile ? `${userProfile.name} Istakası` : 'Istakanız'}
            </span>
            <span className="text-[10px] text-[#e2b86e] font-mono tracking-widest hidden sm:inline font-bold">
              · HELENA WOOD ART (MASİF CEVİZ OVAL)
            </span>
          </div>
          <span className="text-xs text-[#d1ba9e] font-mono bg-black/50 px-2 py-0.5 rounded-full border border-white/10 font-bold shadow-inner">
            {state.players[0].rackSlots.filter(Boolean).length}/15 Taş
          </span>

          {/* İkram for Player 0 (You) */}
          {activeOrders.length > 0 ? (
            <button
              type="button"
              onClick={() => sounds.playTeaService()}
              className="flex items-center gap-1.5 bg-[#231409]/95 px-2 py-0.5 rounded-lg border border-amber-400/50 hover:border-amber-300 transition-all cursor-pointer shadow-sm active:scale-95 ml-0.5"
              title={`Sizin İkramınız: ${activeOrders[0].name} (Tıkla - Yudumla)`}
            >
              <CafeItemRealisticImage itemId={activeOrders[0].id} size="sm" />
              <span className="text-[10px] text-amber-300 font-bold hidden sm:inline">{activeOrders[0].name}</span>
            </button>
          ) : onOpenWaiter && (
            <button
              type="button"
              onClick={onOpenWaiter}
              className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-lg text-[9px] text-amber-300/80 hover:text-amber-200 border border-white/10 cursor-pointer ml-0.5"
              title="Kendinize Çay/Kahve İkramı İsteyin"
            >
              <span>☕</span>
              <span className="hidden sm:inline">İkram İste</span>
            </button>
          )}

          {/* Oynanış Modu Seçici: Sürükle-Bırak vs Seç & Taşı */}
          <div className="flex items-center bg-[#2b170c] p-0.5 rounded-lg border border-[#c89d56]/30 text-xs">
            <button
              type="button"
              onClick={() => {
                setInteractionMode('drag');
                setSelectedSlot(null);
              }}
              title="Sürükle & Bırak Modu: Taşları doğrudan tutup sürükleyerek oynayın"
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md font-medium transition-all ${
                interactionMode === 'drag'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow'
                  : 'text-[#d4beaa] hover:text-amber-200'
              }`}
            >
              <Move className="w-3 h-3" />
              <span>Sürükle-Bırak</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInteractionMode('click');
                setSelectedSlot(null);
              }}
              title="Seç & Taşı Modu: Taşa tıklayıp seçin, sonra gideceği yere tıklayın"
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md font-medium transition-all ${
                interactionMode === 'click'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow'
                  : 'text-[#d4beaa] hover:text-amber-200'
              }`}
            >
              <MousePointer className="w-3 h-3" />
              <span>Seç & Taşı</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          {/* 101 Okey Meld Open Buttons */}
          {state.variant === 'yuzbir' && (
            <div className="flex items-center gap-1 bg-[#251409] p-0.5 rounded-lg border border-[#c89d56]/30">
              {!state.playerHasOpened[0] ? (
                <>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold ${
                      user101Eval.canOpenSeri
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : 'bg-black/40 text-amber-300/80 border border-white/10'
                    }`}
                    title={`Geçerli Per Puanı: ${user101Eval.totalPoints}/101 | Çift: ${user101Eval.pairCount}/5`}
                  >
                    {user101Eval.totalPoints}/101 Puan
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenHand101('seri')}
                    disabled={
                      !user101Eval.canOpenSeri ||
                      state.currentTurnPlayerIndex !== 0 ||
                      !state.hasDrawnThisTurn
                    }
                    title={
                      user101Eval.canOpenSeri
                        ? '101 puan barajını geçtiniz! Perlerinizi masaya açın'
                        : `101 barajına ${Math.max(0, 101 - user101Eval.totalPoints)} puan daha lazım`
                    }
                    className="px-2 py-0.5 sm:py-1 text-xs font-bold rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white disabled:opacity-40 transition-all shadow cursor-pointer disabled:cursor-not-allowed"
                  >
                    El Aç (101+)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenHand101('cift')}
                    disabled={
                      !user101Eval.canOpenCift ||
                      state.currentTurnPlayerIndex !== 0 ||
                      !state.hasDrawnThisTurn
                    }
                    title={
                      user101Eval.canOpenCift
                        ? '5 çiftiniz var! Masaya çift açın'
                        : `5 çifte ${Math.max(0, 5 - user101Eval.pairCount)} çift daha lazım`
                    }
                    className="px-2 py-0.5 sm:py-1 text-xs font-bold rounded-md bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-600 hover:to-cyan-600 text-white disabled:opacity-40 transition-all shadow cursor-pointer disabled:cursor-not-allowed"
                  >
                    Çift Aç ({user101Eval.pairCount}/5)
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] sm:text-xs text-emerald-300 font-semibold">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Eliniz Açık (Taş İşleyebilirsiniz)</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSortRuns}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold rounded-lg bg-[#381f13] hover:bg-[#4a2b1b] border border-[#c89d56]/40 text-[#f5d58d] transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
          >
            Seri Diz
          </button>
          <button
            onClick={handleSortPairs}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold rounded-lg bg-[#381f13] hover:bg-[#4a2b1b] border border-[#c89d56]/40 text-[#f5d58d] transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
          >
            Çift Diz
          </button>
          <button
            onClick={handleDeclareGosterge}
            className="hidden sm:inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold rounded-lg bg-[#381f13] hover:bg-[#4a2b1b] border border-[#c89d56]/40 text-[#f5d58d] transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
          >
            Gösterge
          </button>

          {/* Finish Button */}
          <button
            onClick={handleDeclareFinish}
            className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {state.variant === 'yuzbir' ? "101'i Bitir" : 'Okeyi Bitir'}
          </button>

          {/* Discard Button */}
          <button
            onClick={handleDiscardSelected}
            disabled={
              selectedSlot === null ||
              state.currentTurnPlayerIndex !== 0 ||
              !state.hasDrawnThisTurn
            }
            className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa821d] hover:from-[#e2be4a] hover:to-[#ba9024] text-[#120a06] disabled:opacity-40 transition-all flex items-center gap-1 shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Taş At</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error notification if finishing or discard has an issue */}
      {finishError && (
        <div className="px-3 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 max-w-5xl mx-auto w-full">
          {finishError}
        </div>
      )}

      {/* Player's Authentic Helena Wood Art Oval Curved Wooden Istaka Body (Fotoğraftaki Masif Koyu Kahve Oval Takım) */}
      <div className={`relative max-w-5xl mx-auto w-full select-none rounded-2xl sm:rounded-3xl shadow-2xl transition-all overflow-visible ${
        isCompactFit
          ? 'pt-4 sm:pt-5 pb-2 sm:pb-3 px-2 sm:px-4'
          : 'pt-8 sm:pt-10 pb-4 sm:pb-5 px-3 sm:px-5'
      }`}>
        {/* Real 100% Vector Helena Wood Art Masif Oval Gövde & Sedef Mozaik Kakma & Vidalı Pirinç Plakalar */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
          <HelenaIstakaBackdrop className="drop-shadow-2xl w-full h-full" />
        </div>

        {/* 2-Tier Slotted Rails Positioned Exactly inside the Carved Wooden Shelf Channels */}
        <div className={`relative z-10 flex flex-col px-1 sm:px-4 overflow-x-auto ${
          isCompactFit ? 'gap-1.5 sm:gap-2 pt-3 sm:pt-4 pb-1' : 'gap-2.5 sm:gap-3.5 pt-5 sm:pt-6 pb-2'
        }`}>
          {/* Top Tier Shelf (Slot 0..13) */}
          <div className="relative pt-2.5 sm:pt-3 pb-1 px-1 rounded-lg bg-black/30 backdrop-blur-[1px] border-b-2 border-[#5c2a13] shadow-inner overflow-visible">
            <div className={`flex items-end gap-0.5 sm:gap-1 min-w-[500px] overflow-visible ${
              isCompactFit ? 'h-12 sm:h-14' : 'h-16 sm:h-18'
            }`}>
              {state.players[0].rackSlots.slice(0, 14).map((tile, idx) => {
                const actualSlot = idx;
                const isSelected = selectedSlot === actualSlot;
                const isDragTarget = dragOverSlot === actualSlot;
                const isBeingDragged = draggedSlot === actualSlot;
                const canDragThisTile = !!tile && interactionMode === 'drag';
                return (
                  <button
                    key={actualSlot}
                    draggable={canDragThisTile}
                    onDragStart={(e) => handleDragStart(e, actualSlot)}
                    onDragOver={(e) => handleDragOverSlot(e, actualSlot)}
                    onDrop={(e) => handleDropOnSlot(e, actualSlot)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleSlotClick(actualSlot)}
                    title={
                      tile
                        ? interactionMode === 'drag'
                          ? 'Sürükleyin: Yeni yuvaya veya Taş At alanına bırakın'
                          : 'Tıklayın: Seçip yeni yere taşıyın'
                        : 'Boş Yuva'
                    }
                    className={`flex-1 ${
                      isCompactFit ? 'min-w-[28px] sm:min-w-[34px]' : 'min-w-[34px] sm:min-w-[40px]'
                    } h-full rounded-md flex items-end justify-center transition-all cursor-pointer relative group overflow-visible ${
                      isBeingDragged
                        ? 'opacity-40 scale-95'
                        : isDragTarget
                        ? 'border-2 border-amber-400 bg-amber-500/30 scale-105 z-20 shadow-lg rounded-t'
                        : tile
                        ? ''
                        : 'border-b-2 border-dashed border-[#572915]/60 hover:border-[#c89d56]/50 bg-black/20 hover:bg-black/40 rounded-t'
                    }`}
                  >
                    {tile ? (
                      renderTile(tile, isSelected, false)
                    ) : (
                      <span className="text-[10px] text-[#7a482c] mb-1 select-none opacity-0 group-hover:opacity-100 transition-opacity">
                        +
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Wooden Ledge Footing (Taşların oturduğu ahşap tırnak çıkıntısı) */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#442010] via-[#5c2e17] to-[#442010] rounded-b shadow-sm border-t border-black/40 mt-0.5" />
          </div>

          {/* Bottom Tier Shelf (Slot 14..27) */}
          <div className="relative pt-2.5 sm:pt-3 pb-1 px-1 rounded-lg bg-black/30 backdrop-blur-[1px] border-b-2 border-[#5c2a13] shadow-inner overflow-visible">
            <div className={`flex items-end gap-0.5 sm:gap-1 min-w-[500px] overflow-visible ${
              isCompactFit ? 'h-12 sm:h-14' : 'h-16 sm:h-18'
            }`}>
              {state.players[0].rackSlots.slice(14, 28).map((tile, idx) => {
                const actualSlot = idx + 14;
                const isSelected = selectedSlot === actualSlot;
                const isDragTarget = dragOverSlot === actualSlot;
                const isBeingDragged = draggedSlot === actualSlot;
                const canDragThisTile = !!tile && interactionMode === 'drag';
                return (
                  <button
                    key={actualSlot}
                    draggable={canDragThisTile}
                    onDragStart={(e) => handleDragStart(e, actualSlot)}
                    onDragOver={(e) => handleDragOverSlot(e, actualSlot)}
                    onDrop={(e) => handleDropOnSlot(e, actualSlot)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleSlotClick(actualSlot)}
                    title={
                      tile
                        ? interactionMode === 'drag'
                          ? 'Sürükleyin: Yeni yuvaya veya Taş At alanına bırakın'
                          : 'Tıklayın: Seçip yeni yere taşıyın'
                        : 'Boş Yuva'
                    }
                    className={`flex-1 ${
                      isCompactFit ? 'min-w-[28px] sm:min-w-[34px]' : 'min-w-[34px] sm:min-w-[40px]'
                    } h-full rounded-md flex items-end justify-center transition-all cursor-pointer relative group overflow-visible ${
                      isBeingDragged
                        ? 'opacity-40 scale-95'
                        : isDragTarget
                        ? 'border-2 border-amber-400 bg-amber-500/30 scale-105 z-20 shadow-lg rounded-t'
                        : tile
                        ? ''
                        : 'border-b-2 border-dashed border-[#572915]/60 hover:border-[#c89d56]/50 bg-black/20 hover:bg-black/40 rounded-t'
                    }`}
                  >
                    {tile ? (
                      renderTile(tile, isSelected, false)
                    ) : (
                      <span className="text-[10px] text-[#7a482c] mb-1 select-none opacity-0 group-hover:opacity-100 transition-opacity">
                        +
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Wooden Ledge Footing (Taşların oturduğu ahşap tırnak çıkıntısı) */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#442010] via-[#5c2e17] to-[#442010] rounded-b shadow-sm border-t border-black/40 mt-0.5" />
          </div>
        </div>
      </div>

      {/* Bottom Bar: Quick Help & Chat Trigger */}
      <div className="px-2.5 py-1 text-[11px] text-[#a18c7b] flex items-center justify-between gap-2 max-w-5xl mx-auto w-full bg-black/35 rounded-xl border border-white/5 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-amber-300 font-semibold shrink-0 text-[10px] sm:text-xs">
            {interactionMode === 'drag' ? '🖱️ Sürükle & Bırak' : '👆 Seç & Taşı'}
          </span>
          <span className="hidden sm:inline text-stone-400 text-[10px] truncate">
            {interactionMode === 'drag'
              ? 'Taşları doğrudan ıstaka yuvalarına veya atma alanına sürükleyin.'
              : 'Taşa tıklayıp yeni yuvaya veya Taş At alanına tıklayın.'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[#f5d58d] text-[10px] hidden md:inline">
            Hedef: 14 Taş + 1 Bitiş
          </span>

          {onOpenWaiter && (
            <button
              type="button"
              onClick={() => {
                sounds.playWaiterBell();
                onOpenWaiter();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/40 text-[10px] sm:text-xs font-bold cursor-pointer transition-all shadow-sm"
              title="Çaycıyı masaya çağır"
            >
              <span>☕</span>
              <span>Çaycı</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowChatModal(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#271810] hover:bg-[#381a0b] text-[#f5d58d] border border-[#c89d56]/30 text-[10px] sm:text-xs font-semibold cursor-pointer transition-all shadow-sm"
            title="Masa muhabbetini görüntüle"
          >
            <MessageSquare className="w-3 h-3 text-amber-400" />
            <span>Masa Sohbeti ({state.cafeDialogue.length})</span>
          </button>
        </div>
      </div>

      {/* When screen is unlocked and not in compact fit, also show the expanded Cafe Dialogue Box */}
      {!isLocked && !isCompactFit && (
        <div className="p-3.5 rounded-2xl bg-[#1b120c] border border-[#c89d56]/20 flex flex-col gap-2 max-w-5xl mx-auto w-full shrink-0">
          <span className="text-xs font-bold text-[#c89d56] uppercase tracking-wider flex items-center gap-2">
            <span>💬</span>
            <span>Royal Cafe Masa Muhabbeti</span>
          </span>
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-2">
            {state.cafeDialogue.map((d, i) => (
              <div key={i} className="text-xs text-[#cfbfaf] flex items-baseline gap-2">
                <strong className="text-[#f5d58d] shrink-0">{d.sender}:</strong>
                <span className="italic">"{d.text}"</span>
                <span className="text-[10px] text-[#806f62] shrink-0 ml-auto">{d.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Masa Sohbeti Modal (Tek ekran sabitleme modunda sohbeti rahatça okumak için) */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#19100a] border border-[#c89d56]/50 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#c89d56]/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">💬</span>
                <h3 className="text-sm font-bold text-[#f5d58d] font-serif-royal">
                  Royal Cafe Masa Muhabbeti
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChatModal(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white bg-black/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {state.cafeDialogue.map((d, i) => (
                <div key={i} className="text-xs bg-black/30 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-[#f5d58d]">{d.sender}</strong>
                    <span className="text-[10px] text-[#806f62]">{d.time}</span>
                  </div>
                  <p className="text-[#cfbfaf] italic text-[11px]">"{d.text}"</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowChatModal(false)}
              className="w-full py-1.5 rounded-xl bg-[#2e170c] hover:bg-[#3d1f0f] border border-[#c89d56]/30 text-amber-200 text-xs font-bold transition-all cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* ÇANAK KIRILDI KUTLAMA MODALI */}
      {state.canakBreakEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-gradient-to-b from-[#2b170c] via-[#1c0f07] to-[#120904] border-2 border-amber-400 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center text-center relative overflow-hidden">
            {/* Ambient golden glow rings */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25)_0%,transparent_70%)] pointer-events-none" />

            {/* Shattered Ceramic / Gold Urn Icon */}
            <div className="relative mb-3 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center shadow-2xl animate-pulse">
                <span className="text-5xl select-none">🏺</span>
              </div>
              <span className="absolute -top-2 -right-2 text-3xl animate-bounce">💥</span>
              <span className="absolute -bottom-1 -left-2 text-2xl">🪙</span>
              <span className="absolute -bottom-2 -right-1 text-2xl">✨</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase tracking-widest mb-2 shadow">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>MASANIN ÇANAĞI TUZ BUZ OLDU!</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-serif-royal gold-gradient-text uppercase tracking-wider drop-shadow-md">
              ÇANAK KIRILDI!
            </h2>

            <div className="mt-3 p-3.5 rounded-2xl bg-black/40 border border-amber-400/30 flex flex-col items-center gap-1.5 w-full">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{state.canakBreakEvent.winnerAvatar}</span>
                <span className="text-sm font-bold text-[#f5d58d]">
                  {state.canakBreakEvent.winnerName}
                </span>
              </div>
              <span className="text-xs text-amber-200/90 font-medium">
                {state.canakBreakEvent.reason === 'okey_atti'
                  ? '🎯 Bitiş taşı olarak OKEY atarak çanağı kırdı!'
                  : state.canakBreakEvent.reason === 'cift'
                  ? '👥 Çifte gidip eli tamamlayarak çanağı kırdı!'
                  : "⚡ 101 Okeyde ELDEN BİTİŞ yaparak çanağı havaya uçurdu!"}
              </span>

              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-center gap-2">
                <span className="text-xs text-[#a99988]">Kazanılan Çanak Kasası:</span>
                <span className="text-lg font-black text-amber-300 font-mono flex items-center gap-1 bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-400/50">
                  +{state.canakBreakEvent.amount} 🪙
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#baa794] mt-3">
              Rakiplere çifte ceza puanı uygulandı ve yeni el için çanak 500 altınla yeniden başlatılacak.
            </p>

            <button
              type="button"
              onClick={handleClaimCanakReward}
              className="mt-5 w-full py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-stone-950 shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Ödülü Al & Devam Et</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ÇANAK BİLGİ MODALI (Kurallar ve Kırma Şartları) */}
      {showCanakInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#192b1d] border border-[#c89d56]/50 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#c89d56]/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏺</span>
                <h3 className="text-base font-bold text-[#f5d58d] font-serif-royal">
                  Çanak Okey & Çanak Kırma Kuralları
                </h3>
              </div>
              <button
                onClick={() => setShowCanakInfo(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white bg-black/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#dcd2c4] space-y-3 leading-relaxed">
              <div className="p-3 rounded-xl bg-black/30 border border-amber-400/30 flex items-center justify-between">
                <span className="font-semibold text-amber-200">Şu Anki Masadaki Çanak:</span>
                <span className="font-mono font-black text-amber-300 text-sm flex items-center gap-1">
                  {state.canakGold} 🪙 Altın
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>💥</span>
                  <span>Çanak Nasıl Kırılır?</span>
                </h4>
                <ul className="space-y-1.5 list-disc pl-4 text-[11px] text-[#b8a796]">
                  <li>
                    <strong className="text-[#f5d58d]">Okey Atarak Bitme:</strong> Elinizi normal perlerle tamamlayıp, bitiş taşı olarak ortaya <strong className="text-amber-300">OKEY</strong> taşını atarsanız çanak anında kırılır!
                  </li>
                  <li>
                    <strong className="text-[#f5d58d]">Çifte Gitme:</strong> Klasik Okey'de 7 çift, 101 Okey'de 5 çift yaparak bitişe ulaşırsanız çanak kırılır!
                  </li>
                  <li>
                    <strong className="text-[#f5d58d]">101'de Elden Bitme:</strong> Hiçbir per açmadan, tek seferde elinizdeki tüm 14 taşı per oluşturup biterseniz çanak kırılır!
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-[#253d2b] border border-emerald-500/30 text-[11px] text-emerald-200">
                ⭐ Çanağı kıran oyuncu masadaki tüm birikmiş altınları kasasına ekler ve rakiplerden normal cezanın 2 katı düşülür!
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowCanakInfo(false)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow cursor-pointer transition-all"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
