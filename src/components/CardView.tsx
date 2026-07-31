import React from 'react';
import { Card } from '../types';
import { Flame, ShieldAlert, Sparkles, Zap, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showBack?: boolean;
  isVortexExposed?: boolean;
  className?: string;
  rotationAngle?: number; // for fanned cards
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  isSelected = false,
  isPlayable = false,
  isDisabled = false,
  size = 'md',
  showBack = false,
  isVortexExposed = false,
  className = '',
  rotationAngle = 0,
}) => {
  const isBackVisible = showBack || card.isFaceDown;

  // Dimensions
  const dimensionClasses =
    size === 'sm'
      ? 'h-15 w-[2.75rem] sm:h-16 sm:w-11 text-xs'
      : size === 'lg'
      ? 'h-24 w-16 sm:h-28 sm:w-[4.75rem] text-lg sm:text-xl'
      : 'h-20 w-14 sm:h-22 sm:w-15 text-sm sm:text-base';

  // Card Back Rendering - Matches Reference: Bright Lime Green with slanted "SKIP BO" logo!
  if (isBackVisible && !isVortexExposed) {
    return (
      <motion.div
        whileHover={onClick && !isDisabled ? { scale: 1.05, y: -4 } : {}}
        whileTap={onClick && !isDisabled ? { scale: 0.95 } : {}}
        onClick={onClick}
        style={{ transform: rotationAngle ? `rotate(${rotationAngle}deg)` : undefined }}
        className={`relative select-none rounded-xl border-2 border-white bg-[#4fb837] p-1 shadow-md transition-all duration-200 ${dimensionClasses} ${
          onClick ? 'cursor-pointer hover:shadow-lg' : ''
        } ${className}`}
      >
        {/* Card Back Inner Frame */}
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-white/40 bg-[#44a62e] p-1 text-center shadow-inner">
          <div className="flex flex-col items-center justify-center -rotate-12">
            <span className="font-black text-xs md:text-sm tracking-tighter text-white drop-shadow-md leading-none">
              SKIP
            </span>
            <span className="font-black text-xs md:text-sm tracking-tighter text-[#cbf53d] drop-shadow-md leading-none">
              BO
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  const isWild = card.value === 'WILD';

  // Number Color & Wave Styling matching exact Reference Image!
  // Red: 10, 11, 12, 1 | Green: 4, 5, 6 | Blue: 1, 2, 3, 7, 8
  let textColor = 'text-[#d62a24]';
  let waveBg = 'bg-[#d62a24]';
  let wildLabel = '';
  let wildIcon = null;

  if (isWild) {
    if (card.wildType === 'VORTEX') {
      textColor = 'text-purple-700';
      waveBg = 'bg-purple-600';
      wildIcon = <Sparkles className="h-3 w-3 text-purple-600" />;
      wildLabel = 'VORTEX';
    } else if (card.wildType === 'SPIKE') {
      textColor = 'text-rose-700';
      waveBg = 'bg-rose-600';
      wildIcon = <Flame className="h-3 w-3 text-rose-600" />;
      wildLabel = 'SPIKE';
    } else if (card.wildType === 'HEIST') {
      textColor = 'text-amber-700';
      waveBg = 'bg-amber-600';
      wildIcon = <ShieldAlert className="h-3 w-3 text-amber-600" />;
      wildLabel = 'HEIST';
    } else {
      textColor = 'text-[#4fb837]';
      waveBg = 'bg-[#4fb837]';
      wildIcon = <Zap className="h-3 w-3 text-[#4fb837]" />;
      wildLabel = 'SKIP-BO';
    }
  } else if (typeof card.value === 'number') {
    if (card.value <= 3) {
      textColor = 'text-[#1f64c0]'; // Blue
      waveBg = 'bg-[#1f64c0]';
    } else if (card.value <= 6) {
      textColor = 'text-[#24a638]'; // Green
      waveBg = 'bg-[#24a638]';
    } else if (card.value <= 9) {
      textColor = 'text-[#1f64c0]'; // Blue
      waveBg = 'bg-[#1f64c0]';
    } else {
      textColor = 'text-[#d62a24]'; // Red/Orange-red
      waveBg = 'bg-[#d62a24]';
    }
  }

  return (
    <motion.div
      whileHover={onClick && !isDisabled ? { y: -8, scale: 1.05 } : {}}
      whileTap={onClick && !isDisabled ? { scale: 0.95 } : {}}
      onClick={!isDisabled ? onClick : undefined}
      style={{ transform: rotationAngle ? `rotate(${rotationAngle}deg)` : undefined }}
      className={`relative select-none overflow-hidden rounded-xl border-2 bg-white shadow-md transition-all duration-200 ${dimensionClasses} ${
        isSelected
          ? '-translate-y-3 border-amber-400 ring-4 ring-amber-400/80 shadow-2xl'
          : 'border-slate-300'
      } ${
        isPlayable && !isSelected
          ? 'animate-pulse border-amber-300 ring-2 ring-amber-300/60 shadow-md'
          : ''
      } ${
        isVortexExposed
          ? 'ring-2 ring-purple-500 shadow-purple-500/40 shadow-lg'
          : ''
      } ${
        isDisabled
          ? 'opacity-50 grayscale cursor-not-allowed'
          : onClick
          ? 'cursor-pointer'
          : ''
      } ${className}`}
    >
      {/* Vortex Eye Badge if Exposed */}
      {isVortexExposed && (
        <div className="absolute top-1 right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white shadow-md animate-pulse">
          <Eye className="h-3 w-3" />
        </div>
      )}

      {/* Card Face Layout matching Reference Images */}
      {isWild ? (
        /* Wild Card Special View */
        <div className="flex h-full w-full flex-col items-center justify-between p-1.5 bg-[#4fb837] text-white">
          <div className="w-full text-left font-black text-[10px] uppercase tracking-wider">
            WILD
          </div>
          <div className="flex flex-col items-center text-center my-auto -rotate-6">
            <span className="font-black text-sm md:text-base leading-none drop-shadow">
              SKIP
            </span>
            <span className="font-black text-sm md:text-base text-yellow-300 leading-none drop-shadow">
              BO
            </span>
            {wildLabel && (
              <span className="text-[8px] font-bold tracking-widest bg-black/30 px-1 py-0.5 rounded mt-1">
                {wildLabel}
              </span>
            )}
          </div>
          <div className="w-full text-right font-black text-[10px] uppercase tracking-wider">
            WILD
          </div>
        </div>
      ) : (
        /* Regular Numbered Card View */
        <div className="relative flex h-full w-full flex-col justify-between p-1.5 bg-white">
          {/* Top-Left Number with Underline */}
          <div className="z-10 flex flex-col items-start leading-none font-black text-xs md:text-sm">
            <span className={`${textColor} tracking-tight`}>{card.value}</span>
            <div className={`h-[2px] w-3 ${waveBg} rounded-full`} />
          </div>

          {/* Large Center Number */}
          <div className="z-10 flex flex-1 items-center justify-center py-1">
            <div className="flex flex-col items-center leading-none">
              <span
                className={`font-black ${
                  size === 'lg'
                    ? 'text-3xl md:text-4xl'
                    : size === 'sm'
                    ? 'text-lg'
                    : 'text-2xl'
                } ${textColor} tracking-tight`}
              >
                {card.value}
              </span>
              <div
                className={`h-[3px] ${
                  size === 'lg' ? 'w-8' : size === 'sm' ? 'w-4' : 'w-6'
                } ${waveBg} rounded-full mt-0.5`}
              />
            </div>
          </div>

          {/* Bottom Curved Wave Accent Shape matching Reference Image */}
          <div className={`absolute bottom-0 left-0 right-0 h-[28%] ${waveBg} rounded-t-[100%] opacity-90`} />

          {/* Bottom-Right Rotated Number */}
          <div className="z-10 flex flex-col items-end leading-none font-black text-xs md:text-sm rotate-180 text-white">
            <span className="tracking-tight">{card.value}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
