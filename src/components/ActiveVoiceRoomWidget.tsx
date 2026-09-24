import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Users, Radio, MessageSquare, ArrowLeftRight, Sparkles } from 'lucide-react';
import { GameRoom } from '../types/rooms';
import { voiceChatService } from '../services/voiceChatService';

interface ActiveVoiceRoomWidgetProps {
  activeRoom: GameRoom;
  onLeaveRoom: () => void;
  onOpenLobby: () => void;
}

export const ActiveVoiceRoomWidget: React.FC<ActiveVoiceRoomWidgetProps> = ({
  activeRoom,
  onLeaveRoom,
  onOpenLobby,
}) => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setIsMicOn(voiceChatService.getMicActive());
    setIsDeafened(voiceChatService.getDeafened());

    const unsubMeter = voiceChatService.subscribe((lvl, speaking) => {
      setVolumeLevel(lvl);
      setIsSpeaking(speaking);
      if (speaking) {
        setActiveSpeaker('Siz');
      }
    });

    const unsubStatus = voiceChatService.subscribeStatus((micActive, deafened) => {
      setIsMicOn(micActive);
      setIsDeafened(deafened);
    });

    return () => {
      unsubMeter();
      unsubStatus();
    };
  }, []);

  const handleToggleMic = async () => {
    const next = voiceChatService.toggleMicrophone();
    setIsMicOn(next);
  };

  const handleToggleDeafen = () => {
    const next = voiceChatService.toggleDeafen();
    setIsDeafened(next);
  };

  const handleBanterRemark = (speakerName: string, text: string) => {
    setActiveSpeaker(speakerName);
    voiceChatService.speakOpponentRemark(speakerName, text);
    setTimeout(() => {
      setActiveSpeaker(null);
    }, 3000);
  };

  const isLiveVoice = activeRoom.roomType === 'live_voice' && activeRoom.hasVoiceChat;

  return (
    <div className="w-full bg-gradient-to-r from-[#170e08]/95 via-[#23150d]/95 to-[#160d07]/95 border-b border-amber-500/30 px-2 sm:px-4 py-1.5 backdrop-blur-md shadow-lg transition-all z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Room Badge & Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenLobby}
            title="Salona Dön & Oda Değiştir"
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 font-bold transition-all active:scale-95 cursor-pointer shadow-sm text-[11px]"
          >
            <ArrowLeftRight className="w-3 h-3 text-amber-400" />
            <span className="hidden xs:inline">Salondan</span> Oda Değiştir
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg">
              {activeRoom.gameType === 'okey' ? '🀄' : activeRoom.gameType === 'tavla' ? '🎲' : activeRoom.gameType === 'satranc' ? '♟️' : '⚪'}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#f5d58d] text-xs sm:text-sm font-serif-royal line-clamp-1">
                  {activeRoom.title}
                </span>
                {isLiveVoice ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold animate-pulse">
                    <Radio className="w-2.5 h-2.5" />
                    <span>Canlı Sesli</span>
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full bg-stone-800/80 border border-stone-600 text-stone-300 text-[9px] font-medium">
                    Tek Kişilik Özel
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#b3a18f]">
                {activeRoom.stake} · {activeRoom.currentPlayers.length}/{activeRoom.maxPlayers} Masada
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Seated Players with Speaking Indicators */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap no-scrollbar py-0.5 max-w-md shrink min-w-0">
          <span className="text-[10px] text-amber-400/80 font-medium hidden sm:inline shrink-0">Masadakiler:</span>
          {activeRoom.currentPlayers.map((player) => {
            const isUser = player.id === 'p-user' || player.name === 'Siz';
            const speakingNow = isUser ? isSpeaking : activeSpeaker === player.name || player.isSpeaking;

            return (
              <div
                key={player.id}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg border transition-all text-[11px] ${
                  speakingNow
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/60 scale-105 shadow-md'
                    : 'bg-[#2a170d]/90 border-[#c89d56]/30 text-[#f5d58d]'
                }`}
                title={`${player.name} ${speakingNow ? '(Şu an konuşuyor)' : ''}`}
              >
                <span className="text-xs sm:text-sm">{player.avatar}</span>
                <span className="font-semibold whitespace-nowrap text-[10px] sm:text-[11px]">{player.name}</span>
                {isLiveVoice && (
                  <span className={`text-[9px] ${speakingNow ? 'text-emerald-300 font-bold animate-pulse' : 'text-stone-400'}`}>
                    {speakingNow ? '🎙️' : '🔉'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Live Voice Chat Audio Controls */}
        {isLiveVoice ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Cafe Banter Button */}
            <button
              type="button"
              onClick={() => {
                const remarks = [
                  { speaker: 'Haydar Usta', text: 'Hadi bakalım abi, taşını seri at çaylar soğumasın!' },
                  { speaker: 'Murat Kaptan', text: 'Zarlar can yaktı, bu el bende bilesin!' },
                  { speaker: 'Selim Abi', text: 'İyi hamle yaptın ama hesabımı bozamazsın!' },
                ];
                const r = remarks[Math.floor(Math.random() * remarks.length)];
                handleBanterRemark(r.speaker, r.text);
              }}
              className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-[#301a0e] hover:bg-[#422414] border border-[#c89d56]/40 text-amber-200 text-[10px] cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Masadakilerin sesli sohbet repliğini tetikle"
            >
              <MessageSquare className="w-3 h-3 text-amber-400" />
              <span>Sohbet Replik</span>
            </button>

            {/* Microphone Toggle Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
                isMicOn
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white ring-2 ring-emerald-400/40 animate-pulse'
                  : 'bg-[#29160c] hover:bg-[#381e10] border-amber-500/40 text-amber-300'
              }`}
              title={isMicOn ? 'Mikrofonu Kapat (Sessize Al)' : 'Canlı Mikrofonu Aç & Sesli Konuş'}
            >
              {isMicOn ? <Mic className="w-3.5 h-3.5 text-white" /> : <MicOff className="w-3.5 h-3.5 text-amber-400" />}
              <span className="text-[10px] sm:text-[11px]">{isMicOn ? 'Konuşuyor' : 'Mikrofon Aç'}</span>
              {isMicOn && (
                <div
                  className="w-1.5 h-3 rounded-full bg-emerald-300 transition-all ml-0.5"
                  style={{ height: `${Math.max(6, Math.min(16, (volumeLevel / 100) * 16))}px` }}
                />
              )}
            </button>

            {/* Deafen (Kulaklık) Toggle */}
            <button
              type="button"
              onClick={handleToggleDeafen}
              className={`p-1 sm:p-1.5 rounded-xl border transition-all cursor-pointer ${
                isDeafened
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                  : 'bg-[#29160c] hover:bg-[#381e10] border-amber-500/40 text-amber-300'
              }`}
              title={isDeafened ? 'Sesi Aç' : 'Oda Sesini Kapat'}
            >
              {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
            <span>🛡️ Özel tek kişilik masa · Rahat oyun</span>
          </div>
        )}
      </div>
    </div>
  );
};
