import React, { useState } from 'react';
import { VehicleConfig, LevelConfig, CarUpgrades } from '../types';
import { MenuModal } from './MenuModal';
import { Compass } from 'lucide-react';
import { sounds } from '../audio/soundEngine';

interface GameHUDProps {
  currentVehicle: VehicleConfig;
  currentLevel: LevelConfig;
  collectedCount: number;
  starsEarned: number;
  upgrades: CarUpgrades;
  onUpgrade: (category: 'engine' | 'suspension' | 'tires' | 'paint', val: any, cost: number) => void;
  onSelectVehicle: (v: VehicleConfig) => void;
  onSelectLevel: (lvl: LevelConfig) => void;
  onOpenDiploma: () => void;
  lang: 'sv' | 'en';
  onToggleLang: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentVehicle,
  currentLevel,
  collectedCount,
  starsEarned,
  upgrades,
  onUpgrade,
  onSelectVehicle,
  onSelectLevel,
  onOpenDiploma,
  lang,
  onToggleLang,
  isMuted,
  onToggleMute,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [initialMenuTab, setInitialMenuTab] = useState<'levels' | 'garage' | 'settings'>('levels');

  const openMenuWithTab = (tab: 'levels' | 'garage' | 'settings') => {
    sounds.init();
    setInitialMenuTab(tab);
    setMenuOpen(true);
  };

  return (
    <>
      {/* Sleek, Low-Profile Floating Top Bar */}
      <header className="absolute top-0 inset-x-0 pt-[env(safe-area-inset-top,10px)] p-2.5 sm:p-4 flex items-center justify-between z-20 pointer-events-none select-none">
        {/* Left: Ultra-Compact Mission Pill */}
        <button
          type="button"
          onClick={() => {
            sounds.init();
            const introSpeech =
              lang === 'sv'
                ? `${currentLevel.titleSv}! Mål: samla ${currentLevel.goalCount} stycken!`
                : `${currentLevel.titleEn}! Goal: collect ${currentLevel.goalCount}!`;
            sounds.speak(introSpeech, lang);
          }}
          className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border-2 border-slate-200/90 shadow-md active:scale-95 transition-all"
        >
          <span className="text-xl sm:text-2xl leading-none">{currentLevel.emoji}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-extrabold text-slate-800 font-display hidden xs:inline">
              {lang === 'sv' ? currentLevel.titleSv : currentLevel.titleEn}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-lg">
              {collectedCount} / {currentLevel.goalCount}
            </span>
          </div>
        </button>

        {/* Right: Garage, Stars & Menu Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Quick Vehicle / Garage Button */}
          <button
            type="button"
            onClick={() => openMenuWithTab('garage')}
            aria-label={lang === 'sv' ? 'Byt bil i garaget' : 'Switch car in garage'}
            className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border-2 border-slate-200/90 shadow-md hover:bg-white active:scale-95 transition-all text-xs sm:text-sm font-extrabold text-slate-800"
          >
            <span className="text-xl leading-none">{currentVehicle.emoji}</span>
            <span className="hidden sm:inline font-display">{currentVehicle.nameSv.split(' ')[0]}</span>
            <span className="text-slate-400 text-[10px]">▼</span>
          </button>

          {/* Stars / Diploma Badge */}
          <button
            type="button"
            onClick={() => {
              sounds.init();
              onOpenDiploma();
            }}
            aria-label={lang === 'sv' ? 'Se guldstjärnor och körkort' : 'View license and stars'}
            className="flex items-center gap-1 bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl shadow-md border-2 border-amber-300 transition-all text-xs sm:text-sm"
          >
            <span>⭐</span>
            <span>{starsEarned}</span>
          </button>

          {/* Main Menu Button (Banor & Inställningar) */}
          <button
            type="button"
            onClick={() => openMenuWithTab('levels')}
            aria-label={lang === 'sv' ? 'Öppna äventyrsmenyn' : 'Open adventure menu'}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-md border-2 border-slate-700 transition-all text-xs sm:text-sm"
          >
            <Compass className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span className="font-display">{lang === 'sv' ? 'Banor' : 'Tracks'}</span>
          </button>
        </div>
      </header>

      {/* Clean Popup Menu Modal */}
      <MenuModal
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentVehicle={currentVehicle}
        currentLevel={currentLevel}
        starsEarned={starsEarned}
        upgrades={upgrades}
        onUpgrade={onUpgrade}
        onSelectLevel={onSelectLevel}
        onSelectVehicle={onSelectVehicle}
        onOpenDiploma={onOpenDiploma}
        lang={lang}
        onToggleLang={onToggleLang}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        initialTab={initialMenuTab}
      />
    </>
  );
};
