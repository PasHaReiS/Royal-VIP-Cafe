import React from 'react';
import { VenueId, VENUES, VenueTheme } from '../types/venue';
import { X, Check, Sparkles, MapPin, Music, Coffee, Compass } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface VenueSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVenue: VenueId;
  onSelectVenue: (venueId: VenueId) => void;
}

export const VenueSelectorModal: React.FC<VenueSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedVenue,
  onSelectVenue,
}) => {
  if (!isOpen) return null;

  const handleVenuePick = (vId: VenueId) => {
    sounds.playCheckerSelect();
    onSelectVenue(vId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#170e09] border border-[#c89d56]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#c89d56]/20 bg-gradient-to-r from-[#22130b] via-[#2a170d] to-[#1a0e08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3b2012] border border-[#c89d56]/40 flex items-center justify-center text-xl shadow-inner">
              <Compass className="w-5 h-5 text-[#f5d58d]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-royal text-[#f5d58d]">
                Oyun Salonu Mekanını Seç
              </h2>
              <p className="text-xs text-[#b8a694]">
                Tavla ve Okey keyfini İstanbul'un en özel atmosferlerinde kişiselleştirin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/30 border border-white/10 text-white/60 hover:text-white hover:bg-black/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Venues Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.values(VENUES) as VenueTheme[]).map((venue) => {
            const isSelected = selectedVenue === venue.id;

            return (
              <div
                key={venue.id}
                onClick={() => handleVenuePick(venue.id)}
                className={`relative rounded-2xl p-4 flex flex-col justify-between border-2 transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#2b180d] to-[#1e1008] border-[#c89d56] shadow-[0_0_25px_rgba(200,157,86,0.35)] scale-[1.02]'
                    : 'bg-[#1b110a]/90 hover:bg-[#23150d] border-white/10 hover:border-[#c89d56]/40'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{venue.icon}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isSelected
                        ? 'bg-[#c89d56] text-black'
                        : 'bg-white/10 text-stone-300 group-hover:bg-white/15'
                    }`}
                  >
                    {venue.badge}
                  </span>
                </div>

                {/* Venue Visual Silhouette & Mood */}
                <div className="relative h-28 rounded-xl overflow-hidden mb-3 border border-white/10 flex flex-col justify-end p-2.5">
                  {venue.id === 'tarihi_han' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140b06] via-[#2d170a]/80 to-[#42220d]/50 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/40 via-transparent to-black" />
                      <div className="text-4xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        🕌
                      </div>
                    </div>
                  )}

                  {venue.id === 'bogaz_teras' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#091522] via-[#10243e]/80 to-[#224063]/60 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/40 via-blue-900/30 to-black" />
                      <div className="text-4xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        🌉
                      </div>
                    </div>
                  )}

                  {venue.id === 'modern_kafe' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-[#1c1c24]/80 to-[#2c2c38]/60 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-400/30 via-amber-500/20 to-black" />
                      <div className="text-4xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        ☕
                      </div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <span className="text-xs font-bold text-white drop-shadow-md">
                      {venue.name}
                    </span>
                    <span className="block text-[10px] text-amber-200/80 drop-shadow">
                      {venue.tagline}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-[#c4b5a3] leading-relaxed mb-3 line-clamp-3">
                  {venue.description}
                </p>

                {/* Atmosphere details */}
                <div className="border-t border-white/10 pt-2.5 flex flex-col gap-1.5 text-[10px] text-[#9c8978]">
                  <div className="flex items-center gap-1.5">
                    <Music className="w-3 h-3 text-[#c89d56]" />
                    <span className="truncate">{venue.ambientSoundTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coffee className="w-3 h-3 text-[#c89d56]" />
                    <span className="truncate">{venue.specialTreat.name}</span>
                  </div>
                </div>

                {/* Selection indicator button */}
                <button
                  type="button"
                  className={`mt-3 w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#c89d56] text-black shadow-md'
                      : 'bg-black/30 border border-white/10 text-white/70 group-hover:text-white group-hover:border-white/20'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Aktif Mekan</span>
                    </>
                  ) : (
                    <span>Mekana Geç</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-[#120a06] border-t border-[#c89d56]/20 flex items-center justify-between text-xs text-[#a89582]">
          <span>Mekan değiştiğinde arka plan, aydınlatma ve kafe müzikleri güncellenir.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#26150b] border border-[#c89d56]/30 text-[#f5d58d] hover:bg-[#341d10] font-semibold transition-colors cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
