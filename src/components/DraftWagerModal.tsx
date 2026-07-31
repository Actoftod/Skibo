import React, { useState } from 'react';
import { Card } from '../types';
import { CardView } from './CardView';
import { Zap, Flame, Shield, ArrowRight, Sparkles } from 'lucide-react';

interface DraftWagerModalProps {
  draftCards: Card[];
  onCompleteDraft: (selectedHandCards: Card[], chosenStockpileSize: number, opponentExtraStockpileCards?: Card[]) => void;
  defaultStockpileSize: number;
}

export const DraftWagerModal: React.FC<DraftWagerModalProps> = ({
  draftCards,
  onCompleteDraft,
  defaultStockpileSize,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [targetDestination, setTargetDestination] = useState<Record<number, 'HAND' | 'OPPONENT_STOCKPILE'>>({});
  const [chosenStockpileSize, setChosenStockpileSize] = useState<number>(defaultStockpileSize || 15);

  const toggleCard = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== idx));
      const updated = { ...targetDestination };
      delete updated[idx];
      setTargetDestination(updated);
    } else if (selectedIndices.length < 5) {
      setSelectedIndices([...selectedIndices, idx]);
      // Default destination: high numbers (10, 11, 12) default to OPPONENT_STOCKPILE; otherwise HAND
      const card = draftCards[idx];
      const dest = typeof card?.value === 'number' && card.value >= 10 ? 'OPPONENT_STOCKPILE' : 'HAND';
      setTargetDestination((prev) => ({ ...prev, [idx]: dest }));
    }
  };

  const toggleDestination = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetDestination((prev) => ({
      ...prev,
      [idx]: prev[idx] === 'HAND' ? 'OPPONENT_STOCKPILE' : 'HAND',
    }));
  };

  const handleStart = () => {
    const handCards: Card[] = [];
    const opponentCards: Card[] = [];

    selectedIndices.forEach((idx) => {
      const card = draftCards[idx];
      if (targetDestination[idx] === 'OPPONENT_STOCKPILE') {
        opponentCards.push(card);
      } else {
        handCards.push(card);
      }
    });

    onCompleteDraft(handCards, chosenStockpileSize, opponentCards);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border-4 border-black bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 p-5 sm:p-6 shadow-[8px_8px_0_#000] my-auto">
        {/* Slanted Cartoon Ribbon Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-3 border-black bg-yellow-400 font-black text-slate-950 shadow-[3px_3px_0_#000]">
            <span className="text-2xl">🧸</span>
          </div>
          <div>
            <div className="transform -skew-x-6 bg-black border-2 border-yellow-400 px-3 py-1 rounded-lg shadow-[2px_2px_0_#000] inline-block">
              <h2 className="text-sm sm:text-base font-black italic text-yellow-300 uppercase tracking-wider">
                BET YOUR CARDS <span className="text-cyan-400">&</span> STOCKPILE SETUP
              </h2>
            </div>
            <p className="text-xs text-amber-200/90 font-black mt-1">
              Draft 5 cards from 10 face-up choices! Send low cards to your Hand & heavy cards to Opponents' Stockpiles!
            </p>
          </div>
        </div>

        {/* 1. Stockpile Wager Selector */}
        <div className="mb-5 rounded-2xl border-3 border-black bg-slate-950 p-3.5 shadow-[3px_3px_0_#000]">
          <div className="mb-2 flex items-center justify-between text-xs font-black">
            <span className="text-yellow-300 uppercase tracking-wider">SELECT STARTING STOCKPILE SIZE</span>
            <span className="text-cyan-300 text-[11px]">Smaller Size = Opponents Gain +1 Starting Wild Card!</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[15, 20, 25].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setChosenStockpileSize(size)}
                className={`flex flex-col items-center justify-center rounded-2xl border-3 border-black p-2.5 transition-all cursor-pointer shadow-[2px_2px_0_#000] active:translate-y-0.5 ${
                  chosenStockpileSize === size
                    ? 'bg-gradient-to-b from-yellow-400 via-amber-400 to-amber-500 text-slate-950 font-black ring-2 ring-white scale-102'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg sm:text-xl font-black">{size} CARDS</span>
                <span className={`text-[10px] font-black mt-0.5 text-center ${chosenStockpileSize === size ? 'text-slate-950' : 'text-amber-400'}`}>
                  {size === 15 ? '🔥 15 CARDS (Opponents +1 Wild)' : size === 20 ? '⚡ 20 BALANCED' : '🛡️ 25 EXTENDED'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Draft Cards Pool */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-xs font-black">
            <span className="text-yellow-300 uppercase tracking-wider">
              10 REVEALED CARDS POOL (PICK 5)
            </span>
            <span className="text-cyan-300">
              SELECTED: {selectedIndices.length} / 5
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {draftCards.slice(0, 10).map((card, idx) => {
              const isSelected = selectedIndices.includes(idx);
              const dest = targetDestination[idx];
              return (
                <div key={card.id} className="flex flex-col items-center gap-1">
                  <CardView
                    card={card}
                    size="md"
                    isSelected={isSelected}
                    onClick={() => toggleCard(idx)}
                  />
                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => toggleDestination(idx, e)}
                      className={`rounded-xl px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border-2 border-black shadow-[1px_1px_0_#000] cursor-pointer transition-all active:translate-y-0.5 ${
                        dest === 'OPPONENT_STOCKPILE'
                          ? 'bg-rose-500 text-white hover:bg-rose-600'
                          : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                      }`}
                    >
                      {dest === 'OPPONENT_STOCKPILE' ? '→ OPP STOCK' : '→ YOUR HAND'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleStart}
            disabled={selectedIndices.length < 5}
            className={`brawl-btn-yellow flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-wider shadow-[0_4px_0_#000] active:translate-y-0.5 cursor-pointer ${
              selectedIndices.length < 5 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="font-black">Lock In & Start Match</span>
            <ArrowRight className="h-4 w-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};

