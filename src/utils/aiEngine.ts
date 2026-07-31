import { Card, CentralPile, Player, CardLocation } from '../types';
import { canPlayOnCentralPile } from './gameEngine';

export interface AiMove {
  card: Card;
  from: CardLocation;
  toPileIndex: number; // 0..3
}

export function findBestAiMove(
  player: Player,
  playerIndex: number,
  centralPiles: CentralPile[],
  overdriveActive: boolean
): AiMove | null {
  // Priority 1: Check Stockpile Card
  if (player.stockpile.length > 0) {
    const stockCard = player.stockpile[0];
    for (let pIdx = 0; pIdx < centralPiles.length; pIdx++) {
      if (canPlayOnCentralPile(stockCard, centralPiles[pIdx], 'STOCKPILE', overdriveActive)) {
        return {
          card: stockCard,
          from: { type: 'STOCKPILE', playerIndex },
          toPileIndex: pIdx,
        };
      }
    }
  }

  // Priority 2: Check Discard Slots
  for (let dIdx = 0; dIdx < player.discards.length; dIdx++) {
    const slot = player.discards[dIdx];
    if (slot.length > 0) {
      const topDiscardCard = slot[slot.length - 1];
      for (let pIdx = 0; pIdx < centralPiles.length; pIdx++) {
        if (canPlayOnCentralPile(topDiscardCard, centralPiles[pIdx], 'DISCARD', overdriveActive)) {
          return {
            card: topDiscardCard,
            from: { type: 'DISCARD', playerIndex, discardIndex: dIdx },
            toPileIndex: pIdx,
          };
        }
      }
    }
  }

  // Priority 3: Check Hand Cards
  for (let hIdx = 0; hIdx < player.hand.length; hIdx++) {
    const handCard = player.hand[hIdx];
    for (let pIdx = 0; pIdx < centralPiles.length; pIdx++) {
      if (canPlayOnCentralPile(handCard, centralPiles[pIdx], 'HAND', overdriveActive)) {
        return {
          card: handCard,
          from: { type: 'HAND', playerIndex, handIndex: hIdx },
          toPileIndex: pIdx,
        };
      }
    }
  }

  return null;
}

export function chooseAiDiscardIndex(player: Player): { handIndex: number; discardSlotIndex: number } {
  if (player.hand.length === 0) {
    return { handIndex: 0, discardSlotIndex: 0 };
  }

  // Look for a card in hand that matches the top card of a discard slot to earn a Shield Token!
  for (let hIdx = 0; hIdx < player.hand.length; hIdx++) {
    const card = player.hand[hIdx];
    if (card.value !== 'WILD') {
      for (let dIdx = 0; dIdx < player.discards.length; dIdx++) {
        const slot = player.discards[dIdx];
        if (slot.length > 0) {
          const topCard = slot[slot.length - 1];
          if (topCard.value === card.value) {
            return { handIndex: hIdx, discardSlotIndex: dIdx };
          }
        }
      }
    }
  }

  // Look for empty discard slot
  for (let dIdx = 0; dIdx < player.discards.length; dIdx++) {
    if (player.discards[dIdx].length === 0) {
      return { handIndex: 0, discardSlotIndex: dIdx };
    }
  }

  // Default: Choose non-wild card if possible to store in smallest slot
  let bestHandIdx = 0;
  for (let hIdx = 0; hIdx < player.hand.length; hIdx++) {
    if (player.hand[hIdx].value !== 'WILD') {
      bestHandIdx = hIdx;
      break;
    }
  }

  // Find slot with fewest cards
  let minSlotIdx = 0;
  let minCount = player.discards[0].length;
  for (let dIdx = 1; dIdx < player.discards.length; dIdx++) {
    if (player.discards[dIdx].length < minCount) {
      minCount = player.discards[dIdx].length;
      minSlotIdx = dIdx;
    }
  }

  return { handIndex: bestHandIdx, discardSlotIndex: minSlotIdx };
}

export function chooseAiSabotageTarget(players: Player[], sourcePlayerIndex: number): number {
  let targetIdx = -1;
  let minStockpileSize = 999;

  players.forEach((p, idx) => {
    if (idx !== sourcePlayerIndex && p.stockpile.length > 0) {
      if (p.stockpile.length < minStockpileSize) {
        minStockpileSize = p.stockpile.length;
        targetIdx = idx;
      }
    }
  });

  return targetIdx !== -1 ? targetIdx : (sourcePlayerIndex + 1) % players.length;
}
