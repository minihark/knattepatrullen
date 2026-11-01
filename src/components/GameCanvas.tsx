import React, { useRef, useEffect } from 'react';
import { VehicleType, LevelConfig, CollectibleItem, Particle, CarUpgrades } from '../types';
import { VEHICLES } from '../data/gameData';
import { sounds } from '../audio/soundEngine';

interface GameCanvasProps {
  currentVehicle: VehicleType;
  currentLevel: LevelConfig;
  upgrades: CarUpgrades;
  onItemCollected: (count: number, itemType: string) => void;
  onGoalReached: () => void;
  onRequestShapePuzzle: (requiredShape: 'circle' | 'square' | 'triangle' | 'star') => void;
  isShapePuzzleSolved: boolean;
  onRequestColorPuzzle: (requiredColor: 'red' | 'blue' | 'yellow' | 'green') => void;
  isColorPuzzleSolved: boolean;
  onRequestLetterPuzzle: () => void;
  isLetterPuzzleSolved: boolean;
  onRequestAdditionPuzzle: () => void;
  isAdditionPuzzleSolved: boolean;
  starsEarned: number;
  drivingForward: boolean;
  drivingBackward: boolean;
  isJumping: boolean;
  hornTrigger: number;
  activeHorn?: 'horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog';
  lang: 'sv' | 'en';
}

interface MushroomProp {
  x: number;
  squash: number;
}

interface CampfireProp {
  x: number;
  extinguished: boolean;
}

interface AnimalProp {
  x: number;
  emoji: string;
  name: string;
  type?: 'cat' | 'dog' | 'cow' | 'sheep' | 'rabbit' | 'squirrel';
  jumpY: number;
  jumpVy: number;
  greeted?: boolean;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentVehicle,
  currentLevel,
  upgrades,
  onItemCollected,
  onGoalReached,
  onRequestShapePuzzle,
  isShapePuzzleSolved,
  onRequestColorPuzzle,
  isColorPuzzleSolved,
  onRequestLetterPuzzle,
  isLetterPuzzleSolved,
  onRequestAdditionPuzzle,
  isAdditionPuzzleSolved,
  starsEarned,
  drivingForward,
  drivingBackward,
  isJumping,
  hornTrigger,
  activeHorn,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game Simulation State
  const stateRef = useRef({
    // Canvas dimensions
    canvasWidth: 800,
    canvasHeight: 500,

    // Car State
    carX: 180,
    carY: 300,
    vx: 0,
    vy: 0,
    angle: 0,
    wheelAngle: 0,
    suspension: 0,
    isGrounded: true,
    lastVy: 0,
    blinkTimer: 0,
    isBlinking: false,

    // Tractor Trailer State
    trailerX: 125,
    trailerY: 300,
    trailerAngle: 0,

    // Camera
    camX: 0,
    camY: 0,

    // Collectibles & Props
    items: [] as CollectibleItem[],
    bonusItems: [] as { id: string; x: number; y: number; collected: boolean }[],
    particles: [] as Particle[],
    goalX: 6600,
    hasReachedGoal: false,
    bridgeX: 3200,
    hasPromptedCheckpoint: false,

    // Interactive Props
    mushrooms: [
      { x: 1650, squash: 0 },
      { x: 4700, squash: 0 },
    ] as MushroomProp[],

    campfires: [
      { x: 2050, extinguished: false },
      { x: 4950, extinguished: false },
    ] as CampfireProp[],

    animals: [
      { x: 950, emoji: '🐱', name: 'Katten Misse', jumpY: 0, jumpVy: 0, type: 'cat', greeted: false },
      { x: 1900, emoji: '🐶', name: 'Hunden Buster', jumpY: 0, jumpVy: 0, type: 'dog', greeted: false },
      { x: 3100, emoji: '🐮', name: 'Klara Ko', jumpY: 0, jumpVy: 0, type: 'cow', greeted: false },
      { x: 4400, emoji: '🐰', name: 'Pelle Kanin', jumpY: 0, jumpVy: 0, type: 'rabbit', greeted: false },
      { x: 5600, emoji: '🐿️', name: 'Nils Ekorre', jumpY: 0, jumpVy: 0, type: 'squirrel', greeted: false },
    ] as AnimalProp[],

    windmillAngle: 0,

    // Floating text juice
    floatingTexts: [] as FloatingText[],
    nextTextId: 1,

    // Speed boost pads
    boostPads: [2400, 5200],
    boostCooldown: 0,

    // Controls state ref
    drivingForward: false,
    drivingBackward: false,
    isJumping: false,
    jumpCooldown: 0,
    hornCooldown: 0,
  });

  // Keep control props synced
  useEffect(() => {
    stateRef.current.drivingForward = drivingForward;
  }, [drivingForward]);

  useEffect(() => {
    stateRef.current.drivingBackward = drivingBackward;
  }, [drivingBackward]);

  useEffect(() => {
    stateRef.current.isJumping = isJumping;
  }, [isJumping]);

  // Handle Horn Trigger
  useEffect(() => {
    if (hornTrigger > 0) {
      const v = VEHICLES.find((v) => v.id === currentVehicle) || VEHICLES[0];
      sounds.playHorn(activeHorn || v.honkSound);

      const state = stateRef.current;

      // Special Ability Trigger on Horn:
      if (v.traits.special === 'water') {
        sounds.playWaterSpray();
        for (let i = 0; i < 16; i++) {
          state.particles.push({
            x: state.carX + 42,
            y: state.carY - 28,
            vx: 6 + Math.random() * 8,
            vy: -4 - Math.random() * 5,
            size: 6 + Math.random() * 6,
            color: '#38BDF8',
            alpha: 0.9,
            life: 0,
            maxLife: 35,
            shape: 'water',
          });
        }
      } else if (v.traits.special === 'nitro') {
        sounds.playTurbo();
        state.vx = Math.min(state.vx + 4.5, 12);
        for (let i = 0; i < 14; i++) {
          state.particles.push({
            x: state.carX - 35,
            y: state.carY + 4,
            vx: -5 - Math.random() * 6,
            vy: (Math.random() - 0.5) * 4,
            size: 10 + Math.random() * 8,
            color: ['#F97316', '#EF4444', '#FBBF24', '#3B82F6'][i % 4],
            alpha: 1,
            life: 0,
            maxLife: 30,
            shape: 'flame',
          });
        }
      }

      // Spawn musical note and heart particles
      for (let i = 0; i < 6; i++) {
        state.particles.push({
          x: state.carX + 40,
          y: state.carY - 30,
          vx: 2 + Math.random() * 4,
          vy: -3 - Math.random() * 4,
          size: 18 + Math.random() * 8,
          color: ['#F59E0B', '#EF4444', '#EC4899', '#3B82F6', '#10B981'][i % 5],
          alpha: 1,
          life: 0,
          maxLife: 45,
          shape: i % 2 === 0 ? 'note' : 'heart',
        });
      }

      // Animals jump!
      state.animals.forEach((animal) => {
        if (Math.abs(state.carX - animal.x) < 450) {
          animal.jumpVy = -7;
          state.particles.push({
            x: animal.x,
            y: getGroundY(animal.x, state.canvasHeight) - 75,
            vx: (Math.random() - 0.5) * 3,
            vy: -3,
            size: 20,
            color: '#EC4899',
            alpha: 1,
            life: 0,
            maxLife: 35,
            shape: 'heart',
          });
        }
      });
    }
  }, [hornTrigger, currentVehicle, activeHorn]);

