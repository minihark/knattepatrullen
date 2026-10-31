import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundEngine';
import { LevelConfig, VehicleConfig } from '../types';
import { Star, Award, RotateCcw, ArrowRight } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  level: LevelConfig;
  vehicle: VehicleConfig;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenDiploma: () => void;
  lang: 'sv' | 'en';
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  level,
  vehicle,
  onNextLevel,
  onReplay,
  onOpenDiploma,
  lang,
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playVictory();
      sounds.playVoiceClip('bra_jobbat', 'Bra jobbat!', lang);
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
      });
      const t = setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Celebration Badges */}
        <div className="text-6xl sm:text-7xl mb-2 animate-bounce">🏆</div>

        <h2 className="text-3xl font-extrabold text-amber-950 font-display">
          {lang === 'sv' ? 'HURRA! DU KLARADE DET!' : 'HOORAY! YOU DID IT!'}
        </h2>

        <p className="text-base text-slate-600 font-medium mt-1">
          {lang === 'sv'
            ? `Fantastiskt bra kört med ${vehicle.nameSv}!`
            : `Awesome driving with ${vehicle.nameEn}!`}
        </p>

        {/* 3 Golden Stars */}
        <div className="flex justify-center items-center gap-3 my-6">
          <Star className="w-12 h-12 text-amber-400 fill-amber-400 animate-pulse stroke-[1.5]" />
          <Star className="w-16 h-16 text-amber-400 fill-amber-400 scale-110 drop-shadow-md stroke-[1.5]" />
          <Star className="w-12 h-12 text-amber-400 fill-amber-400 animate-pulse stroke-[1.5]" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          {/* Next Level */}
          <button
            type="button"
            onClick={onNextLevel}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>{lang === 'sv' ? 'Nästa bana!' : 'Next Level!'}</span>
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </button>

          {/* View Diploma */}
          <button
            type="button"
            onClick={onOpenDiploma}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 font-bold text-base flex items-center justify-center gap-2 border-2 border-amber-300 transition-all"
          >
            <Award className="w-5 h-5 text-amber-700" />
            <span>{lang === 'sv' ? 'Se mitt Knatte-Körkort' : "View Driver's License"}</span>
          </button>

          {/* Replay */}
          <button
            type="button"
            onClick={onReplay}
            className="w-full py-2.5 text-slate-500 hover:text-slate-800 font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lang === 'sv' ? 'Kör samma bana igen' : 'Drive this level again'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
