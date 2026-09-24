import { GameRoom, GameType, RoomType, RoomPlayer } from '../types/rooms';

const STORAGE_KEY = 'royal_cafe_game_rooms_v1';

const INITIAL_DEFAULT_ROOMS: GameRoom[] = [
  // --- OKEY ROOMS ---
  {
    id: 'room-okey-1',
    title: 'Üstatlar Canlı & Sesli Okey Masası',
    gameType: 'okey',
    roomType: 'live_voice',
    hasVoiceChat: true,
    maxPlayers: 4,
    stake: '11 Puan Klasik',
    status: 'in_game',
    createdAt: Date.now() - 3600000,
    creatorName: 'Haydar Usta',
    description: 'Mikrofon açık, taş sesleri ve canlı sohbet eşliğinde 4 kişilik VIP Okey.',
    currentPlayers: [
      { id: 'p-haydar', name: 'Haydar Usta', avatar: '🧔', isHost: true, isSpeaking: true, score: 11, ping: 18 },
      { id: 'p-murat', name: 'Murat Kaptan', avatar: '👨‍✈️', isSpeaking: false, score: 9, ping: 24 },
      { id: 'p-selim', name: 'Selim Abi', avatar: '👴', isSpeaking: false, score: 7, ping: 31 },
    ],
    spectators: [
      { id: 's-riza', name: 'Çaycı Rıza', avatar: '☕', role: 'spectator' },
    ],
    voiceActiveCount: 3,
  },
  {
    id: 'room-okey-2',
    title: '101 Okey Canlı Sesli Turnuva Odası',
    gameType: 'okey',
    roomType: 'live_voice',
    hasVoiceChat: true,
    maxPlayers: 4,
    stake: '22 Puan VIP',
    status: 'waiting',
    createdAt: Date.now() - 1800000,
    creatorName: 'Ahmet Çavuş',
    description: '101 Barajlı katlamalı seri & çift per açmalı canlı sesli masa.',
    currentPlayers: [
      { id: 'p-ahmet', name: 'Ahmet Çavuş', avatar: '👮', isHost: true, isSpeaking: false, score: 22, ping: 15 },
      { id: 'p-kemal', name: 'Kemal Reis', avatar: '🎩', isSpeaking: true, score: 22, ping: 28 },
    ],
    spectators: [],
    voiceActiveCount: 2,
  },
  {
    id: 'room-okey-solo',
    title: 'Okey Tek Kişilik Özel Masa (Botlarla)',
    gameType: 'okey',
    roomType: 'solo_private',
    hasVoiceChat: false,
    maxPlayers: 4,
    stake: 'Antrenman / Çayına',
    status: 'waiting',
    createdAt: Date.now() - 7200000,
    creatorName: 'Sistem',
    description: 'Sessiz ve sakin, Haydar Usta, Murat Kaptan ve Selim Abi botlarına karşı tek başınıza antrenman yapın.',
    currentPlayers: [
      { id: 'p-bot-1', name: 'Haydar Usta (Yapay Zeka)', avatar: '🧔', score: 11 },
      { id: 'p-bot-2', name: 'Murat Kaptan (Yapay Zeka)', avatar: '👨‍✈️', score: 11 },
      { id: 'p-bot-3', name: 'Selim Abi (Yapay Zeka)', avatar: '👴', score: 11 },
    ],
    spectators: [],
    voiceActiveCount: 0,
  },

  // --- TAVLA ROOMS ---
  {
    id: 'room-tavla-1',
    title: 'Hatemkâri Canlı & Sesli Tavla Kapışması',
    gameType: 'tavla',
    roomType: 'live_voice',
    hasVoiceChat: true,
    maxPlayers: 2,
    stake: '5 Puanlık Maç',
    status: 'waiting',
    createdAt: Date.now() - 2400000,
    creatorName: 'Zar Üstadı Nuri',
    description: 'Mikrofon açık canlı tavla, her zarda sohbet ve şakalar serbest!',
    currentPlayers: [
      { id: 'p-nuri', name: 'Zar Üstadı Nuri', avatar: '🎲', isHost: true, isSpeaking: false, score: 3, ping: 22 },
    ],
    spectators: [
      { id: 's-kemal', name: 'Kemal Reis', avatar: '🎩', role: 'spectator' },
    ],
    voiceActiveCount: 1,
  },
  {
    id: 'room-tavla-solo',
    title: 'Tavla Tek Kişilik Özel Antrenman Odası',
    gameType: 'tavla',
    roomType: 'solo_private',
    hasVoiceChat: false,
    maxPlayers: 2,
    stake: 'Serbest Oyun',
    status: 'waiting',
    createdAt: Date.now() - 10000000,
    creatorName: 'Sistem',
    description: 'Usta tavla yapay zekasına karşı tek başınıza stratejinizi geliştirin.',
    currentPlayers: [
      { id: 'p-bot-tavla', name: 'Kemal Reis (Bot Usta)', avatar: '🎩', score: 0 },
    ],
    spectators: [],
    voiceActiveCount: 0,
  },

  // --- SATRANÇ ROOMS ---
  {
    id: 'room-satranc-1',
    title: '3D Satranç Canlı & Sesli Büyükusta Odası',
    gameType: 'satranc',
    roomType: 'live_voice',
    hasVoiceChat: true,
    maxPlayers: 2,
    stake: 'Elo / Dereceli',
    status: 'waiting',
    createdAt: Date.now() - 1200000,
    creatorName: 'Hamleci Can',
    description: 'Canlı sesli 3D masif satranç odası. Hamleleri sesli konuşarak tartışabilirsiniz.',
    currentPlayers: [
      { id: 'p-can', name: 'Hamleci Can', avatar: '♟️', isHost: true, isSpeaking: false, score: 1450, ping: 19 },
    ],
    spectators: [],
    voiceActiveCount: 1,
  },
  {
    id: 'room-satranc-solo',
    title: 'Satranç Tek Kişilik Analiz & Bot Masası',
    gameType: 'satranc',
    roomType: 'solo_private',
    hasVoiceChat: false,
    maxPlayers: 2,
    stake: 'Tek Kişilik Maç',
    status: 'waiting',
    createdAt: Date.now() - 8600000,
    creatorName: 'Sistem',
    description: 'Zorluk seviyesi ayarlanabilir Stockfish satranç yapay zekası ile tek başınıza oynayın.',
    currentPlayers: [
      { id: 'p-bot-chess', name: 'Stockfish AI (Büyükusta)', avatar: '🤖', score: 2100 },
    ],
    spectators: [],
    voiceActiveCount: 0,
  },

  // --- DAMA ROOMS ---
  {
    id: 'room-dama-1',
    title: 'Torna Türk Daması Canlı Sesli Kıraathane Odası',
    gameType: 'dama',
    roomType: 'live_voice',
    hasVoiceChat: true,
    maxPlayers: 2,
    stake: 'Çayına & Sohbet',
    status: 'waiting',
    createdAt: Date.now() - 4500000,
    creatorName: 'Dama Piri Halil',
    description: 'Geleneksel Türk daması kuralları (çok taş yeme, dikey-yatay atlama) ile sesli kıraathane odası.',
    currentPlayers: [
      { id: 'p-halil', name: 'Dama Piri Halil', avatar: '⚪', isHost: true, isSpeaking: true, score: 16, ping: 25 },
    ],
    spectators: [],
    voiceActiveCount: 1,
  },
  {
    id: 'room-dama-solo',
    title: 'Türk Daması Tek Kişilik Özel Masa',
    gameType: 'dama',
    roomType: 'solo_private',
    hasVoiceChat: false,
    maxPlayers: 2,
    stake: 'Tek Kişilik Antrenman',
    status: 'waiting',
    createdAt: Date.now() - 9500000,
    creatorName: 'Sistem',
    description: 'Geleneksel Türk damasını bilgisayara karşı rahatça tek başınıza oynayın.',
    currentPlayers: [
      { id: 'p-bot-dama', name: 'Dama Ustası (Yapay Zeka)', avatar: '⚪', score: 0 },
    ],
    spectators: [],
    voiceActiveCount: 0,
  },
];

