import React from 'react';
import { Volume2, VolumeX, Music, BellRing, Sparkles, BarChart3, Trophy, Compass, MapPin } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { UserProfile } from '../services/statsService';
import { VenueId, VENUES } from '../types/venue';

interface TopNavigationProps {
  currentView: 'tavla' | 'okey' | 'satranc' | 'dama';
  onSelectView: (view: 'tavla' | 'okey' | 'satranc' | 'dama') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ambiancePlaying: boolean;
  onToggleAmbiance: () => void;
  onOpenWaiter: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  userProfile?: UserProfile;
  selectedVenue: VenueId;
  onOpenVenueModal: () => void;
  onOpenRoomsLobby: () => void;
  activeRoomTitle?: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentView,
  onSelectView,
  soundEnabled,
  onToggleSound,
  ambiancePlaying,
  onToggleAmbiance,
  onOpenWaiter,
  onOpenRules,
  onOpenStats,
  userProfile,
  selectedVenue,
  onOpenVenueModal,
  onOpenRoomsLobby,
  activeRoomTitle,
}) => {
  const currentVenueTheme = VENUES[selectedVenue] || VENUES.tarihi_han;

  const renderActionControls = (compact: boolean = false) => (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* Player Profile & Avatar Pill */}
      {userProfile && (
        <button
          onClick={onOpenStats}
          title={`${userProfile.name} (${userProfile.title}) - Avatar Seç & İstatistikler`}
          className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-lg bg-[#271810] border border-[#c89d56]/40 hover:border-[#c89d56] text-[#f5d58d] hover:bg-[#382216] transition-all cursor-pointer shrink-0"
        >
          <span className="text-sm sm:text-base">{userProfile.avatar}</span>
          <span className={`text-xs font-semibold ${compact ? 'hidden md:inline' : 'hidden lg:inline'} whitespace-nowrap`}>
            {userProfile.name}
          </span>
        </button>
      )}

      {/* Sound Toggle */}
      <button
        onClick={onToggleSound}
        title={soundEnabled ? 'Sesleri Kapat' : 'Sesleri Aç'}
        aria-label={soundEnabled ? 'Sesleri Kapat' : 'Sesleri Aç'}
        className="p-1.5 sm:p-2 rounded-lg bg-[#271810] border border-[#c89d56]/20 text-[#c89d56] hover:bg-[#382216] transition-colors shrink-0"
      >
        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
      </button>

      {/* Ambiance Music Toggle */}
      <button
        onClick={onToggleAmbiance}
        title={
          ambiancePlaying
            ? 'Kafe Müziğini Kapat'
            : `${currentVenueTheme.name} Ambiyans Müziğini Başlat`
        }
        aria-label={ambiancePlaying ? 'Kafe Müziğini Kapat' : 'Müziği Başlat'}
        className={`p-1.5 sm:p-2 rounded-lg border transition-colors shrink-0 ${
          ambiancePlaying
            ? 'bg-[#c89d56]/20 border-[#c89d56] text-[#f5d58d]'
            : 'bg-[#271810] border-[#c89d56]/20 text-[#c89d56] hover:bg-[#382216]'
        }`}
      >
        <Music className={`w-4 h-4 ${ambiancePlaying ? 'animate-pulse' : ''}`} />
      </button>

      {/* Çaycı / Garson Çağır Butonu */}
      <button
        type="button"
        onClick={() => {
          sounds.playWaiterBell();
          onOpenWaiter();
        }}
        title="Çaycı / Garson Çağır (Çay, Kahve, İkramlar)"
        aria-label="Çaycı Çağır"
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs shadow-md border border-amber-300/80 transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
      >
        <span className="text-sm">☕</span>
        <span className="font-extrabold tracking-wide">Çaycı</span>
      </button>
    </div>
  );

  return (
    <header className="w-full bg-[#1b120c]/95 backdrop-blur-md border-b border-[#c89d56]/25 sticky top-0 z-40 px-2 sm:px-4 lg:px-6 py-2 sm:py-2.5 transition-colors shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5 xl:gap-4">
        {/* Zone 1 & Upper Row on Mobile/Tablet */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full xl:w-auto shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onSelectView('tavla');
              }}
              className="text-base sm:text-lg lg:text-xl font-black tracking-wider uppercase font-serif-royal gold-gradient-text hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              ROYAL VIP CAFE
            </a>

            {/* Quick Venue Badge / Switcher Trigger */}
            <button
              type="button"
              onClick={onOpenVenueModal}
              title={`Mekan Değiştir (Şu anki mekan: ${currentVenueTheme.name})`}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#271810] border border-[#c89d56]/30 hover:border-[#c89d56] text-[11px] sm:text-xs text-[#f5d58d] hover:bg-[#341d11] transition-all cursor-pointer shadow-sm group shrink-0"
            >
              <span>{currentVenueTheme.icon}</span>
              <span className="font-semibold text-[11px] group-hover:text-amber-200 hidden xs:inline whitespace-nowrap">
                {currentVenueTheme.name}
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full uppercase font-bold">
                Mekan
              </span>
            </button>
          </div>

          {/* Action controls on mobile & tablet screens (<xl) */}
          <div className="flex xl:hidden items-center shrink-0">
            {renderActionControls(true)}
          </div>
        </div>

        {/* Zone 2: Horizontally scrollable Navigation & Category Bar */}
        <nav
          aria-label="Oyun ve Salon Kategorileri"
          className="w-full xl:w-auto flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 text-xs sm:text-sm font-medium overflow-x-auto whitespace-nowrap no-scrollbar sm:thin-gold-scrollbar scroll-smooth py-1 px-0.5 xl:py-0 border-t border-[#c89d56]/15 xl:border-t-0"
        >
          {/* Salon & Odalar Hub Button */}
          <button
            type="button"
            onClick={onOpenRoomsLobby}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-700/60 to-amber-900/70 hover:from-amber-600 hover:to-amber-800 text-amber-200 border border-amber-500/40 hover:border-amber-400 font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            title="Tüm oyunların canlı sesli ve tek kişilik odalarını gör / oda kur"
          >
            <span>🏛️</span>
            <span>Salon & Odalar</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </button>

          {/* Tavla Masası */}
          <button
            type="button"
            onClick={() => onSelectView('tavla')}
            className={`transition-all relative py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              currentView === 'tavla'
                ? 'text-[#f5d58d] font-bold bg-[#341d11] border border-[#c89d56]/60 shadow-[0_0_12px_rgba(200,157,86,0.25)]'
                : 'text-[#d4c5b3] hover:text-[#f4ecd8] hover:bg-[#25150d] border border-transparent'
            }`}
          >
            <span>🎲</span>
            <span>Tavla Masası</span>
            {currentView === 'tavla' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#c89d56] to-transparent rounded-full" />
            )}
          </button>

          {/* Okey Masası */}
          <button
            type="button"
            onClick={() => onSelectView('okey')}
            className={`transition-all relative py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              currentView === 'okey'
                ? 'text-[#f5d58d] font-bold bg-[#341d11] border border-[#c89d56]/60 shadow-[0_0_12px_rgba(200,157,86,0.25)]'
                : 'text-[#d4c5b3] hover:text-[#f4ecd8] hover:bg-[#25150d] border border-transparent'
            }`}
          >
            <span>🀄</span>
            <span>Okey Masası</span>
            {currentView === 'okey' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#c89d56] to-transparent rounded-full" />
            )}
          </button>

          {/* Satranç 3D VIP */}
          <button
            type="button"
            onClick={() => onSelectView('satranc')}
            className={`transition-all relative py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              currentView === 'satranc'
                ? 'text-[#f5d58d] font-bold bg-[#341d11] border border-[#c89d56]/60 shadow-[0_0_12px_rgba(200,157,86,0.25)]'
                : 'text-[#d4c5b3] hover:text-[#f4ecd8] hover:bg-[#25150d] border border-transparent'
            }`}
          >
            <span>♟️</span>
            <span>Satranç 3D</span>
            <span className="text-[9px] bg-amber-500/25 text-amber-300 px-1.5 py-0.2 rounded-full font-bold border border-amber-500/30">
              VIP
            </span>
            {currentView === 'satranc' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#c89d56] to-transparent rounded-full" />
            )}
          </button>

          {/* Dama 3D VIP */}
          <button
            type="button"
            onClick={() => onSelectView('dama')}
            className={`transition-all relative py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              currentView === 'dama'
                ? 'text-[#f5d58d] font-bold bg-[#341d11] border border-[#c89d56]/60 shadow-[0_0_12px_rgba(200,157,86,0.25)]'
                : 'text-[#d4c5b3] hover:text-[#f4ecd8] hover:bg-[#25150d] border border-transparent'
            }`}
          >
            <span>⚪</span>
            <span>Dama 3D</span>
            <span className="text-[9px] bg-amber-500/25 text-amber-300 px-1.5 py-0.2 rounded-full font-bold border border-amber-500/30">
              VIP
            </span>
            {currentView === 'dama' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#c89d56] to-transparent rounded-full" />
            )}
          </button>

          {/* Mekan Değiştir Butonu */}
          <button
            type="button"
            onClick={onOpenVenueModal}
            className="transition-all py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 shrink-0 whitespace-nowrap text-[#d4c5b3] hover:text-[#f5d58d] hover:bg-[#25150d] border border-transparent cursor-pointer"
            title="Tarihi Han, Boğaz Yalısı, Sultan Köşkü vb. mekan seçimi"
          >
            <span>{currentVenueTheme.icon}</span>
            <span>Mekan</span>
          </button>

          {/* İstatistikler */}
          <button
            type="button"
            onClick={onOpenStats}
            className="transition-all py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 shrink-0 whitespace-nowrap text-[#d4c5b3] hover:text-[#f5d58d] hover:bg-[#25150d] border border-transparent cursor-pointer"
            title="Oyun istatistikleri ve profil"
          >
            <BarChart3 className="w-4 h-4 text-[#c89d56]" />
            <span>İstatistikler</span>
          </button>

          {/* Kurallar */}
          <button
            type="button"
            onClick={onOpenRules}
            className="transition-all py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 shrink-0 whitespace-nowrap text-[#d4c5b3] hover:text-[#f4ecd8] hover:bg-[#25150d] border border-transparent cursor-pointer"
            title="Tavla, Okey, Satranç ve Dama kuralları"
          >
            <span className="text-sm">📖</span>
            <span>Kurallar</span>
          </button>
        </nav>

        {/* Zone 3: Desktop Action Controls (xl:flex) */}
        <div className="hidden xl:flex items-center shrink-0">
          {renderActionControls(false)}
        </div>
      </div>
    </header>
  );
};
