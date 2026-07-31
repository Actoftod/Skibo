export async function fetchAiCommentary(
  event: string,
  playerName: string,
  details?: string
): Promise<string> {
  try {
    const res = await fetch('/api/commentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, playerName, details }),
    });

    if (!res.ok) throw new Error('Commentary request failed');
    const data = await res.json();
    return data.commentary || `${playerName} with an intense play!`;
  } catch (err) {
    return `${playerName} executes a high-velocity ${event}!`;
  }
}

export async function fetchCoachAdvice(gameState: {
  hand: (number | 'WILD')[];
  stockpileTop: number | 'WILD' | null;
  centralPiles: number[];
  opponentStockpiles: number[];
}): Promise<string> {
  try {
    const res = await fetch('/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameState }),
    });

    if (!res.ok) throw new Error('Advisor request failed');
    const data = await res.json();
    return data.advice || 'Clear your Stockpile first!';
  } catch (err) {
    return 'Target your Stockpile card first to speed up your win!';
  }
}
