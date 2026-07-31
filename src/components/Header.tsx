import React from 'react';
import { Volume2, VolumeX, Settings, BookOpen, Clock, Zap, Users, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Player, PlayerProgression } from '../types';
import { getRankTier } from '../utils/rankingProgression';

interface HeaderProps {
  turnTimer: number;
  maxTimerSeconds: number;
  isCurrentPlayerHuman: boolean;
  activePlayerName: string;
  players: Player[];
  activePlayerIndex: number;
  progression?: PlayerProgression;
  onOpenRanking?: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onOpenMultiplayer: () => void;
  soundEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  turnTimer,
  maxTimerSeconds,
  players,
  activePlayerIndex,
  progression,
  onOpenRanking,
  onOpenTutorial,
  onOpenSettings,
  onToggleSound,
  onOpenMultiplayer,
  soundEnabled,
}) => {
  const currentTier = progression ? getRankTier(progression.rp) : null;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 border-b-4 border-black px-3 py-2 shadow-[0_4px_0_#000] backdrop-blur-md text-amber-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Left Brand Title in Slanted Cartoon Ribbon */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-3 border-black bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 font-black text-slate-950 shadow-[2px_2px_0_#000]">
            <span className="text-xl">🧸</span>
          </div>
          <div className="hidden sm:block">
            <div className="transform -skew-x-6 bg-black border-2 border-amber-400 px-3 py-0.5 rounded-lg shadow-[2px_2px_0_#000]">
              <h1 className="text-xs sm:text-sm font-black italic text-amber-300 tracking-wider uppercase leading-none">
                TEDDY PASS <span className="text-cyan-400">OVERDRIVE</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Top Player Bar Widgets (matching reference image!) */}
        <div className="flex flex-1 items-center justify-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 max-w-2xl">
          {players.map((p, pIdx) => {
            const isActive = pIdx === activePlayerIndex;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black transition-all border-3 border-black ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-[3px_3px_0_#000] scale-105 ring-2 ring-white'
                    : 'bg-slate-900/90 text-amber-200/80 shadow-[2px_2px_0_#000] opacity-85 hover:opacity-100'
                }`}
              >
                {/* Avatar & Pulsing Glow Ring */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={
                      isActive
                        ? {
                            scale: [1, 1.25, 1],
                            filter: [
                              'drop-shadow(0 0 2px rgba(251,191,36,0.6))',
                              'drop-shadow(0 0 8px rgba(251,191,36,1))',
                              'drop-shadow(0 0 2px rgba(251,191,36,0.6))',
                            ],
                          }
                        : {}
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: 'easeInOut',
                    }}
                    className="flex items-center justify-center text-base"
                  >
                    <span>{p.avatar}</span>
                  </motion.div>
                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-emerald-950"></span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col text-left leading-tight">
                  <div className="flex items-center gap-1 font-black text-[11px]">
                    <span className="truncate max-w-[70px] drop-shadow-[0_1px_0_#000]">
                      {p.name} {pIdx === 0 && <span className="text-[9px] text-amber-900 font-bold">(you)</span>}
                    </span>
                    {isActive && (
                      <span className="rounded-md bg-slate-950 px-1 py-0.5 text-[8px] font-black text-amber-400 tracking-tighter uppercase animate-pulse border border-amber-400">
                        TURN
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-black ${isActive ? 'text-amber-950' : 'text-amber-400'}`}>
                    {p.stockpile.length} stock
                  </span>
                </div>
              </div>
            );
          })}

          {/* Center Turn Timer Pill Widget */}
          {maxTimerSeconds > 0 && (
            <div className="flex items-center gap-1.5 rounded-2xl border-3 border-black bg-slate-900 px-3 py-1 text-xs font-black text-amber-300 shadow-[2px_2px_0_#000]">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>{formatTimer(turnTimer)}</span>
            </div>
          )}
        </div>

        {/* Header Right Tools: Chunky 3D Cartoon Buttons */}
        <div className="flex items-center gap-1.5">
          {onOpenRanking && (
            <button
              type="button"
              onClick={onOpenRanking}
              className="brawl-btn-yellow flex items-center gap-1.5 px-3 py-1 text-xs text-slate-950 shadow-[0_3px_0_#000] active:translate-y-0.5 cursor-pointer"
              title="View Ranks, Solo Levels & Leaderboard"
            >
              <Trophy className="h-4 w-4 text-slate-950 fill-current" />
              <div className="flex items-center gap-1">
                <span>{currentTier?.icon || '🏆'}</span>
                <span className="font-black">{progression?.rp ?? 100} RP</span>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenMultiplayer}
            className="brawl-btn-green flex items-center gap-1.5 px-3 py-1 text-xs text-slate-950 shadow-[0_3px_0_#000] active:translate-y-0.5 cursor-pointer"
            title="Chat Rooms & Private Games"
          >
            <Users className="h-4 w-4 fill-current" />
            <span className="hidden sm:inline font-black">Play Online</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-slate-900 text-amber-300 shadow-[2px_2px_0_#000] active:translate-y-0.5 hover:bg-slate-800 transition-all cursor-pointer"
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-amber-400" /> : <VolumeX className="h-4 w-4 text-amber-300/40" />}
          </button>

          <button
            type="button"
            onClick={onOpenTutorial}
            className="brawl-btn-cyan flex items-center gap-1 px-2.5 py-1 text-xs text-slate-950 shadow-[0_3px_0_#000] active:translate-y-0.5 cursor-pointer"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden md:inline font-black">Rules</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-slate-900 text-amber-300 shadow-[2px_2px_0_#000] active:translate-y-0.5 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Settings className="h-4 w-4 text-amber-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
