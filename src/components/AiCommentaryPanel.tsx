import React from 'react';
import { Radio, Lightbulb, RefreshCw } from 'lucide-react';

interface AiCommentaryPanelProps {
  commentary: string;
  coachAdvice: string;
  onRequestAdvice: () => void;
  isLoadingAdvice: boolean;
}

export const AiCommentaryPanel: React.FC<AiCommentaryPanelProps> = ({
  commentary,
  coachAdvice,
  onRequestAdvice,
  isLoadingAdvice,
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-2.5 rounded-2xl border-3 border-black bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 px-3 py-1.5 shadow-[4px_4px_0_#000] text-xs">
      {/* Left: Teddy Coach Badge */}
      <div className="flex items-center gap-2.5 overflow-hidden flex-1">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-amber-400 text-slate-950 font-black shadow-[2px_2px_0_#000]">
          <span className="text-base">🧸</span>
        </div>
        <div className="flex flex-col text-left overflow-hidden leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black italic uppercase tracking-wider text-amber-300 drop-shadow-[0_1px_0_#000] shrink-0">
              TEDDY SHOUT OUT:
            </span>
          </div>
          <p className="text-[11px] font-extrabold text-white truncate">
            {commentary || 'Match initiated! Clear your stockpile to claim the Teddy Trophy!'}
          </p>
        </div>
      </div>

      {/* Right: Tactical Tip Button */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onRequestAdvice}
          disabled={isLoadingAdvice}
          className="brawl-btn-yellow flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-slate-950 shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer"
          title={coachAdvice || 'Prioritize emptying your Stockpile!'}
        >
          <Lightbulb className="h-3.5 w-3.5 text-slate-950 shrink-0 fill-current" />
          <span className="hidden xs:inline font-black">TIP</span>
          <RefreshCw className={`h-3 w-3 ${isLoadingAdvice ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
