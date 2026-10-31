import React, { useState, useEffect } from 'react';
import { sounds } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Check, Sparkles } from 'lucide-react';

interface LetterPuzzleModalProps {
  isOpen: boolean;
  onSolve: () => void;
  lang: 'sv' | 'en';
}

interface LetterQuestion {
  emoji: string;
  wordSv: string;
  wordEn: string;
  letter: string;
  options: string[];
}

const QUESTIONS: LetterQuestion[] = [
  { emoji: '🚗', wordSv: 'BIL', wordEn: 'CAR', letter: 'B', options: ['B', 'S', 'M'] },
  { emoji: '☀️', wordSv: 'SOL', wordEn: 'SUN', letter: 'S', options: ['S', 'L', 'B'] },
  { emoji: '🐒', wordSv: 'APA', wordEn: 'APE', letter: 'A', options: ['A', 'O', 'P'] },
  { emoji: '🚂', wordSv: 'TÅG', wordEn: 'TRAIN', letter: 'T', options: ['T', 'K', 'S'] },
  { emoji: '🐱', wordSv: 'KATT', wordEn: 'CAT', letter: 'K', options: ['K', 'B', 'M'] },
  { emoji: '🐟', wordSv: 'FISK', wordEn: 'FISH', letter: 'F', options: ['F', 'S', 'T'] },
];

export const LetterPuzzleModal: React.FC<LetterPuzzleModalProps> = ({
  isOpen,
  onSolve,
  lang,
}) => {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Pick a fresh question each time modal opens
  useEffect(() => {
    if (isOpen) {
      const nextIdx = Math.floor(Math.random() * QUESTIONS.length);
      setQIndex(nextIdx);
      setSelected(null);
      setIsError(false);

      const q = QUESTIONS[nextIdx];
      const targetWord = lang === 'sv' ? q.wordSv : q.wordEn;
      const targetLetter = q.letter;
      const promptText =
        lang === 'sv'
          ? `Vilken bokstav börjar ${targetWord} på? Hitta bokstaven ${targetLetter}!`
          : `What letter does ${targetWord} start with? Find letter ${targetLetter}!`;

      setTimeout(() => {
        sounds.speak(promptText, lang);
      }, 300);
    }
  }, [isOpen, lang]);

  if (!isOpen) return null;

  const currentQ = QUESTIONS[qIndex];
  const targetWord = lang === 'sv' ? currentQ.wordSv : currentQ.wordEn;

  const handlePick = (letter: string) => {
    sounds.init();
    setSelected(letter);

    if (letter === currentQ.letter) {
      sounds.playSnap();
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
      });

      const praise =
        lang === 'sv'
          ? `Jippi! ${currentQ.letter}! ${currentQ.letter} som i ${targetWord}! Helt rätt!`
          : `Hooray! ${currentQ.letter}! ${currentQ.letter} is for ${targetWord}!`;
      sounds.speak(praise, lang);

      setTimeout(() => {
        onSolve();
      }, 1000);
    } else {
      sounds.playHorn('boing');
      setIsError(true);
      const hint =
        lang === 'sv'
          ? `Lyssna noga: ${targetWord}! Vi letar efter bokstaven ${currentQ.letter}!`
          : `Listen closely: ${targetWord}! We need letter ${currentQ.letter}!`;
      sounds.speak(hint, lang);
      setTimeout(() => setIsError(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-orange-50 rounded-3xl border-4 border-orange-300 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Abbe the Monkey Header */}
        <div className="flex flex-col items-center mb-4">
          <span className="text-6xl sm:text-7xl mb-2 animate-bounce">🐒</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-orange-950 font-display">
            {lang === 'sv' ? 'Bokstavs-Kluringen!' : 'Letter Challenge!'}
          </h2>
          <p className="text-base sm:text-lg text-orange-800 font-medium mt-1">
            {lang === 'sv'
              ? `Vilken bokstav börjar ${targetWord} på?`
              : `What letter starts ${targetWord}?`}
          </p>
        </div>

        {/* Big Picture Card */}
        <div className="my-5 flex flex-col items-center justify-center bg-white rounded-2xl border-4 border-orange-200 py-4 px-6 shadow-md">
          <span className="text-7xl sm:text-8xl mb-2 drop-shadow-sm">{currentQ.emoji}</span>
          <div className="flex items-center gap-1 font-mono font-black text-3xl sm:text-4xl text-orange-900 tracking-widest">
            <span className="w-10 h-12 border-b-4 border-orange-500 text-orange-600 flex items-center justify-center">
              {selected === currentQ.letter ? currentQ.letter : '?'}
            </span>
            <span>{targetWord.slice(1)}</span>
          </div>
        </div>

        {/* 3 Giant Letter Buttons */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 mt-6">
          {currentQ.options.map((letter) => {
            const isTarget = letter === currentQ.letter;
            const isPicked = selected === letter;

            return (
              <button
                key={letter}
                type="button"
                onClick={() => handlePick(letter)}
                className={`py-5 sm:py-6 rounded-2xl border-4 text-3xl sm:text-4xl font-black font-display transition-all duration-150 flex flex-col items-center justify-center active:scale-95 shadow-lg ${
                  isPicked && isTarget
                    ? 'bg-emerald-500 border-emerald-300 text-white scale-105 ring-4 ring-emerald-300'
                    : isPicked && isError
                    ? 'bg-red-100 border-red-400 text-red-600 animate-shake'
                    : 'bg-white hover:bg-orange-100 border-orange-200 text-orange-950'
                }`}
              >
                <span>{letter}</span>
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
