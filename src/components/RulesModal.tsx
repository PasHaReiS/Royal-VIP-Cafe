import React, { useState } from 'react';
import { X, BookOpen, Award, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'tavla' | 'okey' | 'satranc' | 'dama';
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'tavla',
}) => {
  const [activeTab, setActiveTab] = useState<'tavla' | 'okey' | 'satranc' | 'dama'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#1b120c] border border-[#c89d56]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c89d56]/20 bg-[#251811] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#c89d56]" />
            <h2 className="text-lg font-bold text-[#f5d58d] font-serif-royal">
              Eksiksiz Oyun Kuralları & Taktikleri
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#b8a796] hover:text-[#f5d58d] hover:bg-[#382216] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 border-b border-[#c89d56]/20 bg-[#21150e] px-3 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('tavla')}
            className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'tavla'
                ? 'border-[#c89d56] text-[#f5d58d]'
                : 'border-transparent text-[#b8a796] hover:text-[#f4ecd8]'
            }`}
          >
            <span>🎲</span>
            <span>Tavla</span>
          </button>
          <button
            onClick={() => setActiveTab('okey')}
            className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'okey'
                ? 'border-[#c89d56] text-[#f5d58d]'
                : 'border-transparent text-[#b8a796] hover:text-[#f4ecd8]'
            }`}
          >
            <span>🀄</span>
            <span>Okey</span>
          </button>
          <button
            onClick={() => setActiveTab('satranc')}
            className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'satranc'
                ? 'border-[#c89d56] text-[#f5d58d]'
                : 'border-transparent text-[#b8a796] hover:text-[#f4ecd8]'
            }`}
          >
            <span>♟️</span>
            <span>Satranç</span>
          </button>
          <button
            onClick={() => setActiveTab('dama')}
            className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'dama'
                ? 'border-[#c89d56] text-[#f5d58d]'
                : 'border-transparent text-[#b8a796] hover:text-[#f4ecd8]'
            }`}
          >
            <span>⚪</span>
            <span>Dama</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#ded3c3] leading-relaxed">
          {activeTab === 'tavla' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#271810] border border-[#c89d56]/25">
                <h3 className="font-bold text-[#f5d58d] mb-1 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#c89d56]" />
                  Tavla Amacı ve İlerleyiş
                </h3>
                <p className="text-xs text-[#bdae9c]">
                  Tavla, 15 beyaz ve 15 siyah pul ile 24 kapıdan oluşan tahtada oynanır. Amaç tüm pulları kendi toplama alanınıza getirip rakipten önce tahtadan toplamaktır.
                </p>
              </div>

              {/* Başlangıç Zarı ve İlk Hamle Kuralı */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#291307] to-[#1e0e05] border border-amber-400/40 shadow-sm">
                <h4 className="font-bold text-sm text-amber-300 mb-1.5 flex items-center gap-2">
                  <span className="text-base">🎲</span>
                  <span>Başlangıç Zarı & İlk Hamle Kuralı</span>
                </h4>
                <div className="space-y-2 text-xs text-[#d8c7b5]">
                  <p>
                    • <strong>Büyüklük Kuralı:</strong> Oyun başlamadan önce her iki oyuncu da birer tek zar atar. Daha büyük zar atan oyuncu oyuna başlama hakkı kazanır.
                  </p>
                  <p>
                    • <strong>Eşitlik Kuralı:</strong> Zarlar eşit gelirse (örn. 3-3, 5-5) kural gereği eşitlik bozulana kadar zarlar yeniden atılır. Açılışta çift zar gelmesi ve çift oynanması imkansızdır.
                  </p>
                  <p>
                    • <strong>İlk Hamlede Zarların Birleştirilmesi:</strong> Açılışı kazanan oyuncu yeni zar atmaz; açılış atışında gelen iki zarı (büyük ve küçük zarı) birleştirerek ilk hamlesini hemen yapar.
                  </p>
                </div>
              </div>

              {/* Standart Pul Dizilimi */}
              <div className="p-4 rounded-xl bg-[#22130b] border border-[#c89d56]/30">
                <h4 className="font-bold text-sm text-[#f5d58d] mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Resmi Pul Dizilimi (15 Pul)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs mt-2">
                  <div className="p-2 rounded-lg bg-black/40 border border-amber-400/20">
                    <span className="block font-bold text-amber-300 font-mono">24. Hane</span>
                    <span className="text-[11px] text-stone-300">2 Pul (Rakip Köşe)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-amber-400/20">
                    <span className="block font-bold text-amber-300 font-mono">13. Hane</span>
                    <span className="text-[11px] text-stone-300">5 Pul (Dış Alan)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-amber-400/20">
                    <span className="block font-bold text-amber-300 font-mono">8. Hane</span>
                    <span className="text-[11px] text-stone-300">3 Pul (Kendi Alan)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-amber-400/20">
                    <span className="block font-bold text-amber-300 font-mono">6. Hane</span>
                    <span className="text-[11px] text-stone-300">5 Pul (İç Kale/Ev)</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#bdae9c] mt-2">
                  Siyah oyuncu için dizilim simetrik olarak 1. hane (2 pul), 12. hane (5 pul), 17. hane (3 pul) ve 19. hanededir (5 pul).
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-[#f5d58d] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Kapı Alma ve Güvenli Haneler
                </h4>
                <p className="text-xs text-[#bdae9c]">
                  Bir hanede aynı renkten 2 veya daha fazla pul varsa kapı oluşur. Rakip kapılı haneye basamaz. Açıkta tek kalan pul vurulup kırığa (Bar) gönderilebilir.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-[#f5d58d] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Mars ve Katmerli Mars
                </h4>
                <p className="text-xs text-[#bdae9c]">
                  Rakip tek bir pul dahi toplamadan oyunu bitirirseniz <strong>Mars</strong> (2 puan) olur. Rakip pulunu sizin evinizden çıkaramamışsa <strong>Katmerli Mars</strong> (3 puan) sayılır.
                </p>
              </div>
            </div>
          ) : activeTab === 'okey' ? (
            <div className="space-y-5">
              {/* Çanak Kırma Mekaniği */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#3b1c09] to-[#221004] border border-amber-400/50 shadow-md">
                <h3 className="font-bold text-amber-300 mb-1.5 flex items-center gap-2">
                  <span className="text-lg">🏺</span>
                  <span>Çanak Kırma (VIP Çanak Mekaniği)</span>
                </h3>
                <p className="text-xs text-[#d8c3b0] mb-2 leading-relaxed">
                  Her el başladığında masanın ortasındaki altın çanağa ekstra altın eklenir. Oyuncular özel şartları sağladığında çanak <strong>TUZ BUZ OLUR</strong> ve biriken tüm altınlar kazananın kasasına aktarılır!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-amber-400/20">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <strong className="text-[#f5d58d] block mb-0.5">🎯 Okey Atarak</strong>
                    <span className="text-stone-300">Bitiş taşı olarak OKEY taşı ortaya atıldığında çanak kırılır.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <strong className="text-[#f5d58d] block mb-0.5">👥 Çifte Giderek</strong>
                    <span className="text-stone-300">7 çift (Klasik) veya 5 çift (101) ile bitirildiğinde çanak kırılır.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <strong className="text-[#f5d58d] block mb-0.5">⚡ 101'de Elden Bitme</strong>
                    <span className="text-stone-300">Önceden açmadan tek elde 14 taşı per yapıp bitiren çanağı kırar!</span>
                  </div>
                </div>
              </div>

              {/* 101 Okey Kuralları */}
              <div className="p-4 rounded-xl bg-[#14261a] border border-emerald-500/40">
                <h3 className="font-bold text-emerald-300 mb-1.5 flex items-center gap-2">
                  <span className="text-lg">💯</span>
                  <span>101 Okey (YüzBir) Kuralları</span>
                </h3>
                <p className="text-xs text-[#b8d6c1] mb-2.5">
                  101 Okey'de amaç elinizdeki perleri masaya açmak, masadaki perlere taş işlemek ve elinizi en az ceza puanıyla bitirmektir.
                </p>
                <ul className="text-xs text-[#c5ded0] space-y-2 list-disc pl-5">
                  <li>
                    <strong>101 Barajı ile Per Açma:</strong> Elinizdeki seri ve grup perlerin sayı değerleri toplamı <strong>en az 101 puan</strong> olmalıdır. Barajı geçtiğinizde elinizi masaya açabilirsiniz.
                  </li>
                  <li>
                    <strong>Çift Açma (5 Çift):</strong> Elinizde en az 5 çift varsa (örn: 2 tane Kırmızı 7, 2 tane Siyah 4 vb.), çift olarak açabilirsiniz.
                  </li>
                  <li>
                    <strong>Masaya Taş İşleme (+ İşle):</strong> Elinizi açtıktan sonra, sıranız geldiğinde ıstakanızdaki uygun taşları kendinizin veya rakiplerin masadaki perlerine ekleyebilirsiniz (Örn: Siyah 3-4-5 perinin sonuna Siyah 6).
                  </li>
                  <li>
                    <strong>Elden Bitme:</strong> Hiçbir per açmadan, tek seferde elinizdeki tüm 14 taşı per oluşturup 15. taşı bitiş olarak atarsanız rakiplere çifte ceza verilir ve çanak kırılır!
                  </li>
                </ul>
              </div>

              {/* Klasik Okey Kuralları */}
              <div className="p-4 rounded-xl bg-[#271810] border border-[#c89d56]/25">
                <h3 className="font-bold text-[#f5d58d] mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Klasik Okey Kuralları
                </h3>
                <p className="text-xs text-[#bdae9c]">
                  106 taş ve 4 oyuncuyla oynanır. Amaç eldeki 14 taşı geçerli perlere (aynı renk ardışık veya farklı renk aynı sayılar) ayırmaktır.
                </p>
                <ul className="text-xs text-[#bdae9c] space-y-1.5 list-disc pl-5 mt-2">
                  <li><strong>Normal Bitiş:</strong> 14 taş perlere ayrılmış, fazlalık taş ortaya atıldığında rakiplerden 2 puan düşülür.</li>
                  <li><strong>Okey Atarak Bitiş:</strong> Bitiş taşı olarak OKEY taşı atılırsa rakiplerden 4 puan düşülür!</li>
                  <li><strong>Gösterge Açma:</strong> Dağıtılan elde gösterge taşı varsa, ilk turda gösterip tüm rakiplerden 1 puan düşebilirsiniz.</li>
                  <li><strong>Çifte Gitmek:</strong> 7 çift toplanarak bitilirse ceza puanı ikiye katlanır.</li>
                </ul>
              </div>
            </div>
          ) : activeTab === 'satranc' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#271810] border border-[#c89d56]/25">
                <h3 className="font-bold text-[#f5d58d] mb-1 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Satranç Temel Kuralları
                </h3>
                <p className="text-xs text-[#bdae9c]">
                  64 karelik masif ceviz tahtada 16 beyaz ve 16 siyah taşla oynanır. Amaç rakip şahı tehdit altına alıp kaçacak hiçbir yasal hamlesi kalmayacak şekilde <strong>Şah ve Mat</strong> etmektir.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-[#f5d58d]">Önemli Hamleler & Kurallar</h4>
                <ul className="text-xs text-[#bdae9c] space-y-1.5 list-disc pl-5">
                  <li><strong>Rok:</strong> Şah ile kalenin güvenli şekilde yer değiştirmesi.</li>
                  <li><strong>Piyon Terfisi:</strong> Son sıraya ulaşan piyon Vezir, Kale, Fil veya Ata terfi eder.</li>
                  <li><strong>Geçerken Alma (En Passant):</strong> İki kare ilerleyen rakip piyonu çaprazdan yeme hakkı.</li>
                  <li><strong>Pat (Berabere):</strong> Şah tehdit altında değilken yapacak yasal hamlenin kalmaması.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#271810] border border-[#c89d56]/25">
                <h3 className="font-bold text-[#f5d58d] mb-1 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Türk Daması Kuralları
                </h3>
                <p className="text-xs text-[#bdae9c]">
                  8x8 tahtada 16 beyaz ve 16 siyah pulla oynanır. Pullar 1 adım ileri ve yana hareket eder (asla geri veya çapraz gitmez!).
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-[#f5d58d]">Altın Kurallar</h4>
                <ul className="text-xs text-[#bdae9c] space-y-1.5 list-disc pl-5">
                  <li><strong>Çok Taş Yeme Zorunluluğu:</strong> Eğer birden fazla taş yeme imkânı varsa, en çok taş yiyen yolu oynamak zorunludur!</li>
                  <li><strong>Uçan Dama:</strong> Karşı son sıraya ulaşan pul Dama olur ve kale gibi düz çizgiler boyunca istediği mesafeye uçar.</li>
                  <li><strong>Dama Yeme:</strong> Dama pulu da aynı hat üzerindeki taşları atlayarak yiyebilir ve yön değiştirebilir.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#c89d56]/20 bg-[#251811] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c89d56] text-[#120a06] hover:bg-[#d8ae67] transition-colors cursor-pointer"
          >
            Kuralları Anladım, Masaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};
