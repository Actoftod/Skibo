import React, { useState } from 'react';
import { ActionLog } from '../types';
import { Zap, Flame, Shield, Sparkles, RefreshCw, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActionLogProps {
  logs: ActionLog[];
}

export const ActionLogFeed: React.FC<ActionLogProps> = ({ logs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const latestLog = logs[0];

  let icon = <RefreshCw className="h-3 w-3 text-slate-400 shrink-0" />;
  let textColor = 'text-slate-300';

  if (latestLog?.type === 'COMBO') {
    icon = <Zap className="h-3 w-3 text-cyan-400 shrink-0" />;
    textColor = 'text-cyan-200';
  } else if (latestLog?.type === 'SABOTAGE') {
    icon = <Sparkles className="h-3 w-3 text-purple-400 shrink-0" />;
    textColor = 'text-purple-200';
  } else if (latestLog?.type === 'BLAST') {
    icon = <Flame className="h-3 w-3 text-rose-400 shrink-0" />;
    textColor = 'text-rose-200';
  } else if (latestLog?.type === 'SHIELD') {
    icon = <Shield className="h-3 w-3 text-emerald-400 shrink-0" />;
    textColor = 'text-emerald-200';
  } else if (latestLog?.type === 'BURN') {
    icon = <Flame className="h-3 w-3 text-amber-400 shrink-0" />;
    textColor = 'text-amber-200';
  }

  return (
    <>
      {/* Sleek Single-Line Ticker Bar */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium shadow-xs cursor-pointer hover:border-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className="flex items-center gap-1 text-slate-400 font-bold shrink-0">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] uppercase tracking-wider hidden xs:inline">FEED:</span>
          </div>
          <span className={`truncate font-semibold ${textColor}`}>
            {latestLog ? latestLog.text : 'Match in progress. Make your move!'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold shrink-0">
          <span>{logs.length}</span>
          <ChevronUp className="h-3 w-3 text-slate-400" />
        </div>
      </div>

      {/* Expandable Action History Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-black text-amber-300 uppercase tracking-wide">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Match Action History</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full bg-slate-800 p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
                {logs.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-6">No actions recorded yet.</div>
                ) : (
                  logs.map((log) => {
                    let logIcon = <RefreshCw className="h-3.5 w-3.5 text-slate-400" />;
                    let logBg = 'bg-slate-950/60 border-slate-800';
                    let logText = 'text-slate-300';

                    if (log.type === 'COMBO') {
                      logIcon = <Zap className="h-3.5 w-3.5 text-cyan-400" />;
                      logBg = 'bg-cyan-950/40 border-cyan-800/40';
                      logText = 'text-cyan-200';
                    } else if (log.type === 'SABOTAGE') {
                      logIcon = <Sparkles className="h-3.5 w-3.5 text-purple-400" />;
                      logBg = 'bg-purple-950/40 border-purple-800/40';
                      logText = 'text-purple-200';
                    } else if (log.type === 'BLAST') {
                      logIcon = <Flame className="h-3.5 w-3.5 text-rose-400" />;
                      logBg = 'bg-rose-950/40 border-rose-800/40';
                      logText = 'text-rose-200';
                    } else if (log.type === 'SHIELD') {
                      logIcon = <Shield className="h-3.5 w-3.5 text-emerald-400" />;
                      logBg = 'bg-emerald-950/40 border-emerald-800/40';
                      logText = 'text-emerald-200';
                    } else if (log.type === 'BURN') {
                      logIcon = <Flame className="h-3.5 w-3.5 text-amber-400" />;
                      logBg = 'bg-amber-950/40 border-amber-800/40';
                      logText = 'text-amber-200';
                    }

                    return (
                      <div
                        key={log.id}
                        className={`flex items-center gap-2.5 rounded-xl border p-2 text-xs font-semibold ${logBg} ${logText}`}
                      >
                        <span className="shrink-0">{logIcon}</span>
                        <span className="flex-1">{log.text}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
