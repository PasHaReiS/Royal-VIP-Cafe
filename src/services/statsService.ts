export interface UserProfile {
  name: string;
  avatar: string;
  title: string;
}

export interface PlayerAvatarOption {
  id: string;
  emoji: string;
  name: string;
  title: string;
  description: string;
}

export const PLAYER_AVATARS: PlayerAvatarOption[] = [
  {
    id: 'sultan',
    emoji: '👑',
    name: 'Sultan',
    title: 'Masa Hükümdarı',
    description: 'Tavla tahtasının ve okey masasının heybetli efendisi',
  },
  {
    id: 'usta',
    emoji: '🧔🏻‍♂️',
    name: 'Tavla Ustası',
    title: 'Kadim Üstat',
    description: 'Kapı almadan oynamaz, her hamlesi hesaplı ve soğukkanlı',
  },
  {
    id: 'pasa',
    emoji: '🎩',
    name: 'Beyefendi',
    title: 'VIP Beyzade',
    description: 'Asil tavırlarıyla masaya zarafet katar',
  },
  {
    id: 'kralice',
    emoji: '👸🏼',
    name: 'Hanımefendi',
    title: 'Saray Prensesi',
    description: 'Keskin zekası ve şansıyla rakipleri mat eder',
  },
  {
    id: 'kaptan',
    emoji: '⚓',
    name: 'Kaptan',
    title: 'Fırtına Süvarisi',
    description: 'Dalgalı oyunları ve riskli açıkları ustalıkla toplar',
  },
  {
    id: 'serce',
    emoji: '🦅',
    name: 'Şahin',
    title: 'Avcı Gözü',
    description: 'Rakibin açıklarını saniyesinde yakalayıp kırar',
  },
  {
    id: 'genc',
    emoji: '🦁',
    name: 'Aslan',
    title: 'Cesur Yürek',
    description: 'Büyük zarlara ve cesur perlere oynar',
  },
  {
    id: 'bilge',
    emoji: '🧙‍♂️',
    name: 'Bilge',
    title: 'Zar Büyücüsü',
    description: 'Düşeş beklerken hepyek gelse dahi oyunu çevirir',
  },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Siz (Oyuncu)',
  avatar: '👑',
  title: 'Masa Hükümdarı',
};

const PROFILE_STORAGE_KEY = 'royal_vip_cafe_profile_v1';

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load profile', e);
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalDurationSeconds: number; // in seconds
  marsWins?: number;
  katmerliMarsWins?: number;
  okeyFinishCount?: number;
  lastPlayedAt?: number;
}

export interface SalonStats {
  tavla: GameStats;
  okey: GameStats;
  satranc: GameStats;
  dama: GameStats;
}

const STORAGE_KEY = 'royal_vip_cafe_stats_v1';

export const DEFAULT_STATS: SalonStats = {
  tavla: {
    gamesPlayed: 14,
    wins: 9,
    losses: 5,
    totalDurationSeconds: 4320, // ~1 saat 12 dk
    marsWins: 3,
    katmerliMarsWins: 1,
    lastPlayedAt: Date.now() - 3600000,
  },
  okey: {
    gamesPlayed: 10,
    wins: 6,
    losses: 4,
    totalDurationSeconds: 5280, // ~1 saat 28 dk
    okeyFinishCount: 2,
    lastPlayedAt: Date.now() - 7200000,
  },
  satranc: {
    gamesPlayed: 8,
    wins: 5,
    losses: 3,
    totalDurationSeconds: 3600,
    lastPlayedAt: Date.now() - 10800000,
  },
  dama: {
    gamesPlayed: 12,
    wins: 8,
    losses: 4,
    totalDurationSeconds: 2800,
    lastPlayedAt: Date.now() - 14400000,
  },
};

export function loadSalonStats(): SalonStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATS));
      return DEFAULT_STATS;
    }
    const parsed = JSON.parse(raw);
    return {
      tavla: { ...DEFAULT_STATS.tavla, ...parsed.tavla },
      okey: { ...DEFAULT_STATS.okey, ...parsed.okey },
      satranc: { ...DEFAULT_STATS.satranc, ...parsed.satranc },
      dama: { ...DEFAULT_STATS.dama, ...parsed.dama },
    };
  } catch (e) {
    console.error('Failed to load stats', e);
    return DEFAULT_STATS;
  }
}

export function saveSalonStats(stats: SalonStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

export function recordGameResult(
  game: 'tavla' | 'okey' | 'satranc' | 'dama',
  isWin: boolean,
  durationSeconds: number,
  extra?: { winType?: string }
): SalonStats {
  const current = loadSalonStats();
  const target = current[game] || {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    totalDurationSeconds: 0,
  };

  target.gamesPlayed += 1;
  if (isWin) {
    target.wins += 1;
    if (game === 'tavla') {
      if (extra?.winType === 'mars') target.marsWins = (target.marsWins || 0) + 1;
      if (extra?.winType === 'katmerli_mars') target.katmerliMarsWins = (target.katmerliMarsWins || 0) + 1;
    } else if (game === 'okey') {
      if (extra?.winType === 'okey_atti') target.okeyFinishCount = (target.okeyFinishCount || 0) + 1;
    }
  } else {
    target.losses += 1;
  }

  target.totalDurationSeconds += Math.max(10, Math.floor(durationSeconds));
  target.lastPlayedAt = Date.now();

  current[game] = target;
  saveSalonStats(current);
  return current;
}

export function resetSalonStats(): SalonStats {
  const fresh: SalonStats = {
    tavla: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalDurationSeconds: 0,
      marsWins: 0,
      katmerliMarsWins: 0,
    },
    okey: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalDurationSeconds: 0,
      okeyFinishCount: 0,
    },
    satranc: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalDurationSeconds: 0,
    },
    dama: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalDurationSeconds: 0,
    },
  };
  saveSalonStats(fresh);
  return fresh;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 dk';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} saat ${minutes > 0 ? `${minutes} dk` : ''}`.trim();
  }
  return `${Math.max(1, minutes)} dk`;
}