  // Check if current checkpoint is solved
  const isCurrentCheckpointSolved = (): boolean => {
    if (currentLevel.id === 'shapes') return isShapePuzzleSolved;
    if (currentLevel.id === 'letters') return isLetterPuzzleSolved;
    if (currentLevel.id === 'math') return isAdditionPuzzleSolved;
    if (currentLevel.id === 'colors') return isColorPuzzleSolved;
    if (starsEarned >= 6) {
      return isAdditionPuzzleSolved || isLetterPuzzleSolved;
    }
    return true;
  };

  // Responsive Dynamic Terrain Height Function
  const getGroundY = (x: number, viewH: number): number => {
    const baseGround = Math.max(220, viewH * 0.62);

    if (x < 350) return baseGround;

    const hill1 = Math.sin(x * 0.0022) * 55;
    const hill2 = Math.sin(x * 0.0055) * 32;
    const hill3 = Math.cos(x * 0.0011) * 26;

    let base = baseGround + hill1 + hill2 + hill3;

    const hasCheckpoint =
      currentLevel.id === 'shapes' ||
      currentLevel.id === 'letters' ||
      currentLevel.id === 'math' ||
      currentLevel.id === 'colors' ||
      starsEarned >= 6;

    if (hasCheckpoint) {
      const bridgeStart = 3100;
      const bridgeEnd = 3500;
      if (x > bridgeStart && x < bridgeEnd) {
        if (!isCurrentCheckpointSolved()) {
          return baseGround + 320;
        }
        return baseGround + 8;
      }
    }

    if (x > 6450) return baseGround + 15;

    return base;
  };

  // Reset or initialize Level State
  useEffect(() => {
    const state = stateRef.current;
    state.carX = 160;
    state.carY = 260;
    state.trailerX = 110;
    state.trailerY = 260;
    state.vx = 0;
    state.vy = 0;
    state.angle = 0;
    state.hasReachedGoal = false;
    state.hasPromptedCheckpoint = false;
    state.particles = [];
    state.floatingTexts = [];
    state.boostCooldown = 0;

    state.goalX = 6600;

    // Reset campfires
    state.campfires = [
      { x: 2050, extinguished: false },
      { x: 4950, extinguished: false },
    ];

    // Start tactile engine rumble & playful background music
    sounds.startEngine(currentVehicle);
    sounds.startMusic();

    // Generate main mission collectibles along the expanded track
    const items: CollectibleItem[] = [];
    const mainPositions = [950, 2200, 3750, 5100, 6150];

    for (let i = 0; i < currentLevel.goalCount; i++) {
      const x = mainPositions[i] || 1000 + i * 1100;
      const y = getGroundY(x, state.canvasHeight || 500) - 75;
      items.push({
        id: `item-${i + 1}`,
        x,
        y,
        collected: false,
        type: currentLevel.itemType,
        val: i + 1,
        color: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#A855F7'][i % 5],
        pulsePhase: i * 0.8,
      });
    }
    state.items = items;

    // Generate mini bonus sparkle stars along hilltops
    const bonusPositions = [
      600, 700, 800, 1450, 1550, 1750, 2750, 2850, 2950, 4350, 4450, 4550, 5650, 5750, 5850,
    ];
    state.bonusItems = bonusPositions.map((bx, idx) => ({
      id: `bonus-${idx}`,
      x: bx,
      y: getGroundY(bx, state.canvasHeight || 500) - 70,
      collected: false,
    }));

    // Speak introductory mission greeting with human voice clip
    const introSpeech =
      lang === 'sv'
        ? `${currentLevel.titleSv}! ${currentLevel.missionDescriptionSv}`
        : `${currentLevel.titleEn}! ${currentLevel.missionDescriptionEn}`;
    setTimeout(() => {
      sounds.playVoiceClip(`level_${currentLevel.id}`, introSpeech, lang);
    }, 400);

    return () => {
      sounds.stopEngine();
      sounds.stopMusic();
    };
  }, [currentLevel.id, currentVehicle, lang]);

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      stateRef.current.canvasWidth = rect.width;
      stateRef.current.canvasHeight = rect.height;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const vehicleConfig =
      VEHICLES.find((v) => v.id === currentVehicle) || VEHICLES[0];

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const state = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const viewW = rect.width;
      const viewH = rect.height;
      state.canvasWidth = viewW;
      state.canvasHeight = viewH;

      // 1. Calculate Vehicle Physics & Upgrades
      const speedMultiplier = 1 + (upgrades.engineLevel - 1) * 0.18;
      const maxSpeed = vehicleConfig.traits.maxSpeed * speedMultiplier;
      const accel = vehicleConfig.traits.accel * (1 + (upgrades.engineLevel - 1) * 0.12);
      const gravity = vehicleConfig.traits.gravity;
      const jumpPower = vehicleConfig.traits.jumpPower * (1 + (upgrades.suspensionLevel - 1) * 0.22);
      const friction = 0.94;

      // Update engine audio frequency
      const speedRatio = Math.abs(state.vx) / maxSpeed;
      sounds.updateEngine(speedRatio, state.drivingForward || state.drivingBackward);

