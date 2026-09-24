import React, { useState } from 'react';
import {
  X,
  Trophy,
  Flame,
  Clock,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Award,
  Swords,
  Layers,
  Percent,
  UserCheck,
  Check,
} from 'lucide-react';
import {
  SalonStats,
  UserProfile,
  PLAYER_AVATARS,
  formatDuration,
  resetSalonStats,
  saveUserProfile,
} from '../services/statsService';
import { sounds } from '../services/soundEffects';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SalonStats;
  onStatsUpdate: (stats: SalonStats) => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  defaultTab?: 'tavla' | 'okey' | 'satranc' | 'dama';
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onStatsUpdate,
  userProfile,
  onUpdateProfile,
  defaultTab = 'tavla',
}) => {
  const [activeTab, setActiveTab] = useState<'tavla' | 'okey' | 'satranc' | 'dama'>(defaultTab);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  if (!isOpen) return null;

  const currentStats = stats[activeTab];
  const winRate =
    currentStats.gamesPlayed > 0
      ? Math.round((currentStats.wins / currentStats.gamesPlayed) * 100)
      : 0;

  const handleReset = () => {
    sounds.playOkeyTileTap();
    const fresh = resetSalonStats();
    onStatsUpdate(fresh);
    setShowResetConfirm(false);
  };

  const handleSelectAvatar = (avatarEmoji: string, title: string) => {
    sounds.playOkeyTileTap();
    const nextProfile: UserProfile = {
      ...userProfile,
      avatar: avatarEmoji,
      title,
    };
    saveUserProfile(nextProfile);
    onUpdateProfile(nextProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#21130a] via-[#1a0e07] to-[#120904] border border-[#c89d56]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-[#c89d56]/20 bg-[#2b170e]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-[#c89d56]/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {userProfile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#f5d58d] font-serif-royal">
                  {userProfile.name}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium">
                  {userProfile.title}
                </span>
              </div>
              <p className="text-[11px] text-[#bdae9c]">
                Oyuncu profili, avatar seçimi ve masa istatistikleri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#b8a796] hover:text-[#f5d58d] hover:bg-[#382216] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Avatar Selection Card */}
        <div className="bg-[#180b05] border-b border-[#c89d56]/20 px-5 py-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#f5d58d]">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Oyuncu Avatarı & Unvanı</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              className="text-[11px] text-amber-400/90 hover:text-amber-200 transition-colors font-medium underline cursor-pointer"
            >
              {isEditingAvatar ? 'Avatar Listesini Gizle' : 'Avatarı Değiştir'}
            </button>
          </div>

          {/* Quick Avatar Row (Always visible or expanded) */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {PLAYER_AVATARS.map((av) => {
              const isSelected = userProfile.avatar === av.emoji;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => handleSelectAvatar(av.emoji, av.title)}
                  title={`${av.name} - ${av.title}: ${av.description}`}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-md'
                      : 'bg-[#25130b] border-[#c89d56]/20 hover:border-[#c89d56]/60 hover:bg-[#30190f]'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{av.emoji}</span>
                  <span className="text-[9px] text-[#eeddc5] mt-1 font-semibold truncate w-full text-center">
                    {av.name}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center text-black text-[8px] font-black shadow">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isEditingAvatar && (
            <div className="p-2.5 rounded-xl bg-[#231209] border border-amber-500/20 text-xs text-[#d8c8b6] animate-in fade-in duration-150">
              <span className="font-semibold text-amber-300">Seçili Unvan: </span>
              <span>{userProfile.title} — Bu avatarınız hem Tavla tahtasında hem de Okey masanızın köşesinde profiliniz olarak sergilenecektir.</span>
            </div>
          )}
        </div>

        {/* Game Tab Switcher */}
        <div className="grid grid-cols-4 border-b border-[#c89d56]/20 bg-[#1c0f08] px-3 pt-2 gap-1">
          <button
            onClick={() => setActiveTab('tavla')}
            className={`pb-2.5 font-semibold text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tavla'
                ? 'border-[#c89d56] text-[#f5d58d] font-bold bg-[#c89d56]/5 rounded-t-xl'
                : 'border-transparent text-[#a89582] hover:text-[#f4ecd8]'
            }`}
          >
            <span>🎲</span>
            <span>Tavla</span>
          </button>
          <button
            onClick={() => setActiveTab('okey')}
            className={`pb-2.5 font-semibold text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'okey'
                ? 'border-[#c89d56] text-[#f5d58d] font-bold bg-[#c89d56]/5 rounded-t-xl'
                : 'border-transparent text-[#a89582] hover:text-[#f4ecd8]'
            }`}
          >
            <span>🀄</span>
            <span>Okey</span>
          </button>
          <button
            onClick={() => setActiveTab('satranc')}
            className={`pb-2.5 font-semibold text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'satranc'
                ? 'border-[#c89d56] text-[#f5d58d] font-bold bg-[#c89d56]/5 rounded-t-xl'
                : 'border-transparent text-[#a89582] hover:text-[#f4ecd8]'
            }`}
          >
            <span>♟️</span>
            <span>Satranç</span>
          </button>
          <button
            onClick={() => setActiveTab('dama')}
            className={`pb-2.5 font-semibold text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'dama'
                ? 'border-[#c89d56] text-[#f5d58d] font-bold bg-[#c89d56]/5 rounded-t-xl'
                : 'border-transparent text-[#a89582] hover:text-[#f4ecd8]'
            }`}
          >
            <span>⚪</span>
            <span>Dama</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-[#ded3c3]">
          {/* Main Key Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Games Played */}
            <div className="p-3.5 rounded-2xl bg-[#26150c] border border-[#c89d56]/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#a89582] text-xs">
                <span>Oynanan</span>
                <Swords className="w-3.5 h-3.5 text-[#c89d56]" />
              </div>
              <div className="mt-2 text-2xl font-black text-[#f5d58d] font-serif-royal">
                {currentStats.gamesPlayed}
              </div>
              <div className="text-[10px] text-[#8a7968] mt-0.5">Toplam Maç</div>
            </div>

            {/* 2. Wins */}
            <div className="p-3.5 rounded-2xl bg-[#1b2612]/60 border border-emerald-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400/90 text-xs">
                <span>Galibiyet</span>
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-300 font-serif-royal">
                {currentStats.wins}
              </div>
              <div className="text-[10px] text-emerald-500/70 mt-0.5">Kazanılan El</div>
            </div>

            {/* 3. Losses */}
            <div className="p-3.5 rounded-2xl bg-[#2b1411]/60 border border-red-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-red-400/90 text-xs">
                <span>Mağlubiyet</span>
                <Percent className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-red-300 font-serif-royal">
                {currentStats.losses}
              </div>
              <div className="text-[10px] text-red-500/70 mt-0.5">Kaybedilen El</div>
            </div>

            {/* 4. Total Duration */}
            <div className="p-3.5 rounded-2xl bg-[#26150c] border border-[#c89d56]/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#a89582] text-xs">
                <span>Süre</span>
                <Clock className="w-3.5 h-3.5 text-[#c89d56]" />
              </div>
              <div className="mt-2 text-xl font-bold text-[#f5d58d] font-serif-royal truncate">
                {formatDuration(currentStats.totalDurationSeconds)}
              </div>
              <div className="text-[10px] text-[#8a7968] mt-0.5">Masada Geçen</div>
            </div>
          </div>

          {/* Win Rate Progress Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#24130a] via-[#2d180d] to-[#24130a] border border-[#c89d56]/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#f5d58d]">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Kazanma Oranı (Win Rate)</span>
              </div>
              <span className="text-sm font-black text-amber-300">%{winRate}</span>
            </div>

            {/* Modern Dual Color Bar */}
            <div className="h-3 w-full bg-[#170a04] rounded-full overflow-hidden border border-[#c89d56]/20 flex">
              <div
                style={{ width: `${winRate}%` }}
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 rounded-l-full transition-all duration-700 relative"
              />
              <div
                style={{ width: `${100 - winRate}%` }}
                className="h-full bg-gradient-to-r from-red-950 to-red-900 rounded-r-full transition-all duration-700"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#9c8978] pt-1">
              <span>{currentStats.wins} Galibiyet (%{winRate})</span>
              <span>
                {currentStats.losses} Mağlubiyet (%
                {currentStats.gamesPlayed > 0 ? 100 - winRate : 0})
              </span>
            </div>
          </div>

          {/* Special Game Feats & Badges */}
          <div className="p-4 rounded-2xl bg-[#1c0f08] border border-[#c89d56]/20 space-y-3">
            <h4 className="text-xs font-bold text-[#f5d58d] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeTab === 'tavla' ? 'Özel Tavla Başarıları' : 'Özel Okey Başarıları'}</span>
            </h4>

            {activeTab === 'tavla' ? (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#26150c] border border-[#c89d56]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <div>
                      <div className="text-xs font-semibold text-[#eeddc5]">Mars Galibiyeti</div>
                      <div className="text-[10px] text-[#9c8978]">Rakip pul toplayamadan</div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-amber-400 font-serif-royal">
                    {currentStats.marsWins || 0}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#26150c] border border-[#c89d56]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👑</span>
                    <div>
                      <div className="text-xs font-semibold text-[#eeddc5]">Katmerli Mars</div>
                      <div className="text-[10px] text-[#9c8978]">Barda / evinizde kaldığında</div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-amber-400 font-serif-royal">
                    {currentStats.katmerliMarsWins || 0}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#26150c] border border-[#c89d56]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <div>
                      <div className="text-xs font-semibold text-[#eeddc5]">Okey Atma</div>
                      <div className="text-[10px] text-[#9c8978]">Okey taşıyla bitiş</div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-amber-400 font-serif-royal">
                    {currentStats.okeyFinishCount || 0}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#26150c] border border-[#c89d56]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🀄</span>
                    <div>
                      <div className="text-xs font-semibold text-[#eeddc5]">Normal Per Bitişi</div>
                      <div className="text-[10px] text-[#9c8978]">14 taş seri & renkli</div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-amber-400 font-serif-royal">
                    {Math.max(0, currentStats.wins - (currentStats.okeyFinishCount || 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Reset Stats section */}
          <div className="pt-2 border-t border-[#c89d56]/15 flex items-center justify-between text-xs">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-[#968270] hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>İstatistikleri Sıfırla</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#2d120d] p-1.5 px-3 rounded-xl border border-red-500/30">
                <span className="text-red-300 text-[11px]">Tüm kayıtlar silinsin mi?</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] cursor-pointer"
                >
                  Evet
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-0.5 rounded bg-[#412117] text-[#c4b5a3] hover:text-white text-[11px] cursor-pointer"
                >
                  Vazgeç
                </button>
              </div>
            )}

            <span className="text-[#7d6c5d] text-[11px] italic">
              Kayıtlar tarayıcı hafızasında saklanır
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
