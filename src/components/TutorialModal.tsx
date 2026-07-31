import React, { useState } from 'react';
import { Zap, Flame, Shield, Sparkles, Layers, Eye, X, BookOpen, ChevronRight } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'COMBOS' | 'WILDS' | 'BLAST' | 'DISCARD' | 'SHIELDS' | 'UNDERDOG'>('COMBOS');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl rounded-2xl border-2 border-cyan-500/60 bg-slate-900 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">
                Skip-Bo: Overdrive — Rulebook & Strategy
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                High-velocity sequencing with sabotage, combos, and tactical agency.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 my-4 border-b border-slate-800 pb-3">
          {[
            { id: 'COMBOS', label: 'Chain Combos', icon: Zap },
            { id: 'WILDS', label: 'Aspect Wilds', icon: Sparkles },
            { id: 'BLAST', label: 'Blast Radius', icon: Flame },
            { id: 'DISCARD', label: 'Discard Linking', icon: Layers },
            { id: 'SHIELDS', label: 'Shield Tokens', icon: Shield },
            { id: 'UNDERDOG', label: 'Underdog Bounce', icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-slate-300 text-sm">
          {activeTab === 'COMBOS' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-cyan-400 text-base flex items-center gap-2">
                <Zap className="h-5 w-5" /> The "Chain Reaction" Combo Engine
              </h3>
              <p>
                In standard Skip-Bo, clearing your 5-card hand gives you a refill. In <strong className="text-white">Overdrive</strong>, clearing your hand multiple times in a single turn triggers escalating tier perks:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="font-black text-cyan-400 text-xs uppercase mb-1">Combo x1 (1st Refill)</div>
                  <p className="text-xs text-slate-400">Normal 5-card hand refill. Keep playing seamlessly!</p>
                </div>
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3">
                  <div className="font-black text-amber-400 text-xs uppercase mb-1">Combo x2 (2nd Refill)</div>
                  <p className="text-xs text-slate-400">Instantly burn/discard the top card of ANY opponent's Stockpile down to the bottom of the deck!</p>
                </div>
                <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-3">
                  <div className="font-black text-purple-400 text-xs uppercase mb-1">Combo x3 (Overdrive)</div>
                  <p className="text-xs text-slate-400">For rest of turn, you can play sequences DESCENDING (e.g., placing an 8 on a 9) on central build piles!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'WILDS' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-purple-400 text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Sabotage Aspect Wilds (18 Total)
              </h3>
              <p>
                Standard wildcards are upgraded to 3 specialized Aspect Wild types that add tactical player disruption:
              </p>
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-3 rounded-xl border border-purple-500/40 bg-purple-950/20 p-3">
                  <span className="rounded bg-purple-900 px-2 py-1 font-black text-purple-300 text-xs">VORTEX</span>
                  <div>
                    <div className="font-bold text-slate-100 text-xs">Vortex Wild (6 in deck)</div>
                    <p className="text-xs text-slate-400">Acts as a Wild card. Forces the next player to invert their entire hand (cards face-out visible to everyone!).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-950/20 p-3">
                  <span className="rounded bg-rose-900 px-2 py-1 font-black text-rose-300 text-xs">SPIKE</span>
                  <div>
                    <div className="font-bold text-slate-100 text-xs">Spike Wild (6 in deck)</div>
                    <p className="text-xs text-slate-400">Acts as a Wild card. Locks that central pile number! No player can use hand cards on it—they must use a Stockpile or Discard card!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-950/20 p-3">
                  <span className="rounded bg-amber-900 px-2 py-1 font-black text-amber-300 text-xs">HEIST</span>
                  <div>
                    <div className="font-bold text-slate-100 text-xs">Heist Wild (6 in deck)</div>
                    <p className="text-xs text-slate-400">Acts as a Wild card. Swaps the top card of your Discard pile with the top card of an opponent's Discard pile.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'BLAST' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-rose-400 text-base flex items-center gap-2">
                <Flame className="h-5 w-5" /> Blast Radius Explosions
              </h3>
              <p>
                When a central build pile reaches <strong className="text-white">12</strong>, the pile explodes and resets to 0.
              </p>
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4">
                <div className="font-extrabold text-rose-300 text-sm mb-1">The "Blast Radius" Penalty</div>
                <p className="text-xs text-slate-300">
                  The player who drops the 12 instantly forces ALL other players to discard one random card from their hand! Use this strategically to break an opponent's rhythm before their turn.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'DISCARD' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-amber-400 text-base flex items-center gap-2">
                <Layers className="h-5 w-5" /> Discard Linking
              </h3>
              <p>
                Eliminate deadlocks with Discard Linking! If your active Stockpile card matches the exact number of one of your personal Discard piles:
              </p>
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4">
                <div className="font-extrabold text-amber-300 text-sm mb-1">Under-Card Access</div>
                <p className="text-xs text-slate-300">
                  You can fuse the Stockpile card with that Discard pile for your turn, allowing you to play the card sitting directly <em className="text-amber-200">underneath</em> that top discard card!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'SHIELDS' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-cyan-400 text-base flex items-center gap-2">
                <Shield className="h-5 w-5" /> Shield Tokens
              </h3>
              <p>
                Earn Shield Tokens to defend yourself against opponent sabotage!
              </p>
              <div className="rounded-xl border border-cyan-500/40 bg-slate-950 p-4">
                <div className="font-extrabold text-cyan-300 text-sm mb-1">How to Earn Shields</div>
                <p className="text-xs text-slate-300 mb-2">
                  When ending your turn, if you place a card on top of an identical number in your discard pile (e.g. placing a 5 on top of a 5), you earn <strong className="text-cyan-400">+1 Shield Token</strong>!
                </p>
                <div className="font-extrabold text-cyan-300 text-sm mb-1">Shield Protection</div>
                <p className="text-xs text-slate-300">
                  A Shield Token automatically consumes itself to absorb and block an opponent's Vortex Wild, Heist Wild, or Combo x2 Stockpile Burn!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'UNDERDOG' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-amber-400 text-base flex items-center gap-2">
                <Eye className="h-5 w-5" /> Underdog Bounce & Perfect Match-Ending Scoring
              </h3>
              <p>
                No match is ever truly lost. Overdrive rewards decisive stock clearance and provides comeback mechanics to keep matches hyper-competitive:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4">
                  <div className="font-extrabold text-amber-300 text-sm mb-1">🏀 Underdog Bounce Perk</div>
                  <p className="text-xs text-slate-300">
                    If a player loses a match/round with more than 15 cards left in their stockpile, they gain a temporary <strong className="text-amber-300">6th hand card slot</strong> until they win a turn!
                  </p>
                </div>
                <div className="rounded-xl border border-yellow-500/40 bg-gradient-to-br from-[#382312] to-amber-950/80 p-4">
                  <div className="font-extrabold text-yellow-300 text-sm mb-1">🎯 Perfect Match-Ending Scoring</div>
                  <p className="text-xs text-slate-300">
                    Clearing your Stockpile awards <strong className="text-yellow-300">25 Base Victory Points</strong>, plus an extra <strong className="text-yellow-300">+5 Bonus Points per card</strong> remaining in all opponents' stockpiles!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-5 py-2 font-extrabold text-slate-950 text-xs uppercase tracking-wider hover:bg-cyan-400 transition-colors cursor-pointer"
          >
            <span>Got It! Let's Play</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
