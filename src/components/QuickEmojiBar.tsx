import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import { Smile, Sparkles, Send, Heart, Flame, Zap, Trophy, X } from 'lucide-react';

export interface TeddyReaction {
  id: string;
  name: string;
  emoji: string;
  subEmoji: string;
  label: string;
  color: string;
  bgGradient: string;
  particle: string;
  soundType: string;
  speech: string;
}

export const TEDDY_REACTIONS: TeddyReaction[] = [
  {
    id: 'hug',
    name: 'Teddy Hug',
    emoji: '🧸',
    subEmoji: '🤗',
    label: 'Big Hug!',
    color: 'text-pink-400',
    bgGradient: 'from-pink-500 via-rose-400 to-yellow-300',
    particle: '💖',
    soundType: 'hug',
    speech: 'gives a warm Teddy Hug! 🤗💖',
  },
  {
    id: 'rage',
    name: 'Teddy Stomp',
    emoji: '🧸',
    subEmoji: '🔥',
    label: 'Teddy Stomp!',
    color: 'text-rose-500',
    bgGradient: 'from-red-600 via-orange-500 to-yellow-400',
    particle: '💥',
    soundType: 'rage',
    speech: 'does a furious Teddy Stomp! 🔥💥',
  },
  {
    id: 'laugh',
    name: 'Teddy Giggle',
    emoji: '🧸',
    subEmoji: '😂',
    label: 'Hehehe!',
    color: 'text-yellow-400',
    bgGradient: 'from-amber-400 via-yellow-300 to-lime-400',
    particle: '✨',
    soundType: 'laugh',
    speech: 'giggles merrily! 😂✨',
  },
  {
    id: 'crown',
    name: 'King Teddy',
    emoji: '🧸',
    subEmoji: '👑',
    label: 'I Rule!',
    color: 'text-amber-300',
    bgGradient: 'from-yellow-400 via-amber-500 to-amber-600',
    particle: '⭐',
    soundType: 'crown',
    speech: 'flashes the King Teddy Crown! 👑⭐',
  },
  {
    id: 'flex',
    name: 'Teddy Flex',
    emoji: '🧸',
    subEmoji: '💪',
    label: 'Mighty Bear!',
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500 via-blue-500 to-purple-500',
    particle: '⚡',
    soundType: 'flex',
    speech: 'flexes cartoon teddy muscles! 💪⚡',
  },
  {
    id: 'cry',
    name: 'Teddy Pout',
    emoji: '🧸',
    subEmoji: '🥺',
    label: 'Sad Bear...',
    color: 'text-sky-300',
    bgGradient: 'from-sky-400 via-indigo-500 to-slate-700',
    particle: '💧',
    soundType: 'hug',
    speech: 'pouts with sad teddy eyes... 🥺💧',
  },
  {
    id: 'surprised',
    name: 'Teddy Shock',
    emoji: '🧸',
    subEmoji: '😲',
    label: 'Whoa!',
    color: 'text-purple-400',
    bgGradient: 'from-purple-500 via-pink-500 to-yellow-300',
    particle: '❓',
    soundType: 'laugh',
    speech: 'is shocked by that move! 😲‼️',
  },
  {
    id: 'sleepy',
    name: 'Sleeping Bear',
    emoji: '🧸',
    subEmoji: '💤',
    label: 'Zzz...',
    color: 'text-indigo-300',
    bgGradient: 'from-indigo-600 via-purple-600 to-slate-800',
    particle: '💤',
    soundType: 'hug',
    speech: 'is taking a quick teddy nap... 💤😴',
  },
];

export interface ActiveFlyingReaction {
  id: string;
  senderName: string;
  senderAvatar: string;
  targetName?: string;
  reaction: TeddyReaction;
  timestamp: number;
}

interface QuickEmojiBarProps {
  players: Player[];
  activePlayerIndex: number;
  onSendReaction: (reaction: TeddyReaction, targetPlayerId?: string) => void;
  activeFlyingReactions: ActiveFlyingReaction[];
}

