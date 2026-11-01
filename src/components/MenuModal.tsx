import React, { useState } from 'react';
import { VehicleConfig, LevelConfig, CarUpgrades, TimeOfDay } from '../types';
import { VEHICLES, LEVELS, UPGRADES_CONFIG } from '../data/gameData';
import { sounds } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import { X, Volume2, VolumeX, Award, Play, Sparkles, Zap, Shield, ChevronRight, Music, Moon, Sun } from 'lucide-react';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVehicle: VehicleConfig;
  currentLevel: LevelConfig;
  starsEarned: number;
  upgrades: CarUpgrades;
  onUpgrade: (category: 'engine' | 'suspension' | 'tires' | 'paint', val: any, cost: number) => void;
  onSelectLevel: (lvl: LevelConfig) => void;
  onSelectVehicle: (v: VehicleConfig) => void;
  onOpenDiploma: () => void;
  lang: 'sv' | 'en';
  onToggleLang: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicOn: boolean;
  onToggleMusic: () => void;
  timeOfDay?: TimeOfDay;
  onToggleTimeOfDay?: () => void;
  activeHorn: 'horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog';
  onSelectHorn: (h: 'horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog') => void;
  initialTab?: 'levels' | 'garage' | 'settings';
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  currentVehicle,
  currentLevel,
  starsEarned,
  upgrades,
  onUpgrade,
  onSelectLevel,
  onSelectVehicle,
  onOpenDiploma,
  lang,
  onToggleLang,
  isMuted,
  onToggleMute,
  isMusicOn,
  onToggleMusic,
  timeOfDay = 'day',
  onToggleTimeOfDay,
  activeHorn,
  onSelectHorn,
  initialTab = 'levels',
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'garage' | 'settings'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl max-h-[92dvh] bg-[#FFFDF9] rounded-3xl border-4 border-amber-300 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-amber-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🧭</span>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-950 font-display">
                {lang === 'sv' ? 'Äventyrs-Meny' : 'Adventure Menu'}
              </h2>
              <p className="text-xs sm:text-sm text-amber-800 font-medium">
                {lang === 'sv' ? 'Välj bana eller trimma bilen i garaget!' : 'Pick a track or upgrade your car!'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-2xl bg-amber-200/70 hover:bg-amber-300 active:scale-95 text-amber-900 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          </button>
        </div>

        {/* 3 Nav Tabs */}
        <div className="flex border-b border-amber-200/60 bg-amber-100/40 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('levels')}
            className={`flex-1 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'levels'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-900 hover:bg-amber-200/50'
            }`}
          >
            <span>🗺️</span>
            <span>{lang === 'sv' ? 'Banor (1–6)' : 'Tracks (1–6)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('garage')}
            className={`flex-1 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'garage'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-900 hover:bg-amber-200/50'
            }`}
          >
            <span>🏎️</span>
            <span>{lang === 'sv' ? 'Garaget & Trim' : 'Garage & Upgrades'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-900 hover:bg-amber-200/50'
            }`}
          >
            <span>⚙️</span>
            <span>{lang === 'sv' ? 'Körkort & Ljud' : 'License & Sound'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 scrollbar-none">
          {/* TAB 1: LEVELS */}
          {activeTab === 'levels' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {LEVELS.map((lvl, idx) => {
                const isSelected = lvl.id === currentLevel.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      sounds.init();
                      onSelectLevel(lvl);
                      onClose();
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border-3 text-left transition-all flex items-center gap-3.5 active:scale-98 shadow-sm ${
                      isSelected
                        ? 'bg-amber-400 border-amber-500 text-amber-950 ring-2 ring-amber-400/50'
                        : 'bg-white hover:bg-amber-50 border-amber-200 text-slate-800'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl p-2 bg-amber-100 rounded-xl">
                      {lvl.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded">
                          {lang === 'sv' ? `Bana ${idx + 1}` : `Level ${idx + 1}`}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-300 px-1 rounded">
                            {lang === 'sv' ? 'Aktiv' : 'Active'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base font-display truncate mt-0.5">
                        {lang === 'sv' ? lvl.titleSv : lvl.titleEn}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {lang === 'sv' ? lvl.learningFocusSv : lvl.learningFocusEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: GARAGE & UPGRADES */}
          {activeTab === 'garage' && (
            <div className="flex flex-col gap-6">
              {/* Star Bank Banner */}
              <div className="bg-amber-100/80 border-2 border-amber-300 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl">⭐</span>
                  <div>
                    <h4 className="font-black text-amber-950 text-sm sm:text-base">
                      {lang === 'sv' ? 'Din Stjärnkassa' : 'Your Star Bank'}
                    </h4>
                    <p className="text-xs text-amber-800">
                      {lang === 'sv'
                        ? 'Kör banor och samla stjärnor för att trimma bilarna!'
                        : 'Complete tracks and gather stars to upgrade your rides!'}
                    </p>
                  </div>
                </div>
                <div className="bg-amber-400 text-amber-950 font-black text-lg sm:text-xl px-3.5 py-1.5 rounded-xl border-2 border-amber-500 shadow-sm">
                  ⭐ {starsEarned}
                </div>
              </div>

              {/* 1. Vehicles with Distinct Abilities */}
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-800 font-display mb-2.5 flex items-center gap-1.5">
                  <span>🚗</span>
                  <span>{lang === 'sv' ? 'Välj fordon' : 'Choose Vehicle'}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        className={`p-3.5 sm:p-4 rounded-2xl border-3 text-left transition-all flex items-center gap-3 active:scale-98 shadow-sm ${
                          isSelected
                            ? 'bg-amber-400 border-amber-500 text-amber-950 ring-2 ring-amber-400/50'
                            : 'bg-white hover:bg-amber-50 border-amber-200 text-slate-800'
                        }`}
                      >
                        <span className="text-3xl sm:text-4xl p-2 bg-amber-100 rounded-2xl">
                          {v.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm sm:text-base font-display">
                              {lang === 'sv' ? v.nameSv.split(' ')[0] : v.nameEn.split(' ')[0]}
                            </h4>
                            <span className="text-xs font-black bg-white/70 px-2 py-0.5 rounded-lg border border-amber-300">
                              {v.traits.specialNameSv}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                            {v.descriptionSv}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Upgrades Shop (Speed, Jump, Tires, Paint) */}
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-800 font-display mb-2.5 flex items-center gap-1.5">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>{lang === 'sv' ? 'Trimma & Trimdelar' : 'Performance Upgrades'}</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {/* Upgrade 1: Turbo Motor */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-2xl font-black">
                        ⚡
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-800 text-sm sm:text-base">
                            {lang === 'sv' ? 'Turbo-Motor' : 'Turbo Engine'}
                          </h4>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Nivå {upgrades.engineLevel} / 3
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {UPGRADES_CONFIG.engine[upgrades.engineLevel - 1]?.bonusDescSv}
                        </p>
                      </div>
                    </div>

                    {upgrades.engineLevel < 3 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const nextTier = UPGRADES_CONFIG.engine[upgrades.engineLevel];
                          if (starsEarned >= nextTier.cost) {
                            sounds.playUpgrade();
                            confetti({ particleCount: 40, spread: 60 });
                            onUpgrade('engine', upgrades.engineLevel + 1, nextTier.cost);
                          } else {
                            sounds.playHorn('boing');
                            sounds.speak('Du behöver fler stjärnor för att trimma!', lang);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          starsEarned >= UPGRADES_CONFIG.engine[upgrades.engineLevel].cost
                            ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 active:scale-95'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        <span>Trimma</span>
                        <span>⭐ {UPGRADES_CONFIG.engine[upgrades.engineLevel].cost}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-center">
                        MAXAD! 🏆
                      </span>
                    )}
                  </div>

                  {/* Upgrade 2: Super Fjädrar */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-2xl font-black">
                        🦘
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-800 text-sm sm:text-base">
                            {lang === 'sv' ? 'Super-Fjädrar' : 'Super Springs'}
                          </h4>
                          <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                            Nivå {upgrades.suspensionLevel} / 3
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {UPGRADES_CONFIG.suspension[upgrades.suspensionLevel - 1]?.bonusDescSv}
                        </p>
                      </div>
                    </div>

                    {upgrades.suspensionLevel < 3 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const nextTier = UPGRADES_CONFIG.suspension[upgrades.suspensionLevel];
                          if (starsEarned >= nextTier.cost) {
                            sounds.playUpgrade();
                            confetti({ particleCount: 40, spread: 60 });
                            onUpgrade('suspension', upgrades.suspensionLevel + 1, nextTier.cost);
                          } else {
                            sounds.playHorn('boing');
                            sounds.speak('Samla fler stjärnor först!', lang);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          starsEarned >= UPGRADES_CONFIG.suspension[upgrades.suspensionLevel].cost
                            ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 active:scale-95'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        <span>Trimma</span>
                        <span>⭐ {UPGRADES_CONFIG.suspension[upgrades.suspensionLevel].cost}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-center">
                        MAXAD! 🏆
                      </span>
                    )}
                  </div>

                  {/* Upgrade 3: Monster Däck */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl font-black">
                        🛞
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-800 text-sm sm:text-base">
                            {lang === 'sv' ? 'Monster-Hjul' : 'Monster Wheels'}
                          </h4>
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            Nivå {upgrades.tireLevel} / 3
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {UPGRADES_CONFIG.tires[upgrades.tireLevel - 1]?.bonusDescSv}
                        </p>
                      </div>
                    </div>

                    {upgrades.tireLevel < 3 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const nextTier = UPGRADES_CONFIG.tires[upgrades.tireLevel];
                          if (starsEarned >= nextTier.cost) {
                            sounds.playUpgrade();
                            confetti({ particleCount: 40, spread: 60 });
                            onUpgrade('tires', upgrades.tireLevel + 1, nextTier.cost);
                          } else {
                            sounds.playHorn('boing');
                            sounds.speak('Samla fler stjärnor först!', lang);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          starsEarned >= UPGRADES_CONFIG.tires[upgrades.tireLevel].cost
                            ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 active:scale-95'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        <span>Trimma</span>
                        <span>⭐ {UPGRADES_CONFIG.tires[upgrades.tireLevel].cost}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-center">
                        MAXAD! 🏆
                      </span>
                    )}
                  </div>

                  {/* Upgrade 4: Special Paints */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 sm:p-4">
                    <h4 className="font-black text-slate-800 text-sm sm:text-base mb-2">
                      {lang === 'sv' ? '🎨 Lackering & Färg' : '🎨 Paint Shop'}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {UPGRADES_CONFIG.paints.map((p) => {
                        const isCurrent = upgrades.paintId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              if (isCurrent) return;
                              if (p.cost === 0 || starsEarned >= p.cost) {
                                sounds.playUpgrade();
                                confetti({ particleCount: 30, spread: 50 });
                                onUpgrade('paint', p.id, p.cost);
                              } else {
                                sounds.playHorn('boing');
                                sounds.speak('Det kostar fler stjärnor!', lang);
                              }
                            }}
                            className={`p-2.5 rounded-xl border-2 font-extrabold text-xs flex flex-col items-center gap-1 transition-all ${
                              isCurrent
                                ? 'bg-amber-400 border-amber-500 text-amber-950 ring-2 ring-amber-300'
                                : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{p.nameSv}</span>
                            {p.cost > 0 && !isCurrent && (
                              <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                ⭐ {p.cost}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & DIPLOMA */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDiploma();
                }}
                className="w-full p-4 rounded-2xl bg-amber-100/80 hover:bg-amber-200 border-2 border-amber-300 flex items-center justify-between active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center text-2xl shadow-sm">
                    🎖️
                  </div>
                  <div className="text-left">
                    <h4 className="font-black text-amber-950 text-base">
                      {lang === 'sv' ? 'Se mitt Knatte-Körkort' : 'View Driver License'}
                    </h4>
                    <p className="text-xs text-amber-800 font-medium">
                      {lang === 'sv'
                        ? `Du har samlat ${starsEarned} guldstjärnor!`
                        : `You have earned ${starsEarned} golden stars!`}
                    </p>
                  </div>
                </div>
                <Award className="w-6 h-6 text-amber-700" />
              </button>

              {/* Sound Effects & Engine Rumble Toggle */}
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {lang === 'sv' ? 'Ljudeffekter & Motorljud' : 'Sound Effects & Motor Rumble'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isMuted
                        ? lang === 'sv' ? 'Alla ljudeffekter är avstängda' : 'Sound effects are muted'
                        : lang === 'sv' ? 'Taktilt motorbrum & effekter igång' : 'Tactile engine rumble & SFX on'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.init();
                    onToggleMute();
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    isMuted
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-emerald-500 text-white shadow-sm'
                  }`}
                >
                  {isMuted ? (lang === 'sv' ? 'Sätt på' : 'Turn On') : (lang === 'sv' ? 'Ljud På' : 'Sound On')}
                </button>
              </div>

              {/* Background Playful Melody Chime Toggle */}
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {lang === 'sv' ? 'Bakgrundsmusik & Trudilutt' : 'Background Playful Melody'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isMusicOn && !isMuted
                        ? lang === 'sv' ? 'Glad pentatonisk klockmelodi igång' : 'Cheerful pentatonic chime loop playing'
                        : lang === 'sv' ? 'Bakgrundsmusik avstängd' : 'Background music off'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.init();
                    onToggleMusic();
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    isMusicOn && !isMuted
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isMusicOn && !isMuted ? (lang === 'sv' ? 'Musik På' : 'Music On') : (lang === 'sv' ? 'Musik Av' : 'Music Off')}
                </button>
              </div>

              {/* Day / Night Starry Adventure Mode */}
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    timeOfDay === 'night' ? 'bg-indigo-950 text-amber-300' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {timeOfDay === 'night' ? '🌙' : '☀️'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {lang === 'sv' ? 'Dag eller Nattkörning' : 'Day or Night Driving'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {timeOfDay === 'night'
                        ? (lang === 'sv' ? 'Stjärnhimmel, strålkastare & ugglan Ulla' : 'Starry sky, headlights & Ulla the Owl')
                        : (lang === 'sv' ? 'Solsken och klarblå himmel' : 'Sunshine and clear blue sky')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.init();
                    onToggleTimeOfDay?.();
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    timeOfDay === 'night'
                      ? 'bg-indigo-900 text-amber-300 shadow-sm'
                      : 'bg-amber-500 text-white shadow-sm'
                  }`}
                >
                  {timeOfDay === 'night' ? (lang === 'sv' ? '🌙 Natt' : '🌙 Night') : (lang === 'sv' ? '☀️ Dag' : '☀️ Day')}
                </button>
              </div>

              {/* Select Horn Sound (6 Kid-Friendly Horns) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-200 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
                    <span>📯</span>
                    <span>{lang === 'sv' ? 'Välj din favorittuta!' : 'Pick your favorite horn!'}</span>
                  </h4>
                  <span className="text-[11px] text-amber-800 font-medium">
                    {lang === 'sv' ? 'Tryck för att provtuta' : 'Tap to try sound'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'horn', nameSv: 'Klassisk', nameEn: 'Classic', emoji: '📢' },
                    { id: 'quack', nameSv: 'Kvack-Anka', nameEn: 'Duck', emoji: '🦆' },
                    { id: 'siren', nameSv: 'Brandbil', nameEn: 'Siren', emoji: '🚨' },
                    { id: 'boing', nameSv: 'Rymd-Boing', nameEn: 'Space Boing', emoji: '⭐' },
                    { id: 'cat', nameSv: 'Katten Misse', nameEn: 'Misse Cat', emoji: '🐱' },
                    { id: 'dog', nameSv: 'Hunden Buster', nameEn: 'Buster Dog', emoji: '🐶' },
                  ].map((hornItem) => {
                    const isSelected = activeHorn === hornItem.id;
                    return (
                      <button
                        key={hornItem.id}
                        type="button"
                        onClick={() => {
                          sounds.init();
                          sounds.playHorn(hornItem.id as any);
                          onSelectHorn(hornItem.id as any);
                        }}
                        className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all text-xs font-black ${
                          isSelected
                            ? 'bg-amber-400 border-amber-600 text-amber-950 ring-2 ring-amber-300 shadow-sm'
                            : 'bg-white hover:bg-amber-100/60 border-amber-200 text-slate-800'
                        }`}
                      >
                        <span className="text-2xl leading-none">{hornItem.emoji}</span>
                        <span className="text-[11px] font-bold truncate">
                          {lang === 'sv' ? hornItem.nameSv : hornItem.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Animal Friends Voice Showcase (Katten Misse & Hunden Buster) */}
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex flex-col gap-2.5">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <span>🐾</span>
                  <span>{lang === 'sv' ? 'Djur-Vännerna i Knattepatrullen' : 'Animal Friends'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Katten Misse */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.init();
                      sounds.playAnimalVoice('cat', lang);
                    }}
                    className="p-3 rounded-xl bg-orange-50 hover:bg-orange-100/80 active:scale-98 border-2 border-orange-200 text-left flex items-center gap-3 transition-all"
                  >
                    <span className="text-3xl p-1 bg-white rounded-lg shadow-xs">🐱</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-orange-950 text-xs">
                        {lang === 'sv' ? 'Katten Misse' : 'Misse the Cat'}
                      </div>
                      <div className="text-[11px] text-orange-800 font-medium">
                        {lang === 'sv' ? '”Mjau! Ska vi rejsa?”' : '"Meow! Shall we race?"'}
                      </div>
                    </div>
                    <span className="text-xs bg-orange-200 text-orange-900 font-black px-2 py-1 rounded-lg">
                      🔊
                    </span>
                  </button>

                  {/* Hunden Buster */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.init();
                      sounds.playAnimalVoice('dog', lang);
                    }}
                    className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 active:scale-98 border-2 border-amber-200 text-left flex items-center gap-3 transition-all"
                  >
                    <span className="text-3xl p-1 bg-white rounded-lg shadow-xs">🐶</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-amber-950 text-xs">
                        {lang === 'sv' ? 'Hunden Buster' : 'Buster the Dog'}
                      </div>
                      <div className="text-[11px] text-amber-800 font-medium">
                        {lang === 'sv' ? '”Voff voff! Jag älskar fart!”' : '"Woof! I love speed!"'}
                      </div>
                    </div>
                    <span className="text-xs bg-amber-200 text-amber-900 font-black px-2 py-1 rounded-lg">
                      🔊
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                    {lang === 'sv' ? '🇸🇪' : '🇬🇧'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {lang === 'sv' ? 'Tal & Text (Språk)' : 'Voice & Language'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {lang === 'sv' ? 'Svenska röster & text' : 'English voices & text'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleLang}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs transition-all shadow-sm"
                >
                  {lang === 'sv' ? 'Byt till English 🇬🇧' : 'Switch to Svenska 🇸🇪'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-amber-100 bg-amber-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{lang === 'sv' ? 'Fortsätt köra! 🚀' : 'Keep Driving! 🚀'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
