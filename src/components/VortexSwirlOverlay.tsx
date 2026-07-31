import React from 'react';
import { motion } from 'motion/react';
import { Eye, Sparkles } from 'lucide-react';

interface VortexSwirlOverlayProps {
  children: React.ReactNode;
  isExposed: boolean;
  className?: string;
  badgePosition?: 'top' | 'bottom';
  compact?: boolean;
}

export const VortexSwirlOverlay: React.FC<VortexSwirlOverlayProps> = ({
  children,
  isExposed,
  className = '',
  badgePosition = 'top',
  compact = false,
}) => {
  if (!isExposed) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group rounded-3xl p-2.5 transition-all duration-300 ${className}`}>
      {/* 1. Outer Swirling Cosmic Purple Aura Background */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-fuchsia-900/40 border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.5)] overflow-hidden pointer-events-none" />

      {/* 2. Rotating Vortex Swirl SVG Layer 1 (Clockwise) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none overflow-hidden rounded-3xl">
        <svg
          className="w-full h-full max-w-[400px] max-h-[300px] animate-[spin_12s_linear_infinite] text-purple-400/80"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 20C144.183 20 180 55.8172 180 100C180 144.183 144.183 180 100 180C55.8172 180 20 144.183 20 100"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="12 12"
            strokeLinecap="round"
          />
          <path
            d="M100 40C133.137 40 160 66.8629 160 100C160 133.137 133.137 160 100 160C66.8629 160 40 133.137 40 100"
            stroke="url(#vortex-grad-1)"
            strokeWidth="4"
            strokeDasharray="8 8"
          />
          <path
            d="M100 60C122.091 60 140 77.9086 140 100C140 122.091 122.091 140 100 140C77.9086 140 60 122.091 60 100"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="6 6"
          />
          <defs>
            <linearGradient id="vortex-grad-1" x1="0" y1="0" x2="200" y2="200">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 3. Counter-Rotating Inner Vortex Ring (Counter-Clockwise) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none overflow-hidden rounded-3xl">
        <svg
          className="w-full h-full max-w-[320px] max-h-[240px] animate-[spin_8s_linear_infinite_reverse] text-cyan-400/70"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle
            cx="100"
            cy="100"
            r="70"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="15 10"
          />
          <circle
            cx="100"
            cy="100"
            r="50"
            stroke="#a855f7"
            strokeWidth="3"
            strokeDasharray="4 8"
          />
        </svg>
      </div>

      {/* 4. Pulsing Center Gradient Glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-2 rounded-2xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-indigo-600/10 to-transparent pointer-events-none"
      />

      {/* 5. Floating Vortex Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [-10, -25, -10],
              x: [i * 10 - 15, i * -10 + 15, i * 10 - 15],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              duration: 2.5 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
            className="absolute bottom-2 left-1/4 transform -translate-x-1/2 text-purple-300"
            style={{ left: `${20 + i * 20}%` }}
          >
            <Sparkles className="h-3 w-3 text-fuchsia-300 drop-shadow-[0_0_8px_rgba(232,121,249,0.9)]" />
          </motion.div>
        ))}
      </div>

      {/* 6. VORTEX Active Floating Status Badge */}
      {badgePosition === 'top' && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-700 via-indigo-600 to-fuchsia-700 px-3.5 py-0.5 text-[10px] font-black text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.9)] border border-purple-300 uppercase tracking-wider whitespace-nowrap animate-pulse">
          <Eye className="h-3.5 w-3.5 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>🌀 VORTEX SABOTAGE • HAND EXPOSED</span>
        </div>
      )}

      {/* 7. Filter Overlay & Children Content Container */}
      <div className="relative z-10 transition-all duration-300 filter drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]">
        {children}
      </div>

      {badgePosition === 'bottom' && (
        <div className="mt-1 flex justify-center z-30">
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-800 px-3 py-0.5 text-[9px] font-black text-purple-100 shadow-md border border-purple-400 uppercase tracking-wide">
            <Eye className="h-3 w-3 text-cyan-300" />
            <span>VORTEX EXPOSED</span>
          </div>
        </div>
      )}
    </div>
  );
};
