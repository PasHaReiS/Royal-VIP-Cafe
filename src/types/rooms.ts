export type GameType = 'okey' | 'tavla' | 'satranc' | 'dama';

export type RoomType = 'live_voice' | 'solo_private';

export type RoomStatus = 'waiting' | 'in_game' | 'full';

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isReady?: boolean;
  score?: number;
  role?: 'player' | 'spectator';
  ping?: number;
}

export interface GameRoom {
  id: string;
  title: string;
  gameType: GameType;
  roomType: RoomType;
  hasVoiceChat: boolean;
  maxPlayers: number;
  currentPlayers: RoomPlayer[];
  spectators: RoomPlayer[];
  stake: string; // e.g., '11 Puan Klasik', 'Çayına & Sohbet', '22 Puan VIP', 'Dereceli Maç'
  status: RoomStatus;
  createdAt: number;
  creatorName: string;
  isUserCreated?: boolean;
  description?: string;
  voiceActiveCount?: number;
}