class RoomService {
  private rooms: GameRoom[] = [];
  private activeRoomId: string | null = null;
  private listeners: Set<(rooms: GameRoom[], activeRoom: GameRoom | null) => void> = new Set();

  constructor() {
    this.loadRooms();
  }

  private loadRooms() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.rooms = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved rooms, using defaults', e);
    }
    this.rooms = [...INITIAL_DEFAULT_ROOMS];
    this.saveRooms();
  }

  private saveRooms() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.rooms));
    } catch (e) {
      console.warn('Failed to save rooms to localStorage', e);
    }
    this.notify();
  }

  public subscribe(cb: (rooms: GameRoom[], activeRoom: GameRoom | null) => void): () => void {
    this.listeners.add(cb);
    cb(this.rooms, this.getActiveRoom());
    return () => this.listeners.delete(cb);
  }

  private notify() {
    const active = this.getActiveRoom();
    this.listeners.forEach((cb) => cb(this.rooms, active));
  }

  public getRooms(): GameRoom[] {
    return this.rooms;
  }

  public getActiveRoom(): GameRoom | null {
    if (!this.activeRoomId) return null;
    return this.rooms.find((r) => r.id === this.activeRoomId) || null;
  }

  /**
   * Create a new room (Live voice or Solo private)
   */
  public createRoom(options: {
    title: string;
    gameType: GameType;
    roomType: RoomType;
    hasVoiceChat: boolean;
    maxPlayers?: number;
    stake?: string;
    description?: string;
    creatorName: string;
    creatorAvatar?: string;
  }): GameRoom {
    const defaultMaxPlayers = options.gameType === 'okey' ? 4 : 2;
    const newRoom: GameRoom = {
      id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: options.title.trim() || `${options.creatorName}'in Masası`,
      gameType: options.gameType,
      roomType: options.roomType,
      hasVoiceChat: options.hasVoiceChat,
      maxPlayers: options.maxPlayers || defaultMaxPlayers,
      stake: options.stake || (options.roomType === 'solo_private' ? 'Tek Kişilik Antrenman' : '11 Puan / Çayına'),
      status: 'waiting',
      createdAt: Date.now(),
      creatorName: options.creatorName,
      isUserCreated: true,
      description: options.description || (options.roomType === 'live_voice' ? 'Canlı sesli ve sohbete açık masa.' : 'Kişisel tek kişilik masa.'),
      currentPlayers: [
        {
          id: 'p-user',
          name: options.creatorName,
          avatar: options.creatorAvatar || '👤',
          isHost: true,
          isSpeaking: false,
          isReady: true,
          score: 0,
        },
      ],
      spectators: [],
      voiceActiveCount: options.hasVoiceChat ? 1 : 0,
    };

    // Prepend new room to front
    this.rooms = [newRoom, ...this.rooms];
    this.activeRoomId = newRoom.id;
    this.saveRooms();
    return newRoom;
  }

  /**
   * Join an existing room
   */
  public joinRoom(roomId: string, userName: string, userAvatar: string): GameRoom | null {
    const roomIndex = this.rooms.findIndex((r) => r.id === roomId);
    if (roomIndex === -1) return null;

    const room = this.rooms[roomIndex];
    // Check if user is already seated
    const isAlreadySeated = room.currentPlayers.some((p) => p.name === userName || p.id === 'p-user');

    if (!isAlreadySeated && room.currentPlayers.length < room.maxPlayers) {
      const updatedPlayers = [
        ...room.currentPlayers,
        {
          id: 'p-user',
          name: userName,
          avatar: userAvatar,
          isSpeaking: false,
          isReady: true,
          score: 0,
        },
      ];
      room.currentPlayers = updatedPlayers;
      room.voiceActiveCount = room.hasVoiceChat ? updatedPlayers.length : 0;
      if (room.currentPlayers.length >= room.maxPlayers) {
        room.status = 'in_game';
      }
    }

    this.activeRoomId = roomId;
    this.saveRooms();
    return room;
  }

  /**
   * Leave current active room
   */
  public leaveRoom() {
    if (!this.activeRoomId) return;

    const roomIndex = this.rooms.findIndex((r) => r.id === this.activeRoomId);
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      // If user created this room and leaves, or just remove user from room
      room.currentPlayers = room.currentPlayers.filter((p) => p.id !== 'p-user');
      room.voiceActiveCount = Math.max(0, (room.voiceActiveCount || 1) - 1);
      if (room.status === 'in_game' && room.currentPlayers.length < room.maxPlayers) {
        room.status = 'waiting';
      }
    }

    this.activeRoomId = null;
    this.saveRooms();
  }

  /**
   * Delete a user-created room
   */
  public deleteRoom(roomId: string) {
    if (this.activeRoomId === roomId) {
      this.activeRoomId = null;
    }
    this.rooms = this.rooms.filter((r) => r.id !== roomId);
    this.saveRooms();
  }

  /**
   * Reset to default rooms
   */
  public resetToDefaults() {
    this.rooms = [...INITIAL_DEFAULT_ROOMS];
    this.activeRoomId = null;
    this.saveRooms();
  }
}

export const roomService = new RoomService();
