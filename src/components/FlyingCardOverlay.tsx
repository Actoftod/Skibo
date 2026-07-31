import React from 'react';
import { Card } from '../types';
import { CardView } from './CardView';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles } from 'lucide-react';

export interface FlyingCardData {
  id: string;
  card: Card;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isCombo?: boolean;
  comboCount?: number;
}

interface FlyingCardOverlayProps {
  flyingCards: FlyingCardData[];
  onCardAnimationComplete: (id: string) => void;
}

const GHOST_TRAIL_STEPS = [
  { delay: 0.04, opacity: 0.65, scale: 0.94, blur: '1px', glowColor: 'rgba(251, 191, 36, 0.9)' },
  { delay: 0.08, opacity: 0.45, scale: 0.88, blur: '2px', glowColor: 'rgba(245, 158, 11, 0.75)' },
  { delay: 0.12, opacity: 0.25, scale: 0.82, blur: '3px', glowColor: 'rgba(239, 68, 68, 0.6)' },
];

export const FlyingCardOverlay: React.FC<FlyingCardOverlayProps> = ({
  flyingCards,
  onCardAnimationComplete,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {flyingCards.map((fc) => {
          const isComboPlay = Boolean(fc.isCombo || (fc.comboCount && fc.comboCount > 0));

          // Calculate horizontal distance & dynamic trajectory tilt lean angle
          const dx = fc.endX - fc.startX;
          const leanAngle = Math.max(-28, Math.min(28, dx * 0.15));
          const arcHeight = Math.min(fc.startY, fc.endY) - Math.max(65, Math.abs(dx) * 0.22);

          return (
            <React.Fragment key={fc.id}>
              {/* Ghost Card Trail Animations for Chain Reaction Combos */}
              {isComboPlay &&
                GHOST_TRAIL_STEPS.map((ghost, gIdx) => (
                  <motion.div
                    key={`${fc.id}-ghost-${gIdx}`}
                    initial={{
                      x: fc.startX,
                      y: fc.startY,
                      scale: 0.9 * ghost.scale,
                      rotate: -14,
                      opacity: 0,
                    }}
                    animate={{
                      x: [fc.startX, fc.startX + dx * 0.55, fc.endX],
                      y: [fc.startY, arcHeight, fc.endY],
                      scale: [0.9 * ghost.scale, 1.25 * ghost.scale, 1 * ghost.scale],
                      rotate: [-14, leanAngle * 0.8, 0],
                      opacity: [0, ghost.opacity, ghost.opacity * 0.9, 0],
                    }}
                    transition={{
                      duration: 0.48,
                      delay: ghost.delay,
                      ease: [0.175, 0.885, 0.32, 1.25], // Spring dampening overshoot recoil
                    }}
                    style={{
                      filter: `blur(${ghost.blur}) drop-shadow(0 0 18px ${ghost.glowColor})`,
                    }}
                    className="absolute top-0 left-0 pointer-events-none mix-blend-screen z-40"
                  >
                    <div className="relative">
                      <CardView card={fc.card} size="md" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/40 via-yellow-300/40 to-orange-500/40 border-2 border-yellow-300/80" />
                    </div>
                  </motion.div>
                ))}

              {/* Landing Impact Shockwave Particle Ring */}
              <motion.div
                initial={{
                  left: fc.endX,
                  top: fc.endY,
                  scale: 0.2,
                  opacity: 0.9,
                }}
                animate={{
                  scale: [0.2, 1.8],
                  opacity: [0.9, 0],
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.35,
                  ease: [0.1, 0.9, 0.2, 1],
                }}
                className="absolute h-16 w-16 -ml-8 -mt-8 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_25px_rgba(251,191,36,0.95)] pointer-events-none z-30"
              />

              {/* Primary Flying Card with Physics-Based Spring-Dampening */}
              <motion.div
                initial={{
                  x: fc.startX,
                  y: fc.startY,
                  scale: 0.88,
                  rotate: -12,
                  opacity: 0.85,
                }}
                animate={{
                  x: [fc.startX, fc.startX + dx * 0.55, fc.endX],
                  y: [fc.startY, arcHeight, fc.endY],
                  scale: [0.88, 1.3, 1],
                  rotate: [-12, leanAngle, 0],
                  opacity: 1,
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.48,
                  times: [0, 0.55, 1],
                  ease: [0.175, 0.885, 0.32, 1.25], // Custom spring back dampening curve (Anticipation & Overshoot spring)
                }}
                className={`absolute top-0 left-0 filter ${
                  isComboPlay
                    ? 'drop-shadow-[0_0_25px_rgba(251,191,36,0.95)] z-50'
                    : 'drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] z-50'
                }`}
                onAnimationComplete={() => onCardAnimationComplete(fc.id)}
              >
                <div className="relative">
                  <CardView card={fc.card} size="md" />

                  {/* Combo Badge Floating Particle on Primary Card */}
                  {isComboPlay && (
                    <motion.div
                      animate={{
                        scale: [1, 1.25, 1],
                        rotate: [0, 15, -15, 0],
                      }}
                      transition={{ duration: 0.45, repeat: Infinity }}
                      className="absolute -top-3 -right-3 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 p-1 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,1)] border border-yellow-200 z-50"
                    >
                      <Flame className="h-3.5 w-3.5 fill-current" />
                      {fc.comboCount && fc.comboCount > 1 && (
                        <span className="text-[9px] font-black leading-none ml-0.5">
                          x{fc.comboCount}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

