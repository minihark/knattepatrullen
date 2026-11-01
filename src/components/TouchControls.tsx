import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, RefreshCw } from 'lucide-react';
import { VehicleConfig } from '../types';

export const HORN_EMOJIS: Record<string, string> = {
  horn: '📢',
  quack: '🦆',
  siren: '🚨',
  boing: '⭐',
  cat: '🐱',
  dog: '🐶',
};

interface TouchControlsProps {
  vehicle: VehicleConfig;
  activeHorn?: 'horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog';
  onCycleHorn?: () => void;
  onDriveForwardStart: () => void;
  onDriveForwardEnd: () => void;
  onDriveBackwardStart: () => void;
  onDriveBackwardEnd: () => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onHonk: () => void;
  lang: 'sv' | 'en';
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  vehicle,
  activeHorn,
  onCycleHorn,
  onDriveForwardStart,
  onDriveForwardEnd,
  onDriveBackwardStart,
  onDriveBackwardEnd,
  onJumpStart,
  onJumpEnd,
  onHonk,
  lang,
}) => {
  const currentHornEmoji = activeHorn ? HORN_EMOJIS[activeHorn] || vehicle.hornEmoji : vehicle.hornEmoji;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 sm:bottom-10 pb-[env(safe-area-inset-bottom,24px)] px-5 sm:px-12 flex justify-between items-end z-30 select-none">
      {/* LEFT SIDE: Steering / Drive Controls */}
      <div className="pointer-events-auto flex items-center gap-3 sm:gap-5">
        {/* Reverse / Backa Button */}
        <button
          type="button"
          aria-label={lang === 'sv' ? 'Backa bilen' : 'Reverse vehicle'}
          onPointerDown={(e) => {
            e.preventDefault();
            onDriveBackwardStart();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onDriveBackwardEnd();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            onDriveBackwardEnd();
          }}
          className="w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] rounded-3xl bg-amber-100/95 active:bg-amber-200 border-4 border-amber-400 active:scale-95 shadow-xl transition-all flex flex-col items-center justify-center select-none touch-none ring-2 ring-black/10"
        >
          <ArrowLeft className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800 stroke-[3.5]" />
          <span className="text-[12px] sm:text-xs font-black text-amber-900 tracking-wider mt-0.5">
            {lang === 'sv' ? 'BACKA' : 'BACK'}
          </span>
        </button>

        {/* Forward / KÖR! Button */}
        <button
          type="button"
          aria-label={lang === 'sv' ? 'Kör framåt' : 'Drive forward'}
          onPointerDown={(e) => {
            e.preventDefault();
            onDriveForwardStart();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onDriveForwardEnd();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            onDriveForwardEnd();
          }}
          className="w-[96px] h-[96px] sm:w-[112px] sm:h-[112px] rounded-3xl bg-emerald-500 active:bg-emerald-600 border-4 border-emerald-300 active:scale-95 shadow-2xl transition-all flex flex-col items-center justify-center select-none touch-none ring-4 ring-emerald-500/25"
        >
          <ArrowRight className="w-11 h-11 sm:w-13 sm:h-13 text-white stroke-[3.5]" />
          <span className="text-sm sm:text-base font-black text-white tracking-wider mt-0.5">
            {lang === 'sv' ? 'KÖR! 🚀' : 'GO! 🚀'}
          </span>
        </button>
      </div>

      {/* RIGHT SIDE: Action Controls (Jump & Honk!) */}
      <div className="pointer-events-auto flex items-center gap-3 sm:gap-5">
        {/* TUTA / HORN Button with 1-Tap Horn Switcher Badge */}
        <div className="relative">
          <button
            type="button"
            aria-label={lang === 'sv' ? 'Tuta med hornet' : 'Honk the horn'}
            onPointerDown={(e) => {
              e.preventDefault();
              onHonk();
            }}
            className="w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] rounded-3xl bg-amber-400 active:bg-amber-500 border-4 border-amber-200 active:scale-90 shadow-xl transition-all flex flex-col items-center justify-center select-none touch-none ring-2 ring-black/10 animate-pulse relative"
          >
            <span className="text-3xl sm:text-4xl leading-none">{currentHornEmoji}</span>
            <span className="text-[12px] sm:text-xs font-black text-amber-950 tracking-wider mt-1">
              {lang === 'sv' ? 'TUTA!' : 'HONK!'}
            </span>
          </button>

          {onCycleHorn && (
            <button
              type="button"
              aria-label={lang === 'sv' ? 'Byt horn-ljud' : 'Change horn sound'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCycleHorn();
              }}
              className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white active:bg-amber-100 border-2 border-amber-300 shadow-md flex items-center justify-center text-xs text-amber-900 active:scale-90 transition-transform"
              title="Byt tuta"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
            </button>
          )}
        </div>

        {/* HOPPA! / JUMP Button */}
        <button
          type="button"
          aria-label={lang === 'sv' ? 'Hoppa med bilen' : 'Jump'}
          onPointerDown={(e) => {
            e.preventDefault();
            onJumpStart();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onJumpEnd();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            onJumpEnd();
          }}
          className="w-[96px] h-[96px] sm:w-[112px] sm:h-[112px] rounded-3xl bg-sky-500 active:bg-sky-600 border-4 border-sky-300 active:scale-95 shadow-2xl transition-all flex flex-col items-center justify-center select-none touch-none ring-4 ring-sky-500/25"
        >
          <ArrowUp className="w-11 h-11 sm:w-13 sm:h-13 text-white stroke-[3.5]" />
          <span className="text-sm sm:text-base font-black text-white tracking-wider mt-0.5">
            {lang === 'sv' ? 'HOPPA! 🦘' : 'JUMP! 🦘'}
          </span>
        </button>
      </div>
    </div>
  );
};
