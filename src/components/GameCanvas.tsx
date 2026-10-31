import React, { useRef, useEffect } from 'react';
import { VehicleType, LevelConfig, CollectibleItem, Particle } from '../types';
import { VEHICLES } from '../data/gameData';
import { sounds } from '../audio/soundEngine';

interface GameCanvasProps {
  currentVehicle: VehicleType;
  currentLevel: LevelConfig;
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
  lang: 'sv' | 'en';
}

interface MushroomProp {
  x: number;
  squash: number;
}

interface AnimalProp {
  x: number;
  emoji: string;
  name: string;
  jumpY: number;
  jumpVy: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentVehicle,
  currentLevel,
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
    blinkTimer: 0,
    isBlinking: false,

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

    animals: [
      { x: 1200, emoji: '🐮', name: 'Klara Ko', jumpY: 0, jumpVy: 0 },
      { x: 2500, emoji: '🐑', name: 'Ulla Ulltuss', jumpY: 0, jumpVy: 0 },
      { x: 4100, emoji: '🐰', name: 'Pelle Kanin', jumpY: 0, jumpVy: 0 },
      { x: 5500, emoji: '🐿️', name: 'Nils Ekorre', jumpY: 0, jumpVy: 0 },
    ] as AnimalProp[],

    windmillAngle: 0,

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
      sounds.playHorn(v.honkSound);

