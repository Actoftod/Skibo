import { PlayerProgression, RankTier, SoloLevel, MatchHistoryItem, OpponentStat, MatchOpponentRecord, GameMode, Player } from '../types';
import { ensureDailyMissions, markDailyMatchPlayed } from './dailyMissions';

export const DEFAULT_MATCH_HISTORY: MatchHistoryItem[] = [
  {
    id: 'match-seed-1',
    timestamp: Date.now() - 3600000 * 2,
    gameMode: 'SOLO_CAMPAIGN',
    levelTitle: 'Level 1: Novice Duel',
    winnerName: 'Card Shark (YOU)',
    winnerAvatar: '🦊',
    isUserWin: true,
    totalScore: 75,
    durationSeconds: 142,
    opponents: [{ name: 'Rookie Bot 🤖', avatar: '🤖', isAi: true, score: 10 }],
    rpChange: 50,
    xpChange: 100,
  },
  {
    id: 'match-seed-2',
    timestamp: Date.now() - 3600000 * 18,
    gameMode: 'SOLO_CAMPAIGN',
    levelTitle: 'Level 2: Tactical Trial',
    winnerName: 'Tactical Bot 🎯',
    winnerAvatar: '🎯',
    isUserWin: false,
    totalScore: 60,
    durationSeconds: 215,
    opponents: [{ name: 'Tactical Bot 🎯', avatar: '🎯', isAi: true, score: 60 }],
    rpChange: -15,
    xpChange: 40,
  },
  {
    id: 'match-seed-3',
    timestamp: Date.now() - 3600000 * 42,
    gameMode: 'SINGLE_PLAYER',
    winnerName: 'Card Shark (YOU)',
    winnerAvatar: '🦊',
    isUserWin: true,
    totalScore: 85,
    durationSeconds: 188,
    opponents: [
      { name: 'Aggressive Bot ⚡', avatar: '⚡', isAi: true, score: 20 },
      { name: 'Rookie Bot 🤖', avatar: '🤖', isAi: true, score: 15 },
    ],
    rpChange: 65,
    xpChange: 120,
  },
];

export const DEFAULT_OPPONENT_STATS: Record<string, OpponentStat> = {
  'Rookie Bot 🤖': {
    name: 'Rookie Bot 🤖',
    avatar: '🤖',
    isAi: true,
    matchesPlayed: 2,
    winsAgainst: 2,
    lossesAgainst: 0,
    lastPlayedTimestamp: Date.now() - 3600000 * 2,
  },
  'Tactical Bot 🎯': {
    name: 'Tactical Bot 🎯',
    avatar: '🎯',
    isAi: true,
    matchesPlayed: 1,
    winsAgainst: 0,
    lossesAgainst: 1,
    lastPlayedTimestamp: Date.now() - 3600000 * 18,
  },
  'Aggressive Bot ⚡': {
    name: 'Aggressive Bot ⚡',
    avatar: '⚡',
    isAi: true,
    matchesPlayed: 1,
    winsAgainst: 1,
    lossesAgainst: 0,
    lastPlayedTimestamp: Date.now() - 3600000 * 42,
  },
};

