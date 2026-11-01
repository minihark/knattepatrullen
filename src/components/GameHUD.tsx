import React, { useState } from 'react';
import { VehicleConfig, LevelConfig, CarUpgrades, TimeOfDay } from '../types';
import { MenuModal } from './MenuModal';
import { Compass, Volume2, VolumeX, Music, Lock } from 'lucide-react';
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
  isMusicOn: boolean;
  onToggleMusic: () => void;
  timeOfDay: TimeOfDay;
  onToggleTimeOfDay: () => void;
  activeHorn: 'horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog';
  onSelectHorn: (h: 'horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog') => void;
  isToddlerLocked: boolean;
  unlockTaps: number;
  onTapUnlock: () => void;
  onActivateToddlerLock: () => void;
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
  isMusicOn,
  onToggleMusic,
  timeOfDay,
  onToggleTimeOfDay,
  activeHorn,
  onSelectHorn,
  isToddlerLocked,
  unlockTaps,
  onTapUnlock,
  onActivateToddlerLock,
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

        {/* Right: Controls (Locked or Normal) */}
        {isToddlerLocked ? (
          /* Locked State: Discreet 3-Tap Parent Unlock Pill */
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
            {/* Quick Sound/Mute Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.init();
                onToggleMute();
              }}
              aria-label={isMuted ? 'Slå på ljud' : 'Stäng av ljud'}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl border-2 shadow-md active:scale-95 transition-all text-xs font-extrabold ${
                isMuted
                  ? 'bg-rose-50/95 border-rose-300 text-rose-600'
                  : 'bg-white/95 border-slate-200/90 text-slate-800'
              }`}
              title={isMuted ? 'Ljud avstängt' : 'Ljud igång'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Day / Night Starry Adventure Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.init();
                onToggleTimeOfDay();
              }}
              aria-label={timeOfDay === 'day' ? 'Växla till nattkörning' : 'Växla till dagkörning'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl border-2 shadow-md active:scale-95 transition-all text-xs font-extrabold ${
                timeOfDay === 'night'
                  ? 'bg-slate-900/95 border-indigo-400 text-amber-300'
                  : 'bg-amber-50/95 border-amber-300 text-amber-900'
              }`}
              title={timeOfDay === 'night' ? 'Nattkörning med strålkastare' : 'Dagkörning med solsken'}
            >
              <span className="text-sm sm:text-base leading-none">{timeOfDay === 'night' ? '🌙' : '☀️'}</span>
            </button>

            {/* The 3-Tap Child-Proof Parent Unlock Button */}
            <button
              type="button"
              onClick={onTapUnlock}
              aria-label={lang === 'sv' ? 'Tryck 3 gånger för att låsa upp barnlåset' : 'Tap 3 times to unlock toddler lock'}
              className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border-2 shadow-lg active:scale-95 transition-all font-black text-xs ${
                unlockTaps > 0
                  ? 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-300'
                  : 'bg-slate-900/95 text-amber-300 border-slate-700'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-display">
                {lang === 'sv' ? 'Barnlås' : 'Child Lock'}
              </span>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full transition-all ${unlockTaps >= 1 ? 'bg-amber-950 scale-125' : 'bg-slate-500'}`} />
                <span className={`w-2 h-2 rounded-full transition-all ${unlockTaps >= 2 ? 'bg-amber-950 scale-125' : 'bg-slate-500'}`} />
                <span className={`w-2 h-2 rounded-full transition-all ${unlockTaps >= 3 ? 'bg-amber-950 scale-125' : 'bg-slate-500'}`} />
              </div>
              <span className="text-[10px] text-slate-300 font-semibold hidden sm:inline">
                ({3 - unlockTaps}x)
              </span>
            </button>
          </div>
        ) : (
          /* Normal State: Sound Toggle, Day/Night, Barnlås, Garage, Stars & Menu */
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
            {/* Quick Sound/Mute Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.init();
                onToggleMute();
              }}
              aria-label={isMuted ? 'Slå på ljud' : 'Stäng av ljud'}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl border-2 shadow-md active:scale-95 transition-all text-xs font-extrabold ${
                isMuted
                  ? 'bg-rose-50/95 border-rose-300 text-rose-600'
                  : 'bg-white/95 border-slate-200/90 text-slate-800'
              }`}
              title={isMuted ? 'Ljud avstängt' : 'Ljud igång'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              {isMusicOn && !isMuted && <span className="text-[10px]">🎵</span>}
            </button>

            {/* Day / Night Starry Adventure Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.init();
                onToggleTimeOfDay();
              }}
              aria-label={timeOfDay === 'day' ? 'Växla till nattkörning' : 'Växla till dagkörning'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl border-2 shadow-md active:scale-95 transition-all text-xs font-extrabold ${
                timeOfDay === 'night'
                  ? 'bg-slate-900/95 border-indigo-400 text-amber-300'
                  : 'bg-amber-50/95 border-amber-300 text-amber-900'
              }`}
              title={timeOfDay === 'night' ? 'Nattkörning med strålkastare' : 'Dagkörning med solsken'}
            >
              <span className="text-sm sm:text-base leading-none">{timeOfDay === 'night' ? '🌙' : '☀️'}</span>
              <span className="hidden md:inline font-display text-xs">
                {timeOfDay === 'night' ? (lang === 'sv' ? 'Natt' : 'Night') : (lang === 'sv' ? 'Dag' : 'Day')}
              </span>
            </button>

            {/* Toddler Kiosk & Fullscreen Mode Button */}
            <button
              type="button"
              onClick={onActivateToddlerLock}
              aria-label={lang === 'sv' ? 'Aktivera barnlås och fullskärm' : 'Activate toddler lock and fullscreen'}
              className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl border-2 border-slate-200/90 shadow-md hover:bg-white active:scale-95 transition-all text-xs font-extrabold text-slate-700 hover:text-amber-800"
              title={lang === 'sv' ? 'Barnlås: Lås skärmen för ostörd lek' : 'Toddler Lock: Lock screen for child play'}
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden lg:inline font-display text-xs">
                {lang === 'sv' ? 'Barnlås' : 'Child Lock'}
              </span>
            </button>

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
        )}
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
        isMusicOn={isMusicOn}
        onToggleMusic={onToggleMusic}
        timeOfDay={timeOfDay}
        onToggleTimeOfDay={onToggleTimeOfDay}
        activeHorn={activeHorn}
        onSelectHorn={onSelectHorn}
        initialTab={initialMenuTab}
        onActivateToddlerLock={onActivateToddlerLock}
      />
    </>
  );
};
