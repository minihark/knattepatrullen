import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VehicleConfig, LevelConfig, VehicleType, CarUpgrades, TimeOfDay } from './types';
import { VEHICLES, LEVELS } from './data/gameData';
import { GameCanvas } from './components/GameCanvas';
import { TouchControls } from './components/TouchControls';
import { GameHUD } from './components/GameHUD';
import { ShapePuzzleModal } from './components/ShapePuzzleModal';
import { ColorPuzzleModal } from './components/ColorPuzzleModal';
import { LetterPuzzleModal } from './components/LetterPuzzleModal';
import { AdditionPuzzleModal } from './components/AdditionPuzzleModal';
import { VictoryModal } from './components/VictoryModal';
import { DiplomaModal } from './components/DiplomaModal';
import { sounds } from './audio/soundEngine';

export const App: React.FC = () => {
  // Game State
  const [currentVehicle, setCurrentVehicle] = useState<VehicleConfig>(VEHICLES[0]);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [collectedCount, setCollectedCount] = useState<number>(0);
  const [starsEarned, setStarsEarned] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('knatte_stars') || '0');
      return Number.isFinite(saved) && saved >= 0 ? saved : 0;
    } catch {
      return 0;
    }
  });

  // Safari wildlife friends greeted during the adventure
  const [greetedAnimals, setGreetedAnimals] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('knatte_greeted_animals');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const handleAnimalGreeted = useCallback((animalType: string) => {
    setGreetedAnimals((prev) => {
      if (prev.includes(animalType)) return prev;
      const next = [...prev, animalType];
      try {
        localStorage.setItem('knatte_greeted_animals', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Car Upgrades State (saved in localStorage)
  const [upgrades, setUpgrades] = useState<CarUpgrades>(() => {
    try {
      const saved = localStorage.getItem('knatte_car_upgrades');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      engineLevel: 1,
      suspensionLevel: 1,
      tireLevel: 1,
      paintId: 'default',
    };
  });

  const handleUpgrade = (
    category: 'engine' | 'suspension' | 'tires' | 'paint',
    val: any,
    cost: number
  ) => {
    if (starsEarned < cost) return;
    setStarsEarned((prev) => {
      const next = prev - cost;
      try {
        localStorage.setItem('knatte_stars', String(next));
      } catch {}
      return next;
    });

    setUpgrades((prev) => {
      const next = { ...prev };
      if (category === 'engine') next.engineLevel = val;
      if (category === 'suspension') next.suspensionLevel = val;
      if (category === 'tires') next.tireLevel = val;
      if (category === 'paint') next.paintId = val;
      try {
        localStorage.setItem('knatte_car_upgrades', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Driving Controls State
  const [drivingForward, setDrivingForward] = useState<boolean>(false);
  const [drivingBackward, setDrivingBackward] = useState<boolean>(false);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [hornTrigger, setHornTrigger] = useState<number>(0);

  // Puzzle & Modals State
  const [shapePuzzleOpen, setShapePuzzleOpen] = useState<boolean>(false);
  const [requiredShape, setRequiredShape] = useState<'circle' | 'square' | 'triangle' | 'star'>('triangle');
  const [isShapePuzzleSolved, setIsShapePuzzleSolved] = useState<boolean>(false);

  const [colorPuzzleOpen, setColorPuzzleOpen] = useState<boolean>(false);
  const [requiredColor, setRequiredColor] = useState<'red' | 'blue' | 'yellow' | 'green'>('blue');
  const [isColorPuzzleSolved, setIsColorPuzzleSolved] = useState<boolean>(false);

  const [letterPuzzleOpen, setLetterPuzzleOpen] = useState<boolean>(false);
  const [isLetterPuzzleSolved, setIsLetterPuzzleSolved] = useState<boolean>(false);

  const [additionPuzzleOpen, setAdditionPuzzleOpen] = useState<boolean>(false);
  const [isAdditionPuzzleSolved, setIsAdditionPuzzleSolved] = useState<boolean>(false);

  const [victoryModalOpen, setVictoryModalOpen] = useState<boolean>(false);
  const [diplomaModalOpen, setDiplomaModalOpen] = useState<boolean>(false);

  // Settings State
  const [lang, setLang] = useState<'sv' | 'en'>('sv');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => {
    try {
      const saved = localStorage.getItem('knatte_time_of_day');
      if (saved === 'day' || saved === 'night') return saved;
    } catch {}
    return 'day';
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicOn, setIsMusicOn] = useState<boolean>(() => sounds.isMusicOn());
  const [activeHorn, setActiveHorn] = useState<'horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog'>(() => {
    try {
      const saved = localStorage.getItem('knatte_active_horn');
      if (saved && ['horn', 'quack', 'siren', 'boing', 'cat', 'dog'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'horn';
  });

  const handleToggleTimeOfDay = useCallback(() => {
    sounds.init();
    const next: TimeOfDay = timeOfDay === 'day' ? 'night' : 'day';
    setTimeOfDay(next);
    sounds.playHeadlightSwitch(next === 'night');
    if (next === 'night') {
      sounds.playNightModeVoice(lang);
    } else {
      sounds.playDayModeVoice(lang);
    }
    try {
      localStorage.setItem('knatte_time_of_day', next);
    } catch {}
  }, [timeOfDay, lang]);

  const handleToggleMusic = useCallback(() => {
    const next = sounds.toggleMusic();
    setIsMusicOn(next);
  }, []);

  const handleSelectHorn = useCallback((h: 'horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog') => {
    setActiveHorn(h);
    try {
      localStorage.setItem('knatte_active_horn', h);
    } catch {}
  }, []);

  const handleCycleHorn = useCallback(() => {
    sounds.init();
    const horns: ('horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog')[] = [
      'horn',
      'quack',
      'siren',
      'boing',
      'cat',
      'dog',
    ];
    const currentIndex = horns.indexOf(activeHorn);
    const nextHorn = horns[(currentIndex + 1) % horns.length];
    setActiveHorn(nextHorn);
    sounds.playHorn(nextHorn);
    try {
      localStorage.setItem('knatte_active_horn', nextHorn);
    } catch {}
  }, [activeHorn]);

  // Toddler Kiosk & Fullscreen Mode State
  const [isToddlerLocked, setIsToddlerLocked] = useState<boolean>(false);
  const [unlockTaps, setUnlockTaps] = useState<number>(0);
  const unlockTimerRef = useRef<any>(null);
  const wakeLockSentinelRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockSentinelRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch {}
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockSentinelRef.current) {
        await wakeLockSentinelRef.current.release();
        wakeLockSentinelRef.current = null;
      }
    } catch {}
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }
    } catch {}
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      const doc = document as any;
      if (doc.exitFullscreen && doc.fullscreenElement) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen && doc.webkitFullscreenElement) {
        await doc.webkitExitFullscreen();
      }
    } catch {}
  }, []);

  const handleActivateToddlerLock = useCallback(async () => {
    sounds.init();
    setIsToddlerLocked(true);
    setUnlockTaps(0);
    await enterFullscreen();
    await requestWakeLock();
    sounds.playLockSound(true);
    sounds.playToddlerLockVoice(true, lang);
  }, [enterFullscreen, requestWakeLock, lang]);

  const handleTapUnlock = useCallback(() => {
    sounds.init();
    setUnlockTaps((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
        setIsToddlerLocked(false);
        sounds.playLockSound(false);
        sounds.playToddlerLockVoice(false, lang);
        releaseWakeLock();
        exitFullscreen();
        return 0;
      } else {
        sounds.playLockTumbler(next);
        if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
        unlockTimerRef.current = setTimeout(() => {
          setUnlockTaps(0);
        }, 2500);
        return next;
      }
    });
  }, [lang, releaseWakeLock, exitFullscreen]);

  // Keep screen awake while in toddler kiosk mode on tab refocus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isToddlerLocked) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      releaseWakeLock();
    };
  }, [isToddlerLocked, requestWakeLock, releaseWakeLock]);

  // Add stars helper
  const addStars = useCallback((num: number = 3) => {
    setStarsEarned((prev) => {
      const next = prev + num;
      try {
        localStorage.setItem('knatte_stars', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Item Collected Callback
  const handleItemCollected = useCallback((count: number) => {
    setCollectedCount(count);
  }, []);

  // Goal Reached Callback
  const handleGoalReached = useCallback(() => {
    addStars(3);
    setVictoryModalOpen(true);
  }, [addStars]);

  // Next Level Handler
  const handleNextLevel = () => {
    setVictoryModalOpen(false);
    setCollectedCount(0);
    setIsShapePuzzleSolved(false);
    setIsColorPuzzleSolved(false);
    setIsLetterPuzzleSolved(false);
    setIsAdditionPuzzleSolved(false);

    const currentIndex = LEVELS.findIndex((l) => l.id === currentLevel.id);
    const nextIndex = (currentIndex + 1) % LEVELS.length;
    setCurrentLevel(LEVELS[nextIndex]);
  };

  // Replay Level Handler
  const handleReplay = () => {
    setVictoryModalOpen(false);
    setCollectedCount(0);
    setIsShapePuzzleSolved(false);
    setIsColorPuzzleSolved(false);
    setIsLetterPuzzleSolved(false);
    setIsAdditionPuzzleSolved(false);
    // Trigger reset by re-setting currentLevel object reference
    setCurrentLevel({ ...currentLevel });
  };

  // Switch Level directly from HUD
  const handleSelectLevel = (lvl: LevelConfig) => {
    setCurrentLevel(lvl);
    setCollectedCount(0);
    setIsShapePuzzleSolved(false);
    setIsColorPuzzleSolved(false);
    setIsLetterPuzzleSolved(false);
    setIsAdditionPuzzleSolved(false);
    setVictoryModalOpen(false);
  };

  // Honk Horn
  const triggerHonk = useCallback(() => {
    sounds.init();
    sounds.playHorn(activeHorn);
    setHornTrigger((prev) => prev + 1);
  }, [activeHorn]);

  // Keyboard Event Listeners for Desktop Play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      sounds.init();
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setDrivingForward(true);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setDrivingBackward(true);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        setIsJumping(true);
      } else if (e.key === 'h' || e.key === 'H' || e.key === 'Enter') {
        triggerHonk();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setDrivingForward(false);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setDrivingBackward(false);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        setIsJumping(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerHonk]);

  return (
    <div
      className={`fixed inset-0 w-full h-[100dvh] overflow-hidden bg-slate-900 select-none ${
        isToddlerLocked ? 'touch-none ring-2 ring-inset ring-amber-400/25' : ''
      }`}
      onContextMenu={(e) => {
        if (isToddlerLocked) e.preventDefault();
      }}
    >
      {/* Top HUD (Header, Mission Counter, Vehicle Picker, Levels) */}
      <GameHUD
        currentVehicle={currentVehicle}
        currentLevel={currentLevel}
        collectedCount={collectedCount}
        starsEarned={starsEarned}
        upgrades={upgrades}
        onUpgrade={handleUpgrade}
        onSelectVehicle={(v) => setCurrentVehicle(v)}
        onSelectLevel={handleSelectLevel}
        onOpenDiploma={() => setDiplomaModalOpen(true)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'sv' ? 'en' : 'sv'))}
        timeOfDay={timeOfDay}
        onToggleTimeOfDay={handleToggleTimeOfDay}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          sounds.setMuted(next);
        }}
        isMusicOn={isMusicOn}
        onToggleMusic={handleToggleMusic}
        activeHorn={activeHorn}
        onSelectHorn={handleSelectHorn}
        isToddlerLocked={isToddlerLocked}
        unlockTaps={unlockTaps}
        onTapUnlock={handleTapUnlock}
        onActivateToddlerLock={handleActivateToddlerLock}
      />

      {/* Main 60fps Canvas Simulator */}
      <GameCanvas
        currentVehicle={currentVehicle.id}
        currentLevel={currentLevel}
        upgrades={upgrades}
        timeOfDay={timeOfDay}
        onItemCollected={handleItemCollected}
        onGoalReached={handleGoalReached}
        onRequestShapePuzzle={(shape) => {
          setRequiredShape(shape);
          setShapePuzzleOpen(true);
        }}
        isShapePuzzleSolved={isShapePuzzleSolved}
        onRequestColorPuzzle={(col) => {
          setRequiredColor(col);
          setColorPuzzleOpen(true);
        }}
        isColorPuzzleSolved={isColorPuzzleSolved}
        onRequestLetterPuzzle={() => setLetterPuzzleOpen(true)}
        isLetterPuzzleSolved={isLetterPuzzleSolved}
        onRequestAdditionPuzzle={() => setAdditionPuzzleOpen(true)}
        isAdditionPuzzleSolved={isAdditionPuzzleSolved}
        starsEarned={starsEarned}
        drivingForward={drivingForward}
        drivingBackward={drivingBackward}
        isJumping={isJumping}
        hornTrigger={hornTrigger}
        onAnimalGreeted={handleAnimalGreeted}
        activeHorn={activeHorn}
        lang={lang}
      />

      {/* Big Thumb Touch Controls (Bottom left drive, bottom right jump & honk) */}
      <TouchControls
        vehicle={currentVehicle}
        activeHorn={activeHorn}
        onCycleHorn={handleCycleHorn}
        onDriveForwardStart={() => setDrivingForward(true)}
        onDriveForwardEnd={() => setDrivingForward(false)}
        onDriveBackwardStart={() => setDrivingBackward(true)}
        onDriveBackwardEnd={() => setDrivingBackward(false)}
        onJumpStart={() => setIsJumping(true)}
        onJumpEnd={() => setIsJumping(false)}
        onHonk={triggerHonk}
        lang={lang}
      />

      {/* Interactive Shape Bridge Puzzle Modal */}
      <ShapePuzzleModal
        isOpen={shapePuzzleOpen}
        requiredShape={requiredShape}
        onSolve={() => {
          setIsShapePuzzleSolved(true);
          setShapePuzzleOpen(false);
        }}
        lang={lang}
      />

      {/* Interactive Color Bridge Puzzle Modal */}
      <ColorPuzzleModal
        isOpen={colorPuzzleOpen}
        requiredColor={requiredColor}
        onSolve={() => {
          setIsColorPuzzleSolved(true);
          setColorPuzzleOpen(false);
        }}
        lang={lang}
      />

      {/* Interactive Letter Puzzle Modal */}
      <LetterPuzzleModal
        isOpen={letterPuzzleOpen}
        onSolve={() => {
          setIsLetterPuzzleSolved(true);
          setLetterPuzzleOpen(false);
        }}
        lang={lang}
      />

      {/* Interactive Addition Math Puzzle Modal */}
      <AdditionPuzzleModal
        isOpen={additionPuzzleOpen}
        onSolve={() => {
          setIsAdditionPuzzleSolved(true);
          setAdditionPuzzleOpen(false);
        }}
        lang={lang}
      />

      {/* Level Complete Victory Celebration */}
      <VictoryModal
        isOpen={victoryModalOpen}
        level={currentLevel}
        vehicle={currentVehicle}
        onNextLevel={handleNextLevel}
        onReplay={handleReplay}
        onOpenDiploma={() => {
          setVictoryModalOpen(false);
          setDiplomaModalOpen(true);
        }}
        lang={lang}
      />

      {/* Official Driver License / Diploma */}
      <DiplomaModal
        isOpen={diplomaModalOpen}
        onClose={() => setDiplomaModalOpen(false)}
        starsEarned={starsEarned}
        vehicle={currentVehicle}
        lang={lang}
        greetedAnimals={greetedAnimals}
      />
    </div>
  );
};

export default App;
