import React, { useState } from 'react';
import { sounds } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Check } from 'lucide-react';

interface ColorPuzzleModalProps {
  isOpen: boolean;
  requiredColor: 'red' | 'blue' | 'yellow' | 'green';
  onSolve: () => void;
  lang: 'sv' | 'en';
}

const COLORS = [
  { id: 'red', nameSv: 'Röd', nameEn: 'Red', hex: '#EF4444', emoji: '🔴' },
  { id: 'blue', nameSv: 'Blå', nameEn: 'Blue', hex: '#3B82F6', emoji: '🔵' },
  { id: 'yellow', nameSv: 'Gul', nameEn: 'Yellow', hex: '#EAB308', emoji: '🟡' },
  { id: 'green', nameSv: 'Grön', nameEn: 'Green', hex: '#22C55E', emoji: '🟢' },
] as const;

export const ColorPuzzleModal: React.FC<ColorPuzzleModalProps> = ({
  isOpen,
  requiredColor,
  onSolve,
  lang,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const targetColorObj = COLORS.find((c) => c.id === requiredColor) || COLORS[1];

  const handlePick = (colorId: string) => {
    sounds.init();
    setSelected(colorId);

    if (colorId === requiredColor) {
      sounds.playSnap();
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
      });

      const praise =
        lang === 'sv'
          ? `Hurra! ${targetColorObj.nameSv} färg målade bron! Nu kör vi vidare!`
          : `Hooray! ${targetColorObj.nameEn} painted the bridge! Let's go!`;
      sounds.speak(praise, lang);

      setTimeout(() => {
        onSolve();
      }, 900);
    } else {
      sounds.playHorn('boing');
      setIsError(true);
      const hint =
        lang === 'sv'
          ? `Vi behöver ${targetColorObj.nameSv} färg! Prova igen!`
          : `We need ${targetColorObj.nameEn}! Try again!`;
      sounds.speak(hint, lang);
      setTimeout(() => setIsError(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-sky-300 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Bear Header */}
        <div className="flex flex-col items-center mb-4">
          <span className="text-6xl sm:text-7xl mb-2 animate-bounce">🐻</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-display">
            {lang === 'sv' ? 'Måla regnbågen med Nalle!' : 'Paint the Rainbow with Bear!'}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium mt-1">
            {lang === 'sv'
              ? `Vilken färgburk behöver vi? Hitta ${targetColorObj.nameSv}!`
              : `Which color bucket do we need? Find ${targetColorObj.nameEn}!`}
          </p>
        </div>

        {/* 4 Big Color Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {COLORS.map((col) => {
            const isTarget = col.id === requiredColor;
            const isPicked = selected === col.id;

            return (
              <button
                key={col.id}
                type="button"
                onClick={() => handlePick(col.id)}
                style={{ backgroundColor: col.hex }}
                className={`py-5 px-3 rounded-2xl border-4 border-white text-white font-extrabold transition-all duration-150 flex flex-col items-center justify-center gap-1 active:scale-95 shadow-lg ${
                  isPicked && isTarget
                    ? 'ring-4 ring-emerald-400 scale-105'
                    : isPicked && isError
                    ? 'opacity-60 animate-shake'
                    : 'hover:opacity-95'
                }`}
              >
                <span className="text-4xl">{col.emoji}</span>
                <span className="text-lg text-white drop-shadow-md">
                  {lang === 'sv' ? col.nameSv : col.nameEn}
                </span>
                {isPicked && isTarget && (
                  <Check className="w-6 h-6 text-white stroke-[3.5] mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
