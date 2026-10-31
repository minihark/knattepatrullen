import React, { useState, useEffect } from 'react';
import { sounds } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Check } from 'lucide-react';

interface AdditionPuzzleModalProps {
  isOpen: boolean;
  onSolve: () => void;
  lang: 'sv' | 'en';
}

interface MathQuestion {
  num1: number;
  num2: number;
  sum: number;
  itemEmoji: string;
  options: number[];
}

const QUESTIONS: MathQuestion[] = [
  { num1: 1, num2: 1, sum: 2, itemEmoji: '🍎', options: [2, 3, 4] },
  { num1: 1, num2: 2, sum: 3, itemEmoji: '⭐', options: [2, 3, 4] },
  { num1: 2, num2: 1, sum: 3, itemEmoji: '🥕', options: [3, 4, 2] },
  { num1: 2, num2: 2, sum: 4, itemEmoji: '🎈', options: [3, 4, 5] },
  { num1: 3, num2: 1, sum: 4, itemEmoji: '🚗', options: [4, 5, 3] },
  { num1: 2, num2: 3, sum: 5, itemEmoji: '🍎', options: [4, 5, 3] },
  { num1: 1, num2: 4, sum: 5, itemEmoji: '⭐', options: [5, 4, 3] },
];

export const AdditionPuzzleModal: React.FC<AdditionPuzzleModalProps> = ({
  isOpen,
  onSolve,
  lang,
}) => {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const nextIdx = Math.floor(Math.random() * QUESTIONS.length);
      setQIndex(nextIdx);
      setSelected(null);
      setIsError(false);

      const q = QUESTIONS[nextIdx];
      const promptText =
        lang === 'sv'
          ? `Räkna plus med Boris! ${q.num1} plus ${q.num2}! Räkna hur många det blir tillsammans!`
          : `Math with Boris! ${q.num1} plus ${q.num2}! Count how many in total!`;

      setTimeout(() => {
        sounds.speak(promptText, lang);
      }, 300);
    }
  }, [isOpen, lang]);

  if (!isOpen) return null;

  const currentQ = QUESTIONS[qIndex];

  const handlePick = (answer: number) => {
    sounds.init();
    setSelected(answer);

    if (answer === currentQ.sum) {
      sounds.playSnap();
      confetti({
        particleCount: 55,
        spread: 85,
        origin: { y: 0.6 },
      });

      const praise =
        lang === 'sv'
          ? `Strålande! ${currentQ.num1} plus ${currentQ.num2} är lika med ${currentQ.sum}! Bra räknat!`
          : `Brilliant! ${currentQ.num1} plus ${currentQ.num2} equals ${currentQ.sum}! Great math!`;

      sounds.playVoiceClip(`math_${currentQ.num1}_${currentQ.num2}`, praise, lang);

      setTimeout(() => {
        onSolve();
      }, 1000);
    } else {
      sounds.playHorn('boing');
      setIsError(true);
      const hint =
        lang === 'sv'
          ? `Kolla noga och prova igen!`
          : `Look closely and try again!`;
      sounds.playVoiceClip('hint_tryagain', hint, lang);
      setTimeout(() => setIsError(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-indigo-50 rounded-3xl border-4 border-indigo-300 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Boris the Beaver Header */}
        <div className="flex flex-col items-center mb-3">
          <span className="text-6xl sm:text-7xl mb-2 animate-bounce">🦫</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 font-display">
            {lang === 'sv' ? 'Matte-Verkstaden!' : 'Math Workshop!'}
          </h2>
          <p className="text-base sm:text-lg text-indigo-800 font-medium mt-0.5">
            {lang === 'sv'
              ? 'Räkna hur många det blir tillsammans:'
              : 'Count how many they make together:'}
          </p>
        </div>

        {/* Visual Math Problem Card */}
        <div className="my-5 bg-white rounded-2xl border-4 border-indigo-200 py-5 px-6 shadow-md flex flex-col items-center gap-3">
          {/* Concrete Visual Groups */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {/* Group 1 */}
            <div className="flex items-center gap-1 bg-indigo-50 px-3 py-2 rounded-xl border-2 border-indigo-200">
              {Array.from({ length: currentQ.num1 }).map((_, i) => (
                <span key={i} className="text-3xl sm:text-4xl animate-pulse">
                  {currentQ.itemEmoji}
                </span>
              ))}
            </div>

            {/* Plus sign */}
            <span className="text-3xl sm:text-4xl font-black text-indigo-600">+</span>

            {/* Group 2 */}
            <div className="flex items-center gap-1 bg-indigo-50 px-3 py-2 rounded-xl border-2 border-indigo-200">
              {Array.from({ length: currentQ.num2 }).map((_, i) => (
                <span key={i} className="text-3xl sm:text-4xl animate-pulse">
                  {currentQ.itemEmoji}
                </span>
              ))}
            </div>

            {/* Equals sign */}
            <span className="text-3xl sm:text-4xl font-black text-indigo-600">=</span>

            {/* Answer slot */}
            <div className="w-12 h-12 rounded-xl border-3 border-dashed border-indigo-400 bg-indigo-100 flex items-center justify-center text-3xl font-black text-indigo-700">
              {selected === currentQ.sum ? currentQ.sum : '?'}
            </div>
          </div>

          {/* Numeral equation below */}
          <div className="font-display font-black text-2xl sm:text-3xl text-indigo-900 tracking-wider">
            {currentQ.num1} + {currentQ.num2} = {selected === currentQ.sum ? currentQ.sum : '?'}
          </div>
        </div>

        {/* 3 Giant Choice Buttons */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 mt-6">
          {currentQ.options.map((val) => {
            const isTarget = val === currentQ.sum;
            const isPicked = selected === val;

            return (
              <button
                key={val}
                type="button"
                onClick={() => handlePick(val)}
                className={`py-5 sm:py-6 rounded-2xl border-4 text-3xl sm:text-4xl font-black font-display transition-all duration-150 flex flex-col items-center justify-center active:scale-95 shadow-lg ${
                  isPicked && isTarget
                    ? 'bg-emerald-500 border-emerald-300 text-white scale-105 ring-4 ring-emerald-300'
                    : isPicked && isError
                    ? 'bg-red-100 border-red-400 text-red-600 animate-shake'
                    : 'bg-white hover:bg-indigo-100 border-indigo-200 text-indigo-950'
                }`}
              >
                <span>{val}</span>
                {isPicked && isTarget && (
                  <Check className="w-6 h-6 text-white stroke-[4] mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