export const RANK_TIERS: RankTier[] = [
  {
    name: 'BRONZE',
    title: 'Bronze Contender',
    icon: '🥉',
    minRp: 0,
    maxRp: 499,
    minXp: 0,
    minWins: 0,
    color: 'text-amber-500',
    borderColor: 'border-amber-700',
    bgGradient: 'from-amber-900/60 to-amber-950/80',
    badgeBg: 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950',
    badgeBorder: 'border-amber-600',
    badgeGlow: 'shadow-[0_0_15px_rgba(217,119,6,0.5)]',
    badgeEmblem: '🛡️',
    description: 'Novice contender embarking on the Skip-Bo Overdrive journey.',
  },
  {
    name: 'SILVER',
    title: 'Silver Tactician',
    icon: '🥈',
    minRp: 500,
    maxRp: 1199,
    minXp: 300,
    minWins: 2,
    color: 'text-slate-300',
    borderColor: 'border-slate-400',
    bgGradient: 'from-slate-800/80 to-slate-900/90',
    badgeBg: 'bg-gradient-to-br from-slate-400 via-slate-600 to-slate-900',
    badgeBorder: 'border-slate-300',
    badgeGlow: 'shadow-[0_0_18px_rgba(203,213,225,0.6)]',
    badgeEmblem: '⚔️',
    description: 'Resourceful tactician who masters discard stack management.',
  },
  {
    name: 'GOLD',
    title: 'Gold Strategist',
    icon: '🥇',
    minRp: 1200,
    maxRp: 1999,
    minXp: 800,
    minWins: 5,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400',
    bgGradient: 'from-amber-600/60 to-yellow-800/80',
    badgeBg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-800',
    badgeBorder: 'border-yellow-300',
    badgeGlow: 'shadow-[0_0_22px_rgba(250,204,21,0.7)]',
    badgeEmblem: '🔱',
    description: 'Formidable strategist capable of orchestrating multi-card combos.',
  },
  {
    name: 'PLATINUM',
    title: 'Platinum Overdrive',
    icon: '💎',
    minRp: 2000,
    maxRp: 2799,
    minXp: 1800,
    minWins: 10,
    color: 'text-cyan-300',
    borderColor: 'border-cyan-400',
    bgGradient: 'from-cyan-900/70 to-blue-950/90',
    badgeBg: 'bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-950',
    badgeBorder: 'border-cyan-300',
    badgeGlow: 'shadow-[0_0_25px_rgba(34,211,238,0.8)]',
    badgeEmblem: '💠',
    description: 'High-speed competitor with fast reflexes and high win consistency.',
  },
  {
    name: 'DIAMOND',
    title: 'Diamond Vanguard',
    icon: '🔷',
    minRp: 2800,
    maxRp: 3499,
    minXp: 3200,
    minWins: 18,
    color: 'text-fuchsia-300',
    borderColor: 'border-fuchsia-400',
    bgGradient: 'from-fuchsia-900/80 via-purple-900/80 to-slate-950',
    badgeBg: 'bg-gradient-to-br from-fuchsia-500 via-purple-700 to-indigo-950',
    badgeBorder: 'border-fuchsia-300',
    badgeGlow: 'shadow-[0_0_28px_rgba(232,121,249,0.85)]',
    badgeEmblem: '🔮',
    description: 'Elite Vanguard demonstrating mastery over Sabotage VORTEX strikes.',
  },
  {
    name: 'LEGEND',
    title: 'Grandmaster Legend',
    icon: '👑',
    minRp: 3500,
    maxRp: 99999,
    minXp: 5000,
    minWins: 30,
    color: 'text-purple-300',
    borderColor: 'border-purple-400',
    bgGradient: 'from-purple-900/80 via-amber-900/60 to-purple-950/90',
    badgeBg: 'bg-gradient-to-br from-amber-400 via-fuchsia-600 to-purple-950',
    badgeBorder: 'border-yellow-300',
    badgeGlow: 'shadow-[0_0_35px_rgba(250,204,21,0.9)]',
    badgeEmblem: '👑',
    description: 'The supreme ruler of the Teddy Pass & Trophy Vault!',
  },
];

