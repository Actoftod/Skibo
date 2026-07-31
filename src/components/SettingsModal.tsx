import React from 'react';
import { GameSettings, AiDifficulty, GameMode } from '../types';
import { Settings, Volume2, VolumeX, Zap, Users, Shield, Clock, X } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetGame,
}) => {
  const update = (patch: Partial<GameSettings>) => {
    onUpdateSettings({ ...settings, ...patch });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl border-2 border-cyan-500/60 bg-slate-900 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Settings className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">
              Match Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Settings Form Body */}
        <div className="flex-1 overflow-y-auto pr-1 my-4 space-y-4">
          {/* 1. Game Mode */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-cyan-400" /> Game Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'SINGLE_PLAYER', label: 'VS AI Bots' },
                { id: 'PASS_AND_PLAY', label: 'Pass & Play' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => update({ gameMode: mode.id as GameMode })}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                    settings.gameMode === mode.id
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Speed Turn Timer */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" /> Turn Speed Timer
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { sec: 0, label: 'Off' },
                { sec: 10, label: '10s (Blitz)' },
                { sec: 15, label: '15s (Standard)' },
                { sec: 30, label: '30s (Relaxed)' },
              ].map((item) => (
                <button
                  key={item.sec}
                  type="button"
                  onClick={() => update({ turnTimerSeconds: item.sec })}
                  className={`rounded-xl border p-2 text-xs font-bold transition-all cursor-pointer ${
                    settings.turnTimerSeconds === item.sec
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Starting Stockpile Size */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-cyan-400" /> Stockpile Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 25].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => update({ startingStockpileSize: size })}
                  className={`rounded-xl border p-2 text-xs font-bold transition-all cursor-pointer ${
                    settings.startingStockpileSize === size
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {size} Cards
                </button>
              ))}
            </div>
          </div>

          {/* 4. AI Difficulty (if SINGLE_PLAYER) */}
          {settings.gameMode === 'SINGLE_PLAYER' && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-cyan-400" /> AI Bot Difficulty
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'EASY', label: 'Easy' },
                  { id: 'TACTICAL', label: 'Tactical' },
                  { id: 'AGGRESSIVE', label: 'Aggressive' },
                  { id: 'OVERDRIVE', label: 'Overdrive' },
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => update({ aiDifficulty: diff.id as AiDifficulty })}
                    className={`rounded-xl border p-2 text-xs font-bold transition-all cursor-pointer ${
                      settings.aiDifficulty === diff.id
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Audio Sound FX */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              {settings.enableSoundFX ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
              Sound Effects Synthesizer
            </span>
            <button
              type="button"
              onClick={() => update({ enableSoundFX: !settings.enableSoundFX })}
              className={`rounded-full px-3 py-1 text-xs font-black transition-all cursor-pointer ${
                settings.enableSoundFX ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.enableSoundFX ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onResetGame();
              onClose();
            }}
            className="rounded-xl border border-rose-500/50 bg-rose-950/40 px-4 py-2 font-bold text-rose-300 text-xs hover:bg-rose-900/60 transition-colors cursor-pointer"
          >
            Restart New Match
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-cyan-500 px-5 py-2 font-extrabold text-slate-950 text-xs uppercase tracking-wider hover:bg-cyan-400 transition-colors cursor-pointer"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
