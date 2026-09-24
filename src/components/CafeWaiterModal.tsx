import React from 'react';
import { X, Coffee, Utensils, Check, Sparkles } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { CafeItemRealisticImage } from './CafeItemRealisticImage';

export interface CafeOrder {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'icecek' | 'ikram';
}

const CAFE_MENU: CafeOrder[] = [
  {
    id: 'cay',
    name: 'Tavşan Kanı Rize Çayı',
    icon: '🍵',
    description: 'İnce belli kristal bardakta, taze demlenmiş mis kokulu Karadeniz çayı.',
    category: 'icecek',
  },
  {
    id: 'kahve',
    name: 'Közde Okkalı Türk Kahvesi',
    icon: '☕',
    description: 'Bakır cezvede köz ateşinde pişmiş, bol köpüklü, yanında damla sakızlı suyla.',
    category: 'icecek',
  },
  {
    id: 'gazoz',
    name: 'Beyoğlu Zencefilli Gazozu',
    icon: '🥤',
    description: 'Nostaljik yeşil cam şişesinde, buz gibi ferahlatıcı tarihi Beyoğlu gazozu.',
    category: 'icecek',
  },
  {
    id: 'lokum',
    name: 'Fıstıklı Hacı Bekir Lokumu',
    icon: '🍬',
    description: 'Geleneksel usulle hazırlanmış, bol Antep fıstıklı, pudra şekerli saray lokumu.',
    category: 'ikram',
  },
  {
    id: 'cerez',
    name: 'VIP Karışık Çerez Tabağı',
    icon: '🥜',
    description: 'Açık Antep fıstığı, kaju, kavrulmuş badem, fındık ve beyaz leblebiden lüks kase.',
    category: 'ikram',
  },
];

interface CafeWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrders: CafeOrder[];
  onAddOrder: (order: CafeOrder) => void;
  onClearOrders?: () => void;
}

export const CafeWaiterModal: React.FC<CafeWaiterModalProps> = ({
  isOpen,
  onClose,
  activeOrders,
  onAddOrder,
  onClearOrders,
}) => {
  if (!isOpen) return null;

  const handleOrder = (item: CafeOrder) => {
    sounds.playTeaService();
    onAddOrder(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#1c120c] border border-[#c89d56]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c89d56]/20 bg-[#251811] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#382216] border border-[#c89d56]/40 flex items-center justify-center text-xl shadow-inner">
              🤵🏻‍♂️
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f5d58d] font-serif-royal flex items-center gap-2">
                <span>Çay Ocağı & Garson Rıza</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Hızlı Servis
                </span>
              </h2>
              <p className="text-xs text-[#b8a796]">
                "Buyurunuz efendim, masanıza ne ikram edelim?"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#b8a796] hover:text-[#f5d58d] hover:bg-[#382216] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boşlar Toplanıyor Hatırlatma Şeridi */}
        <div className="mx-6 mt-3 px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200/90 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm">🧹</span>
            <span>
              <strong className="text-amber-300">Otomatik Boş Toplama:</strong> Yeni sipariş verdiğinizde önceki boşlar toplanır ve taze siparişiniz masaya gelir.
            </span>
          </div>
          {activeOrders.length > 0 && onClearOrders && (
            <button
              type="button"
              onClick={() => {
                onClearOrders();
              }}
              className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg bg-black/50 hover:bg-black/80 text-amber-300 border border-amber-400/40 transition-all cursor-pointer font-bold shrink-0 ml-2"
              title="Masadaki tüm boşları garsona toplat"
            >
              Boşları Kaldır
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-xs text-[#a69480] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-[#c89d56]" />
            <span>Sıcak & Soğuk İçecekler</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAFE_MENU.filter((m) => m.category === 'icecek').map((item) => {
              const isOrdered = activeOrders.some((o) => o.id === item.id);
              return (
                <div
                  key={item.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#23150d] border border-[#c89d56]/25 hover:border-[#c89d56]/60 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <CafeItemRealisticImage itemId={item.id} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#f5d58d] font-serif-royal flex items-center justify-between gap-1">
                        <span>{item.name}</span>
                      </div>
                      <p className="text-[11px] text-[#bdae9c] mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOrder(item)}
                    className="mt-3 w-full py-1.5 px-3 text-xs font-semibold rounded-xl bg-[#351e12] hover:bg-[#4a2b1b] border border-[#c89d56]/35 text-[#f5d58d] flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    {isOrdered ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    <span>{isOrdered ? 'Masanızda Var (Tazele)' : 'Masaya Sipariş Ver'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-[#a69480] uppercase tracking-wider font-semibold flex items-center gap-1.5 pt-2">
            <Utensils className="w-3.5 h-3.5 text-[#c89d56]" />
            <span>VIP İkramlar & Tatlılar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAFE_MENU.filter((m) => m.category === 'ikram').map((item) => {
              const isOrdered = activeOrders.some((o) => o.id === item.id);
              return (
                <div
                  key={item.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#23150d] border border-[#c89d56]/25 hover:border-[#c89d56]/60 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <CafeItemRealisticImage itemId={item.id} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#f5d58d] font-serif-royal flex items-center justify-between gap-1">
                        <span>{item.name}</span>
                      </div>
                      <p className="text-[11px] text-[#bdae9c] mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOrder(item)}
                    className="mt-3 w-full py-1.5 px-3 text-xs font-semibold rounded-xl bg-[#351e12] hover:bg-[#4a2b1b] border border-[#c89d56]/35 text-[#f5d58d] flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    {isOrdered ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    <span>{isOrdered ? 'Tabağı Doldur' : 'Masaya Sipariş Ver'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#c89d56]/20 bg-[#251811] flex items-center justify-between">
          <div className="text-xs text-[#b8a796]">
            Masanızda aktif ikram sayısı: <span className="font-bold text-[#f5d58d]">{activeOrders.length}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c89d56] text-[#120a06] hover:bg-[#d8ae67] transition-colors"
          >
            Tamamdır Rıza, Sağ Ol
          </button>
        </div>
      </div>
    </div>
  );
};