export const DEFAULT_SOLO_LEVELS: SoloLevel[] = [
  {
    id: 1,
    title: 'Level 1: Novice Duel',
    description: 'Face off against 1 Rookie Bot to learn the fundamentals of clearing your stockpile.',
    unlocked: true,
    completed: false,
    stars: 0,
    aiDifficulty: 'EASY',
    aiCount: 1,
    stockpileSize: 10,
    enableDraft: false,
    turnTimerSeconds: 0,
    rewardRp: 50,
    rewardXp: 100,
  },
  {
    id: 2,
    title: 'Level 2: Tactical Trial',
    description: 'Defeat a Tactical Bot who carefully reserves wildcards and shield counters.',
    unlocked: false,
    completed: false,
    stars: 0,
    aiDifficulty: 'TACTICAL',
    aiCount: 1,
    stockpileSize: 15,
    enableDraft: false,
    turnTimerSeconds: 0,
    rewardRp: 75,
    rewardXp: 150,
  },
  {
    id: 3,
    title: 'Level 3: Draft & Wager Arena',
    description: 'Engage in a 3-way draft battle where pre-round wagering gives strategic card advantages.',
    unlocked: false,
    completed: false,
    stars: 0,
    aiDifficulty: 'TACTICAL',
    aiCount: 2,
    stockpileSize: 15,
    enableDraft: true,
    turnTimerSeconds: 15,
    rewardRp: 100,
    rewardXp: 200,
  },
  {
    id: 4,
    title: 'Level 4: Triple Threat Chaos',
    description: 'Survive against 3 Aggressive Bots constantly launching Sabotage VORTEX attacks.',
    unlocked: false,
    completed: false,
    stars: 0,
    aiDifficulty: 'AGGRESSIVE',
    aiCount: 3,
    stockpileSize: 20,
    enableDraft: false,
    turnTimerSeconds: 15,
    rewardRp: 125,
    rewardXp: 250,
  },
  {
    id: 5,
    title: 'Level 5: Overdrive Speed Blitz',
    description: 'Fast-paced 10-second turn timer duel against Overdrive AI. Speed and precision required.',
    unlocked: false,
    completed: false,
    stars: 0,
    aiDifficulty: 'OVERDRIVE',
    aiCount: 1,
    stockpileSize: 20,
    enableDraft: true,
    turnTimerSeconds: 10,
    rewardRp: 150,
    rewardXp: 300,
  },
  {
    id: 6,
    title: 'Level 6: Boss Duel - Cyber Dragon',
    description: 'Epic Boss Encounter! Beat Cyber Dragon, who wields 2x Shield Tokens and intense AI strategy.',
    unlocked: false,
    completed: false,
    stars: 0,
    aiDifficulty: 'OVERDRIVE',
    aiCount: 1,
    stockpileSize: 25,
    enableDraft: true,
    turnTimerSeconds: 15,
    rewardRp: 225,
    rewardXp: 450,
    bossName: 'Cyber Dragon 🐉',
    bossAvatar: '🐉',
  },
  {
    id: 7,
    title: 'Level 7: Apex Overdrive Masters',
    description: 'A brutal 3-player match with 2 Overdrive AI opponents and 10-second timer pressure.',
    unlocked: false,
    completed: false,
    stars: 0,
    aiDifficulty: 'OVERDRIVE',
    aiCount: 2,
    stockpileSize: 25,
    enableDraft: true,
    turnTimerSeconds: 10,
    rewardRp: 275,
    rewardXp: 550,
  },
  {
    id: 8,
    title: 'Level 8: Grandmaster Gauntlet',
    description: 'The Ultimate Challenge! 3 Boss AIs with 30-card stockpiles. Claim your place as Overdrive Legend!',
    unlocked: false,
    completed: false,
    stars: 0,
    aiDifficulty: 'OVERDRIVE',
    aiCount: 3,
    stockpileSize: 30,
    enableDraft: true,
    turnTimerSeconds: 10,
    rewardRp: 350,
    rewardXp: 750,
    bossName: 'Mecha Hydra 🤖',
    bossAvatar: '🤖',
  },
];

const LOCAL_STORAGE_KEY = 'skipbo_overdrive_progression_v1';

export function getRankTier(rp: number, totalXp: number = 0, wins: number = 0): RankTier {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    const tier = RANK_TIERS[i];
    if (rp >= tier.minRp || (totalXp >= tier.minXp && wins >= tier.minWins)) {
      return tier;
    }
  }
  return RANK_TIERS[0];
}

export interface WinStreakMultiplierInfo {
  streak: number;
  multiplier: number;
  bonusPercent: number;
  label: string;
  badgeColor: string;
  badgeGlow: string;
}

export function getWinStreakXpMultiplier(streak: number): WinStreakMultiplierInfo {
  if (streak >= 6) {
    return {
      streak,
      multiplier: 2.0,
      bonusPercent: 100,
      label: '👑 OVERDRIVE 2.0x XP',
      badgeColor: 'from-amber-400 via-fuchsia-500 to-purple-600 text-slate-950 border-yellow-300',
      badgeGlow: 'shadow-[0_0_20px_rgba(250,204,21,0.8)]',
    };
  }
  if (streak === 5) {
    return {
      streak,
      multiplier: 1.75,
      bonusPercent: 75,
      label: '💥 1.75x XP BOOST',
      badgeColor: 'from-orange-500 via-red-500 to-amber-500 text-white border-yellow-300',
      badgeGlow: 'shadow-[0_0_16px_rgba(239,68,68,0.8)]',
    };
  }
  if (streak === 4) {
    return {
      streak,
      multiplier: 1.5,
      bonusPercent: 50,
      label: '⚡ 1.5x XP BOOST',
      badgeColor: 'from-amber-400 to-orange-500 text-slate-950 border-yellow-200',
      badgeGlow: 'shadow-[0_0_14px_rgba(245,158,11,0.7)]',
    };
  }
  if (streak === 3) {
    return {
      streak,
      multiplier: 1.25,
      bonusPercent: 25,
      label: '🔥 1.25x XP BOOST',
      badgeColor: 'from-yellow-400 to-amber-500 text-slate-950 border-yellow-300',
      badgeGlow: 'shadow-[0_0_12px_rgba(234,179,8,0.6)]',
    };
  }
  return {
    streak,
    multiplier: 1.0,
    bonusPercent: 0,
    label: 'NO XP MULTIPLIER',
    badgeColor: 'from-slate-700 to-slate-800 text-slate-300 border-slate-600',
    badgeGlow: '',
  };
}

