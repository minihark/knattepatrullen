import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Volume2 } from 'lucide-react';
import { VehicleConfig } from '../types';

interface TouchControlsProps {
  vehicle: VehicleConfig;
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
  onDriveForwardStart,
  onDriveForwardEnd,
  onDriveBackwardStart,
  onDriveBackwardEnd,
  onJumpStart,
  onJumpEnd,
  onHonk,
  lang,
}) => {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 px-4 sm:px-8 flex justify-between items-end z-20">
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
          className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-amber-100/90 active:bg-amber-200 border-4 border-amber-400 active:scale-95 shadow-lg active:shadow-md transition-all flex flex-col items-center justify-center select-none touch-none"
        >
          <ArrowLeft className="w-8 h-8 sm:w-10 sm:h-10 text-amber-700 stroke-[3]" />
          <span className="text-[12px] sm:text-sm font-bold text-amber-800 tracking-wide mt-0.5">
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
          className="w-22 h-22 sm:w-26 sm:h-26 rounded-3xl bg-emerald-500 active:bg-emerald-600 border-4 border-emerald-300 active:scale-95 shadow-xl active:shadow-md transition-all flex flex-col items-center justify-center select-none touch-none"
        >
          <ArrowRight className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[3.5]" />
          <span className="text-sm sm:text-base font-extrabold text-white tracking-wider mt-0.5">
            {lang === 'sv' ? 'KÖR! 🚀' : 'GO! 🚀'}
          </span>
        </button>
      </div>

      {/* RIGHT SIDE: Action Controls (Jump & Honk!) */}
      <div className="pointer-events-auto flex items-center gap-3 sm:gap-5">
        {/* TUTA / HORN Button */}
        <button
          type="button"
          aria-label={lang === 'sv' ? 'Tuta med hornet' : 'Honk the horn'}
          onPointerDown={(e) => {
            e.preventDefault();
            onHonk();
          }}
          className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-amber-400 active:bg-amber-500 border-4 border-amber-200 active:scale-90 shadow-lg active:shadow-md transition-all flex flex-col items-center justify-center select-none touch-none animate-pulse"
        >
          <span className="text-2xl sm:text-3xl leading-none">{vehicle.hornEmoji}</span>
          <span className="text-[12px] sm:text-sm font-extrabold text-amber-950 tracking-wider mt-1">
            {lang === 'sv' ? 'TUTA!' : 'HONK!'}
          </span>
        </button>

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
          className="w-22 h-22 sm:w-26 sm:h-26 rounded-3xl bg-sky-500 active:bg-sky-600 border-4 border-sky-300 active:scale-95 shadow-xl active:shadow-md transition-all flex flex-col items-center justify-center select-none touch-none"
        >
          <ArrowUp className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[3.5]" />
          <span className="text-sm sm:text-base font-extrabold text-white tracking-wider mt-0.5">
            {lang === 'sv' ? 'HOPPA! 🦘' : 'JUMP! 🦘'}
          </span>
        </button>
      </div>
    </div>
  );
};
