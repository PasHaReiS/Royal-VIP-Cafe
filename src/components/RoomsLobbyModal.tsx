import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Radio,
  User,
  Users,
  Search,
  Mic,
  Volume2,
  Trophy,
  Sparkles,
  ArrowRight,
  Shield,
  Coffee,
  RotateCcw,
} from 'lucide-react';
import { GameRoom, GameType, RoomType } from '../types/rooms';
import { roomService } from '../services/roomService';
import { sounds } from '../services/soundEffects';

interface RoomsLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (room: GameRoom) => void;
  onOpenCreateModal: () => void;
  userName: string;
  userAvatar: string;
  initialGameFilter?: GameType | 'all';
}

export const RoomsLobbyModal: React.FC<RoomsLobbyModalProps> = ({
  isOpen,
  onClose,
  onSelectRoom,
  onOpenCreateModal,
  userName,
  userAvatar,
  initialGameFilter = 'all',
}) => {
  const [rooms, setRooms] = useState<GameRoom[]>(() => roomService.getRooms());
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(() => roomService.getActiveRoom());
  const [gameFilter, setGameFilter] = useState<GameType | 'all'>(initialGameFilter);
  const [typeFilter, setTypeFilter] = useState<RoomType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = roomService.subscribe((updatedRooms, active) => {
      setRooms([...updatedRooms]);
      setActiveRoom(active);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (initialGameFilter) {
      setGameFilter(initialGameFilter);
    }
  }, [initialGameFilter]);

  if (!isOpen) return null;

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (gameFilter !== 'all' && r.gameType !== gameFilter) return false;
    if (typeFilter !== 'all' && r.roomType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchPlayer = r.currentPlayers.some((p) => p.name.toLowerCase().includes(q));
      if (!matchTitle && !matchPlayer) return false;
    }
    return true;
  });

  const handleJoin = (room: GameRoom) => {
    sounds.playOkeyTileTap();
    const joined = roomService.joinRoom(room.id, userName, userAvatar);
    if (joined) {
      onSelectRoom(joined);
      onClose();
    }
  };

  const handleDelete = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    roomService.deleteRoom(roomId);
  };

  const getGameBadge = (game: GameType) => {
    switch (game) {
      case 'okey':
        return { label: 'Okey & 101', icon: '🀄', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' };
      case 'tavla':
        return { label: 'Tavla Masası', icon: '🎲', color: 'bg-amber-950/80 text-amber-300 border-amber-500/40' };
      case 'satranc':
        return { label: 'Satranç 3D', icon: '♟️', color: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40' };
      case 'dama':
        return { label: 'Dama 3D', icon: '⚪', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' };
    }
  };

  const liveVoiceCount = rooms.filter((r) => r.roomType === 'live_voice').length;
  const soloCount = rooms.filter((r) => r.roomType === 'solo_private').length;
  const totalPlayers = rooms.reduce((acc, r) => acc + r.currentPlayers.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl bg-[#180f0a] border-2 border-[#c89d56]/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-stone-200 max-h-[92vh] overflow-hidden">
        {/* Salon Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#c89d56]/25 pb-3 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 border border-amber-400/50 flex items-center justify-center text-2xl shadow-lg">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black font-serif-royal gold-gradient-text tracking-wide uppercase">
                  Oyun & Kıraathane Odaları Salonu
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-bold hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Canlı Kıraathane</span>
                </span>
              </div>
              <p className="text-[11px] text-[#c4b5a3]">
                Her oyun için sesli canlı odalara katılın, masadakileri salondan görün veya tek kişilik özel masanızı kurun.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Create Room Button */}
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black shadow-lg transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yeni Canlı Oda Aç</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Salon Stats Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 text-[11px] shrink-0">
          <div className="flex items-center gap-3 text-stone-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <b className="text-emerald-300">{totalPlayers}</b> Oyuncu Masalarda
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400" />
              <b className="text-amber-300">{liveVoiceCount}</b> Canlı & Sesli Oda
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-stone-400" />
              <b className="text-stone-300">{soloCount}</b> Tek Kişilik Masa
            </span>
          </div>

          <button
            type="button"
            onClick={() => roomService.resetToDefaults()}
            className="text-[10px] text-amber-400/70 hover:text-amber-300 underline cursor-pointer"
            title="Varsayılan odaları geri yükle"
          >
            Varsayılan Odaları Yenile
          </button>
        </div>

        {/* Filters: Game Tabs & Room Type Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Game Selector Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: 'Tüm Oyunlar', icon: '✨' },
              { id: 'okey', label: 'Okey & 101', icon: '🀄' },
              { id: 'tavla', label: 'Tavla', icon: '🎲' },
              { id: 'satranc', label: 'Satranç 3D', icon: '♟️' },
              { id: 'dama', label: 'Dama 3D', icon: '⚪' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGameFilter(tab.id as GameType | 'all')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  gameFilter === tab.id
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 shadow-md font-black'
                    : 'bg-[#24150c] hover:bg-[#341e12] text-[#d4c5b3] border border-[#c89d56]/20'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Room Type & Search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-[11px]">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  typeFilter === 'all' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('live_voice')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  typeFilter === 'live_voice' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-400'
                }`}
              >
                <Radio className="w-2.5 h-2.5" />
                <span>Canlı & Sesli</span>
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('solo_private')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  typeFilter === 'solo_private' ? 'bg-stone-700 text-white font-bold' : 'text-stone-400'
                }`}
              >
                <User className="w-2.5 h-2.5" />
                <span>Tek Kişilik</span>
              </button>
            </div>

            <div className="relative w-36 sm:w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Oda veya isim ara..."
                className="w-full pl-8 pr-2 py-1 rounded-xl bg-black/50 border border-white/10 text-[11px] text-stone-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Room Grid Cards (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
          {filteredRooms.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center text-stone-400 gap-3 bg-black/20 rounded-2xl border border-dashed border-white/10">
              <Coffee className="w-10 h-10 text-amber-500/40" />
              <div>
                <p className="text-sm font-bold text-stone-300">Bu filtreye uygun oda bulunamadı.</p>
                <p className="text-xs text-stone-500 mt-0.5">İlk odayı hemen kurarak oyunu başlatabilirsiniz!</p>
              </div>
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                + Yeni Canlı Oda Aç
              </button>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const badge = getGameBadge(room.gameType);
              const isLive = room.roomType === 'live_voice';
              const isFull = room.currentPlayers.length >= room.maxPlayers;
              const isUserInRoom = activeRoom?.id === room.id;
              const emptySlots = Math.max(0, room.maxPlayers - room.currentPlayers.length);

              return (
                <div
                  key={room.id}
                  onClick={() => handleJoin(room)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden ${
                    isUserInRoom
                      ? 'bg-[#291b10] border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
                      : isLive
                      ? 'bg-[#1e130b]/90 hover:bg-[#28180e] border-[#c89d56]/35 hover:border-amber-400 shadow-md hover:shadow-xl'
                      : 'bg-[#15100c]/90 hover:bg-[#20150f] border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Card Header: Badges & Title */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold flex items-center gap-1 ${badge.color}`}>
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>

                        {isLive ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            <Radio className="w-2.5 h-2.5" />
                            <span>Canlı Sesli</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-600 text-[10px] font-medium flex items-center gap-1">
                            <User className="w-2.5 h-2.5" />
                            <span>Tek Kişilik</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="font-mono text-amber-300 font-bold">{room.stake}</span>
                        {room.isUserCreated && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, room.id)}
                            className="p-1 rounded text-stone-500 hover:text-rose-400 transition-colors"
                            title="Odayı Kapat/Sil"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#f5d58d] font-serif-royal group-hover:text-amber-200 transition-colors line-clamp-1">
                      {room.title}
                    </h3>
                    {room.description && (
                      <p className="text-[11px] text-[#b3a18f] line-clamp-1">{room.description}</p>
                    )}
                  </div>

                  {/* CRITICAL USER REQUIREMENT: Odadaki kişilerin isimleri açıkça yazsın, salondan görülebilir olsun! */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-300/90 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>Masadaki Oyuncular ({room.currentPlayers.length}/{room.maxPlayers}):</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {isFull ? '🔴 Masa Dolu' : `🟢 ${emptySlots} Koltuk Boş`}
                      </span>
                    </div>

                    {/* Prominent List of Player Names in the Room */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {room.currentPlayers.map((player) => (
                        <div
                          key={player.id}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${
                            player.isSpeaking
                              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/40'
                              : 'bg-[#23150d] border-white/10 text-stone-200'
                          }`}
                        >
                          <span className="text-base">{player.avatar}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold truncate text-[11px] leading-tight">
                              {player.name}
                            </span>
                            <span className="text-[9px] text-stone-400 leading-tight">
                              {player.isHost ? '👑 Masa Sahibi' : isLive ? (player.isSpeaking ? '🎙️ Konuşuyor' : '🔉 Bağlı') : 'Oyuncu'}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Empty Slots */}
                      {Array.from({ length: emptySlots }).map((_, idx) => (
                        <div
                          key={`empty-${idx}`}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-dashed border-white/10 bg-black/20 text-stone-500 text-xs"
                        >
                          <span className="text-stone-600">🪑</span>
                          <span className="text-[10px] italic">+ Boş Koltuk</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Action Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-[10px] text-stone-400">
                      Kurucu: <b className="text-stone-300">{room.creatorName}</b>
                    </span>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 group-hover:scale-105 active:scale-95 shadow ${
                        isUserInRoom
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 hover:from-amber-500 hover:to-amber-600'
                      }`}
                    >
                      <span>{isUserInRoom ? 'Masanıza Dön' : 'Masaya Otur & Oyna'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