export function calculatePlayerLevel(totalXp: number): number {
  return Math.floor(totalXp / 150) + 1;
}

export function getInitialProgression(): PlayerProgression {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure missing levels or new fields get merged seamlessly
      const mergedSoloLevels = DEFAULT_SOLO_LEVELS.map((defLevel) => {
        const found = parsed.soloLevels?.find((l: SoloLevel) => l.id === defLevel.id);
        if (found) {
          return { ...defLevel, ...found };
        }
        return defLevel;
      });

      const baseProg: PlayerProgression = {
        totalXp: parsed.totalXp ?? 0,
        level: calculatePlayerLevel(parsed.totalXp ?? 0),
        rp: parsed.rp ?? 100,
        wins: parsed.wins ?? 0,
        losses: parsed.losses ?? 0,
        winStreak: parsed.winStreak ?? 0,
        bestWinStreak: parsed.bestWinStreak ?? 0,
        unlockedTitles: parsed.unlockedTitles ?? ['Card Shark'],
        activeTitle: parsed.activeTitle ?? 'Card Shark',
        unlockedAvatars: parsed.unlockedAvatars ?? ['🦊', '🐱', '🐼', '🐯', '🦁'],
        activeAvatar: parsed.activeAvatar ?? '🦊',
        currentSoloLevelId: parsed.currentSoloLevelId ?? 1,
        soloLevels: mergedSoloLevels,
        matchHistory: parsed.matchHistory ?? DEFAULT_MATCH_HISTORY,
        opponentStats: parsed.opponentStats ?? DEFAULT_OPPONENT_STATS,
        dailyMissionsData: parsed.dailyMissionsData,
      };

      return ensureDailyMissions(baseProg);
    }
  } catch (e) {
    console.warn('Failed to parse saved player progression:', e);
  }

  const defaultProg: PlayerProgression = {
    totalXp: 0,
    level: 1,
    rp: 100,
    wins: 0,
    losses: 0,
    winStreak: 0,
    bestWinStreak: 0,
    unlockedTitles: ['Card Shark'],
    activeTitle: 'Card Shark',
    unlockedAvatars: ['🦊', '🐱', '🐼', '🐯', '🦁'],
    activeAvatar: '🦊',
    currentSoloLevelId: 1,
    soloLevels: DEFAULT_SOLO_LEVELS,
    matchHistory: DEFAULT_MATCH_HISTORY,
    opponentStats: DEFAULT_OPPONENT_STATS,
  };

  return ensureDailyMissions(defaultProg);
}

export function saveProgressionToStorage(prog: PlayerProgression) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prog));
  } catch (e) {
    console.warn('Failed to save progression:', e);
  }
}

export interface MatchDetailsParam {
  winner: Player;
  allPlayers: Player[];
  durationSeconds: number;
  totalScore: number;
  gameMode: GameMode;
  levelTitle?: string;
}

export interface MatchRewardResult {
  rpGained: number;
  xpGained: number;
  newLevel: number;
  leveledUp: boolean;
  tierChanged: boolean;
  oldTier: RankTier;
  newTier: RankTier;
  starsEarned?: number;
  levelUnlockedId?: number;
  updatedProgression: PlayerProgression;
}

