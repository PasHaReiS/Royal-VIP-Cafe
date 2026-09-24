import React, { useState } from 'react';
import { X, Plus, Radio, User, Sparkles, Volume2, Shield } from 'lucide-react';
import { GameType, RoomType } from '../types/rooms';
import { roomService } from '../services/roomService';
import { sounds } from '../services/soundEffects';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGame?: GameType;
  userName: string;
  userAvatar: string;
  onRoomCreated: (roomId: string, gameType: GameType) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  defaultGame = 'okey',
  userName,
  userAvatar,
  onRoomCreated,
}) => {
  const [gameType, setGameType] = useState<GameType>(defaultGame);
  const [roomType, setRoomType] = useState<RoomType>('live_voice');
  const [title, setTitle] = useState('');
  const [stake, setStake] = useState('11 Puan Klasik');
  const [description, setDescription] = useState('');
  const [hasVoiceChat, setHasVoiceChat] = useState(true);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playOkeyTileTap();

    const maxPlayers = gameType === 'okey' ? 4 : 2;
    const finalTitle = title.trim() || (
      roomType === 'live_voice'
        ? `${userName}'in Canlı ${gameType.toUpperCase()} Masası`
        : `${userName}'in Özel ${gameType.toUpperCase()} Masası`
    );

    const room = roomService.createRoom({
      title: finalTitle,
      gameType,
      roomType,
      hasVoiceChat: roomType === 'live_voice' ? hasVoiceChat : false,
      maxPlayers,
      stake: stake || 'Dostluk / Çayına',
      description: description.trim(),
      creatorName: userName,
      creatorAvatar: userAvatar,
    });

    onRoomCreated(room.id, gameType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#180f0a] border-2 border-[#c89d56]/60 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-stone-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c89d56]/25 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-stone-950 font-bold shadow-md">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-royal text-[#f5d58d]">
                Yeni Kıraathane Odası Kur
              </h2>
              <p className="text-[11px] text-[#b3a18f]">
                Salondaki tüm oyuncuların görebileceği canlı veya tek kişilik masa açın
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          {/* 1. Game Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#f5d58d] uppercase tracking-wider">
              1. Hangi Oyun İçin Oda Kurulacak?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'okey', label: 'Okey & 101', icon: '🀄', players: '4 Kişilik' },
                { id: 'tavla', label: 'Tavla Masası', icon: '🎲', players: '2 Kişilik' },
                { id: 'satranc', label: 'Satranç 3D', icon: '♟️', players: '2 Kişilik' },
                { id: 'dama', label: 'Dama 3D', icon: '⚪', players: '2 Kişilik' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGameType(g.id as GameType)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    gameType === g.id
                      ? 'bg-gradient-to-b from-amber-700/50 to-amber-900/60 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 shadow-lg font-bold'
                      : 'bg-black/30 border-white/10 text-stone-300 hover:border-amber-400/40'
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-xs font-bold">{g.label}</span>
                  <span className="text-[9px] opacity-70 font-mono">{g.players}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Room Type: Live Voice vs Solo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#f5d58d] uppercase tracking-wider">
              2. Oda Tipi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setRoomType('live_voice');
                  setHasVoiceChat(true);
                }}
                className={`p-3 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer text-left ${
                  roomType === 'live_voice'
                    ? 'bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400/40 shadow-lg'
                    : 'bg-black/30 border-white/10 text-stone-400 hover:border-emerald-500/30'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${roomType === 'live_voice' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-stone-400'}`}>
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>🎙️ Canlı & Sesli Oda</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      Canlı Sohbet
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Gerçek mikrofon desteği, canlı sesli konuşma ve masadaki oyuncuların canlı isim gösterimi.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoomType('solo_private');
                  setHasVoiceChat(false);
                }}
                className={`p-3 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer text-left ${
                  roomType === 'solo_private'
                    ? 'bg-gradient-to-r from-amber-950/80 to-stone-900/80 border-amber-400 text-amber-100 ring-2 ring-amber-400/40 shadow-lg'
                    : 'bg-black/30 border-white/10 text-stone-400 hover:border-amber-500/30'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${roomType === 'solo_private' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-stone-400'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>👤 Tek Kişilik Özel Masa</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                      Birebir
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Yapay zeka usta rakiplere karşı rahatça tek başınıza antrenman yapıp taktik deneyin.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Room Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#f5d58d]">
              Masa / Oda Adı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Örn: ${userName}'in Canlı Şampiyonlar Masası`}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#c89d56]/40 text-[#f5d58d] text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              maxLength={45}
            />
          </div>

          {/* 4. Stake / Puan / Hedef */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#f5d58d]">
                Oyun Hedefi / Bahis
              </label>
              <select
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-[#c89d56]/40 text-stone-200 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="11 Puan Klasik">11 Puan Klasik</option>
                <option value="22 Puan VIP">22 Puan VIP</option>
                <option value="5 Puanlık Seri">5 Puanlık Seri</option>
                <option value="Dostluk / Çayına">Dostluk / Çayına</option>
                <option value="Dereceli / Elo">Dereceli / Elo</option>
                <option value="Serbest Antrenman">Serbest Antrenman</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#f5d58d]">
                Oda Kurucu (Siz)
              </label>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-amber-200 font-medium">
                <span className="text-base">{userAvatar}</span>
                <span>{userName} (Masa Sahibi)</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#c89d56]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 border border-white/10 text-stone-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-xs font-black shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 uppercase tracking-wide"
            >
              <Plus className="w-4 h-4" />
              <span>Odayı Aç & Masaya Otur</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
