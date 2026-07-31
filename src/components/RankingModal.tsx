import React, { useState } from 'react';
import { PlayerProgression, SoloLevel, RankTier, MatchHistoryItem, OpponentStat } from '../types';
import { getRankTier, RANK_TIERS, getWinStreakXpMultiplier } from '../utils/rankingProgression';
import { claimMissionReward, equipAvatar, getTimeUntilNextReset, claimDailyStreakReward, getStreakRewardXp } from '../utils/dailyMissions';
import {
  Trophy,
  Zap,
  Star,
  Lock,
  CheckCircle2,
  Medal,
  Award,
  Crown,
  Flame,
  Swords,
  Play,
  UserCheck,
  ShieldAlert,
  X,
  Sparkles,
  BarChart3,
  Globe,
  History,
  Clock,
  Users,
  XCircle,
  Shield,
  Target,
  Gift,
  Check,
  Calendar,
  Smile,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  progression: PlayerProgression;
  onSelectSoloLevel: (level: SoloLevel) => void;
  onUpdateTitle?: (title: string) => void;
  onUpdateProgression?: (newProg: PlayerProgression) => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const RankingModal: React.FC<RankingModalProps> = ({
  isOpen,
  onClose,
  progression,
  onSelectSoloLevel,
  onUpdateTitle,
  onUpdateProgression,
}) => {
  const [activeTab, setActiveTab] = useState<'CAMPAIGN' | 'RANKS' | 'LEADERBOARD' | 'HISTORY' | 'MISSIONS'>('CAMPAIGN');

  if (!isOpen) return null;

  const currentTier = getRankTier(progression.rp, progression.totalXp, progression.wins);
  const nextTierIndex = RANK_TIERS.findIndex((t) => t.name === currentTier.name) + 1;
  const nextTier = nextTierIndex < RANK_TIERS.length ? RANK_TIERS[nextTierIndex] : null;

  const missions = progression.dailyMissionsData?.missions || [];
  const streakData = progression.dailyStreakData || {
    currentStreak: 0,
    bestStreak: 0,
    lastPlayedDate: '',
    hasPlayedToday: false,
    claimedToday: false,
    totalXPClaimed: 0,
  };

  const currentStreakDays = streakData.currentStreak || 0;
  const isStreakClaimable = streakData.hasPlayedToday && !streakData.claimedToday;

  const handleClaimStreak = () => {
    const { updatedProg, xpAwarded } = claimDailyStreakReward(progression);
    if (xpAwarded > 0 && onUpdateProgression) {
      onUpdateProgression(updatedProg);
    }
  };

  const claimableCount = missions.filter((m) => m.completed && !m.claimed).length + (isStreakClaimable ? 1 : 0);

  const handleClaimReward = (missionId: string) => {
    const result = claimMissionReward(progression, missionId);
    if (result.claimedMission && onUpdateProgression) {
      onUpdateProgression(result.updatedProg);
    }
  };

  const handleEquipAvatar = (avatar: string) => {
    const updated = equipAvatar(progression, avatar);
    if (onUpdateProgression) {
      onUpdateProgression(updated);
    }
  };

  const rpProgressPercent = nextTier
    ? Math.min(
        100,
        Math.max(
          0,
          ((progression.rp - currentTier.minRp) / (nextTier.minRp - currentTier.minRp)) * 100
        )
      )
    : 100;

  const totalMatches = progression.wins + progression.losses;
  const winRate = totalMatches > 0 ? Math.round((progression.wins / totalMatches) * 100) : 0;

  // Simulated global leaderboard
  const leaderboardData = [
    { rank: 1, name: 'VortexKing_99', title: 'Grandmaster Legend', rp: 3450, avatar: '👑', streak: 12 },
    { rank: 2, name: 'SkipQueen_X', title: 'Grandmaster Legend', rp: 3210, avatar: '🐉', streak: 8 },
    { rank: 3, name: 'OverdriveBot_Alpha', title: 'Platinum Overdrive', rp: 2890, avatar: '🤖', streak: 5 },
    {
      rank: 4,
      name: `${progression.activeTitle || 'You'} (YOU)`,
      title: currentTier.title,
      rp: progression.rp,
      avatar: '🦊',
      streak: progression.winStreak,
      isUser: true,
    },
    { rank: 5, name: 'CardNinja_7', title: 'Gold Strategist', rp: 1750, avatar: '⚡', streak: 3 },
    { rank: 6, name: 'CozyPlayer_21', title: 'Gold Strategist', rp: 1420, avatar: '🍵', streak: 2 },
    { rank: 7, name: 'BlitzRookie', title: 'Silver Tactician', rp: 890, avatar: '🔥', streak: 1 },
  ].sort((a, b) => b.rp - a.rp);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-4xl rounded-3xl border-4 border-black bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 p-4 sm:p-6 text-amber-100 shadow-[8px_8px_0_#000] overflow-hidden my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-3 border-black bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 font-black text-slate-950 shadow-[3px_3px_0_#000]">
                <span className="text-2xl">🧸</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="transform -skew-x-6 bg-black border-2 border-yellow-400 px-3 py-0.5 rounded-lg shadow-[2px_2px_0_#000]">
                    <h2 className="text-sm sm:text-base font-black italic text-yellow-300 tracking-wider uppercase">
                      TEDDY PASS <span className="text-cyan-400">&</span> TROPHY VAULT
                    </h2>
                  </div>
                  <span className="rounded-xl border-2 border-black bg-yellow-400 px-2.5 py-0.5 text-xs font-black text-slate-950 shadow-[2px_2px_0_#000]">
                    LVL {progression.level}
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 font-extrabold mt-1">
                  Conquer Solo Campaign Stages, claim Brawl Rewards, and dominate the Global Leaderboard!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border-3 border-black bg-rose-500 text-white font-black hover:bg-rose-600 transition-all cursor-pointer shadow-[3px_3px_0_#000] active:translate-y-0.5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Overview Header Card - Styled like Reference Image "PASS ACTIVATED" Header! */}
          <div className="mb-5 rounded-3xl border-4 border-black bg-gradient-to-r from-purple-900 via-indigo-900 to-sky-900 p-4 shadow-[5px_5px_0_#000]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Left Visual Tier Badge */}
              <div className="flex items-center gap-3 border-r-0 md:border-r-3 border-black/40 pr-0 md:pr-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl border-3 ${currentTier.badgeBorder || currentTier.borderColor} ${currentTier.badgeBg || 'bg-slate-800'} ${currentTier.badgeGlow || ''} text-2xl shadow-lg relative transform hover:scale-105 transition-transform`}
                >
                  <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {currentTier.badgeEmblem || currentTier.icon}
                  </span>
                  <span className="absolute -bottom-2 -right-1 text-sm">
                    {currentTier.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black italic text-yellow-300 uppercase tracking-wider drop-shadow-[0_1px_0_#000]">
                      ACTIVE TIER BADGE
                    </span>
                    <span className="rounded-full bg-yellow-400/30 px-1.5 py-0.2 text-[9px] font-extrabold text-yellow-200 border border-yellow-400/50">
                      TIER {RANK_TIERS.findIndex((t) => t.name === currentTier.name) + 1}
                    </span>
                  </div>
                  <div className={`text-lg font-black ${currentTier.color} drop-shadow-[0_1px_0_#000] flex items-center gap-1`}>
                    <span>{currentTier.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black text-white mt-0.5">
                    <span className="text-amber-300">🏆 {progression.wins} Wins</span>
                    <span className="text-cyan-300">⚡ {progression.totalXp} XP</span>
                  </div>
                </div>
              </div>

              {/* Center Tier Progress Meter */}
              <div className="flex flex-col gap-1.5 px-2">
                <div className="flex justify-between text-xs font-black">
                  <span className="text-yellow-300 flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-yellow-400" /> TIER BADGE PROGRESS
                  </span>
                  {nextTier ? (
                    <span className="text-cyan-300 font-black">
                      NEXT: {nextTier.title} ({nextTier.icon})
                    </span>
                  ) : (
                    <span className="text-pink-300 font-black">MAX TIER UNLOCKED 👑</span>
                  )}
                </div>

                <div className="h-4 w-full rounded-2xl bg-black border-2 border-black overflow-hidden p-0.5 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rpProgressPercent}%` }}
                    className="h-full rounded-xl bg-gradient-to-r from-yellow-400 via-amber-300 to-lime-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                  />
                </div>

                {nextTier && (
                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-200/90">
                    <span>Target: {nextTier.minXp} XP & {nextTier.minWins} Wins</span>
                    <span className="text-yellow-300 font-black">{progression.rp} / {nextTier.minRp} RP</span>
                  </div>
                )}

                {/* Title selector */}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-black text-yellow-300 uppercase">ACTIVE TITLE:</span>
                  <select
                    value={progression.activeTitle}
                    onChange={(e) => onUpdateTitle?.(e.target.value)}
                    className="bg-slate-950 text-yellow-300 text-xs font-black rounded-xl px-2 py-0.5 border-2 border-black cursor-pointer shadow-[2px_2px_0_#000]"
                  >
                    {progression.unlockedTitles.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center border-l-0 sm:border-l-3 border-black/40 sm:pl-4">
                <div className="rounded-2xl bg-slate-950 border-2 border-black p-2 shadow-[2px_2px_0_#000]">
                  <div className="text-[9px] font-black text-yellow-400 uppercase">MATCH WINS</div>
                  <div className="text-base font-black text-white">{progression.wins}</div>
                </div>
                <div className="rounded-2xl bg-slate-950 border-2 border-black p-2 shadow-[2px_2px_0_#000]">
                  <div className="text-[9px] font-black text-yellow-400 uppercase">TOTAL XP</div>
                  <div className="text-base font-black text-cyan-300">{progression.totalXp}</div>
                </div>
                <div className="rounded-2xl bg-slate-950 border-2 border-black p-2 shadow-[2px_2px_0_#000] relative">
                  <div className="text-[9px] font-black text-yellow-400 uppercase">WIN STREAK</div>
                  <div className="text-base font-black text-amber-400 flex items-center justify-center gap-0.5">
                    <Swords className="h-3.5 w-3.5 text-amber-400" />
                    <span>{progression.winStreak}</span>
                  </div>
                  {progression.winStreak >= 3 && (
                    <span className="mt-0.5 inline-block rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-1.5 py-0.2 text-[8px] font-black text-slate-950 shadow-sm animate-bounce">
                      {getWinStreakXpMultiplier(progression.winStreak).label}
                    </span>
                  )}
                </div>
                <div className="rounded-2xl bg-slate-950 border-2 border-black p-2 shadow-[2px_2px_0_#000]">
                  <div className="text-[9px] font-black text-orange-400 uppercase">DAILY STREAK</div>
                  <div className="text-base font-black text-orange-400 flex items-center justify-center gap-0.5">
                    <Flame className="h-3.5 w-3.5 fill-current text-orange-500 animate-pulse" />
                    <span>{currentStreakDays}d</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Styled as Chunky 3D Cartoon Buttons */}
          <div className="flex border-b-3 border-black mb-4 gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('CAMPAIGN')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-2xl border-3 border-black transition-all cursor-pointer ${
                activeTab === 'CAMPAIGN'
                  ? 'brawl-btn-yellow shadow-[0_3px_0_#000]'
                  : 'bg-slate-900 text-amber-200 shadow-[0_2px_0_#000] opacity-80 hover:opacity-100'
              }`}
            >
              <Swords className="h-4 w-4" />
              <span>CAMPAIGN ({progression.soloLevels.filter((l) => l.completed).length}/8)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('RANKS')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-2xl border-3 border-black transition-all cursor-pointer ${
                activeTab === 'RANKS'
                  ? 'brawl-btn-green shadow-[0_3px_0_#000]'
                  : 'bg-slate-900 text-amber-200 shadow-[0_2px_0_#000] opacity-80 hover:opacity-100'
              }`}
            >
              <Medal className="h-4 w-4" />
              <span>DIVISIONS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('LEADERBOARD')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-2xl border-3 border-black transition-all cursor-pointer ${
                activeTab === 'LEADERBOARD'
                  ? 'brawl-btn-cyan shadow-[0_3px_0_#000]'
                  : 'bg-slate-900 text-amber-200 shadow-[0_2px_0_#000] opacity-80 hover:opacity-100'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>LEADERBOARD</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-2xl border-3 border-black transition-all cursor-pointer ${
                activeTab === 'HISTORY'
                  ? 'brawl-btn-pink shadow-[0_3px_0_#000]'
                  : 'bg-slate-900 text-amber-200 shadow-[0_2px_0_#000] opacity-80 hover:opacity-100'
              }`}
            >
              <History className="h-4 w-4" />
              <span>HISTORY</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MISSIONS')}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-2xl border-3 border-black transition-all cursor-pointer ${
                activeTab === 'MISSIONS'
                  ? 'brawl-btn-yellow shadow-[0_3px_0_#000]'
                  : 'bg-slate-900 text-amber-200 shadow-[0_2px_0_#000] opacity-80 hover:opacity-100'
              }`}
            >
              <Target className="h-4 w-4 text-slate-950" />
              <span>TEDDY PASS</span>
              {claimableCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-black bg-rose-500 px-1 text-[10px] font-black text-white animate-bounce shadow-[1px_1px_0_#000]">
                  {claimableCount}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: SOLO CAMPAIGN LEVELS TO BEAT */}
          {activeTab === 'CAMPAIGN' && (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {progression.soloLevels.map((level) => {
                  const isUnlocked = level.unlocked;
                  const isBoss = !!level.bossName;

                  return (
                    <div
                      key={level.id}
                      className={`relative flex flex-col justify-between rounded-2xl border-2 p-4 transition-all ${
                        isUnlocked
                          ? isBoss
                            ? 'border-purple-500/80 bg-gradient-to-br from-purple-950/80 via-[#3a2517] to-amber-950/90 shadow-lg hover:border-purple-400'
                            : 'border-amber-600/60 bg-gradient-to-br from-[#3a2517] to-[#25160c] hover:border-amber-400 shadow-md'
                          : 'border-amber-950/60 bg-[#1e120a]/80 opacity-60'
                      }`}
                    >
                      {/* Top Bar: Title & Status */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {isBoss ? (
                              <span className="rounded-md bg-purple-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs">
                                BOSS LEVEL
                              </span>
                            ) : (
                              <span className="rounded-md bg-amber-950 border border-amber-700 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                                STAGE {level.id}
                              </span>
                            )}
                            <h3 className="text-sm font-extrabold text-amber-100 truncate">
                              {level.title}
                            </h3>
                          </div>

                          {/* Star Rating */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`h-4 w-4 ${
                                  starIdx <= level.stars
                                    ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]'
                                    : 'text-amber-950 fill-amber-950/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-amber-200/80 mb-3 leading-relaxed">
                          {level.description}
                        </p>

                        {/* Level Parameters Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3 text-[10px] font-bold">
                          <span className="rounded-full bg-amber-950/80 px-2.5 py-0.5 border border-amber-900 text-amber-300">
                            🤖 AI: {level.aiDifficulty} ({level.aiCount} Bot)
                          </span>
                          <span className="rounded-full bg-amber-950/80 px-2.5 py-0.5 border border-amber-900 text-amber-300">
                            🃏 Stockpile: {level.stockpileSize} cards
                          </span>
                          {level.enableDraft && (
                            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 border border-amber-500/40 text-amber-300">
                              ⚡ Draft Wager
                            </span>
                          )}
                          {level.turnTimerSeconds > 0 && (
                            <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 border border-red-500/40 text-red-300">
                              ⏱️ {level.turnTimerSeconds}s Blitz
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Footer: Rewards & Play CTA */}
                      <div className="flex items-center justify-between border-t border-amber-900/60 pt-3 mt-1">
                        <div className="flex items-center gap-2 text-xs font-black">
                          <span className="text-amber-400 flex items-center gap-1">
                            <Trophy className="h-3.5 w-3.5" />+{level.rewardRp} RP
                          </span>
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5" />+{level.rewardXp} XP
                          </span>
                        </div>

                        {isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSoloLevel(level);
                              onClose();
                            }}
                            className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-black transition-all cursor-pointer shadow-md ${
                              isBoss
                                ? 'bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 text-white hover:brightness-115'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110'
                            }`}
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>{level.completed ? 'REPLAY LEVEL' : 'BEAT LEVEL'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 rounded-xl bg-amber-950/90 px-3 py-1 text-xs font-bold text-amber-400/60 border border-amber-900">
                            <Lock className="h-3.5 w-3.5" />
                            <span>LOCKED (Beat Level {level.id - 1})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL TIER BADGES SHOWCASE */}
          {activeTab === 'RANKS' && (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {/* Header Info Banner */}
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/80 via-[#362214] to-indigo-950/80 p-3.5 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 font-black shadow-md">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-yellow-300 uppercase tracking-tight flex items-center gap-2">
                      VISUAL TIER BADGES & MASTERY ROAD
                    </h3>
                    <p className="text-[11px] font-semibold text-amber-200/90">
                      Tier Badges upgrade visually as you earn XP and win matches in Solo Campaign & Multiplayer!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-black text-right">
                  <div className="rounded-xl bg-black/60 border border-amber-800/60 px-3 py-1">
                    <span className="text-[10px] text-amber-400 block">TOTAL XP</span>
                    <span className="text-cyan-300">⚡ {progression.totalXp} XP</span>
                  </div>
                  <div className="rounded-xl bg-black/60 border border-amber-800/60 px-3 py-1">
                    <span className="text-[10px] text-amber-400 block">MATCHES WON</span>
                    <span className="text-amber-300">🏆 {progression.wins} Wins</span>
                  </div>
                </div>
              </div>

              {/* Win Streak Multiplier Banner Card */}
              <div className="rounded-2xl border-2 border-yellow-400/80 bg-gradient-to-r from-purple-950 via-amber-950 to-red-950 p-3.5 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 fill-yellow-400 text-yellow-400 animate-pulse" />
                    <h4 className="text-xs font-black text-yellow-300 uppercase tracking-wider">
                      WIN STREAK XP MULTIPLIER BOOST
                    </h4>
                  </div>
                  <span className="text-[10px] font-black text-amber-200/90">
                    CURRENT STREAK: <span className="text-yellow-300 text-xs">{progression.winStreak} 🔥</span>
                  </span>
                </div>

                <p className="text-[11px] font-semibold text-amber-100/90 mb-3">
                  Win consecutive matches (3+) to activate a progressive XP multiplier that supercharges your Tier Badge progress!
                </p>

                {/* Multiplier Steps Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { streakReq: 3, label: '3 Wins', mult: '1.25x XP', color: 'from-yellow-500 to-amber-600', active: progression.winStreak >= 3 },
                    { streakReq: 4, label: '4 Wins', mult: '1.5x XP', color: 'from-amber-500 to-orange-600', active: progression.winStreak >= 4 },
                    { streakReq: 5, label: '5 Wins', mult: '1.75x XP', color: 'from-orange-600 to-red-600', active: progression.winStreak >= 5 },
                    { streakReq: 6, label: '6+ Wins', mult: '2.0x OVERDRIVE', color: 'from-fuchsia-600 to-purple-700', active: progression.winStreak >= 6 },
                  ].map((step) => (
                    <div
                      key={step.streakReq}
                      className={`rounded-xl border-2 p-2 text-center transition-all ${
                        step.active
                          ? 'border-yellow-300 bg-gradient-to-br ' + step.color + ' text-slate-950 shadow-[0_0_12px_rgba(250,204,21,0.7)] scale-102 font-black'
                          : 'border-slate-800 bg-slate-950/80 text-slate-400 opacity-80'
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-tight">{step.label}</div>
                      <div className={`text-xs font-black ${step.active ? 'text-slate-950' : 'text-yellow-400'}`}>
                        {step.mult}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tier Badges List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {RANK_TIERS.map((tier, idx) => {
                  const isCurrent = currentTier.name === tier.name;
                  const isXpMet = progression.totalXp >= tier.minXp;
                  const isWinsMet = progression.wins >= tier.minWins;
                  const isRpMet = progression.rp >= tier.minRp;
                  const isUnlocked = isRpMet || (isXpMet && isWinsMet);

                  // Calculate requirement progress percent
                  const xpPct = tier.minXp > 0 ? Math.min(100, Math.round((progression.totalXp / tier.minXp) * 100)) : 100;
                  const winsPct = tier.minWins > 0 ? Math.min(100, Math.round((progression.wins / tier.minWins) * 100)) : 100;

                  return (
                    <div
                      key={tier.name}
                      className={`relative flex flex-col justify-between rounded-3xl border-3 p-4 transition-all ${
                        isCurrent
                          ? 'border-yellow-400 bg-gradient-to-br from-amber-950/90 via-[#3d2714] to-purple-950/90 ring-2 ring-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                          : isUnlocked
                          ? 'border-amber-700/80 bg-gradient-to-br from-[#2a1a0f] to-[#1e120a] hover:border-amber-500'
                          : 'border-slate-800/80 bg-[#160d07]/70 opacity-75'
                      }`}
                    >
                      <div>
                        {/* Top Badge Header & Shield Icon */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            {/* Visual 3D Badge Shield Container */}
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-2xl border-3 ${tier.badgeBorder || tier.borderColor} ${tier.badgeBg || 'bg-slate-800'} ${tier.badgeGlow || ''} text-2xl shadow-xl relative transform transition-transform hover:scale-108`}
                            >
                              <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {tier.badgeEmblem || tier.icon}
                              </span>
                              <span className="absolute -bottom-1 -right-1 text-xs">
                                {tier.icon}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`text-base font-black ${tier.color}`}>{tier.title}</h4>
                                <span className="text-[10px] font-black text-amber-400/80 uppercase">
                                  TIER {idx + 1}
                                </span>
                              </div>
                              <p className="text-xs text-amber-200/80 font-medium leading-tight mt-0.5">
                                {tier.description}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge Tag */}
                          {isCurrent ? (
                            <span className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 py-1 text-[10px] font-black text-slate-950 uppercase tracking-tight shadow-md animate-pulse whitespace-nowrap">
                              CURRENT TIER
                            </span>
                          ) : isUnlocked ? (
                            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/40 whitespace-nowrap">
                              ✓ UNLOCKED
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-black text-slate-400 border border-slate-700 whitespace-nowrap">
                              🔒 LOCKED
                            </span>
                          )}
                        </div>

                        {/* Requirements Criteria Breakdown */}
                        <div className="rounded-2xl bg-black/40 border border-amber-900/60 p-2.5 mb-3 space-y-1.5 text-xs font-bold">
                          <div className="text-[10px] font-black text-yellow-300 uppercase tracking-wider mb-1">
                            UNLOCK REQUIREMENTS:
                          </div>

                          {/* XP Criteria */}
                          <div className="flex items-center justify-between text-amber-100">
                            <span className="flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Minimum XP ({tier.minXp} XP):</span>
                            </span>
                            <span className={isXpMet ? 'text-emerald-400 font-black' : 'text-cyan-300'}>
                              {isXpMet ? '✓ ' : ''}{progression.totalXp} / {tier.minXp} XP
                            </span>
                          </div>

                          {/* Matches Won Criteria */}
                          <div className="flex items-center justify-between text-amber-100">
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                              <span>Total Matches Won ({tier.minWins} Wins):</span>
                            </span>
                            <span className={isWinsMet ? 'text-emerald-400 font-black' : 'text-amber-300'}>
                              {isWinsMet ? '✓ ' : ''}{progression.wins} / {tier.minWins} Wins
                            </span>
                          </div>

                          {/* Rating Criteria */}
                          <div className="flex items-center justify-between text-amber-100">
                            <span className="flex items-center gap-1">
                              <Crown className="h-3.5 w-3.5 text-purple-400" />
                              <span>Rating RP ({tier.minRp} RP):</span>
                            </span>
                            <span className={isRpMet ? 'text-emerald-400 font-black' : 'text-purple-300'}>
                              {isRpMet ? '✓ ' : ''}{progression.rp} RP
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Perk Summary */}
                      <div className="pt-2 border-t border-amber-900/50 flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-amber-400">UNLOCKED PERK:</span>
                        <span className="font-bold text-amber-200/90 text-right">
                          {tier.name === 'BRONZE' && '🥉 Novice Solo Campaign Access'}
                          {tier.name === 'SILVER' && '🥈 Silver Frame & Tactical AI Duel'}
                          {tier.name === 'GOLD' && '🥇 Gold Champion Title & Draft Arena'}
                          {tier.name === 'PLATINUM' && '💎 Platinum Aura & Overdrive Speed Mode'}
                          {tier.name === 'DIAMOND' && '🔷 Diamond Vanguard Crest & Sabotage Booster'}
                          {tier.name === 'LEGEND' && '👑 Grandmaster Crown & Boss Gauntlets'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: GLOBAL LEADERBOARD */}
          {activeTab === 'LEADERBOARD' && (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <div className="text-xs text-amber-300/90 mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-400" />
                <span>Live Global Ranking Ladder based on player Rank Points (RP) & Solo Level Victories</span>
              </div>

              <div className="rounded-2xl border border-amber-900/80 bg-[#25160c] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-950/90 text-amber-400 font-black uppercase text-[10px] border-b border-amber-900">
                    <tr>
                      <th className="py-2.5 px-4"># RANK</th>
                      <th className="py-2.5 px-4">PLAYER</th>
                      <th className="py-2.5 px-4">DIVISION TIER</th>
                      <th className="py-2.5 px-4 text-center">RATING (RP)</th>
                      <th className="py-2.5 px-4 text-center">STREAK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/40 font-bold">
                    {leaderboardData.map((row) => (
                      <tr
                        key={row.name}
                        className={`transition-colors ${
                          row.isUser
                            ? 'bg-amber-600/20 text-yellow-200 font-extrabold border-l-4 border-l-yellow-400'
                            : 'hover:bg-amber-950/40 text-amber-100'
                        }`}
                      >
                        <td className="py-3 px-4 font-black">
                          {row.rank === 1 && '🥇 1'}
                          {row.rank === 2 && '🥈 2'}
                          {row.rank === 3 && '🥉 3'}
                          {row.rank > 3 && `#${row.rank}`}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span>{row.avatar}</span>
                            <span>{row.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-amber-300">{row.title}</td>
                        <td className="py-3 px-4 text-center font-black text-amber-400">
                          {row.rp} RP
                        </td>
                        <td className="py-3 px-4 text-center text-orange-400">
                          🔥 {row.streak}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MATCH HISTORY & OPPONENT HEAD-TO-HEAD RECORDS */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-6 max-h-[420px] overflow-y-auto pr-1">
              {/* SECTION A: LAST 5 COMPLETED GAMES DASHBOARD */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-black text-amber-100 uppercase tracking-tight">
                      Recent Match History (Last 5 Games)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400/80">
                    Total Matches Logged: {(progression.matchHistory || []).length}
                  </span>
                </div>

                {(!progression.matchHistory || progression.matchHistory.length === 0) ? (
                  <div className="rounded-2xl border border-amber-900/60 bg-[#25160c]/60 p-6 text-center text-xs text-amber-300/70">
                    No completed games logged yet. Play a match to record game history!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {progression.matchHistory.slice(0, 5).map((matchItem, idx) => {
                      return (
                        <div
                          key={matchItem.id || idx}
                          className={`rounded-2xl border p-3.5 transition-all ${
                            matchItem.isUserWin
                              ? 'border-emerald-600/60 bg-gradient-to-r from-emerald-950/40 via-[#2a1d13] to-amber-950/40'
                              : 'border-rose-950/60 bg-gradient-to-r from-rose-950/30 via-[#2a1a0f] to-amber-950/30'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-900/40">
                            {/* Match Outcome Badge */}
                            <div className="flex items-center gap-2">
                              {matchItem.isUserWin ? (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-black text-emerald-400 border border-emerald-500/40">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> VICTORY
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-black text-rose-400 border border-rose-500/40">
                                  <XCircle className="h-3.5 w-3.5" /> DEFEAT
                                </span>
                              )}

                              <span className="text-xs font-extrabold text-amber-200">
                                {matchItem.levelTitle || matchItem.gameMode.replace('_', ' ')}
                              </span>
                            </div>

                            {/* Timestamp */}
                            <span className="text-[11px] font-semibold text-amber-300/70">
                              {formatRelativeTime(matchItem.timestamp)}
                            </span>
                          </div>

                          {/* Winner, Score & Duration details grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-center">
                            {/* Winner Info */}
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{matchItem.winnerAvatar || '🏆'}</span>
                              <div>
                                <div className="text-[10px] font-bold text-amber-400 uppercase">WINNER</div>
                                <div className="font-extrabold text-amber-100 truncate">
                                  {matchItem.winnerName}
                                </div>
                              </div>
                            </div>

                            {/* Score & Duration */}
                            <div className="flex items-center justify-center gap-3 bg-amber-950/60 rounded-xl p-1.5 border border-amber-900/60 text-center">
                              <div>
                                <div className="text-[9px] font-bold text-amber-400 uppercase">SCORE</div>
                                <div className="font-black text-yellow-300">🏆 {matchItem.totalScore} pts</div>
                              </div>
                              <div className="h-6 w-px bg-amber-900/60" />
                              <div>
                                <div className="text-[9px] font-bold text-amber-400 uppercase">DURATION</div>
                                <div className="font-black text-cyan-300">⏱️ {formatDuration(matchItem.durationSeconds)}</div>
                              </div>
                            </div>

                            {/* Rating RP & XP Change */}
                            <div className="flex items-center justify-end gap-2 text-right">
                              <span
                                className={`font-black text-xs px-2.5 py-1 rounded-lg border ${
                                  matchItem.rpChange >= 0
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                }`}
                              >
                                {matchItem.rpChange >= 0 ? '+' : ''}{matchItem.rpChange} RP
                              </span>
                              <span className="font-black text-xs px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                +{matchItem.xpChange} XP
                              </span>
                            </div>
                          </div>

                          {/* Opponents In Match */}
                          {matchItem.opponents && matchItem.opponents.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-amber-900/30 flex items-center gap-2 text-[11px]">
                              <span className="font-bold text-amber-400/80">Opponents:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {matchItem.opponents.map((opp, oIdx) => (
                                  <span
                                    key={oIdx}
                                    className="inline-flex items-center gap-1 rounded-full bg-amber-950/80 px-2 py-0.5 text-amber-200 border border-amber-900 text-[10px] font-bold"
                                  >
                                    <span>{opp.avatar}</span>
                                    <span>{opp.name}</span>
                                    <span className="text-amber-400 font-extrabold">({opp.score} pts)</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION B: HEAD-TO-HEAD OPPONENT RECORDS */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-black text-amber-100 uppercase tracking-tight">
                    Head-to-Head Opponent Records
                  </h3>
                </div>

                {(!progression.opponentStats || Object.keys(progression.opponentStats).length === 0) ? (
                  <div className="rounded-2xl border border-amber-900/60 bg-[#25160c]/60 p-6 text-center text-xs text-amber-300/70">
                    No opponent statistics logged yet. Complete games against AI or players to record performance!
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-900/80 bg-[#25160c] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-amber-950/90 text-amber-400 font-black uppercase text-[10px] border-b border-amber-900">
                        <tr>
                          <th className="py-2.5 px-4">OPPONENT</th>
                          <th className="py-2.5 px-4 text-center">MATCHES</th>
                          <th className="py-2.5 px-4 text-center">W - L RECORD</th>
                          <th className="py-2.5 px-4 text-center">WIN RATE</th>
                          <th className="py-2.5 px-4 text-right">LAST MATCH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-900/40 font-bold">
                        {(Object.values(progression.opponentStats) as OpponentStat[]).map((stat) => {
                          const total = stat.matchesPlayed || (stat.winsAgainst + stat.lossesAgainst);
                          const winPct = total > 0 ? Math.round((stat.winsAgainst / total) * 100) : 0;

                          return (
                            <tr key={stat.name} className="hover:bg-amber-950/40 text-amber-100 transition-colors">
                              <td className="py-3 px-4 font-black">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{stat.avatar}</span>
                                  <div>
                                    <div className="text-amber-100">{stat.name}</div>
                                    <div className="text-[9px] font-semibold text-amber-400/80">
                                      {stat.isAi ? 'AI Bot' : 'Human Player'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-extrabold text-amber-300">
                                {total}
                              </td>
                              <td className="py-3 px-4 text-center font-black">
                                <span className="text-emerald-400">{stat.winsAgainst}W</span>
                                <span className="text-amber-400/60 mx-1">-</span>
                                <span className="text-rose-400">{stat.lossesAgainst}L</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                    winPct >= 50
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                  }`}
                                >
                                  {winPct}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-[11px] font-semibold text-amber-300/70">
                                {stat.lastPlayedTimestamp ? formatRelativeTime(stat.lastPlayedTimestamp) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DAILY MISSIONS & EXCLUSIVE AVATAR LOCKER */}
          {activeTab === 'MISSIONS' && (
            <div className="space-y-6 max-h-[420px] overflow-y-auto pr-1">
              {/* SECTION 0: DAILY LOGIN STREAK COUNTER BANNER */}
              <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-950/90 via-[#3a2012] to-purple-950/90 p-4 shadow-xl text-amber-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-amber-800/60">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 text-slate-950 font-black shadow-lg">
                      <Flame className="h-7 w-7 fill-current text-yellow-300 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-yellow-300 uppercase tracking-tight flex items-center gap-2">
                          Daily Login Streak
                        </h3>
                        <span className="rounded-full bg-orange-500/30 px-2.5 py-0.5 text-xs font-black text-amber-200 border border-orange-500/60">
                          🔥 {currentStreakDays} DAY{currentStreakDays === 1 ? '' : 'S'} STREAK
                        </span>
                      </div>
                      <p className="text-xs font-medium text-amber-200/80">
                        Play at least 1 match every day to earn scaling XP rewards!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isStreakClaimable ? (
                      <button
                        type="button"
                        onClick={handleClaimStreak}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-xs font-black text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer animate-bounce"
                      >
                        <Sparkles className="h-4 w-4 text-slate-950" />
                        <span>CLAIM STREAK BONUS (+{getStreakRewardXp(Math.max(1, currentStreakDays))} XP)</span>
                      </button>
                    ) : streakData.claimedToday ? (
                      <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3.5 py-1.5 text-xs font-black text-emerald-300 border border-emerald-500/40">
                        <Check className="h-4 w-4 text-emerald-400" /> TODAY'S BONUS CLAIMED!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-black text-amber-300 border border-amber-500/40">
                        ⚡ PLAY 1 MATCH TODAY TO CLAIM BONUS!
                      </span>
                    )}
                  </div>
                </div>

                {/* 7-Day Roadmap Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                  {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                    const rewardXp = getStreakRewardXp(dayNum);
                    const isCompleted = dayNum < currentStreakDays || (dayNum === currentStreakDays && streakData.claimedToday);
                    const isCurrentActive = dayNum === currentStreakDays || (currentStreakDays === 0 && dayNum === 1);

                    return (
                      <div
                        key={dayNum}
                        className={`flex flex-col items-center justify-between rounded-xl border p-2 transition-all ${
                          isCompleted
                            ? 'border-emerald-500/60 bg-emerald-950/80 text-emerald-200 font-bold'
                            : isCurrentActive
                            ? 'border-yellow-400 bg-gradient-to-b from-amber-900 via-amber-950 to-amber-900 text-yellow-300 font-black ring-2 ring-yellow-400/80 scale-102 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'border-amber-950/80 bg-[#1e130a]/60 text-amber-500/60'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold uppercase">DAY {dayNum}</span>
                        <div className="my-1 text-base sm:text-lg">
                          {dayNum === 7 ? '👑' : isCompleted ? '✅' : '🔥'}
                        </div>
                        <span className="text-[9px] font-black text-yellow-300">+{rewardXp} XP</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION A: DAILY MISSIONS HEADER BANNER */}
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/80 via-[#362214] to-amber-950/80 p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 font-black text-slate-950 shadow-lg">
                    <Target className="h-6 w-6 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-100 uppercase tracking-tight flex items-center gap-2">
                      Daily Challenge Board
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-500/40">
                        {missions.filter((m) => m.completed).length} / {missions.length} Completed
                      </span>
                    </h3>
                    <p className="text-xs font-semibold text-amber-300/80">
                      Complete small daily goals to earn bonus XP and unlock exclusive match avatars!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-amber-950/90 px-3 py-1.5 border border-amber-900/80 text-xs font-bold text-amber-300">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span>Resets in <strong className="text-yellow-300">{getTimeUntilNextReset()}</strong></span>
                </div>
              </div>

              {/* SECTION B: DAILY MISSIONS LIST */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {missions.map((mission) => {
                  const percent = Math.min(100, Math.round((mission.currentCount / mission.targetCount) * 100));

                  return (
                    <div
                      key={mission.id}
                      className={`rounded-2xl border p-4 transition-all flex flex-col justify-between gap-3 ${
                        mission.claimed
                          ? 'border-emerald-900/40 bg-[#1e150d]/60 opacity-85'
                          : mission.completed
                          ? 'border-yellow-400/80 bg-gradient-to-br from-[#3d2714] via-[#2d1b0e] to-amber-950/90 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-1 ring-yellow-400/50'
                          : 'border-amber-900/60 bg-[#25160c]/80 hover:border-amber-700/80'
                      }`}
                    >
                      <div>
                        {/* Header: Title + Status Badge */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-900/60 text-amber-300 border border-amber-800 text-xs font-black">
                              <Target className="h-4 w-4 text-amber-400" />
                            </span>
                            <h4 className="font-extrabold text-xs text-amber-100">{mission.title}</h4>
                          </div>

                          {mission.claimed ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/40">
                              <Check className="h-3 w-3" /> CLAIMED
                            </span>
                          ) : mission.completed ? (
                            <span className="flex items-center gap-1 rounded-full bg-yellow-400/20 px-2.5 py-0.5 text-[10px] font-black text-yellow-300 border border-yellow-400/50 animate-pulse">
                              <Sparkles className="h-3 w-3" /> READY TO CLAIM
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-amber-400/80">
                              {mission.currentCount} / {mission.targetCount}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-medium text-amber-300/80 mb-3">{mission.description}</p>

                        {/* Progress Bar */}
                        <div className="relative h-2 w-full rounded-full bg-amber-950 overflow-hidden border border-amber-900/80 mb-3">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              mission.completed
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-300'
                                : 'bg-gradient-to-r from-amber-600 to-yellow-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer: Rewards & Claim Button */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-900/40">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-950/80 px-2 py-0.5 text-[10px] font-black text-cyan-300 border border-cyan-800/80">
                            <Zap className="h-3 w-3 text-cyan-400" /> +{mission.rewardXp} XP
                          </span>
                          {mission.rewardAvatar && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-fuchsia-950/80 px-2 py-0.5 text-[10px] font-black text-fuchsia-300 border border-fuchsia-800/80">
                              <span>{mission.rewardAvatar}</span>
                              <span>{mission.rewardAvatarName}</span>
                            </span>
                          )}
                        </div>

                        {mission.completed && !mission.claimed ? (
                          <button
                            type="button"
                            onClick={() => handleClaimReward(mission.id)}
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer animate-bounce"
                          >
                            <Gift className="h-3.5 w-3.5 fill-current" />
                            <span>CLAIM</span>
                          </button>
                        ) : mission.claimed ? (
                          <span className="text-[11px] font-extrabold text-emerald-400">✓ Reward Added</span>
                        ) : (
                          <span className="text-[11px] font-extrabold text-amber-500/70">{percent}%</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SECTION C: EXCLUSIVE UNLOCKED AVATAR LOCKER */}
              <div className="mt-6 pt-4 border-t border-amber-900/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Smile className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-black text-amber-100 uppercase tracking-tight">
                      Avatar Collection Locker
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400/80">
                    Unlocked: {(progression.unlockedAvatars || ['🦊']).length} Icons
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {[
                    { avatar: '🦊', name: 'Sly Fox', defaultUnlocked: true },
                    { avatar: '🐱', name: 'Cozy Cat', defaultUnlocked: true },
                    { avatar: '🐼', name: 'Panda Ace', defaultUnlocked: true },
                    { avatar: '🐯', name: 'Tiger Strike', defaultUnlocked: true },
                    { avatar: '🦁', name: 'Lion Champion', defaultUnlocked: true },
                    { avatar: '🐉', name: 'Cosmic Dragon', missionTitle: 'Wild Fire' },
                    { avatar: '👑', name: 'Overdrive Monarch', missionTitle: 'Arena Dominator' },
                    { avatar: '⚡', name: 'Hyper Spark', missionTitle: 'Stockpile Sweeper' },
                    { avatar: '🔥', name: 'Inferno Phoenix', missionTitle: 'Sabotage Specialist' },
                    { avatar: '🚀', name: 'Rocket Surge', missionTitle: 'Combo Specialist' },
                    { avatar: '🦄', name: 'Celestial Pegasus', missionTitle: 'Overdrive Contender' },
                  ].map((item) => {
                    const unlockedList = progression.unlockedAvatars || ['🦊', '🐱', '🐼', '🐯', '🦁'];
                    const isUnlocked = item.defaultUnlocked || unlockedList.includes(item.avatar);
                    const isEquipped = (progression.activeAvatar || '🦊') === item.avatar;

                    return (
                      <div
                        key={item.avatar}
                        onClick={() => {
                          if (isUnlocked && !isEquipped) {
                            handleEquipAvatar(item.avatar);
                          }
                        }}
                        className={`relative rounded-2xl border p-3 flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                          isEquipped
                            ? 'border-yellow-400 bg-gradient-to-b from-amber-900/90 to-amber-950/90 shadow-[0_0_12px_rgba(251,191,36,0.5)] ring-2 ring-yellow-400/80 scale-105'
                            : isUnlocked
                            ? 'border-amber-900/80 bg-[#25160c] hover:border-amber-500 hover:scale-102 cursor-pointer'
                            : 'border-amber-950/60 bg-[#1a0f08]/60 opacity-60'
                        }`}
                      >
                        <span className="text-3xl">{item.avatar}</span>
                        <span className="text-[10px] font-extrabold text-amber-100 truncate max-w-full">
                          {item.name}
                        </span>

                        {isEquipped ? (
                          <span className="rounded-full bg-yellow-400 px-2 py-0.2 text-[8px] font-black text-slate-950 uppercase tracking-tight">
                            EQUIPPED
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[9px] font-bold text-amber-400/80 hover:text-amber-300">
                            Click to Equip
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[8px] font-bold text-amber-500/70">
                            <Lock className="h-2.5 w-2.5" /> {item.missionTitle || 'Locked'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