export function recordMatchResult(
  currentProg: PlayerProgression,
  isWin: boolean,
  isMultiplayer: boolean,
  activeSoloLevelId?: number,
  matchDetails?: MatchDetailsParam
): MatchRewardResult {
  const oldTier = getRankTier(currentProg.rp);
  const oldLevel = currentProg.level;

  let rpGained = 0;
  let xpGained = 0;
  let starsEarned = 0;
  let levelUnlockedId: number | undefined = undefined;

  const newSoloLevels = [...currentProg.soloLevels];

  if (isWin) {
    // Determine rewards
    if (activeSoloLevelId) {
      const levelIdx = newSoloLevels.findIndex((l) => l.id === activeSoloLevelId);
      if (levelIdx !== -1) {
        const targetLevel = newSoloLevels[levelIdx];
        rpGained = targetLevel.rewardRp;
        xpGained = targetLevel.rewardXp;
        starsEarned = 3; // 3-star victory

        newSoloLevels[levelIdx] = {
          ...targetLevel,
          completed: true,
          stars: Math.max(targetLevel.stars, starsEarned),
        };

        // Unlock next solo level if available
        if (levelIdx + 1 < newSoloLevels.length) {
          newSoloLevels[levelIdx + 1] = {
            ...newSoloLevels[levelIdx + 1],
            unlocked: true,
          };
          levelUnlockedId = newSoloLevels[levelIdx + 1].id;
        }
      }
    } else if (isMultiplayer) {
      rpGained = 120 + Math.floor(Math.random() * 30);
      xpGained = 250;
    } else {
      rpGained = 60 + Math.floor(Math.random() * 20);
      xpGained = 120;
    }

    // Win streak bonus
    const newStreak = currentProg.winStreak + 1;
    const streakInfo = getWinStreakXpMultiplier(newStreak);
    if (newStreak >= 3) {
      rpGained += Math.min(newStreak * 15, 60);
      xpGained = Math.round(xpGained * streakInfo.multiplier);
    }

    const newRp = currentProg.rp + rpGained;
    const newTotalXp = currentProg.totalXp + xpGained;
    const newLevel = calculatePlayerLevel(newTotalXp);
    const newTier = getRankTier(newRp);

    // Unlocked titles check
    const unlockedTitles = [...currentProg.unlockedTitles];
    if (newTier.name === 'GOLD' && !unlockedTitles.includes('Gold Strategist')) {
      unlockedTitles.push('Gold Strategist');
    }
    if (newTier.name === 'PLATINUM' && !unlockedTitles.includes('Platinum Overdrive')) {
      unlockedTitles.push('Platinum Overdrive');
    }
    if (newTier.name === 'LEGEND' && !unlockedTitles.includes('Grandmaster Legend')) {
      unlockedTitles.push('Grandmaster Legend');
    }

    // Record match history & opponent stats if match details provided
    let updatedHistory = currentProg.matchHistory || DEFAULT_MATCH_HISTORY;
    let updatedOpponentStats = currentProg.opponentStats || DEFAULT_OPPONENT_STATS;

    if (matchDetails) {
      const humanPlayer = matchDetails.allPlayers[0];
      const opponentsList = matchDetails.allPlayers.filter((p) => p.id !== humanPlayer?.id);

      const opponentsRecord: MatchOpponentRecord[] = opponentsList.map((opp) => ({
        name: opp.name,
        avatar: opp.avatar,
        isAi: opp.isAi,
        score: opp.score,
      }));

      const newHistoryItem: MatchHistoryItem = {
        id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        gameMode: matchDetails.gameMode,
        levelTitle: matchDetails.levelTitle,
        winnerName: matchDetails.winner.name,
        winnerAvatar: matchDetails.winner.avatar,
        isUserWin: true,
        totalScore: matchDetails.totalScore,
        durationSeconds: matchDetails.durationSeconds,
        opponents: opponentsRecord,
        rpChange: rpGained,
        xpChange: xpGained,
      };

      updatedHistory = [newHistoryItem, ...updatedHistory].slice(0, 20);

      const oppStatsCopy = { ...updatedOpponentStats };
      opponentsRecord.forEach((opp) => {
        const existing = oppStatsCopy[opp.name] || {
          name: opp.name,
          avatar: opp.avatar,
          isAi: opp.isAi,
          matchesPlayed: 0,
          winsAgainst: 0,
          lossesAgainst: 0,
          lastPlayedTimestamp: Date.now(),
        };
        oppStatsCopy[opp.name] = {
          ...existing,
          matchesPlayed: existing.matchesPlayed + 1,
          winsAgainst: existing.winsAgainst + 1,
          lastPlayedTimestamp: Date.now(),
        };
      });
      updatedOpponentStats = oppStatsCopy;
    }

    const rawProgression: PlayerProgression = {
      ...currentProg,
      rp: newRp,
      totalXp: newTotalXp,
      level: newLevel,
      wins: currentProg.wins + 1,
      winStreak: newStreak,
      bestWinStreak: Math.max(currentProg.bestWinStreak, newStreak),
      unlockedTitles,
      soloLevels: newSoloLevels,
      matchHistory: updatedHistory,
      opponentStats: updatedOpponentStats,
    };

    const updatedProgression = markDailyMatchPlayed(rawProgression);
    saveProgressionToStorage(updatedProgression);

    return {
      rpGained,
      xpGained,
      newLevel,
      leveledUp: newLevel > oldLevel,
      tierChanged: newTier.name !== oldTier.name,
      oldTier,
      newTier,
      starsEarned,
      levelUnlockedId,
      updatedProgression,
    };
  } else {
    // Loss logic (gentle RP decay, minimum 0 RP)
    rpGained = isMultiplayer ? -25 : -15;
    xpGained = 40; // Consolation XP

    const newRp = Math.max(0, currentProg.rp + rpGained);
    const newTotalXp = currentProg.totalXp + xpGained;
    const newLevel = calculatePlayerLevel(newTotalXp);
    const newTier = getRankTier(newRp);

    // Record match history & opponent stats if match details provided
    let updatedHistory = currentProg.matchHistory || DEFAULT_MATCH_HISTORY;
    let updatedOpponentStats = currentProg.opponentStats || DEFAULT_OPPONENT_STATS;

    if (matchDetails) {
      const humanPlayer = matchDetails.allPlayers[0];
      const opponentsList = matchDetails.allPlayers.filter((p) => p.id !== humanPlayer?.id);

      const opponentsRecord: MatchOpponentRecord[] = opponentsList.map((opp) => ({
        name: opp.name,
        avatar: opp.avatar,
        isAi: opp.isAi,
        score: opp.score,
      }));

      const newHistoryItem: MatchHistoryItem = {
        id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        gameMode: matchDetails.gameMode,
        levelTitle: matchDetails.levelTitle,
        winnerName: matchDetails.winner.name,
        winnerAvatar: matchDetails.winner.avatar,
        isUserWin: false,
        totalScore: matchDetails.totalScore,
        durationSeconds: matchDetails.durationSeconds,
        opponents: opponentsRecord,
        rpChange: rpGained,
        xpChange: xpGained,
      };

      updatedHistory = [newHistoryItem, ...updatedHistory].slice(0, 20);

      const oppStatsCopy = { ...updatedOpponentStats };
      opponentsRecord.forEach((opp) => {
        const existing = oppStatsCopy[opp.name] || {
          name: opp.name,
          avatar: opp.avatar,
          isAi: opp.isAi,
          matchesPlayed: 0,
          winsAgainst: 0,
          lossesAgainst: 0,
          lastPlayedTimestamp: Date.now(),
        };
        const isOpponentWinner = matchDetails.winner.name === opp.name;
        oppStatsCopy[opp.name] = {
          ...existing,
          matchesPlayed: existing.matchesPlayed + 1,
          lossesAgainst: isOpponentWinner ? existing.lossesAgainst + 1 : existing.lossesAgainst,
          lastPlayedTimestamp: Date.now(),
        };
      });
      updatedOpponentStats = oppStatsCopy;
    }

    const rawProgression: PlayerProgression = {
      ...currentProg,
      rp: newRp,
      totalXp: newTotalXp,
      level: newLevel,
      losses: currentProg.losses + 1,
      winStreak: 0,
      matchHistory: updatedHistory,
      opponentStats: updatedOpponentStats,
    };

    const updatedProgression = markDailyMatchPlayed(rawProgression);
    saveProgressionToStorage(updatedProgression);

    return {
      rpGained,
      xpGained,
      newLevel,
      leveledUp: newLevel > oldLevel,
      tierChanged: newTier.name !== oldTier.name,
      oldTier,
      newTier,
      updatedProgression,
    };
  }
}
