import React, { useState } from 'react';
import { VehicleConfig, LevelConfig } from '../types';
import { VEHICLES, LEVELS } from '../data/gameData';
import { sounds } from '../audio/soundEngine';
import { X, Volume2, VolumeX, Award, Globe, Play, Sparkles } from 'lucide-react';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVehicle: VehicleConfig;
  currentLevel: LevelConfig;
  starsEarned: number;
  onSelectLevel: (lvl: LevelConfig) => void;
  onSelectVehicle: (v: VehicleConfig) => void;
  onOpenDiploma: () => void;
  lang: 'sv' | 'en';
  onToggleLang: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  initialTab?: 'levels' | 'garage' | 'settings';
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  currentVehicle,
  currentLevel,
  starsEarned,
  onSelectLevel,
  onSelectVehicle,
  onOpenDiploma,
  lang,
  onToggleLang,
  isMuted,
  onToggleMute,
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
                {lang === 'sv' ? 'Välj bana eller byt bil!' : 'Pick a track or switch cars!'}
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
            <span>🚒</span>
            <span>{lang === 'sv' ? 'Garaget' : 'Garage'}</span>
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

          {/* TAB 2: GARAGE */}
          {activeTab === 'garage' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border-3 text-left transition-all flex items-center gap-4 active:scale-98 shadow-sm ${
                      isSelected
                        ? 'bg-amber-400 border-amber-500 text-amber-950 ring-2 ring-amber-400/50'
                        : 'bg-white hover:bg-amber-50 border-amber-200 text-slate-800'
                    }`}
                  >
                    <span className="text-4xl sm:text-5xl p-2.5 bg-amber-100 rounded-2xl">
                      {v.emoji}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-base sm:text-lg font-display">
                          {lang === 'sv' ? v.nameSv : v.nameEn}
                        </h3>
                        <span className="text-xl">{v.hornEmoji}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {v.descriptionSv}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: SETTINGS & DIPLOMA */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Diploma Card */}
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

              {/* Sound Toggle */}
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {lang === 'sv' ? 'Ljudeffekter & Tuta' : 'Sound Effects & Horn'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isMuted
                        ? lang === 'sv' ? 'Ljudet är avstängt' : 'Sound is muted'
                        : lang === 'sv' ? 'Ljudet är på' : 'Sound is on'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleMute}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    isMuted
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-emerald-500 text-white shadow-sm'
                  }`}
                >
                  {isMuted ? (lang === 'sv' ? 'Sätt på' : 'Turn On') : (lang === 'sv' ? 'Ljud På' : 'Sound On')}
                </button>
              </div>

              {/* Language Toggle */}
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

        {/* Modal Footer: Big Resume CTA */}
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
