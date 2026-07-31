import React, { useState, useRef } from 'react';
import { Player, CardLocation, Card } from '../types';
import { CardView } from './CardView';
import { Shield, Sparkles, Zap, Eye, MessageSquare, AlertTriangle, Flame, Layers } from 'lucide-react';
import { checkDiscardLinking } from '../utils/gameEngine';
import { motion, AnimatePresence } from 'motion/react';
import { VortexSwirlOverlay } from './VortexSwirlOverlay';
import { DiscardStackModal } from './DiscardStackModal';
import { sound } from '../utils/audio';

interface PlayerMatProps {
  player: Player;
  playerIndex: number;
  isCurrentTurn: boolean;
  selectedLocation: CardLocation | null;
  onSelectCard: (location: CardLocation, card: Card) => void;
  onSelectDiscardSlot?: (slotIndex: number) => void;
  canDiscardToEndTurn?: boolean;
  isHumanPlayer?: boolean;
  blastRadiusActive?: boolean;
  onDropCardToPile?: (location: CardLocation, card: Card, pileIndex: number) => void;
}

export const PlayerMat: React.FC<PlayerMatProps> = ({
  player,
  playerIndex,
  isCurrentTurn,
  selectedLocation,
  onSelectCard,
  onSelectDiscardSlot,
  canDiscardToEndTurn = false,
  isHumanPlayer = true,
  blastRadiusActive = false,
  onDropCardToPile,
}) => {
  const stockTopCard = player.stockpile.length > 0 ? player.stockpile[0] : null;
  const linkedDiscardSlots = checkDiscardLinking(stockTopCard || undefined, player.discards);
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

  // Drag and drop physics handler for player cards
  const handleCardDragEnd = (
    location: CardLocation,
    card: Card,
    info: { point: { x: number; y: number } }
  ) => {
    if (!isCurrentTurn || !isHumanPlayer) return;

    const dropX = info.point.x;
    const dropY = info.point.y;

    // Check if released over any of the 4 central build piles
    for (let idx = 0; idx < 4; idx++) {
      const pileElem = document.getElementById(`central-pile-${idx}`);
      if (pileElem) {
        const rect = pileElem.getBoundingClientRect();
        if (
          dropX >= rect.left &&
          dropX <= rect.right &&
          dropY >= rect.top &&
          dropY <= rect.bottom
        ) {
          if (onDropCardToPile) {
            onDropCardToPile(location, card, idx);
          }
          return;
        }
      }
    }

    // Check if released over discard slots (when discarding hand card to end turn)
    if (location.type === 'HAND' && canDiscardToEndTurn && onSelectDiscardSlot) {
      for (let dIdx = 0; dIdx < 4; dIdx++) {
        const slotElem = document.getElementById(`player-${playerIndex}-discard-${dIdx}`);
        if (slotElem) {
          const rect = slotElem.getBoundingClientRect();
          if (
            dropX >= rect.left &&
            dropX <= rect.right &&
            dropY >= rect.top &&
            dropY <= rect.bottom
          ) {
            onSelectDiscardSlot(dIdx);
            return;
          }
        }
      }
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Blast Radius Opponent Discard Ripple Banner */}
      <AnimatePresence>
        {blastRadiusActive && !isCurrentTurn && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute -top-10 left-1/2 z-30 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 px-4 py-1 text-xs font-black text-white shadow-xl border-2 border-yellow-300"
          >
            <AlertTriangle className="h-4 w-4 animate-bounce text-yellow-300" />
            <span>💥 BLAST DISCARD! FORCED -1 CARD</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coffee Table Area & Player Badges */}
      <div className="relative w-full max-w-3xl flex items-center justify-between gap-2 px-2 py-2">
        {/* Left Side: Player Stockpile Stack & Oval Badge */}
        <div className="flex flex-col items-center relative">
          {/* Near-Win Danger/Excitement Header Badge */}
          {player.stockpile.length > 0 && player.stockpile.length <= 3 && stockTopCard && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.08, 1], opacity: 1 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-2.5 py-0.5 text-[9px] font-black text-white shadow-[0_0_15px_rgba(239,68,68,0.9)] border border-yellow-300 uppercase tracking-wider whitespace-nowrap"
            >
              <Flame className="h-3 w-3 fill-yellow-300 text-yellow-300 animate-pulse" />
              <span>{player.stockpile.length === 1 ? 'LAST CARD!' : `${player.stockpile.length} LEFT!`}</span>
            </motion.div>
          )}

          {stockTopCard ? (
            <div className="relative">
              {/* Persistent Danger/Excitement Pulsing Border Glow */}
              {player.stockpile.length <= 3 && (
                <motion.div
                  animate={{
                    scale: [1, 1.06, 1],
                    opacity: [0.7, 1, 0.7],
                    boxShadow: [
                      '0 0 12px rgba(239, 68, 68, 0.7), inset 0 0 12px rgba(239, 68, 68, 0.5)',
                      '0 0 28px rgba(245, 158, 11, 0.95), inset 0 0 22px rgba(239, 68, 68, 0.8)',
                      '0 0 12px rgba(239, 68, 68, 0.7), inset 0 0 12px rgba(239, 68, 68, 0.5)',
                    ],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -inset-1.5 rounded-2xl border-2 border-red-500/90 pointer-events-none z-10"
                />
              )}

              <motion.div
                id={`player-${playerIndex}-stockpile`}
                className="relative cursor-grab active:cursor-grabbing z-20"
                drag={isCurrentTurn && isHumanPlayer}
                dragSnapToOrigin
                dragElastic={0.25}
                dragTransition={{ bounceStiffness: 400, bounceDamping: 22, power: 0.2 }}
                whileDrag={{
                  scale: 1.18,
                  rotate: 5,
                  zIndex: 100,
                  filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.6))',
                }}
                onDragEnd={(_, info) =>
                  handleCardDragEnd({ type: 'STOCKPILE', playerIndex }, stockTopCard, info)
                }
              >
                {/* Card stack offset layers */}
                {player.stockpile.length > 1 && (
                  <div className="absolute top-1 left-1 h-22 w-15 rounded-xl border border-slate-300 bg-slate-200 opacity-80 pointer-events-none" />
                )}
                {player.stockpile.length > 2 && (
                  <div className="absolute top-2 left-2 h-22 w-15 rounded-xl border border-slate-300 bg-slate-300 opacity-60 pointer-events-none" />
                )}

                <CardView
                  card={stockTopCard}
                  size="md"
                  isSelected={
                    selectedLocation?.type === 'STOCKPILE' &&
                    selectedLocation.playerIndex === playerIndex
                  }
                  onClick={() =>
                    isCurrentTurn &&
                    onSelectCard({ type: 'STOCKPILE', playerIndex }, stockTopCard)
                  }
                />
              </motion.div>
            </div>
          ) : (
            <div className="flex h-22 w-15 items-center justify-center rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-950/80 text-xs font-black text-emerald-300 text-center p-1 shadow">
              CLEARED! 🏆
            </div>
          )}

          {/* Oval Counter Badge matching Reference Image (e.g. 08, 09, 15) */}
          <div
            className={`mt-1 flex items-center justify-center gap-1 rounded-full px-3 py-0.5 text-xs font-black shadow-lg transition-all ${
              player.stockpile.length > 0 && player.stockpile.length <= 3
                ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 border-2 border-yellow-300 text-yellow-100 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse'
                : 'bg-slate-800/95 border border-slate-600 text-white'
            }`}
          >
            {player.stockpile.length > 0 && player.stockpile.length <= 3 && (
              <Flame className="h-3 w-3 fill-yellow-300 text-yellow-300 animate-bounce" />
            )}
            <span>{player.stockpile.length < 10 ? `0${player.stockpile.length}` : player.stockpile.length}</span>
          </div>
        </div>

        {/* Center: Dark Wood Coffee Table with 4 Discard Slots */}
        <div
          className={`relative flex-1 flex flex-col items-center justify-center rounded-[28px] sm:rounded-[36px] border-2 sm:border-3 transition-all duration-300 p-1.5 sm:p-2 min-h-[95px] ${
            isCurrentTurn
              ? 'border-yellow-300 bg-gradient-to-b from-[#5c3e29] via-[#462d1c] to-[#2d1b0f] ring-4 ring-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.6)] scale-[1.01]'
              : 'border-[#3e2716] bg-gradient-to-b from-[#4e3422] via-[#3a2517] to-[#2b1a0f] shadow-2xl'
          }`}
        >
          {/* Active Turn Subtle Border Glow Pulse Animation */}
          <AnimatePresence>
            {isCurrentTurn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{
                  opacity: [0.5, 0.9, 0.5],
                  scale: [1, 1.015, 1],
                  boxShadow: [
                    '0 0 15px rgba(251, 191, 36, 0.4), inset 0 0 15px rgba(251, 191, 36, 0.2)',
                    '0 0 35px rgba(251, 191, 36, 0.85), inset 0 0 25px rgba(251, 191, 36, 0.45)',
                    '0 0 15px rgba(251, 191, 36, 0.4), inset 0 0 15px rgba(251, 191, 36, 0.2)',
                  ],
                }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-[36px] sm:rounded-[50px] border-2 border-yellow-300/80 pointer-events-none z-20"
              />
            )}
          </AnimatePresence>

          {/* Active Turn Floating Banner */}
          {isCurrentTurn && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-3 py-0.5 text-[10px] font-black text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.9)] border border-yellow-200 uppercase tracking-wider whitespace-nowrap animate-bounce">
              <Zap className="h-3 w-3 fill-current text-slate-950" />
              <span>{isHumanPlayer ? 'YOUR TURN TO PLAY' : `${player.name}'S TURN`}</span>
            </div>
          )}

          {/* Animated Floating Combo Multiplier Text Pop-up */}
          <AnimatePresence mode="wait">
            {player.comboCount > 0 && (
              <motion.div
                key={`combo-pop-${player.id}-${player.comboCount}`}
                initial={{ opacity: 0, scale: 0.2, y: 20, rotate: -10 }}
                animate={{
                  opacity: [0, 1, 1, 0.95],
                  scale: [0.2, 1.45, 1.1, 1],
                  y: [15, -28, -38, -42],
                  rotate: [-10, 5, -2, 0],
                }}
                exit={{ opacity: 0, scale: 0.4, y: -60, filter: 'blur(4px)' }}
                transition={{
                  duration: 2.8,
                  times: [0, 0.2, 0.45, 1],
                  ease: 'easeOut',
                }}
                className="absolute -top-11 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 px-3.5 py-1.5 shadow-[0_0_35px_rgba(251,191,36,0.95),0_0_15px_rgba(239,68,68,0.7)] border-2 border-yellow-200 pointer-events-none whitespace-nowrap"
              >
                <div className="flex items-center justify-center rounded-full bg-slate-950/80 p-1">
                  <Flame className="h-4 w-4 text-amber-400 fill-amber-400 animate-bounce" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-black text-[10px] sm:text-[11px] tracking-widest text-slate-950 uppercase leading-none drop-shadow">
                    COMBO MULTIPLIER!
                  </span>
                  <span className="font-black text-xs sm:text-sm tracking-tighter text-slate-950 leading-none drop-shadow-md">
                    🔥 x{player.comboCount} CHAIN
                  </span>
                </div>
                <Sparkles className="h-4 w-4 text-slate-950 fill-current animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#a88260] uppercase mb-1">
            DISCARD SLOTS
          </span>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full max-w-md">
            {player.discards.map((slot, dIdx) => {
              const topDiscardCard = slot.length > 0 ? slot[slot.length - 1] : null;
              const isLinked = linkedDiscardSlots.includes(dIdx);
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
                    if (canDiscardToEndTurn && isCurrentTurn && onSelectDiscardSlot) {
                      onSelectDiscardSlot(dIdx);
                    } else if (topDiscardCard && isCurrentTurn) {
                      onSelectCard(
                        { type: 'DISCARD', playerIndex, discardIndex: dIdx },
                        topDiscardCard
                      );
                    }
                  }}
                  className={`relative flex h-20 sm:h-22 flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    isLinked
                      ? 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400/50'
                      : canDiscardToEndTurn && isCurrentTurn
                      ? 'border-amber-300 bg-amber-400/20 hover:border-amber-200'
                      : 'border-dashed border-white/30 bg-black/30 hover:border-white/60'
                  }`}
                >
                  {isLinked && (
                    <div className="absolute -top-2 rounded-full bg-amber-500 px-1.5 py-0.2 text-[8px] font-black text-white z-20 shadow">
                      LINKED
                    </div>
                  )}

                  {/* Visual Card Stack Edges underneath */}
                  {slot.length > 1 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      {/* 2nd Card Layer */}
                      <div className="absolute h-14 w-10 sm:h-16 sm:w-11 rounded-lg bg-amber-900/60 border border-amber-600/50 shadow-md translate-y-1.5 -translate-x-1 rotate-[-3deg]" />
                      {/* 3rd Card Layer */}
                      {slot.length > 2 && (
                        <div className="absolute h-14 w-10 sm:h-16 sm:w-11 rounded-lg bg-amber-950/80 border border-amber-700/50 shadow-sm translate-y-2.5 translate-x-1 rotate-[4deg]" />
                      )}
                    </div>
                  )}

                  {topDiscardCard ? (
                    <motion.div
                      className="relative z-10 cursor-grab active:cursor-grabbing"
                      drag={isCurrentTurn && isHumanPlayer}
                      dragSnapToOrigin
                      dragElastic={0.25}
                      dragTransition={{ bounceStiffness: 400, bounceDamping: 22, power: 0.2 }}
                      whileDrag={{
                        scale: 1.18,
                        rotate: 5,
                        zIndex: 100,
                        filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.6))',
                      }}
                      onDragEnd={(_, info) =>
                        handleCardDragEnd(
                          { type: 'DISCARD', playerIndex, discardIndex: dIdx },
                          topDiscardCard,
                          info
                        )
                      }
                    >
                      <CardView card={topDiscardCard} size="md" isSelected={isSelected} />
                    </motion.div>
                  ) : (
                    <div className="text-[10px] font-bold text-white/30">Slot {dIdx + 1}</div>
                  )}

                  {/* Stack Depth & Inspect Button */}
                  {slot.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingSlot(dIdx);
                      }}
                      className="absolute -bottom-1 -right-1 z-30 flex items-center gap-0.5 rounded-full bg-slate-950/90 border border-amber-400/90 px-1.5 py-0.5 text-[9px] font-black text-amber-300 shadow-lg hover:scale-105 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
                      title="Inspect Stack"
                    >
                      <Layers className="h-2.5 w-2.5" />
                      <span>x{slot.length}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal to view cards in a discard stack */}
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
        </div>

        {/* Right Side: Player Avatar Capsule & Status Badges */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex flex-col items-center">
            {/* Avatar Circle with Green Turn Ring */}
            <div
              className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl shadow-xl border-3 ${
                isCurrentTurn ? 'border-emerald-400 ring-4 ring-emerald-400/60' : 'border-white'
              }`}
            >
              {player.avatar || '👤'}

              {/* Glowing Persistent Combo xN Indicator near Player Avatar */}
              <AnimatePresence>
                {player.comboCount > 0 && (
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0, y: 5 }}
                    animate={{ scale: [1, 1.1, 1], opacity: 1, y: 0 }}
                    exit={{ scale: 0.2, opacity: 0 }}
                    transition={{
                      scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
                    }}
                    className="absolute -top-3 -right-6 z-30 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 px-2.5 py-0.5 text-[11px] font-black text-white shadow-[0_0_20px_rgba(245,158,11,0.9)] border-2 border-yellow-300 ring-2 ring-amber-400/60 whitespace-nowrap"
                  >
                    <Zap className="h-3.5 w-3.5 text-yellow-300 fill-current animate-bounce" />
                    <span className="tracking-wider text-yellow-100 uppercase drop-shadow font-black">
                      COMBO x{player.comboCount}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="mt-1 font-black text-xs text-white drop-shadow tracking-wide">
              {player.name}
            </span>

            {/* Chat Speech Bubble Button */}
            <button
              type="button"
              className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#fce0ab] text-[#704d20] border border-[#e3b876] shadow hover:scale-110 transition-transform cursor-pointer"
              title="Quick Chat"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-center gap-1">
            {player.shieldTokens > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-cyan-600 px-2 py-0.5 text-[10px] font-black text-white shadow">
                <Shield className="h-3 w-3 text-yellow-300 fill-current" />
                {player.shieldTokens}
              </span>
            )}
            {player.has6thHandSlot && (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-0.5 text-[10px] font-black text-slate-950 shadow border border-yellow-200 animate-pulse">
                <Sparkles className="h-3 w-3 fill-current" />
                <span>6-CARD BOUNCE</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Player Hand Cards Fanned Out */}
      <div className="relative w-full max-w-2xl flex flex-col items-center mt-1">
        {/* Helper Speech Bubble above Hand when Active Turn */}
        {isCurrentTurn && player.hand.length > 0 && !player.isVortexInverted && (
          <motion.div
            initial={{ y: -5 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-1 rounded-full bg-white/95 px-3 py-0.5 text-xs font-black text-slate-800 shadow-md border border-slate-200 flex items-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Select a card from your hand!</span>
          </motion.div>
        )}

        {/* Vortex Swirl Overlay Wrapping Player Hand */}
        <VortexSwirlOverlay isExposed={player.isVortexInverted} badgePosition="top" className="w-full flex justify-center">
          {/* Fanned Hand Cards */}
          <div className="flex items-center justify-center -space-x-3.5 sm:-space-x-4 py-1 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {player.hand.map((card, hIdx) => {
              const isSelected =
                selectedLocation?.type === 'HAND' &&
                selectedLocation.playerIndex === playerIndex &&
                selectedLocation.handIndex === hIdx;

              const total = player.hand.length;
              const mid = (total - 1) / 2;
              const rotationAngle = (hIdx - mid) * 4;

              return (
                <motion.div
                  key={card.id}
                  id={`player-${playerIndex}-hand-${hIdx}`}
                  className="transition-transform duration-150 cursor-grab active:cursor-grabbing"
                  drag={isCurrentTurn && isHumanPlayer}
                  dragSnapToOrigin
                  dragElastic={0.25}
                  dragTransition={{ bounceStiffness: 400, bounceDamping: 22, power: 0.2 }}
                  whileDrag={{
                    scale: 1.2,
                    rotate: 6,
                    zIndex: 100,
                    filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.6))',
                  }}
                  onDragEnd={(_, info) =>
                    handleCardDragEnd(
                      { type: 'HAND', playerIndex, handIndex: hIdx },
                      card,
                      info
                    )
                  }
                >
                  <CardView
                    card={card}
                    size="md"
                    isSelected={isSelected}
                    isVortexExposed={player.isVortexInverted}
                    rotationAngle={rotationAngle}
                    onClick={() =>
                      isCurrentTurn &&
                      onSelectCard(
                        { type: 'HAND', playerIndex, handIndex: hIdx },
                        card
                      )
                    }
                  />
                </motion.div>
              );
            })}
          </div>
        </VortexSwirlOverlay>
      </div>
    </div>
  );
};
