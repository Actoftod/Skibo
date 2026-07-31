import React, { useState } from 'react';
import { Card, CardLocation } from '../types';
import { CardView } from './CardView';
import { Layers, X, Sparkles, Zap, Flame, Lock, History, ArrowDownUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DiscardStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  slotIndex: number;
  cards: Card[];
  isCurrentTurn: boolean;
  playerIndex: number;
  onSelectCard?: (location: CardLocation, card: Card) => void;
  selectedLocation?: CardLocation | null;
}

export const DiscardStackModal: React.FC<DiscardStackModalProps> = ({
  isOpen,
  onClose,
  playerName,
  slotIndex,
  cards,
  isCurrentTurn,
  playerIndex,
  onSelectCard,
  selectedLocation,
}) => {
  const [viewMode, setViewMode] = useState<'TOP_DOWN' | 'CHRONOLOGICAL'>('TOP_DOWN');

  if (!isOpen) return null;

  // TOP_DOWN: index 0 is top card
  // CHRONOLOGICAL: index 0 is 1st card played (oldest)
  const displayCards =
    viewMode === 'TOP_DOWN'
      ? [...cards].reverse()
      : [...cards];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm rounded-3xl border-3 border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border border-yellow-200 shadow-[2px_2px_0_#000]">
                <History className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-amber-300 uppercase tracking-wide leading-none">
                    Slot {slotIndex + 1} Card History
                  </h3>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-300 border border-amber-500/40">
                    LONG-PRESS
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">
                  {playerName} • {cards.length} {cards.length === 1 ? 'Card' : 'Cards'} Played Total
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-800/80 p-1.5 text-slate-400 hover:text-white cursor-pointer transition-colors border border-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* View Mode Sorting Toggle */}
          {cards.length > 0 && (
            <div className="mt-3 flex items-center justify-between gap-1 rounded-2xl border-2 border-black bg-slate-950 p-1 shadow-[2px_2px_0_#000]">
              <button
                type="button"
                onClick={() => setViewMode('TOP_DOWN')}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border-2 border-black ${
                  viewMode === 'TOP_DOWN'
                    ? 'bg-amber-400 text-slate-950 shadow-[1px_1px_0_#000]'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="h-3 w-3" />
                <span>TOP-DOWN STACK</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('CHRONOLOGICAL')}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border-2 border-black ${
                  viewMode === 'CHRONOLOGICAL'
                    ? 'bg-amber-400 text-slate-950 shadow-[1px_1px_0_#000]'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownUp className="h-3 w-3" />
                <span>OLDEST → NEWEST</span>
              </button>
            </div>
          )}

          {/* Card Stack Content */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
            {cards.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-bold">
                No cards have been discarded into Slot #{slotIndex + 1} yet.
              </div>
            ) : (
              displayCards.map((card, idx) => {
                const isTopCardInGame = card.id === cards[cards.length - 1]?.id;
                const originalIndexInStack = cards.findIndex((c) => c.id === card.id);
                const actualSequenceNumber = originalIndexInStack >= 0 ? originalIndexInStack + 1 : idx + 1;

                const isSelected =
                  selectedLocation?.type === 'DISCARD' &&
                  selectedLocation.playerIndex === playerIndex &&
                  selectedLocation.discardIndex === slotIndex;

                return (
                  <motion.div
                    key={card.id || `stack-${idx}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl border-2 transition-all ${
                      isTopCardInGame
                        ? 'bg-gradient-to-r from-amber-950/70 to-yellow-950/70 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-slate-900/80 border-slate-800 opacity-90'
                    }`}
                  >
                    {/* Left: Card Thumbnail */}
                    <div className="shrink-0 transform scale-90 origin-left">
                      <CardView
                        card={card}
                        size="md"
                        isSelected={isTopCardInGame && isSelected}
                        onClick={() => {
                          if (isTopCardInGame && isCurrentTurn && onSelectCard) {
                            onSelectCard(
                              { type: 'DISCARD', playerIndex, discardIndex: slotIndex },
                              card
                            );
                            onClose();
                          }
                        }}
                      />
                    </div>

                    {/* Middle: Details & History Sequence */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isTopCardInGame ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-[9px] font-black text-slate-950 uppercase shadow">
                            <Flame className="h-2.5 w-2.5 fill-current" />
                            TOP PLAYABLE CARD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400">
                            <Lock className="h-2.5 w-2.5 text-slate-500" />
                            BURIED UNDER STACK
                          </span>
                        )}

                        <span className="text-[10px] font-black text-amber-300">
                          #{actualSequenceNumber} Played
                        </span>
                      </div>

                      <p className="text-xs font-black text-slate-100 mt-1">
                        {card.value === 'WILD' ? (
                          <span className="text-amber-400 font-black flex items-center gap-1">
                            <Zap className="h-3 w-3 fill-amber-400" />
                            WILD ({card.wildType || 'SKIP-BO'})
                          </span>
                        ) : (
                          `Card Number: ${card.value}`
                        )}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {isTopCardInGame
                          ? isCurrentTurn
                            ? 'Tap to select & play onto a central pile!'
                            : 'Playable when your turn begins.'
                          : `Discarded as card #${actualSequenceNumber} in this slot.`}
                      </p>
                    </div>

                    {/* Right: Action button if top card */}
                    {isTopCardInGame && isCurrentTurn && onSelectCard && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCard(
                            { type: 'DISCARD', playerIndex, discardIndex: slotIndex },
                            card
                          );
                          onClose();
                        }}
                        className="shrink-0 rounded-xl border-2 border-black bg-amber-400 hover:bg-yellow-300 text-slate-950 px-2.5 py-1.5 text-xs font-black shadow-[2px_2px_0_#000] cursor-pointer transition-transform active:scale-95"
                      >
                        SELECT
                      </button>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-[10px] font-bold text-amber-300/80">
              💡 Long-press any discard slot on the mat anytime to open this history log!
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

