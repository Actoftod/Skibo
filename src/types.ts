export type WildType = 'VORTEX' | 'SPIKE' | 'HEIST';

export interface Card {
  id: string;
  value: number | 'WILD'; // 1-12 or 'WILD'
  wildType?: WildType;
  isFaceDown?: boolean;
}

export type AiDifficulty = 'EASY' | 'TACTICAL' | 'AGGRESSIVE' | 'OVERDRIVE';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isAi: boolean;
  aiDifficulty?: AiDifficulty;
  stockpile: Card[];
  hand: Card[];
  discards: Card[][]; // 4 discard slots
  shieldTokens: number;
  comboCount: number; // 0, 1, 2, 3+
  isVortexInverted: boolean; // Hand cards visible face-out to all
  has6thHandSlot: boolean; // Underdog Bounce perk from previous loss
  score: number;
  wins: number;
}

export interface CentralPile {
  id: number; // 0 to 3
  cards: Card[];
  topValue: number; // 0 if empty, 1..12
  isSpikeLocked: boolean;
  spikeLockedByPlayerName?: string;
}

export type GameMode = 'SINGLE_PLAYER' | 'PASS_AND_PLAY' | 'MULTIPLAYER' | 'SOLO_CAMPAIGN';

export type RankTierName = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'LEGEND';

export interface RankTier {
  name: RankTierName;
  title: string;
  icon: string;
  minRp: number;
  maxRp: number;
  minXp: number;
  minWins: number;
  color: string;
  borderColor: string;
  bgGradient: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeGlow?: string;
  badgeEmblem?: string;
  description?: string;
}

export interface SoloLevel {
  id: number;
  title: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0..3
  aiDifficulty: AiDifficulty;
  aiCount: number;
  stockpileSize: number;
  enableDraft: boolean;
  turnTimerSeconds: number;
  rewardRp: number;
  rewardXp: number;
  bossName?: string;
  bossAvatar?: string;
}

export interface MatchOpponentRecord {
  name: string;
  avatar: string;
  isAi: boolean;
  score: number;
}

export interface MatchHistoryItem {
  id: string;
  timestamp: number;
  gameMode: GameMode;
  levelTitle?: string;
  winnerName: string;
  winnerAvatar: string;
  isUserWin: boolean;
  totalScore: number;
  durationSeconds: number;
  opponents: MatchOpponentRecord[];
  rpChange: number;
  xpChange: number;
}

export interface OpponentStat {
  name: string;
  avatar: string;
  isAi: boolean;
  matchesPlayed: number;
  winsAgainst: number;
  lossesAgainst: number;
  lastPlayedTimestamp: number;
}

export type MissionGoalType =
  | 'PLAY_WILDS'
  | 'WIN_MATCHES'
  | 'CLEAR_STOCKPILE'
  | 'TRIGGER_COMBOS'
  | 'USE_SABOTAGE'
  | 'PLAY_MATCHES';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  goalType: MissionGoalType;
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  rewardAvatar?: string;
  rewardAvatarName?: string;
  completed: boolean;
  claimed: boolean;
}

export interface DailyMissionsData {
  lastResetDate: string;
  missions: DailyMission[];
}

export interface DailyStreakData {
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string; // YYYY-MM-DD
  hasPlayedToday: boolean;
  claimedToday: boolean;
  totalXPClaimed: number;
}

export interface PlayerProgression {
  totalXp: number;
  level: number;
  rp: number;
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  unlockedTitles: string[];
  activeTitle: string;
  unlockedAvatars?: string[];
  activeAvatar?: string;
  currentSoloLevelId: number;
  soloLevels: SoloLevel[];
  matchHistory?: MatchHistoryItem[];
  opponentStats?: Record<string, OpponentStat>;
  dailyMissionsData?: DailyMissionsData;
  dailyStreakData?: DailyStreakData;
}

export type GamePhase = 'SETUP' | 'DRAFT_WAGER' | 'PLAYING' | 'ROUND_OVER' | 'MATCH_OVER';

export interface CardLocation {
  type: 'HAND' | 'STOCKPILE' | 'DISCARD';
  playerIndex: number;
  handIndex?: number;
  discardIndex?: number; // 0..3
}

export interface GameSettings {
  startingStockpileSize: number; // 10, 15, 20, 25
  turnTimerSeconds: number; // 0 (disabled), 10, 15, 30
  enableDraftPhase: boolean;
  enableUnderdogBounce: boolean;
  aiCount: number; // 1, 2, 3
  aiDifficulty: AiDifficulty;
  enableSoundFX: boolean;
  gameMode: GameMode;
}

export interface ActionLog {
  id: string;
  text: string;
  type: 'PLAY' | 'COMBO' | 'SABOTAGE' | 'BLAST' | 'SHIELD' | 'DRAW' | 'BURN' | 'INFO';
  timestamp: number;
}

export interface SabotageRequest {
  type: 'VORTEX' | 'HEIST' | 'BURN';
  sourcePlayerIndex: number;
  cardPlayed?: Card;
}

export interface DraftCard {
  card: Card;
  selectedByPlayerIndex?: number;
  assignedToOpponentIndex?: number;
}
