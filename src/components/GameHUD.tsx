import React from 'react';
import { VehicleConfig, LevelConfig } from '../types';
import { VEHICLES, LEVELS } from '../data/gameData';
import { sounds } from '../audio/soundEngine';
import { Volume2, VolumeX, Award, Sparkles } from 'lucide-react';

interface GameHUDProps {
  currentVehicle: VehicleConfig;
  currentLevel: LevelConfig;
  collectedCount: number;
  starsEarned: number;
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
  onSelectVehicle,
  onSelectLevel,
  onOpenDiploma,
  lang,
  onToggleLang,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="absolute top-0 inset-x-0 p-3 sm:p-5 flex flex-col gap-2 z-30 pointer-events-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Level Title & Mission Goal Counter */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border-2 border-slate-200/80 shadow-md">
          <span className="text-2xl sm:text-3xl">{currentLevel.emoji}</span>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-800 leading-tight font-display">
              {lang === 'sv' ? currentLevel.titleSv : currentLevel.titleEn}
            </h1>
            <p className="text-[11px] sm:text-xs font-bold text-amber-600 flex items-center gap-1">
              <span>{lang === 'sv' ? 'Mål:' : 'Goal:'}</span>
              <span className="text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded-md">
                {collectedCount} / {currentLevel.goalCount}
              </span>
            </p>
          </div>
        </div>

        {/* Center: Vehicle Quick Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border-2 border-slate-200/80 shadow-md">
          {VEHICLES.map((v) => {
            const isSelected = v.id === currentVehicle.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  sounds.init();
                  sounds.playHorn(v.honkSound);
                  onSelectVehicle(v);
                }}
                title={lang === 'sv' ? v.nameSv : v.nameEn}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-amber-400 ring-2 ring-amber-500 scale-105 shadow-sm'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                {v.emoji}
              </button>
            );
          })}
        </div>

        {/* Right: Stars, Diploma & Audio Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Diploma / Stars Badge */}
          <button
            type="button"
            onClick={onOpenDiploma}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-extrabold px-3 py-2 rounded-2xl shadow-md border-2 border-amber-300 transition-all text-xs sm:text-sm"
          >
            <Award className="w-4 h-4 text-amber-900" />
            <span>⭐ {starsEarned}</span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/90 hover:bg-white text-xs font-bold text-slate-700 border-2 border-slate-200/80 shadow-md flex items-center justify-center transition-all"
          >
            {lang === 'sv' ? '🇸🇪' : '🇬🇧'}
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/90 hover:bg-white text-slate-700 border-2 border-slate-200/80 shadow-md flex items-center justify-center transition-all"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Level Selector Pills */}
      <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none self-start">
        {LEVELS.map((lvl, idx) => {
          const isSelected = lvl.id === currentLevel.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => {
                sounds.init();
                onSelectLevel(lvl);
              }}
              className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 text-white ring-2 ring-slate-700'
                  : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <span>{lvl.emoji}</span>
              <span>
                {lang === 'sv' ? `Bana ${idx + 1}` : `Level ${idx + 1}`}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
