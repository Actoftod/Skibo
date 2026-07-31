import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

interface ClientConnection {
  ws: WebSocket;
  id: string;
  name: string;
  avatar: string;
  currentChannel: string;
  currentRoomCode: string | null;
}

interface ChatMessage {
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

interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  ready: boolean;
  isHost: boolean;
}

interface GameRoom {
  code: string;
  hostId: string;
  hostName: string;
  stockpileSize: number;
  maxPlayers: number;
  players: RoomPlayer[];
  status: 'LOBBY' | 'PLAYING';
  gameState?: any;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Create HTTP Server
  const server = http.createServer(app);

  // Initialize WebSocket Server
  const wss = new WebSocketServer({ server });

  // In-Memory Storage
  const clients = new Map<WebSocket, ClientConnection>();
  const gameRooms = new Map<string, GameRoom>();

  // Default seed chat messages
  const chatMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      channelId: 'lobby',
      senderId: 'bot-1',
      senderName: 'Player793',
      avatar: '🦊',
      text: 'Hey everyone! Anyone up for a fast 10-card Overdrive match?',
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'msg-2',
      channelId: 'lobby',
      senderId: 'bot-2',
      senderName: 'Player070',
      avatar: '🐉',
      text: 'Just created a 20-card private game! Join code is 4829',
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inviteCode: '4829',
    },
    {
      id: 'msg-3',
      channelId: 'lobby',
      senderId: 'bot-3',
      senderName: 'Player512',
      avatar: '⚡',
      text: 'Discard slot linking is super tactical this season!',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  // Helper to generate a 4-digit code
  function generateRoomCode(): string {
    let code = '';
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (gameRooms.has(code));
    return code;
  }

  // Broadcast helper
  function broadcastToChannel(channelId: string, payload: any) {
    const json = JSON.stringify(payload);
    clients.forEach((client) => {
      if (client.currentChannel === channelId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(json);
      }
    });
  }

  function broadcastToRoom(roomCode: string, payload: any) {
    const json = JSON.stringify(payload);
    clients.forEach((client) => {
      if (client.currentRoomCode === roomCode && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(json);
      }
    });
  }

  function getOnlineUsersCount(): number {
    return clients.size;
  }

  function broadcastGlobalStats() {
    const payload = JSON.stringify({
      type: 'GLOBAL_STATS',
      onlineCount: getOnlineUsersCount(),
      activeRoomsCount: gameRooms.size,
    });
    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });
  }

  wss.on('connection', (ws: WebSocket) => {
    const userId = 'usr-' + Math.random().toString(36).substring(2, 9);
    const client: ClientConnection = {
      ws,
      id: userId,
      name: 'Player' + Math.floor(100 + Math.random() * 900),
      avatar: ['🦊', '🐉', '⚡', '🦉', '🐯', '🤖'][Math.floor(Math.random() * 6)],
      currentChannel: 'lobby',
      currentRoomCode: null,
    };
    clients.set(ws, client);

    // Send initial welcome & chat history
    ws.send(
      JSON.stringify({
        type: 'INIT_CONNECTED',
        userId: client.id,
        name: client.name,
        avatar: client.avatar,
        onlineCount: getOnlineUsersCount(),
        messages: chatMessages.filter((m) => m.channelId === client.currentChannel),
      })
    );

    broadcastGlobalStats();

    ws.on('message', (rawMessage: string) => {
      try {
        const data = JSON.parse(rawMessage.toString());

        switch (data.type) {
          case 'SET_IDENTITY': {
            if (data.name) client.name = data.name.trim();
            if (data.avatar) client.avatar = data.avatar;
            ws.send(
              JSON.stringify({
                type: 'IDENTITY_UPDATED',
                userId: client.id,
                name: client.name,
                avatar: client.avatar,
              })
            );
            break;
          }

          case 'JOIN_CHAT_CHANNEL': {
            client.currentChannel = data.channelId || 'lobby';
            ws.send(
              JSON.stringify({
                type: 'CHANNEL_JOINED',
                channelId: client.currentChannel,
                messages: chatMessages.filter((m) => m.channelId === client.currentChannel),
              })
            );
            break;
          }

          case 'SEND_CHAT_MSG': {
            if (!data.text || !data.text.trim()) return;
            const newMsg: ChatMessage = {
              id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              channelId: client.currentChannel,
              senderId: client.id,
              senderName: client.name,
              avatar: client.avatar,
              text: data.text.trim(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              inviteCode: data.inviteCode,
            };
            chatMessages.push(newMsg);
            if (chatMessages.length > 100) chatMessages.shift();

            broadcastToChannel(client.currentChannel, {
              type: 'NEW_CHAT_MSG',
              message: newMsg,
            });
            break;
          }

          case 'CREATE_PRIVATE_GAME': {
            const roomCode = generateRoomCode();
            const stockpileSize = data.stockpileSize || 20;
            const maxPlayers = data.maxPlayers || 2;

            const room: GameRoom = {
              code: roomCode,
              hostId: client.id,
              hostName: client.name,
              stockpileSize,
              maxPlayers,
              players: [
                {
                  id: client.id,
                  name: client.name,
                  avatar: client.avatar,
                  ready: true,
                  isHost: true,
                },
              ],
              status: 'LOBBY',
            };

            gameRooms.set(roomCode, room);
            client.currentRoomCode = roomCode;

            // Send confirmation to host
            ws.send(
              JSON.stringify({
                type: 'ROOM_CREATED',
                room,
              })
            );

            // Send invitation into public chat channel
            const inviteMsg: ChatMessage = {
              id: 'invite-' + Date.now(),
              channelId: client.currentChannel,
              senderId: client.id,
              senderName: client.name,
              avatar: client.avatar,
              text: `🎮 Created Game Room #${roomCode}! Click to Join (${room.players.length}/${room.maxPlayers})`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              inviteCode: roomCode,
              isSystem: true,
            };
            chatMessages.push(inviteMsg);
            broadcastToChannel(client.currentChannel, {
              type: 'NEW_CHAT_MSG',
              message: inviteMsg,
            });
            broadcastGlobalStats();
            break;
          }

          case 'JOIN_GAME_BY_CODE': {
            const code = (data.roomCode || '').trim();
            const room = gameRooms.get(code);

            if (!room) {
              ws.send(
                JSON.stringify({
                  type: 'ERROR_RESPONSE',
                  message: `Room code #${code} not found! Check your 4-digit code.`,
                })
              );
              return;
            }

            if (room.players.length >= room.maxPlayers) {
              ws.send(
                JSON.stringify({
                  type: 'ERROR_RESPONSE',
                  message: `Room #${code} is full! (${room.players.length}/${room.maxPlayers} players)`,
                })
              );
              return;
            }

            // Add player if not already in room
            const existing = room.players.find((p) => p.id === client.id);
            if (!existing) {
              room.players.push({
                id: client.id,
                name: client.name,
                avatar: client.avatar,
                ready: false,
                isHost: false,
              });
            }

            client.currentRoomCode = code;

            broadcastToRoom(code, {
              type: 'ROOM_UPDATED',
              room,
            });

            ws.send(
              JSON.stringify({
                type: 'ROOM_JOINED_SUCCESS',
                room,
              })
            );
            break;
          }

          case 'TOGGLE_READY': {
            if (!client.currentRoomCode) return;
            const room = gameRooms.get(client.currentRoomCode);
            if (!room) return;

            const player = room.players.find((p) => p.id === client.id);
            if (player) {
              player.ready = !player.ready;
              broadcastToRoom(room.code, {
                type: 'ROOM_UPDATED',
                room,
              });
            }
            break;
          }

          case 'START_MULTIPLAYER_GAME': {
            if (!client.currentRoomCode) return;
            const room = gameRooms.get(client.currentRoomCode);
            if (!room || room.hostId !== client.id) return;

            room.status = 'PLAYING';
            broadcastToRoom(room.code, {
              type: 'MULTIPLAYER_GAME_STARTED',
              room,
            });
            break;
          }

          case 'SYNC_GAME_MOVE': {
            if (!client.currentRoomCode) return;
            const room = gameRooms.get(client.currentRoomCode);
            if (!room) return;

            room.gameState = data.gameState;

            broadcastToRoom(room.code, {
              type: 'GAME_MOVE_SYNCED',
              gameState: data.gameState,
              actionLog: data.actionLog,
            });
            break;
          }

          case 'LEAVE_ROOM': {
            if (!client.currentRoomCode) return;
            const code = client.currentRoomCode;
            const room = gameRooms.get(code);
            client.currentRoomCode = null;

            if (room) {
              room.players = room.players.filter((p) => p.id !== client.id);
              if (room.players.length === 0) {
                gameRooms.delete(code);
              } else {
                if (room.hostId === client.id) {
                  room.hostId = room.players[0].id;
                  room.players[0].isHost = true;
                  room.players[0].ready = true;
                }
                broadcastToRoom(code, {
                  type: 'ROOM_UPDATED',
                  room,
                });
              }
            }

            ws.send(JSON.stringify({ type: 'LEFT_ROOM' }));
            broadcastGlobalStats();
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('WebSocket Error:', err);
      }
    });

    ws.on('close', () => {
      const roomCode = client.currentRoomCode;
      clients.delete(ws);

      if (roomCode) {
        const room = gameRooms.get(roomCode);
        if (room) {
          room.players = room.players.filter((p) => p.id !== client.id);
          if (room.players.length === 0) {
            gameRooms.delete(roomCode);
          } else {
            if (room.hostId === client.id) {
              room.hostId = room.players[0].id;
              room.players[0].isHost = true;
              room.players[0].ready = true;
            }
            broadcastToRoom(roomCode, {
              type: 'ROOM_UPDATED',
              room,
            });
          }
        }
      }
      broadcastGlobalStats();
    });
  });

  // Lazy initialization helper for Gemini
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API endpoint for dynamic match commentary
  app.post('/api/commentary', async (req, res) => {
    try {
      const { event, playerName, details } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          commentary: `🔥 UNBELIEVABLE! ${playerName} executes a game-changing ${event}!`,
        });
      }

      const prompt = `You are "Overdrive Announcer", an energetic, witty esports caster for the high-octane card game Skip-Bo: Overdrive.
Give a brief 1-2 sentence dramatic, punchy hype commentary for this event:
Event: ${event}
Player: ${playerName}
Details: ${details || 'High velocity plays occurring!'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      const commentary = response.text?.trim() || `⚡ ${playerName} drops a clutch ${event}!`;
      res.json({ commentary });
    } catch (error: any) {
      // Graceful fallback when Gemini quota is exceeded (429) or offline
      const { event, playerName } = req.body || {};
      const fallbackCommentaries = [
        `🔥 UNBELIEVABLE! ${playerName || 'The player'} executes a game-changing ${event || 'move'}!`,
        `⚡ ${playerName || 'The player'} brings the heat with a high-velocity ${event || 'play'}!`,
        `💥 The arena roars as ${playerName || 'a player'} drops a clutch ${event || 'combo'}!`,
        `🚀 MASSIVE MOMENT! ${playerName || 'Player'} flips the board state with that ${event || 'sequence'}!`,
      ];
      const commentary = fallbackCommentaries[Math.floor(Math.random() * fallbackCommentaries.length)];
      res.json({ commentary });
    }
  });

  // API endpoint for AI tactical coach advice
  app.post('/api/advisor', async (req, res) => {
    try {
      const { gameState } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          advice: '🎯 Focus on clearing your Stockpile first! Save Wild cards for tight spots or Discard Links.',
        });
      }

      const prompt = `You are "Coach Overdrive", an expert Skip-Bo Overdrive strategist.
Analyze this player's state:
Hand Cards: ${JSON.stringify(gameState?.hand)}
Top Stockpile Card: ${JSON.stringify(gameState?.stockpileTop)}
Central Piles Top Values: ${JSON.stringify(gameState?.centralPiles)}
Opponent Stockpiles Left: ${JSON.stringify(gameState?.opponentStockpiles)}

Provide 1 short punchy tip (max 20 words) on the highest value move to make right now.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      const advice = response.text?.trim() || '🎯 Focus on emptying your Stockpile!';
      res.json({ advice });
    } catch (error: any) {
      // Graceful fallback when Gemini quota is exceeded (429) or offline
      res.json({ advice: '💡 Prioritize playing your Stockpile card over hand cards to secure the win!' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Skip-Bo Overdrive Server + WebSockets running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