      if (state.drivingForward && !state.hasReachedGoal) {
        state.vx += accel * dt;
        if (state.vx > maxSpeed) state.vx = maxSpeed;
        state.wheelAngle += state.vx * 0.12;

        // Exhaust smoke or nitro flames
        if (upgrades.engineLevel >= 2 && Math.random() < 0.4) {
          state.particles.push({
            x: state.carX - 34,
            y: state.carY + 8,
            vx: -3 - Math.random() * 3,
            vy: (Math.random() - 0.5) * 2,
            size: upgrades.engineLevel >= 3 ? 12 : 8,
            color: upgrades.engineLevel >= 3 ? '#F97316' : '#E2E8F0',
            alpha: 0.9,
            life: 0,
            maxLife: 26,
            shape: upgrades.engineLevel >= 3 ? 'flame' : 'smoke',
          });
        }
      } else if (state.drivingBackward && !state.hasReachedGoal) {
        state.vx -= accel * 0.8 * dt;
        if (state.vx < -maxSpeed * 0.6) state.vx = -maxSpeed * 0.6;
        state.wheelAngle += state.vx * 0.12;
      } else {
        state.vx *= friction;
      }

      // Moon Rover Hover Thrusters
      if (vehicleConfig.traits.special === 'hover' && (state.isJumping || (!state.isGrounded && state.drivingForward))) {
        state.vy -= 16.0 * dt; // Anti-gravity thrust
        if (Math.random() < 0.5) {
          state.particles.push({
            x: state.carX - 10 + (Math.random() - 0.5) * 20,
            y: state.carY + 18,
            vx: (Math.random() - 0.5) * 2,
            vy: 4 + Math.random() * 3,
            size: 8,
            color: '#06B6D4',
            alpha: 0.9,
            life: 0,
            maxLife: 22,
            shape: 'flame',
          });
        }
      }

      // Jump
      if (state.jumpCooldown > 0) state.jumpCooldown -= dt;
      if (state.isJumping && state.isGrounded && state.jumpCooldown <= 0) {
        state.vy = -jumpPower;
        state.isGrounded = false;
        state.jumpCooldown = 0.35;
        state.suspension = -10;
        sounds.playJump(jumpPower / 12);

        for (let i = 0; i < 6; i++) {
          state.particles.push({
            x: state.carX,
            y: state.carY + 20,
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * 2 + 1,
            size: 6,
            color: '#FDE047',
            alpha: 0.9,
            life: 0,
            maxLife: 20,
            shape: 'star',
          });
        }
      }

      // Gravity
      state.vy += gravity * dt;
      state.lastVy = state.vy;

      // Checkpoint Obstacle Check
      const isSolved = isCurrentCheckpointSolved();
      if (!isSolved && state.carX >= 3060 && state.carX <= 3130) {
        state.vx = 0;
        if (!state.hasPromptedCheckpoint) {
          state.hasPromptedCheckpoint = true;
          if (currentLevel.id === 'shapes') {
            onRequestShapePuzzle('triangle');
          } else if (currentLevel.id === 'letters') {
            onRequestLetterPuzzle();
          } else if (currentLevel.id === 'math') {
            onRequestAdditionPuzzle();
          } else if (currentLevel.id === 'colors') {
            onRequestColorPuzzle('blue');
          } else if (starsEarned >= 6) {
            if (starsEarned % 2 === 0) {
              onRequestAdditionPuzzle();
            } else {
              onRequestLetterPuzzle();
            }
          }
        }
      }

      // Update position
      state.carX += state.vx;
      state.carY += state.vy;

      if (state.carX < 80) {
        state.carX = 80;
        state.vx = 0;
      }

      // Ground Collision & Hill Angle
      const groundY = getGroundY(state.carX, viewH);
      const groundYAhead = getGroundY(state.carX + 24, viewH);
      const groundYBehind = getGroundY(state.carX - 24, viewH);

      const targetAngle = Math.atan2(groundYAhead - groundYBehind, 48);

      if (state.carY >= groundY - 26) {
        // Deep landing impact sound
        if (!state.isGrounded && state.lastVy > 6.0) {
          sounds.playLand(state.lastVy / 12);
        }

        state.carY = groundY - 26;
        state.vy = 0;
        state.isGrounded = true;

        state.angle += (targetAngle - state.angle) * 0.25;
        state.suspension *= 0.8;
      } else {
        state.isGrounded = false;
        state.angle += (0 - state.angle) * 0.05;
      }

      // Update Tractor Trailer Physics
      if (vehicleConfig.traits.special === 'trailer') {
        const targetTrailerX = state.carX - 52 * Math.cos(state.angle);
        const targetTrailerY = getGroundY(targetTrailerX, viewH) - 20;
        state.trailerX += (targetTrailerX - state.trailerX) * 0.22;
        state.trailerY += (targetTrailerY - state.trailerY) * 0.25;
        state.trailerAngle = state.angle * 0.85;
      }

      // Check Speed Boost Pads
      if (state.boostCooldown > 0) state.boostCooldown -= dt;
      state.boostPads.forEach((bx) => {
        if (Math.abs(state.carX - bx) < 48 && state.isGrounded && state.boostCooldown <= 0) {
          state.vx = Math.min(state.vx + 6.2, 14.5);
          state.boostCooldown = 0.8;
          sounds.playTurbo();
          state.floatingTexts.push({
            id: state.nextTextId++,
            text: 'TURBO! ⚡',
            x: bx,
            y: getGroundY(bx, viewH) - 45,
            vy: -2.8,
            alpha: 1,
            color: '#FBBF24',
            size: 26,
          });
          for (let p = 0; p < 14; p++) {
            state.particles.push({
              x: bx + (Math.random() - 0.5) * 30,
              y: getGroundY(bx, viewH) - 10,
              vx: -7 - Math.random() * 6,
              vy: (Math.random() - 0.5) * 3,
              size: 8 + Math.random() * 6,
              color: ['#F59E0B', '#EF4444', '#38BDF8', '#FDE047'][p % 4],
              alpha: 1,
              life: 0,
              maxLife: 24,
              shape: 'flame',
            });
          }
        }
      });

