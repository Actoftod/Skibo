import { Card, CentralPile, Player, GameSettings, ActionLog, WildType } from '../types';

export function createDeck(): Card[] {
  const cards: Card[] = [];
  let idCounter = 1;

  // 12 of each number from 1 to 12 = 144 cards
  for (let num = 1; num <= 12; num++) {
    for (let i = 0; i < 12; i++) {
      cards.push({
        id: `card-${idCounter++}`,
        value: num,
      });
    }
  }

  // 6 Vortex Wilds
  for (let i = 0; i < 6; i++) {
    cards.push({
      id: `card-${idCounter++}`,
      value: 'WILD',
      wildType: 'VORTEX',
    });
  }

  // 6 Spike Wilds
  for (let i = 0; i < 6; i++) {
    cards.push({
      id: `card-${idCounter++}`,
      value: 'WILD',
      wildType: 'SPIKE',
    });
  }

  // 6 Heist Wilds
  for (let i = 0; i < 6; i++) {
    cards.push({
      id: `card-${idCounter++}`,
      value: 'WILD',
      wildType: 'HEIST',
    });
  }

  return shuffle(cards);
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function initializePlayers(
  settings: GameSettings,
  underdogPlayers: Set<string>,
  humanAvatar?: string
): Player[] {
  const avatars = ['⚡', '🤖', '🔥', '🎯'];
  const botNames = ['Blitz', 'Sabatron', 'Calculo'];
  const players: Player[] = [];

  // Human Player
  players.push({
    id: 'player-0',
    name: 'You (Overdriver)',
    avatar: humanAvatar || '🦊',
    isAi: false,
    stockpile: [],
    hand: [],
    discards: [[], [], [], []],
    shieldTokens: 0,
    comboCount: 0,
    isVortexInverted: false,
    has6thHandSlot: underdogPlayers.has('player-0'),
    score: 0,
    wins: 0,
  });

  // AI Players
  const aiCount = settings.gameMode === 'PASS_AND_PLAY' ? 1 : settings.aiCount;
  for (let i = 0; i < aiCount; i++) {
    const isAi = settings.gameMode === 'SINGLE_PLAYER';
    players.push({
      id: `player-${i + 1}`,
      name: isAi ? botNames[i % botNames.length] : `Player ${i + 2}`,
      avatar: avatars[(i + 1) % avatars.length],
      isAi,
      aiDifficulty: settings.aiDifficulty,
      stockpile: [],
      hand: [],
      discards: [[], [], [], []],
      shieldTokens: 0,
      comboCount: 0,
      isVortexInverted: false,
      has6thHandSlot: underdogPlayers.has(`player-${i + 1}`),
      score: 0,
      wins: 0,
    });
  }

  return players;
}

export function dealInitialCards(
  deck: Card[],
  players: Player[],
  stockpileSize: number
): { updatedDeck: Card[]; updatedPlayers: Player[] } {
  let currentDeck = [...deck];
  const updatedPlayers = players.map((player) => {
    // Deal Stockpile
    const stockpile = currentDeck.slice(0, stockpileSize);
    currentDeck = currentDeck.slice(stockpileSize);

    // Deal Hand (5 or 6 cards)
    const handSize = player.has6thHandSlot ? 6 : 5;
    const hand = currentDeck.slice(0, handSize);
    currentDeck = currentDeck.slice(handSize);

    return {
      ...player,
      stockpile,
      hand,
      discards: [[], [], [], []],
      comboCount: 0,
      isVortexInverted: false,
    };
  });

  return { updatedDeck: currentDeck, updatedPlayers };
}

export function initCentralPiles(): CentralPile[] {
  return [0, 1, 2, 3].map((id) => ({
    id,
    cards: [],
    topValue: 0,
    isSpikeLocked: false,
  }));
}

export function canPlayOnCentralPile(
  card: Card,
  pile: CentralPile,
  sourceLocationType: 'HAND' | 'STOCKPILE' | 'DISCARD',
  overdriveActive: boolean
): boolean {
  // Spike Wild Lock rule: Hand cards CANNOT be played on a spike-locked pile!
  if (pile.isSpikeLocked && sourceLocationType === 'HAND') {
    return false;
  }

  // Wild Cards can be played on any pile (unless spike locked for hand cards)
  if (card.value === 'WILD') {
    return true;
  }

  const expectedAscendingValue = pile.topValue === 12 ? 1 : pile.topValue + 1;

  if (card.value === expectedAscendingValue) {
    return true;
  }

  // Overdrive State (Combo x3): Allows playing descending (e.g. 8 on a 9)
  if (overdriveActive && pile.topValue > 0) {
    const expectedDescendingValue = pile.topValue === 1 ? 12 : pile.topValue - 1;
    if (card.value === expectedDescendingValue) {
      return true;
    }
  }

  return false;
}

export function getExpectedValueForPile(pile: CentralPile, overdriveActive: boolean): number {
  if (pile.topValue === 0) return 1;
  return pile.topValue === 12 ? 1 : pile.topValue + 1;
}

export function checkDiscardLinking(stockpileTopCard?: Card, discards?: Card[][]): number[] {
  if (!stockpileTopCard || !discards) return [];
  const linkedSlotIndices: number[] = [];

  discards.forEach((slot, idx) => {
    if (slot.length > 0) {
      const topDiscardCard = slot[slot.length - 1];
      if (
        stockpileTopCard.value !== 'WILD' &&
        topDiscardCard.value !== 'WILD' &&
        stockpileTopCard.value === topDiscardCard.value
      ) {
        linkedSlotIndices.push(idx);
      }
    }
  });

  return linkedSlotIndices;
}

export function createActionLog(text: string, type: ActionLog['type']): ActionLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    text,
    type,
    timestamp: Date.now(),
  };
}
