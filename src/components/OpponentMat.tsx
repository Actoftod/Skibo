import React, { useState, useRef } from 'react';
import { Player, CardLocation, Card } from '../types';
import { CardView } from './CardView';
import { Shield, Zap, Eye, Sparkles, Flame, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VortexSwirlOverlay } from './VortexSwirlOverlay';
import { DiscardStackModal } from './DiscardStackModal';
import { sound } from '../utils/audio';

interface OpponentMatProps {
  player: Player;
  playerIndex: number;
  isCurrentTurn: boolean;
  selectedLocation: CardLocation | null;
  onSelectCard: (location: CardLocation, card: Card) => void;
}

export const OpponentMat: React.FC<OpponentMatProps> = ({
  player,
  playerIndex,
  isCurrentTurn,
  selectedLocation,
  onSelectCard,
}) => {
  const stockTopCard = player.stockpile.length > 0 ? player.stockpile[0] : null;
  const [inspectingSlot, setInspectingSlot] = useState<number | null>(null);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const startLongPress = (dIdx: number) => {
    isLongPressTriggeredRef.current = false;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      sound.triggerHaptic(60);
      setInspectingSlot(dIdx);
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border-2 p-2.5 transition-all duration-300 backdrop-blur-md ${
        isCurrentTurn
          ? 'border-yellow-300 bg-gradient-to-b from-[#4e3422] via-[#3a2517] to-[#2a1a0f] ring-4 ring-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.7)] scale-[1.03]'
          : 'border-amber-900/40 bg-[#2a1a0f]/85 shadow-lg'
      }`}
    >
      {/* Active Turn Subtle Border Glow Pulse Overlay */}
      <AnimatePresence>
        {isCurrentTurn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.02, 1],
              boxShadow: [
                '0 0 12px rgba(251, 191, 36, 0.4), inset 0 0 10px rgba(251, 191, 36, 0.2)',
                '0 0 30px rgba(251, 191, 36, 0.9), inset 0 0 20px rgba(251, 191, 36, 0.45)',
                '0 0 12px rgba(251, 191, 36, 0.4), inset 0 0 10px rgba(251, 191, 36, 0.2)',
              ],
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-2xl border-2 border-yellow-300/90 pointer-events-none z-20"
          />
        )}
      </AnimatePresence>

      {/* Active Turn Header Badge */}
      {isCurrentTurn && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-3 py-0.5 text-[10px] font-black text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.9)] border border-amber-200 uppercase tracking-wider whitespace-nowrap animate-bounce">
          <Zap className="h-3 w-3 fill-current text-slate-950" />
          <span>{player.name}'S TURN</span>
        </div>
      )}

      {/* Animated Floating Combo Multiplier Text Pop-up */}
      <AnimatePresence mode="wait">
        {player.comboCount > 0 && (
          <motion.div
            key={`opponent-combo-pop-${player.id}-${player.comboCount}`}
            initial={{ opacity: 0, scale: 0.2, y: 15, rotate: -10 }}
            animate={{
              opacity: [0, 1, 1, 0.95],
              scale: [0.2, 1.4, 1.1, 1],
              y: [10, -25, -35, -38],
              rotate: [-10, 5, -2, 0],
            }}
            exit={{ opacity: 0, scale: 0.4, y: -55, filter: 'blur(4px)' }}
            transition={{
              duration: 2.8,
              times: [0, 0.2, 0.45, 1],
              ease: 'easeOut',
            }}
            className="absolute -top-11 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 px-3 py-1 shadow-[0_0_30px_rgba(251,191,36,0.95),0_0_15px_rgba(239,68,68,0.7)] border-2 border-yellow-200 pointer-events-none whitespace-nowrap"
          >
            <div className="flex items-center justify-center rounded-full bg-slate-950/80 p-0.5">
              <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-bounce" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-[9px] tracking-widest text-slate-950 uppercase leading-none drop-shadow">
                COMBO MULTIPLIER!
              </span>
              <span className="font-black text-xs tracking-tighter text-slate-950 leading-none drop-shadow-md">
                🔥 x{player.comboCount} CHAIN
              </span>
            </div>
            <Sparkles className="h-3.5 w-3.5 text-slate-950 fill-current animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Avatar & Name */}
      <div className="relative -mt-6 mb-1 flex flex-col items-center">
        {/* Avatar Ring */}
        <div className="relative">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-800 shadow-lg border-2 ${
              isCurrentTurn
                ? 'border-yellow-300 ring-4 ring-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse'
                : 'border-white'
            }`}
          >
            {player.avatar || '👤'}
          </div>

          {/* Glowing Persistent Combo xN Indicator Overlay */}
          <AnimatePresence>
            {player.comboCount > 0 && (
              <motion.div
                initial={{ scale: 0.2, opacity: 0, y: 5 }}
                animate={{ scale: [1, 1.1, 1], opacity: 1, y: 0 }}
                exit={{ scale: 0.2, opacity: 0 }}
                transition={{
                  scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
                }}
                className="absolute -top-3 -right-6 z-30 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 px-2 py-0.5 text-[10px] font-black text-white shadow-[0_0_15px_rgba(245,158,11,0.9)] border-2 border-yellow-300 ring-2 ring-amber-400/60 whitespace-nowrap"
              >
                <Zap className="h-3 w-3 text-yellow-300 fill-current animate-bounce" />
                <span className="tracking-wider text-yellow-100 uppercase drop-shadow font-black">
                  COMBO x{player.comboCount}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Miniature Hand Cards Stack above Avatar */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-6 w-4 rounded-xs border border-white bg-[#4fb837] shadow-xs"
              />
            ))}
          </div>

          {isCurrentTurn && (
            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
            </span>
          )}
        </div>

        <span className="mt-0.5 font-black text-xs text-white drop-shadow tracking-wide">
          {player.name}
        </span>
      </div>

      {/* Opponent Status Badges (Shields, Vortex, Underdog Bounce) */}
      <div className="flex items-center gap-1 mb-2">
        {player.shieldTokens > 0 && (
          <span className="flex items-center gap-0.5 rounded-full bg-cyan-600/90 px-1.5 py-0.5 text-[9px] font-black text-white shadow">
            <Shield className="h-2.5 w-2.5 text-yellow-300" />
            {player.shieldTokens}
          </span>
        )}
        {player.has6thHandSlot && (
          <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-1.5 py-0.5 text-[9px] font-black text-slate-950 shadow border border-yellow-200 animate-pulse">
            <Sparkles className="h-2.5 w-2.5 fill-current" />
            <span>6-CARD BOUNCE</span>
          </span>
        )}
        {player.isVortexInverted && (
          <span className="flex items-center gap-0.5 rounded-full bg-purple-900/90 px-1.5 py-0.5 text-[9px] font-black text-purple-200 shadow animate-pulse">
            <Eye className="h-2.5 w-2.5 text-cyan-300" />
            <span>VORTEX EXPOSED</span>
          </span>
        )}
      </div>

      {/* Exposed Hand Cards Area when VORTEX Sabotage is Active */}
      {player.isVortexInverted && player.hand.length > 0 && (
        <div className="w-full mb-2.5 flex justify-center">
          <VortexSwirlOverlay isExposed={true} badgePosition="top" compact={true} className="w-full flex justify-center py-1">
            <div className="flex items-center justify-center -space-x-3 px-2 py-1">
              {player.hand.map((card, hIdx) => (
                <div key={card.id || hIdx} className="transform hover:scale-110 transition-transform">
                  <CardView
                    card={card}
                    size="sm"
                    isVortexExposed={true}
                    onClick={() => {
                      if (isCurrentTurn) {
                        onSelectCard(
                          { type: 'HAND', playerIndex, handIndex: hIdx },
                          card
                        );
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </VortexSwirlOverlay>
        </div>
      )}

      {/* Opponent Discard Slots Grid + Stockpile */}
      <div className="flex items-start gap-3">
        {/* 4 Discard Slots */}
        <div className="grid grid-cols-4 gap-1">
          {player.discards.map((slot, dIdx) => {
            const topCard = slot.length > 0 ? slot[slot.length - 1] : null;
            const isSelected =
              selectedLocation?.type === 'DISCARD' &&
              selectedLocation.playerIndex === playerIndex &&
              selectedLocation.discardIndex === dIdx;

            return (
              <div
                key={dIdx}
                id={`player-${playerIndex}-discard-${dIdx}`}
                onMouseDown={() => startLongPress(dIdx)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(dIdx)}
                onTouchEnd={cancelLongPress}
                onClick={() => {
                  if (isLongPressTriggeredRef.current) {
                    isLongPressTriggeredRef.current = false;
                    return;
                  }
                  if (topCard && isCurrentTurn) {
                    onSelectCard(
                      { type: 'DISCARD', playerIndex, discardIndex: dIdx },
                      topCard
                    );
                  }
                }}
                className="relative flex h-16 w-11 flex-col items-center justify-center rounded-lg border border-dashed border-white/30 bg-black/20 p-0.5 transition-all hover:border-white/60 cursor-pointer"
              >
                {/* Visual Card Stack Edges underneath */}
                {slot.length > 1 && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* 2nd Card Layer */}
                    <div className="absolute h-11 w-8 rounded-md bg-amber-950/70 border border-amber-600/50 shadow-md translate-y-1 -translate-x-0.5 rotate-[-3deg]" />
                    {/* 3rd Card Layer */}
                    {slot.length > 2 && (
                      <div className="absolute h-11 w-8 rounded-md bg-amber-950/90 border border-amber-700/50 shadow-sm translate-y-2 translate-x-0.5 rotate-[3deg]" />
                    )}
                  </div>
                )}

                {topCard ? (
                  <div className="relative z-10">
                    <CardView card={topCard} size="sm" isSelected={isSelected} />
                  </div>
                ) : (
                  <div className="text-[8px] font-bold text-white/40">{dIdx + 1}</div>
                )}

                {/* Stack Count Indicator & Inspector button */}
                {slot.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingSlot(dIdx);
                    }}
                    className="absolute -bottom-1 -right-1 z-30 flex items-center gap-0.5 rounded-full bg-slate-950/90 border border-amber-400/90 px-1 py-0.2 text-[8px] font-black text-amber-300 shadow-md hover:scale-110 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
                    title="Inspect Stack"
                  >
                    <Layers className="h-2 w-2" />
                    <span>x{slot.length}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal to view cards in opponent discard stack */}
        {inspectingSlot !== null && (
          <DiscardStackModal
            isOpen={inspectingSlot !== null}
            onClose={() => setInspectingSlot(null)}
            playerName={player.name}
            slotIndex={inspectingSlot}
            cards={player.discards[inspectingSlot] || []}
            isCurrentTurn={isCurrentTurn}
            playerIndex={playerIndex}
            onSelectCard={onSelectCard}
            selectedLocation={selectedLocation}
          />
        )}

        {/* Stockpile Slot with Oval Count Pill below */}
        <div className="flex flex-col items-center relative">
          {stockTopCard ? (
            <div className="relative" id={`player-${playerIndex}-stockpile`}>
              {/* Persistent Danger/Excitement Pulsing Border Glow */}
              {player.stockpile.length <= 3 && (
                <motion.div
                  animate={{
                    scale: [1, 1.06, 1],
                    opacity: [0.7, 1, 0.7],
                    boxShadow: [
                      '0 0 10px rgba(239, 68, 68, 0.7), inset 0 0 8px rgba(239, 68, 68, 0.5)',
                      '0 0 22px rgba(245, 158, 11, 0.95), inset 0 0 16px rgba(239, 68, 68, 0.8)',
                      '0 0 10px rgba(239, 68, 68, 0.7), inset 0 0 8px rgba(239, 68, 68, 0.5)',
                    ],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -inset-1 rounded-xl border-2 border-red-500/90 pointer-events-none z-10"
                />
              )}

              <CardView
                card={stockTopCard}
                size="sm"
                isSelected={
                  selectedLocation?.type === 'STOCKPILE' &&
                  selectedLocation.playerIndex === playerIndex
                }
                onClick={() =>
                  isCurrentTurn &&
                  onSelectCard({ type: 'STOCKPILE', playerIndex }, stockTopCard)
                }
              />
            </div>
          ) : (
            <div className="flex h-16 w-11 items-center justify-center rounded-lg border border-emerald-400 bg-emerald-950/80 text-[8px] font-black text-emerald-300 text-center p-0.5">
              CLEAR
            </div>
          )}

          {/* Oval Counter Badge matching reference screenshot (e.g. 04, 08) */}
          <div
            className={`mt-1 flex items-center justify-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-black shadow-md transition-all ${
              player.stockpile.length > 0 && player.stockpile.length <= 3
                ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 border border-yellow-300 text-yellow-100 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse'
                : 'bg-slate-800/90 border border-slate-600 text-white'
            }`}
          >
            {player.stockpile.length > 0 && player.stockpile.length <= 3 && (
              <Flame className="h-2.5 w-2.5 fill-yellow-300 text-yellow-300 animate-bounce" />
            )}
            <span>{player.stockpile.length < 10 ? `0${player.stockpile.length}` : player.stockpile.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
