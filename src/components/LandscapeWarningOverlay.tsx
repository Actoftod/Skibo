import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LandscapeWarningOverlay: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  // Auto-dismiss after 3.5 seconds so it doesn't block play
  useEffect(() => {
    const timer = setTimeout(() => {
      setDismissed(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-3 left-1/2 -translate-x-1/2 pointer-events-none z-50 p-2 w-full max-w-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -20 }}
          className="pointer-events-auto rounded-2xl border-2 border-yellow-400 bg-slate-950/95 p-3 text-center shadow-[4px_4px_0_#000] backdrop-blur-xl relative overflow-hidden flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-yellow-400 text-slate-950 shadow-[1px_1px_0_#000]">
              <Smartphone className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-[10px] font-black text-yellow-300 uppercase tracking-wide">
                <CheckCircle className="h-3 w-3 text-emerald-400" />
                <span>1-HAND PORTRAIT READY</span>
              </div>
              <p className="text-[11px] font-black text-white italic">
                Hold phone vertically & tap cards with thumb!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-xl border-2 border-black bg-rose-500 p-1 text-white hover:bg-rose-600 transition-colors cursor-pointer shadow-[1px_1px_0_#000] shrink-0"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

