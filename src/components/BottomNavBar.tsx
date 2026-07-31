import React, { useState } from 'react';
import { Gamepad2, Trophy, User, Radio, Globe } from 'lucide-react';

interface BottomNavBarProps {
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  onRequestAdvice: () => void;
  onOpenMultiplayer: () => void;
  onOpenRanking?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  onOpenTutorial,
  onOpenSettings,
  onRequestAdvice,
  onOpenMultiplayer,
  onOpenRanking,
}) => {
  const [activeTab, setActiveTab] = useState<'game' | 'online' | 'ranks' | 'advisor' | 'settings'>('game');

  return (
    <nav className="sticky bottom-0 z-30 w-full bg-slate-950/95 border-t-4 border-black px-3 py-1.5 shadow-[0_-4px_0_#000] backdrop-blur-md text-amber-100">
      <div className="mx-auto flex max-w-lg items-center justify-between text-xs font-black">
        {/* Game Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('game')}
          className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'game' ? 'text-yellow-300 scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-2xl border-2 border-black ${activeTab === 'game' ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0_#000]' : 'bg-slate-900'}`}>
            <Gamepad2 className="h-4 w-4" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider drop-shadow-[0_1px_0_#000]">Game</span>
        </button>

        {/* Solo Levels & Ranks Tab */}
        {onOpenRanking && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('ranks');
              onOpenRanking();
            }}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeTab === 'ranks' ? 'text-yellow-300 scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-2xl border-2 border-black ${activeTab === 'ranks' ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0_#000]' : 'bg-slate-900'}`}>
              <Trophy className="h-4 w-4" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider drop-shadow-[0_1px_0_#000]">Vault</span>
          </button>
        )}

        {/* Online Chat & Multiplayer Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('online');
            onOpenMultiplayer();
          }}
          className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'online' ? 'text-yellow-300 scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-2xl border-2 border-black ${activeTab === 'online' ? 'bg-emerald-400 text-slate-950 shadow-[2px_2px_0_#000]' : 'bg-slate-900'}`}>
            <Globe className="h-4 w-4" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider drop-shadow-[0_1px_0_#000]">Online</span>
        </button>

        {/* Coach AI Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('advisor');
            onRequestAdvice();
          }}
          className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'advisor' ? 'text-yellow-300 scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-2xl border-2 border-black ${activeTab === 'advisor' ? 'bg-cyan-400 text-slate-950 shadow-[2px_2px_0_#000]' : 'bg-slate-900'}`}>
            <Radio className="h-4 w-4" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider drop-shadow-[0_1px_0_#000]">Coach</span>
        </button>

        {/* Settings Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('settings');
            onOpenSettings();
          }}
          className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'settings' ? 'text-yellow-300 scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-2xl border-2 border-black ${activeTab === 'settings' ? 'bg-pink-400 text-slate-950 shadow-[2px_2px_0_#000]' : 'bg-slate-900'}`}>
            <User className="h-4 w-4" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider drop-shadow-[0_1px_0_#000]">Settings</span>
        </button>
      </div>

      {/* Modern Phone Home Indicator Line */}
      <div className="mx-auto mt-1 h-1 w-28 rounded-full bg-slate-800" />
    </nav>
  );
};

