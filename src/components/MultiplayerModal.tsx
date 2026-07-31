import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  MessageSquare,
  Key,
  Plus,
  ArrowRight,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  Copy,
  Zap,
  Shield,
  LogOut,
  Play,
  Globe,
  Smile,
  Trophy,
} from 'lucide-react';
import { mpClient, ChatMessage, GameRoom, RoomPlayer } from '../utils/multiplayerClient';
import { PlayerProgression, RankTier } from '../types';
import { getRankTier } from '../utils/rankingProgression';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMultiplayerGame: (room: GameRoom) => void;
  progression?: PlayerProgression;
}

const EMOJI_AVATARS = ['🦊', '🐉', '⚡', '🦉', '🐯', '🤖', '👑', '🔥', '🎲'];

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  onStartMultiplayerGame,
  progression,
}) => {
  const currentTier = progression ? getRankTier(progression.rp) : null;
  const [activeTab, setActiveTab] = useState<'CHAT' | 'PRIVATE' | 'LOBBY'>('CHAT');
  const [channel, setChannel] = useState<'lobby' | 'strategy' | 'casual'>('lobby');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [playerNameInput, setPlayerNameInput] = useState<string>(mpClient.name);
  const [avatar, setAvatar] = useState<string>(mpClient.avatar);

  // Private Game Creation State
  const [stockpileSize, setStockpileSize] = useState<number>(20);
  const [maxPlayers, setMaxPlayers] = useState<number>(2);

  // Join Code Input State
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Room Lobby State
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(mpClient.currentRoom);
  const [onlineCount, setOnlineCount] = useState<number>(mpClient.onlineCount);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mpClient.connect();

    const unsubInit = mpClient.on('init', (data) => {
      setPlayerNameInput(mpClient.name);
      setAvatar(mpClient.avatar);
      setOnlineCount(mpClient.onlineCount);
    });

    const unsubStats = mpClient.on('global_stats', (data) => {
      setOnlineCount(data.onlineCount || 1);
    });

    const unsubChat = mpClient.on('chat_messages', (msgs) => {
      setChatMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    const unsubRoom = mpClient.on('room_update', (room) => {
      setCurrentRoom(room);
      if (room) {
        setActiveTab('LOBBY');
      }
    });

    const unsubGameStarted = mpClient.on('game_started', (room) => {
      onStartMultiplayerGame(room);
      onClose();
    });

    const unsubError = mpClient.on('error', (msg) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    return () => {
      unsubInit();
      unsubStats();
      unsubChat();
      unsubRoom();
      unsubGameStarted();
      unsubError();
    };
  }, [onStartMultiplayerGame, onClose]);

  useEffect(() => {
    if (currentRoom) {
      setActiveTab('LOBBY');
    }
  }, [currentRoom]);

  const handleUpdateIdentity = (name: string, newAvatar: string) => {
    setPlayerNameInput(name);
    setAvatar(newAvatar);
    mpClient.setIdentity(name, newAvatar);
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;
    mpClient.sendChatMessage(messageInput);
    setMessageInput('');
  };

  const handleCreateGame = () => {
    mpClient.createPrivateGame(stockpileSize, maxPlayers);
  };

  const handleJoinByCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!joinCodeInput.trim() || joinCodeInput.trim().length !== 4) {
      setErrorMessage('Please enter a valid 4-digit code (e.g. 4829)');
      return;
    }
    mpClient.joinGameByCode(joinCodeInput.trim());
  };

  const handleCopyCode = () => {
    if (currentRoom?.code) {
      navigator.clipboard.writeText(currentRoom.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        className="relative w-full max-w-xl rounded-3xl border-2 border-amber-900/60 bg-gradient-to-b from-[#3a2517] via-[#2d1b0e] to-[#1e1008] p-4 sm:p-6 text-amber-100 shadow-2xl overflow-hidden"
      >
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 font-black text-slate-950 shadow-md">
              <Globe className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-amber-100 uppercase">
                  Online Multiplayer & Chat
                </h2>
                <span className="flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {onlineCount} Online
                </span>
              </div>
              <p className="text-xs text-amber-300/70 font-semibold">
                Join live chat rooms, broadcast invites, or enter private codes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Handle & Avatar Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-900/40 bg-[#25150a]/90 p-2.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300/70 uppercase">Profile:</span>
            <input
              type="text"
              value={playerNameInput}
              onChange={(e) => handleUpdateIdentity(e.target.value, avatar)}
              placeholder="Your Player Name"
              className="rounded-lg border border-amber-900/60 bg-[#190d05] px-2.5 py-1 text-xs font-bold text-amber-100 focus:outline-none focus:border-amber-400 w-32 sm:w-40"
            />
          </div>

          {/* Emoji Avatars Picker */}
          <div className="flex items-center gap-1">
            {EMOJI_AVATARS.slice(0, 5).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => handleUpdateIdentity(playerNameInput, e)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all cursor-pointer ${
                  avatar === e ? 'bg-amber-500 text-slate-950 scale-110 shadow-md' : 'bg-amber-950/50 hover:bg-amber-900/40'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-[#25150a] p-1 border border-amber-900/40 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('CHAT')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-extrabold uppercase transition-all cursor-pointer ${
              activeTab === 'CHAT'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-amber-300/70 hover:text-amber-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat Rooms</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PRIVATE')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-extrabold uppercase transition-all cursor-pointer ${
              activeTab === 'PRIVATE'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-amber-300/70 hover:text-amber-200'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Private Code</span>
          </button>

          {currentRoom && (
            <button
              type="button"
              onClick={() => setActiveTab('LOBBY')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-extrabold uppercase transition-all cursor-pointer ${
                activeTab === 'LOBBY'
                  ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse'
                  : 'text-amber-300/70 hover:text-amber-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Room #{currentRoom.code}</span>
            </button>
          )}
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 rounded-xl border border-red-500/40 bg-red-950/80 p-2 text-center text-xs font-bold text-red-200"
          >
            {errorMessage}
          </motion.div>
        )}

        {/* TAB 1: CHAT ROOMS & BROADCAST INVITES */}
        {activeTab === 'CHAT' && (
          <div className="flex flex-col gap-3">
            {/* Channel Selection */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-amber-300/70 uppercase">Rooms:</span>
              {(['lobby', 'strategy', 'casual'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => {
                    setChannel(ch);
                    mpClient.joinChatChannel(ch);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-extrabold uppercase transition-all cursor-pointer ${
                    channel === ch
                      ? 'bg-amber-900/80 text-amber-200 border border-amber-600'
                      : 'bg-amber-950/40 text-amber-400/60 hover:text-amber-200'
                  }`}
                >
                  #{ch}
                </button>
              ))}

              <div className="ml-auto">
                <button
                  type="button"
                  onClick={handleCreateGame}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-yellow-400 shadow-sm cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Host & Invite</span>
                </button>
              </div>
            </div>

            {/* Chat Messages Feed Box */}
            <div className="h-64 overflow-y-auto rounded-2xl border border-amber-900/50 bg-[#1e1008] p-3 flex flex-col gap-2.5 shadow-inner">
              {chatMessages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-xs font-bold text-amber-400/40">
                  No chat messages yet. Say hello or post a match invite!
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 rounded-xl p-2.5 text-xs transition-all ${
                      msg.isSystem
                        ? 'border border-amber-500/40 bg-gradient-to-r from-amber-950/90 to-amber-900/50'
                        : 'border border-amber-900/30 bg-[#25150a]/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-extrabold text-amber-200">
                        <span className="text-sm">{msg.avatar}</span>
                        <span>{msg.senderName}</span>
                      </div>
                      <span className="text-[10px] text-amber-400/50 font-mono">{msg.timestamp}</span>
                    </div>

                    <p className="text-amber-100 font-medium pl-6">{msg.text}</p>

                    {/* Interactive Join Button inside Chat Invite */}
                    {msg.inviteCode && (
                      <div className="mt-1 pl-6">
                        <button
                          type="button"
                          onClick={() => mpClient.joinGameByCode(msg.inviteCode!)}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-black text-white hover:bg-emerald-500 shadow-md cursor-pointer transition-all active:scale-95"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>JOIN ROOM #{msg.inviteCode}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message #${channel}...`}
                className="flex-1 rounded-xl border border-amber-900/60 bg-[#1e1008] px-3 py-2 text-xs font-bold text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-md cursor-pointer transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: PRIVATE GAME CREATION & JOIN NUMBER CODE */}
        {activeTab === 'PRIVATE' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Create Game Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-amber-900/50 bg-[#25150a]/90 p-4 shadow-lg">
              <div>
                <div className="flex items-center gap-2 font-black text-amber-200 text-sm mb-2">
                  <Plus className="h-4 w-4 text-amber-400" />
                  <span>Create Private Game</span>
                </div>
                <p className="text-xs text-amber-300/70 mb-4">
                  Generates a unique 4-digit number code to share with friends.
                </p>

                {/* Stockpile Size Selector */}
                <div className="mb-3">
                  <label className="text-[10px] font-black text-amber-300/70 uppercase block mb-1">
                    Stockpile Size:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[10, 20, 30].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setStockpileSize(size)}
                        className={`rounded-lg py-1.5 text-xs font-black transition-all cursor-pointer ${
                          stockpileSize === size
                            ? 'bg-amber-500 text-slate-950 border border-yellow-300'
                            : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/40'
                        }`}
                      >
                        {size} Cards
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Players Selector */}
                <div className="mb-4">
                  <label className="text-[10px] font-black text-amber-300/70 uppercase block mb-1">
                    Players Count:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[2, 3, 4].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setMaxPlayers(cnt)}
                        className={`rounded-lg py-1.5 text-xs font-black transition-all cursor-pointer ${
                          maxPlayers === cnt
                            ? 'bg-amber-500 text-slate-950 border border-yellow-300'
                            : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/40'
                        }`}
                      >
                        {cnt} Players
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateGame}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-black text-slate-950 uppercase tracking-wider hover:from-amber-400 hover:to-yellow-400 shadow-md cursor-pointer transition-all"
              >
                <Key className="h-4 w-4" />
                <span>Create Game Room</span>
              </button>
            </div>

            {/* Join by Code Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-amber-900/50 bg-[#25150a]/90 p-4 shadow-lg">
              <div>
                <div className="flex items-center gap-2 font-black text-amber-200 text-sm mb-2">
                  <Key className="h-4 w-4 text-amber-400" />
                  <span>Join Game by Code</span>
                </div>
                <p className="text-xs text-amber-300/70 mb-4">
                  Have a 4-digit code? Enter it below to join your friend's lobby immediately.
                </p>

                <form onSubmit={handleJoinByCode} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black text-amber-300/70 uppercase block mb-1">
                      4-Digit Code:
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value)}
                      placeholder="e.g. 4829"
                      className="w-full text-center tracking-widest text-lg font-black font-mono uppercase rounded-xl border border-amber-900/60 bg-[#1e1008] py-2 text-amber-100 placeholder-amber-400/30 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-black text-white uppercase tracking-wider hover:from-emerald-500 hover:to-teal-500 shadow-md cursor-pointer transition-all"
                  >
                    <span>JOIN ROOM</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="mt-4 text-[10px] text-center text-amber-400/50 font-semibold">
                Room codes are synchronized live across all online browsers.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE ROOM LOBBY */}
        {activeTab === 'LOBBY' && currentRoom && (
          <div className="flex flex-col gap-4">
            {/* Room Code Banner & Copy Code */}
            <div className="flex items-center justify-between rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-950/90 via-[#3a2517] to-amber-950/90 p-3.5 shadow-lg">
              <div>
                <span className="text-[10px] font-black tracking-widest text-amber-300/70 uppercase">
                  GAME ROOM CODE
                </span>
                <div className="text-3xl font-black font-mono text-yellow-300 tracking-wider">
                  #{currentRoom.code}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-2 text-xs font-black text-amber-200 hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                <Copy className="h-4 w-4 text-amber-400" />
                <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
              </button>
            </div>

            {/* Players Roster in Room */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-300 uppercase">
                  Connected Players ({currentRoom.players.length}/{currentRoom.maxPlayers}):
                </span>
                <span className="text-[10px] font-bold text-amber-400/60">
                  Stockpile: {currentRoom.stockpileSize} cards
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentRoom.players.map((p) => {
                  const isMe = p.id === mpClient.userId;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between rounded-xl border p-2.5 transition-all ${
                        isMe
                          ? 'border-amber-400 bg-amber-900/60 shadow-md'
                          : 'border-amber-900/40 bg-[#25150a]/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1 font-extrabold text-xs text-amber-100">
                            <span>{p.name}</span>
                            {isMe && <span className="text-[9px] text-amber-300">(You)</span>}
                            {p.isHost && (
                              <span className="rounded bg-amber-500 px-1 text-[9px] font-black text-slate-950">
                                HOST
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-emerald-400">Connected</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {p.ready ? (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            READY
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400/50 bg-amber-950/40 px-2 py-0.5 rounded-full">
                            Waiting...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Controls (Toggle Ready / Host Start Match) */}
            <div className="flex items-center justify-between gap-3 border-t border-amber-900/40 pt-3">
              <button
                type="button"
                onClick={() => mpClient.leaveRoom()}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-900/60 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Leave Room</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => mpClient.toggleReady()}
                  className="rounded-xl border border-amber-500/50 bg-amber-950/80 px-4 py-2 text-xs font-black text-amber-200 hover:bg-amber-900/80 transition-all cursor-pointer"
                >
                  TOGGLE READY
                </button>

                {currentRoom.hostId === mpClient.userId && (
                  <button
                    type="button"
                    onClick={() => mpClient.startMultiplayerGame()}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 py-2 text-xs font-black text-slate-950 uppercase tracking-wider hover:brightness-110 shadow-lg cursor-pointer transition-all animate-bounce"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>START MATCH</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
