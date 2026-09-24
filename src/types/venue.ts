export type VenueId = 'tarihi_han' | 'bogaz_teras' | 'modern_kafe';

export interface VenueTheme {
  id: VenueId;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  icon: string;
  ambientSoundTitle: string;
  wallTextureClass: string;
  accentBorderColor: string;
  accentTextColor: string;
  headerGradient: string;
  specialTreat: {
    id: string;
    name: string;
    icon: string;
    desc: string;
  };
}

export const VENUES: Record<VenueId, VenueTheme> = {
  tarihi_han: {
    id: 'tarihi_han',
    name: 'Tarihi Taş Han',
    tagline: 'Kapalıçarşı & Tarihi Han Nostaljisi',
    badge: 'Otantik Klasik',
    description:
      'Asırlık kemerli taş tonozlar, pirinç kandiller ve nargile dumanı eşliğinde otantik İstanbul kahvehane ruhu.',
    icon: '🏛️',
    ambientSoundTitle: 'Otantik Han & Ud Tınıları',
    wallTextureClass: 'venue-tarihi-han',
    accentBorderColor: '#c89d56',
    accentTextColor: '#f5d58d',
    headerGradient: 'from-[#1c110a] via-[#2a170d] to-[#180e08]',
    specialTreat: {
      id: 'kozde_kahve',
      name: 'Közde Kumda Türk Kahvesi',
      icon: '☕',
      desc: 'Bakır cezvede köz ateşinde ağır ağır köpürtülen çifte kavrulmuş kahve.',
    },
  },
  bogaz_teras: {
    id: 'bogaz_teras',
    name: 'Boğaz Manzaralı Teras',
    tagline: 'İstanbul Boğazı & Gün Batımı Meltemi',
    badge: 'Panoramik Manzara',
    description:
      'Erguvan ve kızıl akşam ufku, Boğaz köprüsü ışıltısı, vapur düdükleri ve serin deniz esintisi.',
    icon: '🌊',
    ambientSoundTitle: 'Boğaz Meltemi & Akşam Terası',
    wallTextureClass: 'venue-bogaz-teras',
    accentBorderColor: '#38bdf8',
    accentTextColor: '#bae6fd',
    headerGradient: 'from-[#0b1726] via-[#10243d] to-[#091322]',
    specialTreat: {
      id: 'bogaz_cayi',
      name: 'Teras Demleme Çay & Çıtır Simit',
      icon: '🍵',
      desc: 'Boğaz havasında semaverden taze dökülen ince belli tavşan kanı çay.',
    },
  },
  modern_kafe: {
    id: 'modern_kafe',
    name: 'Modern VIP Lounge',
    tagline: 'Nişantaşı Çağdaş Bistro & Espresso Bar',
    badge: 'Modern Lüks',
    description:
      'Akustik ahşap çıtalar, loş LED neon detaylar, 3. nesil espresso barı ve akıcı lounge caz melodileri.',
    icon: '🍸',
    ambientSoundTitle: 'Lounge Jazz & Espresso Bar',
    wallTextureClass: 'venue-modern-kafe',
    accentBorderColor: '#e0a96d',
    accentTextColor: '#fed7aa',
    headerGradient: 'from-[#141419] via-[#1f1f26] to-[#101014]',
    specialTreat: {
      id: 'artisan_espresso',
      name: 'Single Origin Espresso & Macaron',
      icon: '☕',
      desc: 'Özel çekirdeklerden kadife kremalı espresso ve Antep fıstıklı makaron.',
    },
  },
};