      // Check Extinguishing Campfires with Fire Truck
      state.campfires.forEach((fire) => {
        if (!fire.extinguished) {
          // Check collision with water particles or driving close with fire truck
          const dist = Math.abs(state.carX - fire.x);
          const hasWaterStream = state.particles.some(
            (p) => p.shape === 'water' && Math.abs(p.x - fire.x) < 40
          );

          if (dist < 80 && (hasWaterStream || (vehicleConfig.id === 'fire' && state.drivingForward))) {
            fire.extinguished = true;
            sounds.playSnap();
            state.floatingTexts.push({
              id: state.nextTextId++,
              text: 'SLÄCKT! 💦',
              x: fire.x,
              y: getGroundY(fire.x, viewH) - 40,
              vy: -2.4,
              alpha: 1,
              color: '#38BDF8',
              size: 24,
            });

            // Steam cloud puff
            for (let s = 0; s < 12; s++) {
              state.particles.push({
                x: fire.x + (Math.random() - 0.5) * 20,
                y: getGroundY(fire.x, viewH) - 25,
                vx: (Math.random() - 0.5) * 3,
                vy: -3 - Math.random() * 3,
                size: 14 + Math.random() * 8,
                color: '#CBD5E1',
                alpha: 0.8,
                life: 0,
                maxLife: 30,
                shape: 'smoke',
              });
            }
          }
        }
      });

      // Bouncy Mushroom Collision
      state.mushrooms.forEach((m) => {
        if (m.squash > 0) m.squash = Math.max(0, m.squash - dt * 3);
        if (Math.abs(state.carX - m.x) < 38 && state.carY >= groundY - 32) {
          m.squash = 1;
          state.vy = -17.5 * (1 + (upgrades.suspensionLevel - 1) * 0.15);
          state.isGrounded = false;
          sounds.playJump(1.4);
          state.floatingTexts.push({
            id: state.nextTextId++,
            text: 'SUPER-HOPP! 🦘',
            x: m.x,
            y: groundY - 50,
            vy: -2.8,
            alpha: 1,
            color: '#38BDF8',
            size: 24,
          });
          if (Math.random() < 0.6) {
            sounds.playVoiceClip('superhopp', 'Super-hopp!', lang);
          }

          for (let p = 0; p < 10; p++) {
            state.particles.push({
              x: m.x,
              y: groundY - 20,
              vx: (Math.random() - 0.5) * 7,
              vy: -Math.random() * 6 - 2,
              size: 9,
              color: ['#EF4444', '#FBBF24', '#3B82F6', '#10B981'][p % 4],
              alpha: 1,
              life: 0,
              maxLife: 28,
              shape: 'star',
            });
          }
        }
      });

      // Update Animals jumping physics & roadside greetings
      state.animals.forEach((animal) => {
        if (animal.jumpY < 0 || animal.jumpVy < 0) {
          animal.jumpVy += 20 * dt;
          animal.jumpY += animal.jumpVy;
          if (animal.jumpY >= 0) {
            animal.jumpY = 0;
            animal.jumpVy = 0;
          }
        }

        // Friendly roadside greeting when car drives close
        const dist = Math.abs(state.carX - animal.x);
        if (dist < 110 && !animal.greeted) {
          animal.greeted = true;
          animal.jumpVy = -8.5;

          for (let p = 0; p < 3; p++) {
            state.particles.push({
              x: animal.x + (Math.random() - 0.5) * 20,
              y: getGroundY(animal.x, state.canvasHeight) - 80,
              vx: (Math.random() - 0.5) * 2,
              vy: -3 - Math.random() * 2,
              size: 18,
              color: animal.type === 'cat' ? '#FB923C' : '#F59E0B',
              alpha: 1,
              life: 0,
              maxLife: 40,
              shape: p === 0 ? 'heart' : 'note',
            });
          }

          if (animal.type === 'cat') {
            sounds.playAnimalVoice('cat', lang);
          } else if (animal.type === 'dog') {
            sounds.playAnimalVoice('dog', lang);
          }
        }
      });

      state.windmillAngle += dt * 1.2;

      // Blink animation
      state.blinkTimer += dt;
      if (state.blinkTimer > 3.2) {
        state.isBlinking = true;
        if (state.blinkTimer > 3.4) {
          state.isBlinking = false;
          state.blinkTimer = 0;
        }
      }

