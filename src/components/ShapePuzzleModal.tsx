import React, { useState } from 'react';
import { sounds } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Check } from 'lucide-react';

interface ShapePuzzleModalProps {
  isOpen: boolean;
  requiredShape: 'circle' | 'square' | 'triangle' | 'star';
  onSolve: () => void;
  lang: 'sv' | 'en';
}

const SHAPES = [
  { id: 'circle', nameSv: 'Cirkel', nameEn: 'Circle', icon: '🔴', color: 'bg-red-500' },
  { id: 'triangle', nameSv: 'Triangel', nameEn: 'Triangle', icon: '🔺', color: 'bg-amber-500' },
  { id: 'square', nameSv: 'Kvadrat', nameEn: 'Square', icon: '🟦', color: 'bg-blue-500' },
  { id: 'star', nameSv: 'Stjärna', nameEn: 'Star', icon: '⭐', color: 'bg-purple-500' },
] as const;

export const ShapePuzzleModal: React.FC<ShapePuzzleModalProps> = ({
  isOpen,
  requiredShape,
  onSolve,
  lang,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const targetShapeObj = SHAPES.find((s) => s.id === requiredShape) || SHAPES[1];

  const handlePick = (shapeId: string) => {
    sounds.init();
    setSelected(shapeId);

    if (shapeId === requiredShape) {
      sounds.playSnap();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });

      const praise =
        lang === 'sv'
          ? `Jippi! ${targetShapeObj.nameSv} passar perfekt i hålet! Bron är lagad!`
          : `Yay! ${targetShapeObj.nameEn} fits perfectly! Bridge repaired!`;
      sounds.speak(praise, lang);

      setTimeout(() => {
        onSolve();
      }, 900);
    } else {
      sounds.playHorn('boing');
      setIsError(true);
      const hint =
        lang === 'sv'
          ? `Kolla noga! Vi letar efter en ${targetShapeObj.nameSv}!`
          : `Look closely! We need a ${targetShapeObj.nameEn}!`;
      sounds.speak(hint, lang);
      setTimeout(() => setIsError(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-amber-50 rounded-3xl border-4 border-amber-300 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Decorative corner ribbons */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-300 rounded-full blur-xl pointer-events-none" />

        {/* Dragon Header */}
        <div className="flex flex-col items-center mb-4">
          <span className="text-6xl sm:text-7xl mb-2 animate-bounce">🐲</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-display">
            {lang === 'sv' ? 'Laga bron till Draken Diddi!' : 'Fix the Bridge for Diddi!'}
          </h2>
          <p className="text-base sm:text-lg text-amber-800 font-medium mt-1">
            {lang === 'sv'
              ? `Vilken kloss passar i hålet? Vi behöver en ${targetShapeObj.nameSv}!`
              : `Which block fits in the slot? We need a ${targetShapeObj.nameEn}!`}
          </p>
        </div>

        {/* Slot Target */}
        <div className="my-6 flex justify-center items-center">
          <div className="w-28 h-28 rounded-2xl border-4 border-dashed border-amber-500 bg-amber-200/60 flex items-center justify-center shadow-inner">
            <span className="text-5xl opacity-40">{targetShapeObj.icon}</span>
          </div>
        </div>

        {/* 4 Big Shape Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {SHAPES.map((shape) => {
            const isTarget = shape.id === requiredShape;
            const isPicked = selected === shape.id;

            return (
              <button
                key={shape.id}
                type="button"
                onClick={() => handlePick(shape.id)}
                className={`py-4 px-3 rounded-2xl border-4 transition-all duration-150 flex flex-col items-center justify-center gap-1 active:scale-95 shadow-md ${
                  isPicked && isTarget
                    ? 'bg-emerald-500 border-emerald-300 text-white scale-105'
                    : isPicked && isError
                    ? 'bg-red-100 border-red-400 animate-shake'
                    : 'bg-white hover:bg-amber-100/80 border-amber-200 text-slate-800'
                }`}
              >
                <span className="text-4xl">{shape.icon}</span>
                <span className="font-bold text-base mt-1">
                  {lang === 'sv' ? shape.nameSv : shape.nameEn}
                </span>
                {isPicked && isTarget && (
                  <Check className="w-5 h-5 text-white stroke-[3] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
