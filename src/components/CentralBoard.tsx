import React from 'react';
import { CentralPile, Card } from '../types';
import { CardView } from './CardView';
import { Flame, Lock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CentralBoardProps {
  centralPiles: CentralPile[];
  onPileClick: (pileIndex: number) => void;
  selectedCard: Card | null;
  overdriveActive: boolean;
  blastRadiusPileIndex: number | null;
  drawDeckCount?: number;
}

// Pre-computed particles for Blast Radius explosion system
const BLAST_PARTICLE_COUNT = 24;
const blastParticles = Array.from({ length: BLAST_PARTICLE_COUNT }).map((_, i) => {
  const angle = (i / BLAST_PARTICLE_COUNT) * 2 * Math.PI + (Math.random() * 0.2 - 0.1);
  const distance = 70 + Math.random() * 90; // 70px to 160px propagation radius
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const size = 6 + (i % 4) * 3;
  const colors = [
    '#f59e0b', // amber
    '#ef4444', // red
    '#f97316', // orange
    '#fde047', // bright yellow
    '#c084fc', // neon purple
    '#ffffff', // white flash
  ];
  const color = colors[i % colors.length];
  const delay = (i % 3) * 0.05;
  return { id: i, x, y, size, color, delay };
});

export const CentralBoard: React.FC<CentralBoardProps> = ({
  centralPiles,
  onPileClick,
  selectedCard,
  overdriveActive,
  blastRadiusPileIndex,
  drawDeckCount = 100,
}) => {
  return (
    <div className="relative rounded-3xl border-4 border-black bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-2.5 sm:p-4 shadow-[6px_6px_0_#000]">
      {/* Cartoon Ribbon Title */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="transform -skew-x-6 bg-black border-2 border-yellow-400 px-3 py-1 rounded-lg shadow-[2px_2px_0_#000]">
          <span className="text-xs sm:text-sm font-black italic text-yellow-300 uppercase tracking-wider">
            BUILD PILES 🧸
          </span>
        </div>
        {overdriveActive && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 rounded-xl border-2 border-black bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-[2px_2px_0_#000]"
          >
            <Zap className="h-3 w-3 animate-bounce text-yellow-300 fill-current" />
            <span>OVERDRIVE ACTIVE</span>
          </motion.div>
        )}
      </div>

      {/* 4 Build Piles + Draw Deck Shelf Container */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {/* The 4 Build Piles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {centralPiles.map((pile, idx) => {
            const topCard = pile.cards.length > 0 ? pile.cards[pile.cards.length - 1] : null;
            const isBlastTarget = blastRadiusPileIndex === idx;

            return (
              <motion.div
                key={pile.id}
                id={`central-pile-${idx}`}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPileClick(idx)}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-3 p-1 transition-all duration-200 cursor-pointer min-h-[92px] sm:min-h-[105px] min-w-[60px] sm:min-w-[76px] shadow-[3px_3px_0_#000] ${
                  isBlastTarget ? 'animate-shake border-red-500 ring-4 ring-red-500/50' : ''
                } ${
                  pile.isSpikeLocked
                    ? 'border-rose-600 bg-rose-950/80'
                    : 'border-black bg-black/40 hover:border-yellow-400 hover:bg-black/60'
                }`}
              >
                {/* Spike Lock Badge */}
                {pile.isSpikeLocked && (
                  <div className="absolute top-1 left-1 z-10 flex items-center gap-1 rounded-lg border-2 border-black bg-rose-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-[1px_1px_0_#000]">
                    <Lock className="h-2.5 w-2.5" />
                    <span>LOCKED</span>
                  </div>
                )}

                {/* Blast Radius Explosive Particle System & Animation Overlay */}
                <AnimatePresence>
                  {isBlastTarget && (
                    <React.Fragment>
                      {/* Central Explosive Container */}
                      <motion.div
                        initial={{ scale: 0.2, opacity: 0 }}
                        animate={{ scale: 1.1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-red-600 to-orange-500 p-1 text-white font-black shadow-2xl overflow-hidden ring-4 ring-yellow-400/80"
                      >
                        <Flame className="h-8 w-8 text-yellow-300 animate-pulse" />
                        <span className="text-xs font-black text-yellow-100 tracking-wider animate-bounce">
                          BLAST!
                        </span>
                      </motion.div>

                      {/* Outward Propagating Shockwave Ring 1 */}
                      <motion.div
                        initial={{ scale: 0.2, opacity: 0.9 }}
                        animate={{ scale: 2.8, opacity: 0 }}
                        transition={{ duration: 0.75, ease: 'easeOut' }}
                        className="absolute inset-0 m-auto h-20 w-20 rounded-full border-4 border-amber-400 bg-amber-500/20 blur-xs shadow-[0_0_30px_rgba(245,158,11,0.9)] pointer-events-none z-40"
                      />

                      {/* Outward Propagating Shockwave Ring 2 */}
                      <motion.div
                        initial={{ scale: 0.1, opacity: 1 }}
                        animate={{ scale: 3.6, opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.08 }}
                        className="absolute inset-0 m-auto h-20 w-20 rounded-full border-2 border-red-500 bg-red-600/30 blur-sm shadow-[0_0_40px_rgba(239,68,68,0.9)] pointer-events-none z-40"
                      />

                      {/* Outward Particle Explosion System originating from pile center */}
                      <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
                        {blastParticles.map((p) => (
                          <motion.div
                            key={p.id}
                            initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }}
                            animate={{
                              x: p.x,
                              y: p.y,
                              scale: [0.4, 1.5, 0],
                              opacity: [1, 1, 0],
                            }}
                            transition={{
                              duration: 0.85,
                              ease: 'easeOut',
                              delay: p.delay,
                            }}
                            style={{
                              width: p.size,
                              height: p.size,
                              backgroundColor: p.color,
                              boxShadow: `0 0 12px ${p.color}`,
                            }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          />
                        ))}
                      </div>
                    </React.Fragment>
                  )}
                </AnimatePresence>

                {/* Build Pile Card or Empty Slot */}
                {topCard ? (
                  <div className="relative">
                    {/* Visual Card Stack Offset */}
                    {pile.cards.length > 1 && (
                      <div className="absolute -top-1 -left-1 h-22 w-15 rounded-xl border-2 border-black bg-slate-300 opacity-60" />
                    )}
                    <CardView card={topCard} size="md" />
                  </div>
                ) : (
                  <div className="flex h-22 w-15 flex-col items-center justify-center rounded-xl border-3 border-dashed border-yellow-400/60 bg-amber-950/40 font-black text-yellow-300 text-xs">
                    <span>BUILD</span>
                    <span className="text-[10px] text-yellow-400 font-black">(1)</span>
                  </div>
                )}

                {/* Pile Top Value Badge below slot */}
                {topCard && (
                  <div className="absolute -bottom-2 z-10 rounded-xl bg-yellow-400 text-slate-950 font-black px-2 py-0.5 text-[10px] border-2 border-black shadow-[2px_2px_0_#000]">
                    TOP: {pile.topValue}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Draw Deck */}
        <div className="flex flex-col items-center justify-center ml-1">
          <div className="relative">
            {/* Multi-card stack effect */}
            <div className="absolute top-1 left-1 h-22 w-15 rounded-xl border-2 border-black bg-[#3d962c]" />
            <div className="absolute top-0.5 left-0.5 h-22 w-15 rounded-xl border-2 border-black bg-[#44a62e]" />
            <CardView
              card={{ id: 'draw-deck-card', value: 1, isFaceDown: true }}
              size="md"
              showBack={true}
            />
          </div>
          <span className="mt-1 text-[10px] font-black text-yellow-300 drop-shadow-[0_1px_0_#000]">
            DECK ({drawDeckCount})
          </span>
        </div>
      </div>
    </div>
  );
};
