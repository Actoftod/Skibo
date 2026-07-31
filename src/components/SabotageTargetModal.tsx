import React from 'react';
import { Player, SabotageRequest } from '../types';
import { Flame, Shield, Sparkles, ShieldAlert } from 'lucide-react';

interface SabotageTargetModalProps {
  request: SabotageRequest;
  players: Player[];
  onSelectTarget: (targetPlayerIndex: number) => void;
}

export const SabotageTargetModal: React.FC<SabotageTargetModalProps> = ({
  request,
  players,
  onSelectTarget,
}) => {
  const sourcePlayer = players[request.sourcePlayerIndex];

  let title = 'Select Sabotage Target';
  let description = 'Choose an opponent to disrupt.';
  let icon = <Flame className="h-6 w-6 text-rose-400" />;

  if (request.type === 'VORTEX') {
    title = 'VORTEX WILD ACTIVATED';
    description = 'Force an opponent to invert their hand (cards face-out visible to everyone!).';
    icon = <Sparkles className="h-6 w-6 text-purple-400" />;
  } else if (request.type === 'HEIST') {
    title = 'HEIST WILD ACTIVATED';
    description = 'Swap the top card of your discard pile with an opponent’s top discard card.';
    icon = <ShieldAlert className="h-6 w-6 text-amber-400" />;
  } else if (request.type === 'BURN') {
    title = 'COMBO x2: STOCKPILE BURN';
    description = 'Burn the top card of an opponent’s stockpile down to the bottom of the deck!';
    icon = <Flame className="h-6 w-6 text-rose-400" />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-rose-500/60 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 shadow">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">{title}</h2>
            <p className="text-xs text-slate-400 font-medium">{description}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {players.map((player, idx) => {
            if (idx === request.sourcePlayerIndex) return null;

            const hasShield = player.shieldTokens > 0;

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => onSelectTarget(idx)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 transition-all hover:border-cyan-400 hover:bg-slate-900 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{player.avatar}</span>
                  <div className="text-left">
                    <div className="font-extrabold text-slate-100 text-sm">{player.name}</div>
                    <div className="text-[11px] font-medium text-slate-400">
                      Stockpile: <span className="text-cyan-400 font-bold">{player.stockpile.length} Left</span>
                    </div>
                  </div>
                </div>

                <div>
                  {hasShield ? (
                    <div className="flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-950/80 px-2.5 py-1 text-xs font-bold text-cyan-300">
                      <Shield className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Has Shield (Will Block)</span>
                    </div>
                  ) : (
                    <span className="rounded-full bg-rose-950/80 px-3 py-1 text-xs font-extrabold text-rose-300 border border-rose-800/80">
                      Vulnerable
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
