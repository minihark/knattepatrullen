import React, { useState, useEffect } from 'react';
import { VehicleConfig, SafariPhoto } from '../types';
import { SAFARI_ANIMALS } from '../data/gameData';
import { Award, Printer, X, Sparkles, Star, Compass, Check, Camera, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx } from 'clsx';

interface DiplomaModalProps {
  isOpen: boolean;
  onClose: () => void;
  starsEarned: number;
  vehicle: VehicleConfig;
  lang: 'sv' | 'en';
  greetedAnimals?: string[];
  safariPhotos?: Record<string, SafariPhoto>;
  initialTab?: 'diploma' | 'album';
}

export const DiplomaModal: React.FC<DiplomaModalProps> = ({
  isOpen,
  onClose,
  starsEarned,
  vehicle,
  lang,
  greetedAnimals = [],
  safariPhotos = {},
  initialTab = 'diploma',
}) => {
  const [activeTab, setActiveTab] = useState<'diploma' | 'album'>(initialTab);
  const [driverName, setDriverName] = useState(() => {
    return localStorage.getItem('knatte_driver_name') || 'Mästarchauffören';
  });

  const [savedAnimals, setSavedAnimals] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('knatte_greeted_animals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedPhotos, setSavedPhotos] = useState<Record<string, SafariPhoto>>(() => {
    try {
      const saved = localStorage.getItem('knatte_safari_photos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      try {
        const saved = localStorage.getItem('knatte_greeted_animals');
        if (saved) setSavedAnimals(JSON.parse(saved));
      } catch {}
      try {
        const photosRaw = localStorage.getItem('knatte_safari_photos');
        if (photosRaw) setSavedPhotos(JSON.parse(photosRaw));
      } catch {}
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Merge prop animals and localStorage animals
  const activeGreeted = Array.from(new Set([...greetedAnimals, ...savedAnimals]));
  const greetedCount = SAFARI_ANIMALS.filter((a) => activeGreeted.includes(a.id)).length;
  const allGreeted = greetedCount === SAFARI_ANIMALS.length;

  // Merge prop photos and localStorage photos
  const allPhotos: Record<string, SafariPhoto> = { ...savedPhotos, ...safariPhotos };
  const corePhotoCount = SAFARI_ANIMALS.filter((a) => Boolean(allPhotos[a.id])).length;
  const allCorePhotographed = corePhotoCount === SAFARI_ANIMALS.length;

  // Bonus photos (e.g. rabbit, squirrel) if snapped
  const bonusPhotos = Object.values(allPhotos).filter(
    (p) => !SAFARI_ANIMALS.some((a) => a.id === p.animalId)
  );

  const handlePrint = () => {
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    window.print();
  };

  const handleSaveName = (newName: string) => {
    setDriverName(newName);
    try {
      localStorage.setItem('knatte_driver_name', newName);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static print:block overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#FFFDF7] rounded-3xl border-8 border-amber-400 shadow-2xl p-5 sm:p-7 relative text-center my-auto max-h-[92dvh] overflow-y-auto print:max-h-none print:overflow-visible print:border-4 print:shadow-none print:w-full print:max-w-none print:m-0 print:rounded-none">
        {/* Close Button (Hidden when printing) */}
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'sv' ? 'Stäng körkort' : 'Close license'}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors print:hidden"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Certificate / Scrapbook Header */}
        <div className="flex justify-center items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 animate-pulse" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-900 font-display uppercase tracking-wide">
            {activeTab === 'album'
              ? lang === 'sv'
                ? 'SAFARI-FOTOALBUM'
                : 'SAFARI PHOTO SCRAPBOOK'
              : lang === 'sv'
              ? 'OFFICIELLT KÖRKORT'
              : 'OFFICIAL DRIVER LICENSE'}
          </h2>
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 animate-pulse" />
        </div>

        <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">
          {lang === 'sv' ? 'HARKCO KNATTEPATRULLEN' : 'HARKCO JUNIOR PATROL'}
        </p>

        {/* Tactile View Switcher: Körkort vs Safari-Fotoalbum (Hidden when printing) */}
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-amber-100/90 border-2 border-amber-300/80 mb-3 print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('diploma')}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all',
              activeTab === 'diploma'
                ? 'bg-amber-500 text-white shadow-xs scale-[1.02]'
                : 'text-amber-900 hover:bg-amber-200/70'
            )}
          >
            <CreditCard className="w-4 h-4" />
            <span>{lang === 'sv' ? 'Körkort & Stämplar' : 'License & Stamps'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('album')}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all',
              activeTab === 'album'
                ? 'bg-amber-500 text-white shadow-xs scale-[1.02]'
                : 'text-amber-900 hover:bg-amber-200/70'
            )}
          >
            <Camera className="w-4 h-4" />
            <span>
              {lang === 'sv' ? 'Safari-Fotoalbum' : 'Photo Album'} ({corePhotoCount}/{SAFARI_ANIMALS.length})
            </span>
          </button>
        </div>

        {activeTab === 'diploma' ? (
          /* =========================================================
             TAB 1: OFFICIAL DRIVER LICENSE & SAFARI STAMPS
             ========================================================= */
          <div className="bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl p-4 sm:p-6 my-1">
            <p className="text-sm sm:text-base text-slate-700 font-medium mb-1">
              {lang === 'sv'
                ? 'Härmed intygas att vår modiga och skickliga förare:'
                : 'This certifies that our brave and skillful driver:'}
            </p>

            <input
              type="text"
              value={driverName}
              onChange={(e) => handleSaveName(e.target.value)}
              className="text-2xl sm:text-3xl font-extrabold text-amber-950 text-center bg-transparent border-b-2 border-amber-400 focus:outline-none focus:border-amber-600 px-3 py-1 font-display w-full max-w-sm mb-2"
              placeholder={lang === 'sv' ? 'Skriv ditt namn här...' : 'Enter your name...'}
            />

            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              {lang === 'sv'
                ? 'har framfört fordonet med glädje, hjälpt vännerna och samlat stjärnor!'
                : 'has driven with joy, helped friends, and gathered shiny golden stars!'}
            </p>

            {/* Vehicle & Stars Row */}
            <div className="flex items-center justify-center gap-6 my-4">
              <div className="flex flex-col items-center">
                <span className="text-4xl sm:text-5xl mb-1 filter drop-shadow-xs">{vehicle.emoji}</span>
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'sv' ? vehicle.nameSv : vehicle.nameEn}
                </span>
              </div>

              <div className="h-12 w-px bg-amber-300" />

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-amber-500 font-extrabold text-2xl sm:text-3xl">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-400 text-amber-500" />
                  <span>{starsEarned}</span>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'sv' ? 'Guldstjärnor' : 'Golden Stars'}
                </span>
              </div>
            </div>

            {/* 🌲 SAFARI WILDLIFE PASSPORT STAMPS */}
            <div className="mt-4 pt-4 border-t-2 border-dashed border-amber-300/80 text-left">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-amber-800 shrink-0" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-amber-950 uppercase tracking-wide font-display">
                      {lang === 'sv' ? '🌲 Skogssafari • Djurvän-Stämplar' : '🌲 Forest Safari • Animal Friend Stamps'}
                    </h3>
                    <p className="text-[10px] text-amber-800/80 font-medium hidden sm:block">
                      {lang === 'sv'
                        ? 'Samlarfrimärken från skogens djurvänner du hälsat på under färden'
                        : 'Collectible stamps from animal friends you greeted during the drive'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] sm:text-xs font-black text-amber-950 bg-amber-200/90 border border-amber-400 px-2 py-0.5 rounded-full shadow-2xs">
                    {greetedCount}/{SAFARI_ANIMALS.length} {lang === 'sv' ? 'stämplar' : 'stamps'}
                  </span>
                </div>
              </div>

              {/* Special Ranger Milestone Banner if all 5 greeted */}
              {allGreeted && (
                <div className="mb-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-100 via-amber-100 to-emerald-100 border border-emerald-400 text-center flex items-center justify-center gap-2 animate-pulse shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-black text-emerald-950 uppercase tracking-wider">
                    {lang === 'sv'
                      ? '🏆 HEDERSMÄRKE: MÄSTAR-SAFARI! ALLA 5 DJURVÄNNER HÄLSADE PÅ! 🐾'
                      : '🏆 HONORARY RANGER: MASTER EXPLORER! ALL 5 ANIMAL FRIENDS GREETED! 🐾'}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                </div>
              )}

              {/* Safari Animal Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
                {SAFARI_ANIMALS.map((animal) => {
                  const isCollected = activeGreeted.includes(animal.id);
                  const hasPhoto = Boolean(allPhotos[animal.id]);
                  return (
                    <div
                      key={animal.id}
                      onClick={() => {
                        if (hasPhoto) setActiveTab('album');
                      }}
                      className={clsx(
                        'relative p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all select-none',
                        hasPhoto && 'cursor-pointer',
                        isCollected
                          ? clsx(animal.bgClass, animal.borderClass, animal.tilt, 'border-2 border-dashed shadow-xs hover:scale-105')
                          : 'bg-white/60 border-2 border-dotted border-amber-300/60 opacity-60'
                      )}
                    >
                      {hasPhoto && (
                        <div
                          title={lang === 'sv' ? 'Se Polaroid-foto' : 'View Polaroid photo'}
                          className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-2xs text-[9px]"
                        >
                          📸
                        </div>
                      )}

                      {isCollected ? (
                        <div
                          title={lang === 'sv' ? 'Stämpel godkänd' : 'Stamp verified'}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                        </div>
                      ) : (
                        <div className="absolute -top-1.5 -right-1.5 text-amber-500 text-[11px] leading-none opacity-75">
                          🐾
                        </div>
                      )}

                      <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow-xs transition-transform transform active:scale-110">
                        {animal.emoji}
                      </span>

                      <span
                        className={clsx(
                          'text-[11px] sm:text-xs font-black leading-tight',
                          isCollected ? animal.colorClass : 'text-slate-400'
                        )}
                      >
                        {lang === 'sv' ? animal.nameSv : animal.nameEn}
                      </span>

                      <span className="text-[8px] sm:text-[9px] font-bold text-amber-900/80 uppercase tracking-tighter leading-tight mt-0.5">
                        {isCollected
                          ? lang === 'sv'
                            ? animal.titleSv
                            : animal.titleEn
                          : lang === 'sv'
                          ? 'Kör & hälsa!'
                          : 'Drive & greet!'}
                      </span>

                      {isCollected && (
                        <span className="text-[7.5px] font-medium text-slate-500/90 italic leading-none mt-1 line-clamp-1">
                          "{lang === 'sv' ? animal.taglineSv : animal.taglineEn}"
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
             TAB 2: PRINTABLE SAFARI POLAROID SCRAPBOOK ALBUM
             ========================================================= */
          <div className="bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl p-4 sm:p-5 my-1 text-left">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-amber-950 font-display flex items-center gap-1.5">
                  <span>📸 {driverName}s Safari-Fotoalbum</span>
                </h3>
                <p className="text-[11px] text-amber-800/85 font-medium">
                  {lang === 'sv'
                    ? 'Stanna bredvid djuren i skogen och tryck på 📸 Fota för att spara dina Polaroid-minnen!'
                    : 'Stop beside forest animals and tap 📸 Snap to collect your Polaroid memories!'}
                </p>
              </div>
              <span className="text-xs font-black text-amber-950 bg-amber-200/90 border border-amber-400 px-2.5 py-1 rounded-full shrink-0">
                {corePhotoCount}/{SAFARI_ANIMALS.length} {lang === 'sv' ? 'foton' : 'photos'}
              </span>
            </div>

            {allCorePhotographed && (
              <div className="mb-3.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-100 via-amber-100 to-emerald-100 border border-emerald-400 text-center flex items-center justify-center gap-2 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="text-[10px] sm:text-xs font-black text-emerald-950 uppercase tracking-wider">
                  {lang === 'sv'
                    ? '🏆 MÄSTAR-FOTOGRAF! ALLA 5 SAFARI-PORTRÄTT ÄR SAMLADE I ALBUMET! 📸'
                    : '🏆 MASTER PHOTOGRAPHER! ALL 5 SAFARI PORTRAITS COLLECTED! 📸'}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              </div>
            )}

            {/* Polaroid Photo Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {SAFARI_ANIMALS.map((animal, idx) => {
                const photo = allPhotos[animal.id];
                const tiltClass = idx % 2 === 0 ? '-rotate-1' : 'rotate-1';

                return (
                  <div
                    key={animal.id}
                    className={clsx(
                      'bg-white p-2.5 pb-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between shadow-md',
                      photo
                        ? clsx('border-amber-200', tiltClass, 'hover:rotate-0 hover:scale-[1.02]')
                        : 'border-dashed border-amber-300/70 opacity-75'
                    )}
                  >
                    {/* 3:2 Scenic Polaroid Image Window */}
                    <div className="aspect-[3/2] w-full rounded-xl overflow-hidden bg-amber-50/60 border border-slate-200/80 relative flex items-center justify-center">
                      {photo ? (
                        <>
                          <img
                            src={photo.dataUrl}
                            alt={lang === 'sv' ? photo.animalNameSv : photo.animalNameEn}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1.5 right-1.5 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span>{photo.timeOfDay === 'night' ? '🌙' : '☀️'}</span>
                            <span>{photo.vehicleEmoji}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center">
                          <span className="text-4xl mb-1 opacity-45">{animal.emoji}</span>
                          <span className="text-[10px] font-bold text-amber-800/70 uppercase tracking-wider">
                            {lang === 'sv' ? 'Saknar foto' : 'No photo yet'}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            {lang === 'sv' ? 'Kör fram & tryck 📸 Fota!' : 'Drive close & tap 📸 Snap!'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Classic Polaroid Bottom Caption Strip */}
                    <div className="mt-2.5 px-1 text-center">
                      <div className="text-xs sm:text-sm font-extrabold text-amber-950 font-display flex items-center justify-center gap-1">
                        <span>{lang === 'sv' ? animal.nameSv : animal.nameEn}</span>
                        <span>{animal.emoji}</span>
                      </div>
                      <div className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
                        {photo
                          ? `${lang === 'sv' ? photo.vehicleNameSv : photo.vehicleNameEn} • ${
                              lang === 'sv' ? photo.levelTitleSv : photo.levelTitleEn
                            }`
                          : lang === 'sv'
                          ? ` "${animal.taglineSv}"`
                          : ` "${animal.taglineEn}"`}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Any Bonus Wildlife Photos Snapped (e.g. Pelle Kanin, Nils Ekorre) */}
              {bonusPhotos.map((photo, idx) => (
                <div
                  key={photo.animalId}
                  className={clsx(
                    'bg-white p-2.5 pb-3.5 rounded-2xl border-2 border-amber-200 shadow-md transition-all flex flex-col justify-between',
                    idx % 2 === 0 ? 'rotate-1' : '-rotate-1'
                  )}
                >
                  <div className="aspect-[3/2] w-full rounded-xl overflow-hidden bg-amber-50/60 border border-slate-200/80 relative">
                    <img
                      src={photo.dataUrl}
                      alt={lang === 'sv' ? photo.animalNameSv : photo.animalNameEn}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{photo.timeOfDay === 'night' ? '🌙' : '☀️'}</span>
                      <span>{photo.vehicleEmoji}</span>
                    </div>
                  </div>
                  <div className="mt-2.5 px-1 text-center">
                    <div className="text-xs sm:text-sm font-extrabold text-amber-950 font-display flex items-center justify-center gap-1">
                      <span>{lang === 'sv' ? photo.animalNameSv : photo.animalNameEn}</span>
                      <span>{photo.animalEmoji}</span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
                      {lang === 'sv' ? photo.vehicleNameSv : photo.vehicleNameEn} •{' '}
                      {lang === 'sv' ? photo.levelTitleSv : photo.levelTitleEn}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Golden Harkco Stamp */}
        <div className="flex justify-between items-end mt-4 px-3 sm:px-4">
          <div className="text-left">
            <p className="text-[11px] text-slate-400 font-mono">
              ID: KP-{starsEarned}77{greetedCount > 0 ? `-S${greetedCount}` : ''}{corePhotoCount > 0 ? `-P${corePhotoCount}` : ''}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Harkco Studios • Gothenburg</p>
          </div>

          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-amber-400 bg-amber-100 flex flex-col items-center justify-center rotate-[-12deg] shadow-sm">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
            <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-900 tracking-tighter">GULD</span>
          </div>
        </div>

        {/* Action Button: Print (Hidden during actual print) */}
        <div className="mt-4 flex justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold flex items-center gap-2 shadow-md transition-all text-sm sm:text-base"
          >
            <Printer className="w-5 h-5" />
            <span>
              {activeTab === 'album'
                ? lang === 'sv'
                  ? 'Skriv ut Fotoalbumet 🖨️'
                  : 'Print Photo Scrapbook 🖨️'
                : lang === 'sv'
                ? 'Skriv ut Körkortet 🖨️'
                : 'Print Certificate 🖨️'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