      // Collectibles detection (Main Mission items)
      state.items.forEach((item) => {
        if (!item.collected) {
          const dx = state.carX - item.x;
          const dy = state.carY - item.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 54) {
            item.collected = true;
            const totalCollected = state.items.filter((i) => i.collected).length;
            sounds.playCollect(totalCollected);

            const countSwedish = ['Ett!', 'Två!', 'Tre!', 'Fyra!', 'Fem!'];
            const countEnglish = ['One!', 'Two!', 'Three!', 'Four!', 'Five!'];
            const countWord =
              lang === 'sv'
                ? countSwedish[totalCollected - 1] || `${totalCollected}!`
                : countEnglish[totalCollected - 1] || `${totalCollected}!`;

            sounds.playVoiceClip(`count_${totalCollected}`, countWord, lang);
            onItemCollected(totalCollected, currentLevel.itemType);

            const itemEmoji =
              item.type === 'apple'
                ? '🍎'
                : item.type === 'letter'
                ? '🔤'
                : item.type === 'number'
                ? '🔢'
                : item.type === 'shapeKey'
                ? '🔺'
                : item.type === 'colorOrb'
                ? '🎨'
                : '⭐';
            state.floatingTexts.push({
              id: state.nextTextId++,
              text: `+1 ${itemEmoji}`,
              x: item.x,
              y: item.y - 25,
              vy: -2.6,
              alpha: 1,
              color: '#10B981',
              size: 26,
            });

            for (let p = 0; p < 14; p++) {
              state.particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 7 - 2,
                size: 9 + Math.random() * 6,
                color: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899'][p % 5],
                alpha: 1,
                life: 0,
                maxLife: 35,
                shape: 'star',
              });
            }
          }
        }
      });

      // Mini Bonus Stars detection
      state.bonusItems.forEach((b) => {
        if (!b.collected) {
          const dx = state.carX - b.x;
          const dy = state.carY - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 44) {
            b.collected = true;
            sounds.playSnap();

            for (let p = 0; p < 6; p++) {
              state.particles.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 5,
                vy: -Math.random() * 4 - 1,
                size: 6,
                color: '#FDE047',
                alpha: 1,
                life: 0,
                maxLife: 22,
                shape: 'star',
              });
            }
          }
        }
      });

      // Goal Reach Check
      if (!state.hasReachedGoal && state.carX >= state.goalX - 60) {
        state.hasReachedGoal = true;
        sounds.playVictory();
        const cheers =
          lang === 'sv'
            ? 'Hurra! Du klarade banan! Bra kört!'
            : 'Hooray! You did it! Great driving!';
        sounds.playVoiceClip('cheer', cheers, lang);
        state.floatingTexts.push({
          id: state.nextTextId++,
          text: 'HURRA! 🏆',
          x: state.goalX,
          y: getGroundY(state.goalX, viewH) - 80,
          vy: -2.8,
          alpha: 1,
          color: '#F59E0B',
          size: 32,
        });
        onGoalReached();
      }

      // Update Floating Texts Physics
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y += ft.vy;
        ft.vy *= 0.95;
        ft.alpha -= dt * 0.85;
        if (ft.alpha <= 0) {
          state.floatingTexts.splice(i, 1);
        }
      }

      // Smooth Camera tracking
      const targetCamX = state.carX - viewW * 0.32;
      state.camX += (targetCamX - state.camX) * 0.08;
      if (state.camX < 0) state.camX = 0;

      const targetCamY = state.carY - viewH * 0.52;
      state.camY += (targetCamY - state.camY) * 0.06;
      if (state.camY < -60) state.camY = -60;
      if (state.camY > 100) state.camY = 100;

      // ----------------------------------------------------
      // RENDERING CANVAS
      // ----------------------------------------------------
      ctx.clearRect(0, 0, viewW, viewH);

      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
      skyGrad.addColorStop(0, currentLevel.theme.skyTop);
      skyGrad.addColorStop(1, currentLevel.theme.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, viewW, viewH);

      // Warm Sun Rays
      ctx.save();
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(viewW - 90, 80, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      // Fluffy Clouds
      const cloudOffset = state.camX * 0.16;
      [
        { x: 100, y: 70, s: 0.9 },
        { x: 500, y: 110, s: 1.2 },
        { x: 1000, y: 80, s: 0.8 },
        { x: 1550, y: 65, s: 1.1 },
        { x: 2100, y: 95, s: 0.85 },
        { x: 2700, y: 75, s: 1.0 },
        { x: 3300, y: 105, s: 1.15 },
        { x: 3900, y: 70, s: 0.9 },
        { x: 4500, y: 115, s: 1.1 },
        { x: 5200, y: 85, s: 0.8 },
        { x: 5900, y: 95, s: 1.0 },
        { x: 6500, y: 75, s: 1.2 },
      ].forEach((c) => {
        const renderX = c.x - cloudOffset;
        if (renderX > -150 && renderX < viewW + 150) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
          ctx.beginPath();
          ctx.arc(renderX, c.y, 28 * c.s, 0, Math.PI * 2);
          ctx.arc(renderX + 22 * c.s, c.y - 10 * c.s, 24 * c.s, 0, Math.PI * 2);
          ctx.arc(renderX + 44 * c.s, c.y, 26 * c.s, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // 1. Distant Snow-Capped Mountain Range (Slow Parallax: 0.07x)
      ctx.save();
      ctx.translate(-state.camX * 0.07, -state.camY * 0.05);
      const mtnBaseY = viewH * 0.65;
      const peaks = [
        { x: -100, w: 320, h: 140 },
        { x: 200, w: 420, h: 180 },
        { x: 580, w: 360, h: 150 },
        { x: 900, w: 480, h: 200 },
        { x: 1350, w: 380, h: 160 },
        { x: 1700, w: 440, h: 190 },
        { x: 2100, w: 360, h: 155 },
        { x: 2420, w: 460, h: 205 },
        { x: 2850, w: 400, h: 170 },
        { x: 3220, w: 480, h: 210 },
        { x: 3680, w: 390, h: 165 },
        { x: 4050, w: 460, h: 195 },
        { x: 4480, w: 420, h: 175 },
        { x: 4880, w: 490, h: 215 },
        { x: 5350, w: 410, h: 170 },
        { x: 5720, w: 470, h: 200 },
        { x: 6150, w: 430, h: 180 },
        { x: 6550, w: 480, h: 210 },
      ];
      peaks.forEach((p) => {
        const peakX = p.x + p.w / 2;
        const peakY = mtnBaseY - p.h;
        // Mountain base
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.moveTo(p.x, mtnBaseY);
        ctx.lineTo(peakX, peakY);
        ctx.lineTo(p.x + p.w, mtnBaseY);
        ctx.closePath();
        ctx.fill();

        // Snow Cap
        const snowH = p.h * 0.32;
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.moveTo(peakX, peakY);
        ctx.lineTo(peakX + p.w * 0.16, peakY + snowH);
        ctx.lineTo(peakX + p.w * 0.05, peakY + snowH * 0.85);
        ctx.lineTo(peakX - p.w * 0.04, peakY + snowH * 1.1);
        ctx.lineTo(peakX - p.w * 0.16, peakY + snowH);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();

      // 2. Midground Rolling Pine Forest & Swedish Red Cottages (0.22x Parallax)
      ctx.save();
      ctx.translate(-state.camX * 0.22, -state.camY * 0.12);
      ctx.fillStyle = '#86EFAC';
      ctx.beginPath();
      ctx.moveTo(-200, viewH + 200);
      for (let x = -200; x < 7500; x += 60) {
        const y = viewH * 0.58 + Math.sin(x * 0.002) * 35 + Math.cos(x * 0.005) * 18;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(7500, viewH + 200);
      ctx.fill();

      // Swedish Red Cottages (Falu rödfärg stugor)
      const cottages = [350, 1250, 2150, 3050, 3950, 4850, 5750, 6550];
      cottages.forEach((cx) => {
        const cy = viewH * 0.58 + Math.sin(cx * 0.002) * 35 + Math.cos(cx * 0.005) * 18;
        // Red wooden cottage body
        ctx.fillStyle = '#B91C1C';
        ctx.fillRect(cx - 18, cy - 24, 36, 24);

        // White corner trims
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 18, cy - 24, 3, 24);
        ctx.fillRect(cx + 15, cy - 24, 3, 24);

        // Window with 4 panes
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(cx - 6, cy - 16, 12, 10);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 1, cy - 16, 2, 10);
        ctx.fillRect(cx - 6, cy - 12, 12, 2);

        // Chimney & gentle smoke puff
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx + 6, cy - 36, 5, 12);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(cx + 8, cy - 40, 4, 0, Math.PI * 2);
        ctx.arc(cx + 12, cy - 46, 5, 0, Math.PI * 2);
        ctx.fill();

        // Dark slate pitched roof
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.moveTo(cx - 22, cy - 24);
        ctx.lineTo(cx, cy - 38);
        ctx.lineTo(cx + 22, cy - 24);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Stylized Nordic Pine Trees around the cottage
        [-30, 30].forEach((txOffset) => {
          const tx = cx + txOffset;
          const ty = cy;
          // Pine trunk
          ctx.fillStyle = '#78350F';
          ctx.fillRect(tx - 2, ty - 10, 4, 10);
          // 3 triangular pine needle tiers
          ctx.fillStyle = '#15803D';
          for (let tier = 0; tier < 3; tier++) {
            ctx.beginPath();
            const tierY = ty - 10 - tier * 8;
            const tierW = 13 - tier * 3;
            ctx.moveTo(tx - tierW, tierY);
            ctx.lineTo(tx, tierY - 12);
            ctx.lineTo(tx + tierW, tierY);
            ctx.closePath();
            ctx.fill();
          }
        });
      });
      ctx.restore();

      // 3. Near Rolling Hills (0.4x Parallax)
      ctx.save();
      ctx.translate(-state.camX * 0.4, -state.camY * 0.2);
      ctx.fillStyle = '#4ADE80';
      ctx.beginPath();
      ctx.moveTo(-200, viewH + 200);
      for (let x = -200; x < 7500; x += 70) {
        const y = viewH * 0.63 + Math.sin(x * 0.0035) * 28 + Math.cos(x * 0.002) * 16;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(7500, viewH + 200);
      ctx.fill();
      ctx.restore();

      // ----------------------------------------------------
      // MAIN WORLD
      // ----------------------------------------------------
      ctx.save();
      ctx.translate(-state.camX, -state.camY);

      // Deep Ground Fill
      ctx.beginPath();
      const startX = Math.max(0, state.camX - 60);
      const endX = Math.min(7400, state.camX + viewW + 120);
      const deepBottom = viewH + 500;

      ctx.moveTo(startX, deepBottom);
      for (let x = startX; x <= endX; x += 15) {
        ctx.lineTo(x, getGroundY(x, viewH));
      }
      ctx.lineTo(endX, deepBottom);
      ctx.closePath();

      ctx.fillStyle = currentLevel.theme.grassFill;
      ctx.fill();

      // Subsurface earthy strata band
      ctx.save();
      ctx.fillStyle = currentLevel.theme.groundFill || '#78350F';
      ctx.beginPath();
      ctx.moveTo(startX, deepBottom);
      for (let x = startX; x <= endX; x += 15) {
        ctx.lineTo(x, getGroundY(x, viewH) + 38);
      }
      ctx.lineTo(endX, deepBottom);
      ctx.closePath();
      ctx.fill();

      // Embedded subsurface pebbles
      ctx.fillStyle = '#94A3B8';
      for (let px = startX + 50; px < endX; px += 160) {
        const py = getGroundY(px, viewH) + 22;
        ctx.beginPath();
        ctx.ellipse(px, py, 6, 3.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Grass Rim Outline with Tactile Blades
      ctx.beginPath();
      for (let x = startX; x <= endX; x += 15) {
        if (x === startX) {
          ctx.moveTo(x, getGroundY(x, viewH));
        } else {
          ctx.lineTo(x, getGroundY(x, viewH));
        }
      }
      ctx.strokeStyle = currentLevel.theme.grassOutline;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Speed Boost Pads on Slopes
      state.boostPads.forEach((bx) => {
        const by = getGroundY(bx, viewH);
        ctx.save();
        ctx.translate(bx, by);
        // Yellow chevron speed strip
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.roundRect(-36, -6, 72, 8, 4);
        ctx.fill();
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡ ❯❯❯ ⚡', 0, -2);
        ctx.restore();
      });

      // Wooden Fence at start
      for (let fx = 120; fx < 360; fx += 40) {
        const fy = getGroundY(fx, viewH);
        ctx.fillStyle = '#92400E';
        ctx.fillRect(fx - 4, fy - 32, 8, 32);
        ctx.fillRect(fx - 20, fy - 22, 40, 5);
        ctx.fillRect(fx - 20, fy - 12, 40, 5);
      }

      // Draw Checkpoint Bridge
      const bridgeX = 3100;
      const bridgeW = 400;
      const bridgeY = getGroundY(3100, viewH) + 8;
      const solved = isCurrentCheckpointSolved();

      if (solved) {
        ctx.fillStyle = '#92400E';
        ctx.fillRect(bridgeX, bridgeY - 14, bridgeW, 20);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 4;
        ctx.strokeRect(bridgeX, bridgeY - 14, bridgeW, 20);

        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(bridgeX, bridgeY - 45);
        ctx.quadraticCurveTo(bridgeX + bridgeW / 2, bridgeY - 10, bridgeX + bridgeW, bridgeY - 45);
        ctx.stroke();

        ['🚩', '⭐', '🎈'].forEach((icon, idx) => {
          ctx.font = '24px sans-serif';
          ctx.fillText(icon, bridgeX + 70 + idx * 120, bridgeY - 45);
        });
      } else {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 22px Fredoka, sans-serif';
        ctx.textAlign = 'center';

        const label =
          currentLevel.id === 'letters'
            ? '🔤 Hitta bokstaven här!'
            : currentLevel.id === 'math'
            ? '➕ Lös plus-talet här!'
            : currentLevel.id === 'shapes'
            ? '🔺 Laga bron här!'
            : '⭐ Lås upp banan här!';

        ctx.fillText(label, bridgeX + bridgeW / 2, bridgeY + 60);

        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bridgeX + bridgeW / 2, bridgeY - 20);
        ctx.lineTo(bridgeX + bridgeW / 2 - 25, bridgeY + 25);
        ctx.lineTo(bridgeX + bridgeW / 2 + 25, bridgeY + 25);
        ctx.closePath();
        ctx.stroke();
      }

      // Draw Campfires (Obstacle that Firetruck puts out)
      state.campfires.forEach((fire) => {
        const fy = getGroundY(fire.x, viewH);
        ctx.save();
        ctx.translate(fire.x, fy);

        if (!fire.extinguished) {
          // Campfire logs
          ctx.fillStyle = '#78350F';
          ctx.fillRect(-14, -6, 28, 6);

          // Glowing flickering flames
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔥', 0, -2);
        } else {
          // Extinguished damp wood
          ctx.fillStyle = '#475569';
          ctx.fillRect(-14, -4, 28, 4);
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💨 Släckt!', 0, -14);
        }
        ctx.restore();
      });

      // Bouncy Mushrooms
      state.mushrooms.forEach((m) => {
        const my = getGroundY(m.x, viewH);
        ctx.save();
        ctx.translate(m.x, my);
        ctx.scale(1, 1 - m.squash * 0.45);

        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.roundRect(-10, -22, 20, 22, 4);
        ctx.fill();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(0, -22, 24, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#991B1B';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-11, -28, 4, 0, Math.PI * 2);
        ctx.arc(0, -34, 5, 0, Math.PI * 2);
        ctx.arc(11, -28, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Windmill
      const wmX = 4250;
      const wmY = getGroundY(wmX, viewH);
      ctx.save();
      ctx.translate(wmX, wmY);

      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(24, 0);
      ctx.lineTo(16, -110);
      ctx.lineTo(-16, -110);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(-20, -110);
      ctx.lineTo(20, -110);
      ctx.lineTo(0, -135);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(0, -95);
      ctx.rotate(state.windmillAngle);
      for (let b = 0; b < 4; b++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 2;
        ctx.fillRect(-4, -60, 8, 60);
        ctx.strokeRect(-4, -60, 8, 60);
      }
      ctx.restore();
      ctx.restore();

      // Animals
      state.animals.forEach((animal) => {
        const ay = getGroundY(animal.x, viewH);
        ctx.save();
        ctx.translate(animal.x, ay - 32 + animal.jumpY);
        ctx.font = '52px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(animal.emoji, 0, 0);
        ctx.restore();
      });

      // Mini Bonus Stars
      state.bonusItems.forEach((b) => {
        if (!b.collected) {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#EAB308';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      });

      // Main Collectibles
      state.items.forEach((item) => {
        if (!item.collected) {
          item.pulsePhase += dt * 3;
          const floatY = item.y + Math.sin(item.pulsePhase) * 6;

          ctx.save();
          ctx.translate(item.x, floatY);

          if (item.type === 'apple') {
            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.arc(-8, 0, 16, 0, Math.PI * 2);
            ctx.arc(8, 0, 16, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#15803D';
            ctx.beginPath();
            ctx.ellipse(4, -18, 9, 5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#78350F';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(0, -20);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(-6, -6, 5, 0, Math.PI * 2);
            ctx.fill();
          } else if (item.type === 'letter') {
            const letters = ['A', 'B', 'C', 'D', 'E'];
            const char = letters[item.val ? Number(item.val) - 1 : 0] || 'A';

            ctx.fillStyle = '#FEF3C7';
            ctx.beginPath();
            ctx.roundRect(-18, -18, 36, 36, 8);
            ctx.fill();
            ctx.strokeStyle = '#D97706';
            ctx.lineWidth = 3.5;
            ctx.stroke();

            ctx.fillStyle = '#92400E';
            ctx.font = 'bold 24px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(char, 0, 2);
          } else if (item.type === 'number') {
            const numChar = String(item.val || 1);

            ctx.fillStyle = '#E0E7FF';
            ctx.beginPath();
            ctx.roundRect(-18, -18, 36, 36, 8);
            ctx.fill();
            ctx.strokeStyle = '#4F46E5';
            ctx.lineWidth = 3.5;
            ctx.stroke();

            ctx.fillStyle = '#312E81';
            ctx.font = 'bold 24px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(numChar, 0, 2);
          } else if (item.type === 'shapeKey') {
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FEF08A';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔺', 0, 0);
          } else if (item.type === 'colorOrb') {
            ctx.fillStyle = item.color || '#3B82F6';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 4;
            ctx.stroke();
          } else {
            ctx.fillStyle = '#FBBF24';
            ctx.beginPath();
            for (let s = 0; s < 5; s++) {
              const r1 = 22;
              const r2 = 10;
              const a = (s * Math.PI) / 2.5 - Math.PI / 2;
              const aMid = a + Math.PI / 5;
              if (s === 0) {
                ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
              } else {
                ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
              }
              ctx.lineTo(Math.cos(aMid) * r2, Math.sin(aMid) * r2);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }

          ctx.restore();
        }
      });

      // Goal Friend
      const goalY = getGroundY(state.goalX, viewH);
      ctx.save();
      ctx.translate(state.goalX, goalY - 45);

      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(-8, -100, 10, 100);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(0, -100);
      ctx.lineTo(65, -75);
      ctx.lineTo(0, -50);
      ctx.closePath();
      ctx.fill();

      ctx.font = '76px sans-serif';
      ctx.textAlign = 'center';
      const animalEmoji =
        currentLevel.friendAnimal === 'horse'
          ? '🐴'
          : currentLevel.friendAnimal === 'dragon'
          ? '🐲'
          : currentLevel.friendAnimal === 'monkey'
          ? '🐵'
          : currentLevel.friendAnimal === 'beaver'
          ? '🦫'
          : currentLevel.friendAnimal === 'bear'
          ? '🐻'
          : '🐢';
      ctx.fillText(animalEmoji, 30, 10);

      if (!state.hasReachedGoal) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-45, -145, 160, 40, 14);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 15px Fredoka, sans-serif';
        ctx.textAlign = 'center';

        const speech =
          currentLevel.friendAnimal === 'monkey'
            ? lang === 'sv' ? 'Hej på dig! 🔤' : 'Hello there! 🔤'
            : currentLevel.friendAnimal === 'beaver'
            ? lang === 'sv' ? 'Klarar du plus? 🧮' : 'Can you add? 🧮'
            : lang === 'sv' ? 'Mums! Äpplen! 🍎' : 'Yum! Apples! 🍎';

        ctx.fillText(speech, 35, -120);
      }

      ctx.restore();

      // ----------------------------------------------------
      // DYNAMIC VEHICLE SHADOW (Expands/fades with height)
      // ----------------------------------------------------
      const groundUnderCar = getGroundY(state.carX, viewH);
      const heightAboveGround = Math.max(0, groundUnderCar - (state.carY + 20));
      const shadowScale = Math.max(0.4, 1 - heightAboveGround / 180);
      const shadowAlpha = Math.max(0.1, 0.45 - heightAboveGround / 220);

      ctx.save();
      ctx.translate(state.carX, groundUnderCar - 4);
      ctx.scale(shadowScale, shadowScale * 0.4);
      ctx.fillStyle = `rgba(15, 23, 42, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ----------------------------------------------------
      // TRACTOR TRAILER WAGON
      // ----------------------------------------------------
      if (vehicleConfig.traits.special === 'trailer') {
        ctx.save();
        ctx.translate(state.trailerX, state.trailerY);
        ctx.rotate(state.trailerAngle);

        // Hitch connection bar
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(24, 0);
        ctx.lineTo(48, 6);
        ctx.stroke();

        // Wooden Cart
        ctx.fillStyle = '#92400E';
        ctx.beginPath();
        ctx.roundRect(-24, -18, 48, 22, 5);
        ctx.fill();
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Apples in cart!
        const collectedNum = state.items.filter((i) => i.collected).length;
        for (let a = 0; a < Math.min(collectedNum, 5); a++) {
          ctx.font = '16px sans-serif';
          ctx.fillText('🍎', -16 + a * 8, -12);
        }

        // Wagon Wheel
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 8, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
      }

      // ----------------------------------------------------
      // DRAW VEHICLE
      // ----------------------------------------------------
      ctx.save();
      ctx.translate(state.carX, state.carY + state.suspension);
      ctx.rotate(state.angle);

      // Determine Body Color based on Custom Paint Upgrade
      let carBodyColor = vehicleConfig.color;
      if (upgrades.paintId === 'gold') carBodyColor = '#F59E0B';
      else if (upgrades.paintId === 'neon') carBodyColor = '#A855F7';
      else if (upgrades.paintId === 'fire') carBodyColor = '#DC2626';

      const wheelCol = upgrades.tireLevel >= 3 ? '#F59E0B' : vehicleConfig.wheelColor;

      // Chassis body
      ctx.fillStyle = carBodyColor;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-36, -24, 76, 28, 8);
      ctx.fill();
      ctx.stroke();

      // Gold Sparkle particles when Gold paint equipped
      if (upgrades.paintId === 'gold' && Math.random() < 0.2) {
        state.particles.push({
          x: state.carX + (Math.random() - 0.5) * 40,
          y: state.carY - 20 + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 2,
          vy: -2,
          size: 6,
          color: '#FEF08A',
          alpha: 1,
          life: 0,
          maxLife: 20,
          shape: 'star',
        });
      }

      // Windshield & Cute Eyes
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.roundRect(-10, -42, 42, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      if (state.isBlinking) {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(8, -31, 5, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(22, -31, 5, Math.PI, 0);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(8, -31, 5, 0, Math.PI * 2);
        ctx.arc(22, -31, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(9, -33, 2, 0, Math.PI * 2);
        ctx.arc(23, -33, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Roof Siren or Chimney
      if (vehicleConfig.roofLight) {
        const sirenColor = Math.floor(now / 150) % 2 === 0 ? '#3B82F6' : '#EF4444';
        ctx.fillStyle = sirenColor;
        ctx.beginPath();
        ctx.arc(12, -48, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (currentVehicle === 'tractor') {
        ctx.fillStyle = '#475569';
        ctx.fillRect(-22, -46, 7, 24);
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.strokeRect(-22, -46, 7, 24);
      }

      // Turbo Exhaust Pipes Upgrade (engineLevel >= 2)
      if (upgrades.engineLevel >= 2) {
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(-42, -10, 8, 8);
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.strokeRect(-42, -10, 8, 8);
      }

      // Headlight & Dynamic Lighting Beam
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(38, -10, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dynamic Headlight Glow Beam shining forward onto track
      ctx.save();
      const beamGrad = ctx.createRadialGradient(38, -10, 6, 180, 10, 160);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
      beamGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.14)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(38, -12);
      ctx.lineTo(210, -32);
      ctx.lineTo(230, 48);
      ctx.lineTo(38, -4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Suspension Springs Upgrade (suspensionLevel >= 2)
      if (upgrades.suspensionLevel >= 2) {
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-22, 2);
        ctx.lineTo(-20, -4);
        ctx.lineTo(-24, -8);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(22, 2);
        ctx.lineTo(24, -4);
        ctx.lineTo(20, -8);
        ctx.stroke();
      }

      // Wheels
      const tireScale = 1 + (upgrades.tireLevel - 1) * 0.16;
      const drawWheel = (wx: number, wy: number, r: number) => {
        const finalR = r * tireScale;
        ctx.save();
        ctx.translate(wx, wy);
        ctx.rotate(state.wheelAngle);

        ctx.fillStyle = wheelCol;
        ctx.beginPath();
        ctx.arc(0, 0, finalR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Hubcap (Chrome if tireLevel >= 2)
        ctx.fillStyle = upgrades.tireLevel >= 2 ? '#E2E8F0' : '#F8FAFC';
        ctx.beginPath();
        ctx.arc(0, 0, finalR * 0.45, 0, Math.PI * 2);
        ctx.fill();
        if (upgrades.tireLevel >= 2) {
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(finalR * 0.25, 0, 2.5, 0, Math.PI * 2);
        ctx.arc(-finalR * 0.25, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      if (currentVehicle === 'tractor') {
        drawWheel(-22, 6, 17);
        drawWheel(24, 6, 11);
      } else {
        drawWheel(-22, 6, 13);
        drawWheel(22, 6, 13);
      }

      ctx.restore();

      // ----------------------------------------------------
      // PARTICLES (Water, smoke, flames, stars, notes)
      // ----------------------------------------------------
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'water') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'flame') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'note') {
          ctx.font = `${p.size}px sans-serif`;
          ctx.fillText('🎵', p.x, p.y);
        } else if (p.shape === 'heart') {
          ctx.font = `${p.size}px sans-serif`;
          ctx.fillText('💖', p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ----------------------------------------------------
      // FLOATING JUICE TEXTS (+1 🍎, SUPER-HOPP!, TURBO!, SLÄCKT!)
      // ----------------------------------------------------
      state.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `900 ${ft.size}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 4;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    currentVehicle,
    currentLevel,
    upgrades,
    isShapePuzzleSolved,
    isColorPuzzleSolved,
    isLetterPuzzleSolved,
    isAdditionPuzzleSolved,
    starsEarned,
    lang,
  ]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer touch-none"
        onClick={() => sounds.init()}
      />
    </div>
  );
};