      const state = stateRef.current;

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
  }, [hornTrigger, currentVehicle]);

  // Check if current checkpoint is solved
  const isCurrentCheckpointSolved = (): boolean => {
    if (currentLevel.id === 'shapes') return isShapePuzzleSolved;
    if (currentLevel.id === 'letters') return isLetterPuzzleSolved;
    if (currentLevel.id === 'math') return isAdditionPuzzleSolved;
    if (currentLevel.id === 'colors') return isColorPuzzleSolved;
    // For replay / mastery with 6+ stars
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

    // Checkpoint bridge gap at 3100-3500
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
          return baseGround + 320; // Canyon drop before solving
        }
        return baseGround + 8; // Solved sturdy bridge
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
    state.vx = 0;
    state.vy = 0;
    state.angle = 0;
    state.hasReachedGoal = false;
    state.hasPromptedCheckpoint = false;
    state.particles = [];

    state.goalX = 6600;

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

    // Speak introductory mission greeting
    const introSpeech =
      lang === 'sv'
        ? `${currentLevel.titleSv}! ${currentLevel.missionDescriptionSv}`
        : `${currentLevel.titleEn}! ${currentLevel.missionDescriptionEn}`;
    setTimeout(() => {
      sounds.speak(introSpeech, lang);
    }, 400);
  }, [currentLevel.id, lang]);

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

      // 1. Controls & Acceleration
      const maxSpeed = 7.5;
      const accel = 14.0;
      const friction = 0.94;

      if (state.drivingForward && !state.hasReachedGoal) {
        state.vx += accel * dt;
        if (state.vx > maxSpeed) state.vx = maxSpeed;
        state.wheelAngle += state.vx * 0.12;

        if (Math.random() < 0.25 && state.isGrounded) {
          state.particles.push({
            x: state.carX - 32,
            y: state.carY + 12,
            vx: -1.5 - Math.random() * 2,
            vy: -0.5 - Math.random(),
            size: 6 + Math.random() * 6,
            color: '#E2E8F0',
            alpha: 0.7,
            life: 0,
            maxLife: 24,
            shape: 'circle',
          });
        }
      } else if (state.drivingBackward && !state.hasReachedGoal) {
        state.vx -= accel * 0.8 * dt;
        if (state.vx < -maxSpeed * 0.6) state.vx = -maxSpeed * 0.6;
        state.wheelAngle += state.vx * 0.12;
      } else {
        state.vx *= friction;
      }

      // Jump
      if (state.jumpCooldown > 0) state.jumpCooldown -= dt;
      if (state.isJumping && state.isGrounded && state.jumpCooldown <= 0) {
        state.vy = -12.5;
        state.isGrounded = false;
        state.jumpCooldown = 0.35;
        state.suspension = -10;
        sounds.playJump();

        for (let i = 0; i < 5; i++) {
          state.particles.push({
            x: state.carX,
            y: state.carY + 20,
            vx: (Math.random() - 0.5) * 4,
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
      state.vy += 22.0 * dt;

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
            // Progressive mastery: alternates between letter and math
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
        state.carY = groundY - 26;
        state.vy = 0;
        state.isGrounded = true;

        state.angle += (targetAngle - state.angle) * 0.25;
        state.suspension *= 0.8;
      } else {
        state.isGrounded = false;
        state.angle += (0 - state.angle) * 0.05;
      }

      // Bouncy Mushroom Collision
      state.mushrooms.forEach((m) => {
        if (m.squash > 0) m.squash = Math.max(0, m.squash - dt * 3);
        if (Math.abs(state.carX - m.x) < 38 && state.carY >= groundY - 32) {
          m.squash = 1;
          state.vy = -16.5;
          state.isGrounded = false;
          sounds.playJump();

          for (let p = 0; p < 8; p++) {
            state.particles.push({
              x: m.x,
              y: groundY - 20,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 5 - 2,
              size: 8,
              color: ['#EF4444', '#FBBF24', '#3B82F6', '#10B981'][p % 4],
              alpha: 1,
              life: 0,
              maxLife: 28,
              shape: 'star',
            });
          }
        }
      });

      // Update Animals jumping physics
      state.animals.forEach((animal) => {
        if (animal.jumpY < 0 || animal.jumpVy < 0) {
          animal.jumpVy += 20 * dt;
          animal.jumpY += animal.jumpVy;
          if (animal.jumpY >= 0) {
            animal.jumpY = 0;
            animal.jumpVy = 0;
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

          if (dist < 52) {
            item.collected = true;
            const totalCollected = state.items.filter((i) => i.collected).length;
            sounds.playCollect(totalCollected);

            const countSwedish = ['Ett!', 'Två!', 'Tre!', 'Fyra!', 'Fem!'];
            const countEnglish = ['One!', 'Two!', 'Three!', 'Four!', 'Five!'];
            const countWord =
              lang === 'sv'
                ? countSwedish[totalCollected - 1] || `${totalCollected}!`
                : countEnglish[totalCollected - 1] || `${totalCollected}!`;

            sounds.speak(countWord, lang);
            onItemCollected(totalCollected, currentLevel.itemType);

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

          if (dist < 42) {
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
        sounds.speak(cheers, lang);
        onGoalReached();
      }

      // Smooth Camera tracking (Both horizontal and vertical)
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

      // Sun
      ctx.save();
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(viewW - 90, 80, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      // Fluffy Clouds (Parallax across 7000px)
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

      // Distant Hills
      ctx.save();
      ctx.translate(-state.camX * 0.35, -state.camY * 0.2);
      ctx.fillStyle = '#BBF7D0';
      ctx.beginPath();
      ctx.moveTo(-200, viewH + 200);
      for (let x = -200; x < 7500; x += 80) {
        const y = viewH * 0.55 + Math.sin(x * 0.0018) * 45 + Math.cos(x * 0.004) * 25;
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

      // Grass Rim Outline
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
        // Repaired sturdy bridge with flags
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

        // Celebration pennant flags
        ['🚩', '⭐', '🎈'].forEach((icon, idx) => {
          ctx.font = '24px sans-serif';
          ctx.fillText(icon, bridgeX + 70 + idx * 120, bridgeY - 45);
        });
      } else {
        // Warning Gap with Puzzle prompt banner
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

      // Main Collectibles (Supports apples, shapes, letters, numbers, stars)
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
            // Wooden Letter Block (e.g. A, B, C, D, E)
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
            // Math number crystal
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
            // Star
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

      // Vehicle
      ctx.save();
      ctx.translate(state.carX, state.carY + state.suspension);
      ctx.rotate(state.angle);

      const carColor = vehicleConfig.color;
      const wheelCol = vehicleConfig.wheelColor;

      ctx.fillStyle = carColor;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-36, -24, 76, 28, 8);
      ctx.fill();
      ctx.stroke();

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

      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(38, -10, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();

      const drawWheel = (wx: number, wy: number, r: number) => {
        ctx.save();
        ctx.translate(wx, wy);
        ctx.rotate(state.wheelAngle);

        ctx.fillStyle = wheelCol;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(r * 0.25, 0, 2.5, 0, Math.PI * 2);
        ctx.arc(-r * 0.25, 0, 2.5, 0, Math.PI * 2);
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

      // Particles
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

        if (p.shape === 'star') {
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
