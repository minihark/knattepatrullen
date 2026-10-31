import React, { useState } from 'react';
import { VehicleConfig } from '../types';
import { Award, Printer, X, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiplomaModalProps {
  isOpen: boolean;
  onClose: () => void;
  starsEarned: number;
  vehicle: VehicleConfig;
  lang: 'sv' | 'en';
}

export const DiplomaModal: React.FC<DiplomaModalProps> = ({
  isOpen,
  onClose,
  starsEarned,
  vehicle,
  lang,
}) => {
  const [driverName, setDriverName] = useState(() => {
    return localStorage.getItem('knatte_driver_name') || 'Mästarchauffören';
  });

  if (!isOpen) return null;

  const handlePrint = () => {
    confetti({ particleCount: 40, spread: 60 });
    window.print();
  };

  const handleSaveName = (newName: string) => {
    setDriverName(newName);
    try {
      localStorage.setItem('knatte_driver_name', newName);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="w-full max-w-xl bg-[#FFFDF7] rounded-3xl border-8 border-amber-400 shadow-2xl p-6 sm:p-8 relative text-center print:border-4 print:shadow-none print:w-full">
        {/* Close Button (Hidden when printing) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors print:hidden"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Certificate Header */}
        <div className="flex justify-center items-center gap-2 mb-2">
          <Sparkles className="w-8 h-8 text-amber-500" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-900 font-display uppercase tracking-wide">
            {lang === 'sv' ? 'OFFICIELLT KÖRKORT' : 'OFFICIAL DRIVER LICENSE'}
          </h2>
          <Sparkles className="w-8 h-8 text-amber-500" />
        </div>

        <p className="text-sm sm:text-base font-bold text-amber-700 uppercase tracking-widest mb-6">
          {lang === 'sv' ? 'HARKCO KNATTEPATRULLEN' : 'HARKCO JUNIOR PATROL'}
        </p>

        {/* Diploma Body */}
        <div className="bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl p-6 my-4">
          <p className="text-base text-slate-700 font-medium mb-2">
            {lang === 'sv'
              ? 'Härmed intygas att vår modiga och skickliga förare:'
              : 'This certifies that our brave and skillful driver:'}
          </p>

          <input
            type="text"
            value={driverName}
            onChange={(e) => handleSaveName(e.target.value)}
            className="text-2xl sm:text-3xl font-extrabold text-amber-950 text-center bg-transparent border-b-2 border-amber-400 focus:outline-none focus:border-amber-600 px-3 py-1 font-display w-full max-w-sm mb-3"
            placeholder={lang === 'sv' ? 'Skriv ditt namn här...' : 'Enter your name...'}
          />

          <p className="text-base text-slate-700 font-medium">
            {lang === 'sv'
              ? 'har framfört fordonet med glädje, hjälpt vännerna och samlat stjärnor!'
              : 'has driven with joy, helped friends, and gathered shiny golden stars!'}
          </p>

          {/* Vehicle & Stars Row */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex flex-col items-center">
              <span className="text-5xl mb-1">{vehicle.emoji}</span>
              <span className="text-xs font-bold text-slate-600">{vehicle.nameSv}</span>
            </div>

            <div className="h-12 w-px bg-amber-300" />

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-amber-500 font-extrabold text-2xl">
                <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
                <span>{starsEarned}</span>
              </div>
              <span className="text-xs font-bold text-slate-600">
                {lang === 'sv' ? 'Guldstjärnor' : 'Golden Stars'}
              </span>
            </div>
          </div>
        </div>

        {/* Golden Harkco Stamp */}
        <div className="flex justify-between items-end mt-6 px-4">
          <div className="text-left">
            <p className="text-xs text-slate-400 font-mono">ID: KP-{starsEarned}77</p>
            <p className="text-xs text-slate-500 font-medium">Harkco Studios • Gothenburg</p>
          </div>

          <div className="w-16 h-16 rounded-full border-4 border-amber-400 bg-amber-100 flex flex-col items-center justify-center rotate-[-12deg] shadow-sm">
            <Award className="w-6 h-6 text-amber-700" />
            <span className="text-[9px] font-extrabold text-amber-900 tracking-tighter">GULD</span>
          </div>
        </div>

        {/* Action Button: Print (Hidden during actual print) */}
        <div className="mt-6 flex justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Printer className="w-5 h-5" />
            <span>{lang === 'sv' ? 'Skriv ut Körkortet 🖨️' : 'Print Certificate 🖨️'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