export const QuickEmojiBar: React.FC<QuickEmojiBarProps> = ({
  players,
  activePlayerIndex,
  onSendReaction,
  activeFlyingReactions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('ALL');

  const activePlayer = players[activePlayerIndex];
  const opponents = players.filter((_, idx) => idx !== activePlayerIndex);

  const handleSelectReaction = (reaction: TeddyReaction) => {
    sound.playEmojiReaction(reaction.soundType);
    onSendReaction(reaction, selectedTargetId === 'ALL' ? undefined : selectedTargetId);
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. Animated Flying Teddy Bear Reaction Particles Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <AnimatePresence>
          {activeFlyingReactions.map((flying) => (
            <motion.div
              key={flying.id}
              initial={{ scale: 0.2, opacity: 0, y: 120, x: '-50%' }}
              animate={{
                scale: [0.3, 1.4, 1.1, 1.3, 0],
                opacity: [0, 1, 1, 1, 0],
                y: [100, -80, -180, -280],
                rotate: [-15, 15, -10, 10, 0],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 2.8, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center"
            >
              {/* Floating Cartoon Teddy Reaction Badge */}
              <div
                className={`relative flex items-center justify-center gap-2 rounded-3xl border-4 border-black bg-gradient-to-r ${flying.reaction.bgGradient} px-5 py-3 shadow-[6px_6px_0_#000]`}
              >
                <div className="relative flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl drop-shadow-[0_2px_0_#000]">
                    {flying.reaction.emoji}
                  </span>
                  <span className="absolute -bottom-1 -right-2 text-2xl drop-shadow-[0_2px_0_#000] animate-bounce">
                    {flying.reaction.subEmoji}
                  </span>
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="rounded-lg border-2 border-black bg-yellow-400 px-2 py-0.5 text-[10px] font-black text-slate-950 uppercase shadow-[1px_1px_0_#000]">
                      {flying.senderName}
                    </span>
                    {flying.targetName && (
                      <span className="text-[10px] font-black text-white italic">
                        → {flying.targetName}
                      </span>
                    )}
                  </div>
                  <span className="text-sm sm:text-base font-black text-white italic drop-shadow-[0_2px_0_#000]">
                    "{flying.reaction.label}"
                  </span>
                </div>
              </div>

              {/* Spawning Particle Sparks */}
              <div className="mt-2 flex gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      y: [0, -30, -60],
                      x: [(i - 2) * 15, (i - 2) * 30],
                      opacity: [1, 0.8, 0],
                      scale: [1, 1.5, 0.5],
                    }}
                    transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                    className="text-xl drop-shadow-[0_2px_0_#000]"
                  >
                    {flying.reaction.particle}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 2. Floating Quick-Emoji Control Bar */}
      <div className="fixed bottom-14 right-3 sm:right-6 z-40 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 15 }}
              className="mb-2 w-72 sm:w-80 rounded-3xl border-4 border-black bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 p-3.5 shadow-[6px_6px_0_#000] text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black/50 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">🧸</span>
                  <span className="text-xs font-black italic text-yellow-300 uppercase tracking-wider drop-shadow-[0_1px_0_#000]">
                    TEDDY QUICK-EMOJI
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border-2 border-black bg-rose-500 p-1 text-white hover:bg-rose-600 transition-all cursor-pointer shadow-[1px_1px_0_#000]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Target Selector */}
              <div className="mb-3 flex items-center justify-between gap-1 rounded-2xl border-2 border-black bg-slate-950 p-1 shadow-[2px_2px_0_#000]">
                <span className="text-[10px] font-black text-amber-300 uppercase px-2">TO:</span>
                <div className="flex gap-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedTargetId('ALL')}
                    className={`rounded-xl px-2.5 py-1 text-[10px] font-black uppercase transition-all cursor-pointer border-2 border-black ${
                      selectedTargetId === 'ALL'
                        ? 'bg-yellow-400 text-slate-950 shadow-[1px_1px_0_#000]'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    EVERYONE 🎉
                  </button>
                  {opponents.map((opp) => (
                    <button
                      key={opp.id}
                      type="button"
                      onClick={() => setSelectedTargetId(opp.id)}
                      className={`rounded-xl px-2.5 py-1 text-[10px] font-black uppercase transition-all cursor-pointer border-2 border-black ${
                        selectedTargetId === opp.id
                          ? 'bg-cyan-400 text-slate-950 shadow-[1px_1px_0_#000]'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opp.avatar} {opp.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji Buttons Grid */}
              <div className="grid grid-cols-4 gap-2">
                {TEDDY_REACTIONS.map((rx) => (
                  <button
                    key={rx.id}
                    type="button"
                    onClick={() => handleSelectReaction(rx)}
                    className="group relative flex flex-col items-center justify-center rounded-2xl border-3 border-black bg-slate-900 p-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[2px_2px_0_#000] hover:bg-slate-800"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl group-hover:animate-bounce">
                        {rx.emoji}
                      </span>
                      <span className="absolute -bottom-1 -right-1 text-sm">
                        {rx.subEmoji}
                      </span>
                    </div>
                    <span className="mt-1 text-[9px] font-black text-amber-200 text-center leading-tight truncate w-full">
                      {rx.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="brawl-btn-yellow flex items-center gap-1.5 px-3 py-2 rounded-2xl border-3 border-black text-xs font-black text-slate-950 shadow-[0_3px_0_#000] active:translate-y-0.5 hover:scale-105 cursor-pointer transition-all"
        >
          <span className="text-lg">🧸</span>
          <span className="font-black italic uppercase tracking-wider">REACTION</span>
          <Sparkles className="h-4 w-4 text-slate-950 animate-spin" />
        </button>
      </div>
    </>
  );
};
