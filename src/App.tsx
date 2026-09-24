/**
 * Royal VIP Cafe - Tavla & Okey Salonu
 * Ultra luxury Turkish VIP Cafe experience with authentic Backgammon and 4-Player Okey tables.
 */

import React, { useState, useEffect } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { TavlaBoard } from './components/TavlaBoard';
import { OkeyTable } from './components/OkeyTable';
import { Chess3DTable } from './components/Chess3DTable';
import { Dama3DTable } from './components/Dama3DTable';
import { CafeWaiterModal, CafeOrder } from './components/CafeWaiterModal';
import { CafeItemRealisticImage } from './components/CafeItemRealisticImage';
import { RulesModal } from './components/RulesModal';
import { StatsModal } from './components/StatsModal';
import { VenueSelectorModal } from './components/VenueSelectorModal';
import { RoomsLobbyModal } from './components/RoomsLobbyModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { ActiveVoiceRoomWidget } from './components/ActiveVoiceRoomWidget';
import { roomService } from './services/roomService';
import { GameRoom, GameType } from './types/rooms';
import { VenueId, VENUES } from './types/venue';
import {
  loadSalonStats,
  recordGameResult,
  SalonStats,
  loadUserProfile,
  saveUserProfile,
  UserProfile,
} from './services/statsService';
import { sounds } from './services/soundEffects';
import { Sparkles, Coffee, ShieldCheck, Flame, BarChart3, MapPin, Radio, Plus, Users } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'tavla' | 'okey' | 'satranc' | 'dama'>('tavla');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ambiancePlaying, setAmbiancePlaying] = useState<boolean>(false);
  const [isWaiterOpen, setIsWaiterOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueId>('tarihi_han');
  const [salonStats, setSalonStats] = useState<SalonStats>(() => loadSalonStats());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  // Single-screen locked viewport state for Okey table
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(true);

  // Rooms & Live Voice Chat states
  const [isRoomsLobbyOpen, setIsRoomsLobbyOpen] = useState<boolean>(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState<boolean>(false);
  const [roomsLobbyInitialFilter, setRoomsLobbyInitialFilter] = useState<GameType | 'all'>('all');
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(() => {
    const existing = roomService.getActiveRoom();
    if (existing) return existing;
    // Default to the first available room for tavla
    const all = roomService.getRooms();
    return all.find((r) => r.gameType === 'tavla') || all[0] || null;
  });

  // Sync active room changes from roomService
  useEffect(() => {
    const unsub = roomService.subscribe((_rooms, active) => {
      setActiveRoom(active);
    });
    return unsub;
  }, []);

  // When view changes manually, if current active room doesn't match, auto-connect to that game's live room
  const handleSelectGameView = (view: 'tavla' | 'okey' | 'satranc' | 'dama') => {
    setCurrentView(view);
    if (!activeRoom || activeRoom.gameType !== view) {
      const match = roomService.getRooms().find((r) => r.gameType === view);
      if (match) {
        roomService.joinRoom(match.id, userProfile.name, userProfile.avatar);
      }
    }
  };

  // Waiter notice toast ('Boşlar toplanıyor...', 'Siparişiniz masanızda...')
  const [waiterNotice, setWaiterNotice] = useState<{
    text: string;
    subtext: string;
    action: 'empty_cleared' | 'new_order';
  } | null>(null);

  // Initial welcome tea order on table
  const [activeOrders, setActiveOrders] = useState<CafeOrder[]>([
    {
      id: 'cay',
      name: 'Tavşan Kanı Rize Çayı',
      icon: '🍵',
      description: 'İnce belli kristal bardakta, taze demlenmiş mis kokulu Karadeniz çayı.',
      category: 'icecek',
    },
  ]);

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
  };

  const handleToggleAmbiance = () => {
    if (ambiancePlaying) {
      sounds.stopAmbiance();
      setAmbiancePlaying(false);
    } else {
      sounds.startVenueAmbiance(selectedVenue);
      setAmbiancePlaying(true);
    }
  };

  const handleSelectVenue = (venueId: VenueId) => {
    setSelectedVenue(venueId);
    if (ambiancePlaying) {
      sounds.startVenueAmbiance(venueId);
    }
  };

  // Yeni sipariş geldiğinde önceki boşları topla ve yeni siparişi servis et
  const handleAddOrder = (order: CafeOrder) => {
    const hadPreviousOrders = activeOrders.length > 0;
    // Masadaki eski boşları kaldırıp taze siparişi yerleştiriyoruz
    setActiveOrders([order]);
    sounds.playTeaService();
    sounds.playOkeyTileTap();

    if (hadPreviousOrders) {
      setWaiterNotice({
        text: '🧹 Masadaki boşlar toplandı!',
        subtext: `Çaycı Rıza: "Önceki boşları hemen aldım abi, taze ${order.name} masanızda! Afiyet şeker olsun!"`,
        action: 'empty_cleared',
      });
    } else {
      setWaiterNotice({
        text: '☕ Siparişiniz masanızda!',
        subtext: `Çaycı Rıza: "Taze ${order.name} servis edildi abi, afiyet olsun!"`,
        action: 'new_order',
      });
    }
  };

  // Masadaki boşları toplatma
  const handleClearEmptyOrders = () => {
    if (activeOrders.length === 0) return;
    setActiveOrders([]);
    sounds.playOkeyTileTap();
    setWaiterNotice({
      text: '🧹 Boşlar toplanıyor...',
      subtext: 'Çaycı Rıza: "Masadaki boşları topladım, masanız pırıl pırıl oldu abi! Bir emriniz olursa buradayım."',
      action: 'empty_cleared',
    });
  };

  // Otomatik bildirim temizleme
  useEffect(() => {
    if (!waiterNotice) return;
    const timer = setTimeout(() => {
      setWaiterNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [waiterNotice]);

  const handleRecordStats = (
    game: 'tavla' | 'okey',
    isWin: boolean,
    durationSeconds: number,
    extra?: { winType?: string }
  ) => {
    const updated = recordGameResult(game, isWin, durationSeconds, extra);
    setSalonStats({ ...updated });
  };

  const activeVenueInfo = VENUES[selectedVenue];

  return (
    <div className={`min-h-screen ${activeVenueInfo.wallTextureClass} text-[#f4ecd8] flex flex-col selection:bg-[#c89d56] selection:text-black transition-colors duration-700`}>
      {/* 3-Zone Top Navigation Contract */}
      <TopNavigation
        currentView={currentView}
        onSelectView={handleSelectGameView}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        ambiancePlaying={ambiancePlaying}
        onToggleAmbiance={handleToggleAmbiance}
        onOpenWaiter={() => setIsWaiterOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        selectedVenue={selectedVenue}
        onOpenVenueModal={() => setIsVenueModalOpen(true)}
        onOpenRoomsLobby={() => {
          setRoomsLobbyInitialFilter(currentView);
          setIsRoomsLobbyOpen(true);
        }}
        activeRoomTitle={activeRoom?.title}
        userProfile={userProfile}
      />

      {/* Active Room Voice Chat & Players Bar (Canlı & Sesli Kıraathane Odası Widget'ı) */}
      {activeRoom ? (
        <ActiveVoiceRoomWidget
          activeRoom={activeRoom}
          onLeaveRoom={() => {
            roomService.leaveRoom();
            setActiveRoom(null);
          }}
          onOpenLobby={() => {
            setRoomsLobbyInitialFilter(currentView);
            setIsRoomsLobbyOpen(true);
          }}
        />
      ) : (
        <div className="w-full bg-[#180f09] border-b border-amber-500/20 px-3 py-1.5 flex items-center text-xs text-amber-200/90 z-20">
          <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-stone-300 truncate">
                Kıraathane Odaları Salonu Açık: Canlı sesli veya tek kişilik masalara katılabilirsiniz.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setRoomsLobbyInitialFilter(currentView);
                setIsRoomsLobbyOpen(true);
              }}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/30 cursor-pointer transition-all shrink-0 whitespace-nowrap"
            >
              🏛️ Masadakileri Gör & Odaya Gir
            </button>
          </div>
        </div>
      )}

      {/* Canlı Çaycı Bildirim Banner'ı (Boşlar Toplanıyor / Yeni Sipariş Servisi) */}
      {waiterNotice && (
        <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto max-w-lg w-[95%]">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#2a170d] via-[#3a2012] to-[#25130a] border-2 border-amber-400/80 shadow-[0_12px_32px_rgba(0,0,0,0.85)] text-[#f4ecd8] backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-lg shrink-0 shadow-inner">
              {waiterNotice.action === 'empty_cleared' ? '🧹' : '☕'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-amber-300 font-serif-royal flex items-center gap-1.5">
                <span>{waiterNotice.text}</span>
                <span className="text-[10px] bg-amber-500/25 text-amber-200 px-1.5 py-0.2 rounded-full font-mono font-semibold">
                  Çay Ocağı
                </span>
              </div>
              <p className="text-[11px] text-stone-200 italic truncate mt-0.5 font-medium">
                {waiterNotice.subtext}
              </p>
            </div>
            <button
              onClick={() => setWaiterNotice(null)}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-xs cursor-pointer shrink-0 transition-colors"
              title="Kapat"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-7xl mx-auto px-1 sm:px-3 lg:px-4 flex flex-col transition-all min-h-0 ${
        currentView === 'okey'
          ? 'min-h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden py-0.5 justify-between'
          : 'py-2 sm:py-4 gap-3'
      }`}>
        {/* Salon Atmosphere Kicker & Cafe Mood (Sadece Tavla, Satranç, Dama için) */}
        {currentView !== 'okey' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 rounded-xl bg-gradient-to-r from-[#1c110a]/90 via-[#24160d]/90 to-[#1a0e08]/90 border border-[#c89d56]/25 shadow-lg backdrop-blur-sm transition-all shrink-0 p-2.5 sm:p-3">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="rounded-xl bg-[#331c11] border border-[#c89d56]/40 flex items-center justify-center shadow-inner w-9 h-9 sm:w-10 sm:h-10 text-xl shrink-0">
              {currentView === 'tavla'
                ? '🎲'
                : currentView === 'satranc'
                ? '♟️'
                : '⚪'}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base font-bold font-serif-royal text-[#f5d58d] whitespace-nowrap">
                  {currentView === 'tavla'
                    ? 'İran Sedir Ağacı & Hatemkâri Tavla Masası'
                    : currentView === 'satranc'
                    ? 'VIP Masif Ceviz 3D Satranç Masası'
                    : 'VIP Kakmalı Masif 3D Türk Daması'}
                </h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#382114] text-[#d4af37] border border-[#d4af37]/30 font-medium hidden xs:inline whitespace-nowrap">
                  1 vs 1 Canlı
                </span>
                <button
                  type="button"
                  onClick={() => setIsVenueModalOpen(true)}
                  className="flex items-center gap-1 text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-950/70 hover:bg-amber-900/90 text-amber-300 border border-amber-500/40 transition-all cursor-pointer font-bold shrink-0 whitespace-nowrap"
                  title="Mekanı Değiştir"
                >
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{activeVenueInfo.name}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#b3a18f] line-clamp-1">
                {currentView === 'tavla'
                  ? 'Şiraz sedir ağacı, sedef/abanoz torna pullar, çift hamle ve puanlı maç sistemi.'
                  : currentView === 'satranc'
                  ? 'Staunton 3D masif ahşap taşlar, gerçekçi tahta gölgeleri, canlı rakip replikleri ve puanlı maç.'
                  : 'Torna oyma 3D pullar, çok taş yeme kuralı, uçan dama ve canlı kıraathane üstatları.'}
              </p>
            </div>
          </div>

          {/* Quick Cafe Table Perks & Active Waiter Service */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-[#170c07]/90 px-2 sm:px-3 py-1 rounded-xl border border-[#c89d56]/20 text-xs backdrop-blur-sm shrink-0">
            {/* Quick Rooms & Players Button in Kicker */}
            <button
              type="button"
              onClick={() => {
                setRoomsLobbyInitialFilter(currentView);
                setIsRoomsLobbyOpen(true);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 text-[11px] font-bold cursor-pointer transition-all shadow-sm active:scale-95"
              title="Salondaki odaları ve masadaki oyuncuları gör"
            >
              <span>🏛️</span>
              <span className="hidden sm:inline">Odalar & Masadakiler</span>
            </button>

            <button
              onClick={() => setIsStatsOpen(true)}
              className="flex items-center gap-1 text-[11px] text-[#d8c8b6] hover:text-[#f5d58d] transition-colors pr-1.5 border-r border-[#c89d56]/20 cursor-pointer"
              title="Kazanma/Kaybetme Oranları ve Avatarı Değiştir"
            >
              <span className="text-sm">{userProfile.avatar}</span>
              <span className="hidden sm:inline font-semibold">{userProfile.name}:</span>
              <strong className="text-emerald-400">
                {(salonStats[currentView] || { wins: 0 }).wins}G
              </strong>
              <span>-</span>
              <strong className="text-red-400">
                {(salonStats[currentView] || { losses: 0 }).losses}M
              </strong>
            </button>

            {/* DIRECT ÇAYCI ÇAĞIR BUTONU */}
            <button
              type="button"
              onClick={() => {
                sounds.playWaiterBell();
                setIsWaiterOpen(true);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs border border-amber-300 shadow cursor-pointer transition-all active:scale-95 shrink-0"
              title="Çaycıyı masaya çağır (Menüyü Aç)"
            >
              <span className="text-sm">☕</span>
              <span className="font-extrabold tracking-wide">Çaycı Çağır</span>
            </button>

            <Coffee className="w-3.5 h-3.5 text-[#c89d56] hidden sm:inline" />
            <span className="text-[#a89582] text-[10px] hidden md:inline">Masa Servisi:</span>
            <div className="flex items-center gap-1 ml-0.5">
              {activeOrders.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  title={`${ord.name} (Tıkla - Sesli Yudumla)`}
                  onClick={() => {
                    sounds.playTeaService();
                  }}
                  className="cursor-pointer hover:scale-115 transition-transform"
                >
                  <CafeItemRealisticImage itemId={ord.id} size="sm" />
                </button>
              ))}
              {activeOrders.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearEmptyOrders}
                  title="Masadaki boşları toplat (Garson masayı temizlesin)"
                  className="text-[10px] text-stone-400 hover:text-amber-300 ml-1 px-1.5 py-0.5 rounded bg-black/40 border border-white/10 hover:border-amber-400/30 transition-all cursor-pointer flex items-center gap-0.5"
                >
                  <span>🧹</span>
                  <span className="hidden sm:inline">Boşları Topla</span>
                </button>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Active Game Table */}
        <div className={`w-full ${currentView === 'okey' ? 'flex-1 min-h-0 flex flex-col justify-between' : ''}`}>
          {currentView === 'tavla' ? (
            <TavlaBoard
              activeOrders={activeOrders}
              onOpenStats={() => setIsStatsOpen(true)}
              onRecordStats={(isWin, duration, extra) =>
                handleRecordStats('tavla', isWin, duration, extra)
              }
              userProfile={userProfile}
            />
          ) : currentView === 'okey' ? (
            <OkeyTable
              activeOrders={activeOrders}
              onOpenRules={() => setIsRulesOpen(true)}
              onOpenStats={() => setIsStatsOpen(true)}
              onRecordStats={(isWin, duration, extra) =>
                handleRecordStats('okey', isWin, duration, extra)
              }
              userProfile={userProfile}
              isScreenLocked={isScreenLocked}
              onToggleScreenLock={() => setIsScreenLocked((prev) => !prev)}
              onOpenWaiter={() => setIsWaiterOpen(true)}
              onOpenRoomsLobby={() => {
                setRoomsLobbyInitialFilter('okey');
                setIsRoomsLobbyOpen(true);
              }}
            />
          ) : currentView === 'satranc' ? (
            <Chess3DTable activeOrders={activeOrders} />
          ) : (
            <Dama3DTable activeOrders={activeOrders} />
          )}
        </div>
      </main>

      {/* Clean Editorial Footer (Gizlenir: Okey tek ekran sabitleme modunda) */}
      {!(currentView === 'okey' && isScreenLocked) && (
        <footer className="w-full border-t border-[#c89d56]/20 bg-[#140b07]/90 backdrop-blur-sm py-4 px-6 text-xs text-[#8a7665] shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-serif-royal font-semibold text-[#c89d56]">ROYAL VIP CAFE</span>
              <span>·</span>
              <span>{activeVenueInfo.name} / {activeVenueInfo.tagline}</span>
            </div>
            <div className="flex items-center gap-4 text-[#9c8978]">
              <span>Gerçekçi Web Audio Efektleri</span>
              <span>·</span>
              <span>Eksiksiz Oyun Motoru & Puanlı Maçlar</span>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <RoomsLobbyModal
        isOpen={isRoomsLobbyOpen}
        onClose={() => setIsRoomsLobbyOpen(false)}
        onSelectRoom={(room) => {
          setActiveRoom(room);
          setCurrentView(room.gameType);
          setIsRoomsLobbyOpen(false);
        }}
        onOpenCreateModal={() => {
          setIsRoomsLobbyOpen(false);
          setIsCreateRoomOpen(true);
        }}
        userName={userProfile.name}
        userAvatar={userProfile.avatar}
        initialGameFilter={roomsLobbyInitialFilter}
      />

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        defaultGame={roomsLobbyInitialFilter === 'all' ? currentView : roomsLobbyInitialFilter}
        userName={userProfile.name}
        userAvatar={userProfile.avatar}
        onRoomCreated={(roomId, gameType) => {
          const room = roomService.getActiveRoom();
          if (room) {
            setActiveRoom(room);
          }
          setCurrentView(gameType);
          setWaiterNotice({
            text: '🎉 Yeni Oda Kuruldu!',
            subtext: `Masanız başarıyla açıldı, yerinizi aldınız.`,
            action: 'new_order',
          });
        }}
      />

      <VenueSelectorModal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        selectedVenue={selectedVenue}
        onSelectVenue={handleSelectVenue}
      />

      <CafeWaiterModal
        isOpen={isWaiterOpen}
        onClose={() => setIsWaiterOpen(false)}
        activeOrders={activeOrders}
        onAddOrder={handleAddOrder}
        onClearOrders={handleClearEmptyOrders}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        defaultTab={currentView}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={salonStats}
        onStatsUpdate={setSalonStats}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        defaultTab={currentView}
      />
    </div>
  );
}
