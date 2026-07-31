import {
  PlayerProgression,
  DailyMission,
  DailyMissionsData,
  DailyStreakData,
  MissionGoalType,
} from '../types';
import { calculatePlayerLevel, saveProgressionToStorage } from './rankingProgression';

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getTimeUntilNextReset(): string {
  const now = new Date();
  const nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = Math.max(0, nextReset.getTime() - now.getTime());
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export function getStreakRewardXp(streakDay: number): number {
  if (streakDay <= 1) return 50;
  if (streakDay === 2) return 75;
  if (streakDay === 3) return 100;
  if (streakDay === 4) return 150;
  if (streakDay === 5) return 200;
  if (streakDay === 6) return 250;
  return 350;
}

export function ensureDailyStreak(prog: PlayerProgression): PlayerProgression {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const currentStreakData = prog.dailyStreakData;

  if (!currentStreakData) {
    const initialStreak: DailyStreakData = {
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedDate: '',
      hasPlayedToday: false,
      claimedToday: false,
      totalXPClaimed: 0,
    };
    return { ...prog, dailyStreakData: initialStreak };
  }

  // Check if date is today
  if (currentStreakData.lastPlayedDate === today) {
    return prog;
  }

  // If last played was yesterday, streak stays alive, but reset today's claim/play flags
  if (currentStreakData.lastPlayedDate === yesterday) {
    return {
      ...prog,
      dailyStreakData: {
        ...currentStreakData,
        hasPlayedToday: false,
        claimedToday: false,
      },
    };
  }

  // If last played was before yesterday, reset current streak to 0
  if (currentStreakData.lastPlayedDate !== '' && currentStreakData.lastPlayedDate !== today) {
    return {
      ...prog,
      dailyStreakData: {
        ...currentStreakData,
        currentStreak: 0,
        hasPlayedToday: false,
        claimedToday: false,
      },
    };
  }

  return prog;
}

export function markDailyMatchPlayed(prog: PlayerProgression): PlayerProgression {
  const progWithStreak = ensureDailyStreak(prog);
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const streak = progWithStreak.dailyStreakData || {
    currentStreak: 0,
    bestStreak: 0,
    lastPlayedDate: '',
    hasPlayedToday: false,
    claimedToday: false,
    totalXPClaimed: 0,
  };

  if (streak.hasPlayedToday && streak.lastPlayedDate === today) {
    return progWithStreak;
  }

  let newStreakVal = streak.currentStreak;
  if (streak.lastPlayedDate === yesterday) {
    newStreakVal = streak.currentStreak + 1;
  } else if (streak.lastPlayedDate !== today) {
    newStreakVal = 1; // start streak today
  }

  const updatedStreak: DailyStreakData = {
    ...streak,
    currentStreak: Math.max(1, newStreakVal),
    bestStreak: Math.max(streak.bestStreak, Math.max(1, newStreakVal)),
    lastPlayedDate: today,
    hasPlayedToday: true,
  };

  const updated = {
    ...progWithStreak,
    dailyStreakData: updatedStreak,
  };

  saveProgressionToStorage(updated);
  return updated;
}

export function claimDailyStreakReward(prog: PlayerProgression): {
  updatedProg: PlayerProgression;
  xpAwarded: number;
} {
  const progWithStreak = ensureDailyStreak(prog);
  const streak = progWithStreak.dailyStreakData;

  if (!streak || streak.claimedToday) {
    return { updatedProg: progWithStreak, xpAwarded: 0 };
  }

  const activeStreakDay = Math.max(1, streak.currentStreak || 1);
  const xpAwarded = getStreakRewardXp(activeStreakDay);

  const newTotalXp = progWithStreak.totalXp + xpAwarded;
  const newLevel = calculatePlayerLevel(newTotalXp);

  const updatedStreak: DailyStreakData = {
    ...streak,
    hasPlayedToday: true,
    claimedToday: true,
    totalXPClaimed: (streak.totalXPClaimed || 0) + xpAwarded,
  };

  const updatedProg: PlayerProgression = {
    ...progWithStreak,
    totalXp: newTotalXp,
    level: newLevel,
    dailyStreakData: updatedStreak,
  };

  saveProgressionToStorage(updatedProg);
  return { updatedProg, xpAwarded };
}

export const TEMPLATE_DAILY_MISSIONS: Omit<DailyMission, 'currentCount' | 'completed' | 'claimed'>[] = [
  {
    id: 'play_wilds',
    title: 'Wild Fire',
    description: 'Play 5 Wild Cards in any match',
    goalType: 'PLAY_WILDS',
    targetCount: 5,
    rewardXp: 150,
    rewardAvatar: '🐉',
    rewardAvatarName: 'Cosmic Dragon',
  },
  {
    id: 'win_matches',
    title: 'Arena Dominator',
    description: 'Win 2 Matches against AI or Online Players',
    goalType: 'WIN_MATCHES',
    targetCount: 2,
    rewardXp: 250,
    rewardAvatar: '👑',
    rewardAvatarName: 'Overdrive Monarch',
  },
  {
    id: 'clear_stockpile',
    title: 'Stockpile Sweeper',
    description: 'Play 12 Cards directly from your Stockpile',
    goalType: 'CLEAR_STOCKPILE',
    targetCount: 12,
    rewardXp: 200,
    rewardAvatar: '⚡',
    rewardAvatarName: 'Hyper Spark',
  },
  {
    id: 'use_sabotage',
    title: 'Sabotage Specialist',
    description: 'Trigger 3 Wild Sabotage moves (Vortex, Spike, or Heist)',
    goalType: 'USE_SABOTAGE',
    targetCount: 3,
    rewardXp: 180,
    rewardAvatar: '🔥',
    rewardAvatarName: 'Inferno Phoenix',
  },
  {
    id: 'trigger_combos',
    title: 'Combo Specialist',
    description: 'Trigger 3 Chain Reaction hand-clear Combos',
    goalType: 'TRIGGER_COMBOS',
    targetCount: 3,
    rewardXp: 200,
    rewardAvatar: '🚀',
    rewardAvatarName: 'Rocket Surge',
  },
  {
    id: 'play_matches',
    title: 'Overdrive Contender',
    description: 'Complete 3 full matches in any mode',
    goalType: 'PLAY_MATCHES',
    targetCount: 3,
    rewardXp: 150,
    rewardAvatar: '🦄',
    rewardAvatarName: 'Celestial Pegasus',
  },
];

export function generateDailyMissions(dateStr: string): DailyMission[] {
  // Use dateStr as deterministic seed offset or choose 4 diverse missions
  return TEMPLATE_DAILY_MISSIONS.map((template) => ({
    ...template,
    currentCount: 0,
    completed: false,
    claimed: false,
  }));
}

export function ensureDailyMissions(prog: PlayerProgression): PlayerProgression {
  const progWithStreak = ensureDailyStreak(prog);
  const today = getTodayDateString();
  const existingData = progWithStreak.dailyMissionsData;

  // Default initial unlocked avatars if none specified
  const unlockedAvatars = progWithStreak.unlockedAvatars && progWithStreak.unlockedAvatars.length > 0
    ? progWithStreak.unlockedAvatars
    : ['🦊', '🐱', '🐼', '🐯', '🦁'];

  if (!existingData || existingData.lastResetDate !== today) {
    const newMissions = generateDailyMissions(today);
    const updatedData: DailyMissionsData = {
      lastResetDate: today,
      missions: newMissions,
    };

    const updatedProg: PlayerProgression = {
      ...progWithStreak,
      unlockedAvatars,
      dailyMissionsData: updatedData,
    };
    saveProgressionToStorage(updatedProg);
    return updatedProg;
  }

  // Ensure unlockedAvatars exist
  if (!progWithStreak.unlockedAvatars) {
    const updatedProg: PlayerProgression = {
      ...progWithStreak,
      unlockedAvatars,
    };
    saveProgressionToStorage(updatedProg);
    return updatedProg;
  }

  return progWithStreak;
}

export function trackMissionProgress(
  prog: PlayerProgression,
  goalType: MissionGoalType,
  amount: number = 1
): { updatedProg: PlayerProgression; newlyCompleted: DailyMission[] } {
  const initializedProg = ensureDailyMissions(prog);
  const data = initializedProg.dailyMissionsData;
  if (!data || !data.missions) {
    return { updatedProg: initializedProg, newlyCompleted: [] };
  }

  const newlyCompleted: DailyMission[] = [];
  let updatedAny = false;

  const updatedMissions = data.missions.map((mission) => {
    if (mission.goalType !== goalType || mission.completed) {
      return mission;
    }

    const newCount = Math.min(mission.targetCount, mission.currentCount + amount);
    const isNowCompleted = newCount >= mission.targetCount;
    updatedAny = true;

    if (isNowCompleted && !mission.completed) {
      newlyCompleted.push({ ...mission, currentCount: newCount, completed: true });
    }

    return {
      ...mission,
      currentCount: newCount,
      completed: isNowCompleted,
    };
  });

  if (!updatedAny) {
    return { updatedProg: initializedProg, newlyCompleted: [] };
  }

  const updatedProg: PlayerProgression = {
    ...initializedProg,
    dailyMissionsData: {
      ...data,
      missions: updatedMissions,
    },
  };

  saveProgressionToStorage(updatedProg);
  return { updatedProg, newlyCompleted };
}

export function claimMissionReward(
  prog: PlayerProgression,
  missionId: string
): { updatedProg: PlayerProgression; claimedMission: DailyMission | null } {
  const initializedProg = ensureDailyMissions(prog);
  const data = initializedProg.dailyMissionsData;
  if (!data || !data.missions) {
    return { updatedProg: initializedProg, claimedMission: null };
  }

  let claimedMission: DailyMission | null = null;

  const updatedMissions = data.missions.map((m) => {
    if (m.id === missionId && m.completed && !m.claimed) {
      claimedMission = m;
      return { ...m, claimed: true };
    }
    return m;
  });

  if (!claimedMission) {
    return { updatedProg: initializedProg, claimedMission: null };
  }

  const targetMission = claimedMission as DailyMission;
  const newTotalXp = initializedProg.totalXp + targetMission.rewardXp;
  const newLevel = calculatePlayerLevel(newTotalXp);

  const existingAvatars = initializedProg.unlockedAvatars || ['🦊', '🐱', '🐼', '🐯', '🦁'];
  let newUnlockedAvatars = [...existingAvatars];

  if (targetMission.rewardAvatar && !newUnlockedAvatars.includes(targetMission.rewardAvatar)) {
    newUnlockedAvatars.push(targetMission.rewardAvatar);
  }

  const updatedProg: PlayerProgression = {
    ...initializedProg,
    totalXp: newTotalXp,
    level: newLevel,
    unlockedAvatars: newUnlockedAvatars,
    dailyMissionsData: {
      ...data,
      missions: updatedMissions,
    },
  };

  saveProgressionToStorage(updatedProg);
  return { updatedProg, claimedMission: targetMission };
}

export function equipAvatar(prog: PlayerProgression, avatar: string): PlayerProgression {
  const updatedProg: PlayerProgression = {
    ...prog,
    activeAvatar: avatar,
  };
  saveProgressionToStorage(updatedProg);
  return updatedProg;
}
