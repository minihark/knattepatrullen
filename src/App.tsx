import React, { useState, useEffect, useCallback } from 'react';
import { VehicleConfig, LevelConfig, VehicleType } from './types';
import { VEHICLES, LEVELS } from './data/gameData';
import { GameCanvas } from './components/GameCanvas';
import { TouchControls } from './components/TouchControls';
import { GameHUD } from './components/GameHUD';
import { ShapePuzzleModal } from './components/ShapePuzzleModal';
import { ColorPuzzleModal } from './components/ColorPuzzleModal';
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

  const [victoryModalOpen, setVictoryModalOpen] = useState<boolean>(false);
  const [diplomaModalOpen, setDiplomaModalOpen] = useState<boolean>(false);

  // Settings State
  const [lang, setLang] = useState<'sv' | 'en'>('sv');
  const [isMuted, setIsMuted] = useState<boolean>(false);

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
    // Trigger reset by re-setting currentLevel object reference
    setCurrentLevel({ ...currentLevel });
  };

  // Switch Level directly from HUD
  const handleSelectLevel = (lvl: LevelConfig) => {
    setCurrentLevel(lvl);
    setCollectedCount(0);
    setIsShapePuzzleSolved(false);
    setIsColorPuzzleSolved(false);
    setVictoryModalOpen(false);
  };

  // Honk Horn
  const triggerHonk = useCallback(() => {
    sounds.init();
    setHornTrigger((prev) => prev + 1);
  }, []);

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
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      {/* Top HUD (Header, Mission Counter, Vehicle Picker, Levels) */}
      <GameHUD
        currentVehicle={currentVehicle}
        currentLevel={currentLevel}
        collectedCount={collectedCount}
        starsEarned={starsEarned}
        onSelectVehicle={(v) => setCurrentVehicle(v)}
        onSelectLevel={handleSelectLevel}
        onOpenDiploma={() => setDiplomaModalOpen(true)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'sv' ? 'en' : 'sv'))}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          sounds.setMuted(next);
        }}
      />

      {/* Main 60fps Canvas Simulator */}
      <GameCanvas
        currentVehicle={currentVehicle.id}
        currentLevel={currentLevel}
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
        drivingForward={drivingForward}
        drivingBackward={drivingBackward}
        isJumping={isJumping}
        hornTrigger={hornTrigger}
        lang={lang}
      />

      {/* Big Thumb Touch Controls (Bottom left drive, bottom right jump & honk) */}
      <TouchControls
        vehicle={currentVehicle}
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
      />
    </div>
  );
};

export default App;
