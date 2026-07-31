// Client-side WebSocket manager for Skip-Bo Overdrive Multiplayer

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  avatar: string;
  text: string;
  timestamp: string;
  inviteCode?: string;
  isSystem?: boolean;
}

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  ready: boolean;
  isHost: boolean;
}

export interface GameRoom {
  code: string;
  hostId: string;
  hostName: string;
  stockpileSize: number;
  maxPlayers: number;
  players: RoomPlayer[];
  status: 'LOBBY' | 'PLAYING';
  gameState?: any;
}

type EventListener = (payload: any) => void;

class MultiplayerClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<EventListener>> = new Map();
  public userId: string = '';
  public name: string = 'Player' + Math.floor(100 + Math.random() * 900);
  public avatar: string = '🦊';
  public connected: boolean = false;
  public onlineCount: number = 1;
  public currentRoom: GameRoom | null = null;
  public messages: ChatMessage[] = [];

  constructor() {
    // Auto-connect on import or manual call
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.connected = true;
        this.emitLocal('connection_status', { connected: true });
        // Restore identity
        this.setIdentity(this.name, this.avatar);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingEvent(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.socket.onclose = () => {
        this.connected = false;
        this.emitLocal('connection_status', { connected: false });
        // Auto reconnect after 3 seconds
        setTimeout(() => this.connect(), 3000);
      };

      this.socket.onerror = (err) => {
        console.warn('WebSocket connection warning:', err);
      };
    } catch (err) {
      console.error('Failed to initiate WebSocket connection:', err);
    }
  }

  private handleIncomingEvent(data: any) {
    switch (data.type) {
      case 'INIT_CONNECTED':
        this.userId = data.userId;
        if (data.name) this.name = data.name;
        if (data.avatar) this.avatar = data.avatar;
        this.onlineCount = data.onlineCount || 1;
        this.messages = data.messages || [];
        this.emitLocal('init', data);
        this.emitLocal('chat_messages', this.messages);
        break;

      case 'GLOBAL_STATS':
        this.onlineCount = data.onlineCount || 1;
        this.emitLocal('global_stats', data);
        break;

      case 'IDENTITY_UPDATED':
        this.name = data.name;
        this.avatar = data.avatar;
        this.emitLocal('identity', data);
        break;

      case 'CHANNEL_JOINED':
        this.messages = data.messages || [];
        this.emitLocal('chat_messages', this.messages);
        break;

      case 'NEW_CHAT_MSG':
        this.messages.push(data.message);
        if (this.messages.length > 100) this.messages.shift();
        this.emitLocal('chat_messages', [...this.messages]);
        break;

      case 'ROOM_CREATED':
      case 'ROOM_JOINED_SUCCESS':
      case 'ROOM_UPDATED':
        this.currentRoom = data.room;
        this.emitLocal('room_update', this.currentRoom);
        break;

      case 'MULTIPLAYER_GAME_STARTED':
        this.currentRoom = data.room;
        this.emitLocal('game_started', this.currentRoom);
        break;

      case 'GAME_MOVE_SYNCED':
        this.emitLocal('game_move', data);
        break;

      case 'LEFT_ROOM':
        this.currentRoom = null;
        this.emitLocal('room_update', null);
        break;

      case 'ERROR_RESPONSE':
        this.emitLocal('error', data.message);
        break;

      default:
        break;
    }
  }

  public setIdentity(name: string, avatar: string) {
    this.name = name;
    this.avatar = avatar;
    this.send({ type: 'SET_IDENTITY', name, avatar });
  }

  public joinChatChannel(channelId: string) {
    this.send({ type: 'JOIN_CHAT_CHANNEL', channelId });
  }

  public sendChatMessage(text: string, inviteCode?: string) {
    this.send({ type: 'SEND_CHAT_MSG', text, inviteCode });
  }

  public createPrivateGame(stockpileSize: number = 20, maxPlayers: number = 2) {
    this.send({ type: 'CREATE_PRIVATE_GAME', stockpileSize, maxPlayers });
  }

  public joinGameByCode(roomCode: string) {
    this.send({ type: 'JOIN_GAME_BY_CODE', roomCode });
  }

  public toggleReady() {
    this.send({ type: 'TOGGLE_READY' });
  }

  public startMultiplayerGame() {
    this.send({ type: 'START_MULTIPLAYER_GAME' });
  }

  public syncGameMove(gameState: any, actionLog?: string) {
    this.send({ type: 'SYNC_GAME_MOVE', gameState, actionLog });
  }

  public leaveRoom() {
    this.send({ type: 'LEAVE_ROOM' });
  }

  private send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  public on(event: string, callback: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  public off(event: string, callback: EventListener) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  private emitLocal(event: string, payload: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((cb) => cb(payload));
    }
  }
}

export const mpClient = new MultiplayerClient();
