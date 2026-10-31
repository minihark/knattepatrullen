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
  drivingForward: boolean;
  drivingBackward: boolean;
  isJumping: boolean;
  hornTrigger: number;
  lang: 'sv' | 'en';
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
  drivingForward,
  drivingBackward,
  isJumping,
  hornTrigger,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game Simulation State
  const stateRef = useRef({
    // Car State
    carX: 180,
    carY: 350,
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
    particles: [] as Particle[],
    goalX: 2500,
    hasReachedGoal: false,
    bridgeX: 1100,
    hasPromptedBridge: false,
    colorGateX: 1200,
    hasPromptedColorGate: false,

    // Controls state ref to avoid closure staleness
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

      // Spawn musical note and heart particles
      const state = stateRef.current;
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
    }
  }, [hornTrigger, currentVehicle]);

  // Terrain height calculation function
  const getGroundY = (x: number): number => {
    // Flat start area
    if (x < 300) return 400;

    // Rolling gentle hills
    const hill1 = Math.sin(x * 0.0035) * 55;
    const hill2 = Math.sin(x * 0.009) * 25;
    const hill3 = Math.cos(x * 0.0015) * 35;

    let base = 420 + hill1 + hill2 + hill3;

    // Bridge gap for level 2 (shapes)
    if (currentLevel.id === 'shapes') {
      const bridgeStart = 1050;
      const bridgeEnd = 1350;
      if (x > bridgeStart && x < bridgeEnd) {
        if (!isShapePuzzleSolved) {
          // Deep drop if bridge not fixed
          return 750;
        }
        // Smooth wooden bridge surface when solved
        return 430;
      }
    }

    // Flat goal area at the end
    if (x > 2300) return 420;

    return base;
  };

  // Reset or initialize Level State
  useEffect(() => {
    const state = stateRef.current;
    state.carX = 160;
    state.carY = 380;
    state.vx = 0;
    state.vy = 0;
    state.angle = 0;
    state.hasReachedGoal = false;
    state.hasPromptedBridge = false;
    state.hasPromptedColorGate = false;
    state.particles = [];

    // Generate collectibles along the path
    const items: CollectibleItem[] = [];
    const stepCount = currentLevel.goalCount;
    const spacing = 1900 / (stepCount + 1);

    for (let i = 1; i <= stepCount; i++) {
      const x = 320 + i * spacing;
      const y = getGroundY(x) - 70;
      items.push({
        id: `item-${i}`,
        x,
        y,
        collected: false,
        type: currentLevel.itemType,
        val: i,
        color: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#A855F7'][i % 5],
        pulsePhase: i * 0.8,
      });
    }

    state.items = items;
    state.goalX = 2450;

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

      // 1. Controls & Acceleration
      const maxSpeed = 7.5;
      const accel = 14.0;
      const friction = 0.94;

      if (state.drivingForward && !state.hasReachedGoal) {
        state.vx += accel * dt;
        if (state.vx > maxSpeed) state.vx = maxSpeed;
        state.wheelAngle += state.vx * 0.12;

        // Smoke / dust puff
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

        // Jump sparkle particles
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

      // Check Bridge obstacle for Level 2 (Shapes)
      if (
        currentLevel.id === 'shapes' &&
        !isShapePuzzleSolved &&
        state.carX >= 1010 &&
        state.carX <= 1060
      ) {
        state.vx = 0;
        if (!state.hasPromptedBridge) {
          state.hasPromptedBridge = true;
          onRequestShapePuzzle('triangle');
        }
      }

      // Check Color Gate obstacle for Level 3 (Colors)
      if (
        currentLevel.id === 'colors' &&
        !isColorPuzzleSolved &&
        state.carX >= 1150 &&
        state.carX <= 1200
      ) {
        state.vx = 0;
        if (!state.hasPromptedColorGate) {
          state.hasPromptedColorGate = true;
          onRequestColorPuzzle('blue');
        }
      }

      // Update position
      state.carX += state.vx;
      state.carY += state.vy;

      // Prevent driving too far left
      if (state.carX < 80) {
        state.carX = 80;
        state.vx = 0;
      }

      // Ground Collision & Hill Angle
      const groundY = getGroundY(state.carX);
      const groundYAhead = getGroundY(state.carX + 24);
      const groundYBehind = getGroundY(state.carX - 24);

      const targetAngle = Math.atan2(groundYAhead - groundYBehind, 48);

      if (state.carY >= groundY - 26) {
        state.carY = groundY - 26;
        state.vy = 0;
        state.isGrounded = true;

        // Smoothly match terrain angle
        state.angle += (targetAngle - state.angle) * 0.25;

        // Dampen suspension
        state.suspension *= 0.8;
      } else {
        state.isGrounded = false;
        // In the air, gently level out
        state.angle += (0 - state.angle) * 0.05;
      }

      // Blink animation
      state.blinkTimer += dt;
      if (state.blinkTimer > 3.2) {
        state.isBlinking = true;
        if (state.blinkTimer > 3.4) {
          state.isBlinking = false;
          state.blinkTimer = 0;
        }
      }

      // Collectibles detection
      let newlyCollected = 0;
      state.items.forEach((item) => {
        if (!item.collected) {
          const dx = state.carX - item.x;
          const dy = state.carY - item.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 50) {
            item.collected = true;
            newlyCollected++;
            const totalCollected = state.items.filter((i) => i.collected).length;
            sounds.playCollect(totalCollected);

            // Spoken count for kids!
            const countSwedish = ['Ett!', 'Två!', 'Tre!', 'Fyra!', 'Fem!'];
            const countEnglish = ['One!', 'Two!', 'Three!', 'Four!', 'Five!'];
            const countWord =
              lang === 'sv'
                ? countSwedish[totalCollected - 1] || `${totalCollected}!`
                : countEnglish[totalCollected - 1] || `${totalCollected}!`;

            sounds.speak(countWord, lang);
            onItemCollected(totalCollected, currentLevel.itemType);

            // Confetti & star explosion
            for (let p = 0; p < 12; p++) {
              state.particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 7,
                vy: -Math.random() * 6 - 2,
                size: 8 + Math.random() * 6,
                color: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899'][p % 5],
                alpha: 1,
                life: 0,
                maxLife: 32,
                shape: 'star',
              });
            }
          }
        }
      });

      // Goal Friend Reach Check
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

      // Smooth Camera tracking
      const targetCamX = state.carX - viewW * 0.35;
      state.camX += (targetCamX - state.camX) * 0.08;
      if (state.camX < 0) state.camX = 0;

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

      // Fluffy Clouds (Parallax)
      const cloudOffset = state.camX * 0.2;
      [
        { x: 100, y: 70, s: 0.9 },
        { x: 450, y: 110, s: 1.2 },
        { x: 900, y: 80, s: 0.8 },
        { x: 1350, y: 65, s: 1.1 },
        { x: 1800, y: 95, s: 0.85 },
        { x: 2300, y: 75, s: 1.0 },
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

      // Distant Hills (Mid-ground parallax)
      ctx.save();
      ctx.translate(-state.camX * 0.45, 0);
      ctx.fillStyle = '#BBF7D0';
      ctx.beginPath();
      ctx.moveTo(-200, viewH);
      for (let x = -200; x < 3200; x += 60) {
        const y = 350 + Math.sin(x * 0.002) * 50 + Math.cos(x * 0.005) * 30;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(3200, viewH);
      ctx.fill();
      ctx.restore();

      // Main Terrain (World coords transformed by camera)
      ctx.save();
      ctx.translate(-state.camX, 0);

      // Ground Fill
      ctx.beginPath();
      const startX = Math.max(0, state.camX - 50);
      const endX = Math.min(3200, state.camX + viewW + 100);

      ctx.moveTo(startX, viewH);
      for (let x = startX; x <= endX; x += 15) {
        ctx.lineTo(x, getGroundY(x));
      }
      ctx.lineTo(endX, viewH);
      ctx.closePath();

      ctx.fillStyle = currentLevel.theme.grassFill;
      ctx.fill();

      // Grass Rim Outline
      ctx.beginPath();
      for (let x = startX; x <= endX; x += 15) {
        if (x === startX) {
          ctx.moveTo(x, getGroundY(x));
        } else {
          ctx.lineTo(x, getGroundY(x));
        }
      }
      ctx.strokeStyle = currentLevel.theme.grassOutline;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Draw Bridge if in shapes level
      if (currentLevel.id === 'shapes') {
        const bridgeX = 1050;
        const bridgeW = 300;
        const bridgeY = 430;

        if (isShapePuzzleSolved) {
          // Repaired wooden plank bridge with golden rivets
          ctx.fillStyle = '#92400E';
          ctx.fillRect(bridgeX, bridgeY - 14, bridgeW, 20);
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 4;
          ctx.strokeRect(bridgeX, bridgeY - 14, bridgeW, 20);

          // Bridge ropes / arches
          ctx.strokeStyle = '#B45309';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(bridgeX, bridgeY - 45);
          ctx.quadraticCurveTo(bridgeX + bridgeW / 2, bridgeY - 10, bridgeX + bridgeW, bridgeY - 45);
          ctx.stroke();
        } else {
          // Broken gap with blinking question mark
          ctx.fillStyle = '#EF4444';
          ctx.font = 'bold 24px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ Laga bron här!', bridgeX + bridgeW / 2, bridgeY + 60);

          // Shape outline slot
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(bridgeX + bridgeW / 2, bridgeY - 20);
          ctx.lineTo(bridgeX + bridgeW / 2 - 25, bridgeY + 25);
          ctx.lineTo(bridgeX + bridgeW / 2 + 25, bridgeY + 25);
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Draw Collectibles along path
      state.items.forEach((item) => {
        if (!item.collected) {
          item.pulsePhase += dt * 3;
          const floatY = item.y + Math.sin(item.pulsePhase) * 6;

          ctx.save();
          ctx.translate(item.x, floatY);

          if (item.type === 'apple') {
            // Shiny red apple
            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.arc(-8, 0, 16, 0, Math.PI * 2);
            ctx.arc(8, 0, 16, 0, Math.PI * 2);
            ctx.fill();

            // Leaf & stem
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

            // Highlight shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(-6, -6, 5, 0, Math.PI * 2);
            ctx.fill();
          } else if (item.type === 'shapeKey') {
            // Magical Shape Key
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FEF08A';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Inner star
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔺', 0, 0);
          } else if (item.type === 'colorOrb') {
            // Color Orb
            ctx.fillStyle = item.color || '#3B82F6';
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 4;
            ctx.stroke();
          } else {
            // Golden Star
            ctx.fillStyle = '#FBBF24';
            ctx.beginPath();
            for (let s = 0; s < 5; s++) {
              const r1 = 20;
              const r2 = 9;
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

      // Goal Friend (e.g. Hästen Harald, Draken Diddi)
      const goalY = getGroundY(state.goalX);
      ctx.save();
      ctx.translate(state.goalX, goalY - 45);

      // Goal Flag / Banner
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(-8, -90, 8, 90);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.lineTo(55, -70);
      ctx.lineTo(0, -50);
      ctx.closePath();
      ctx.fill();

      // Friendly Animal Avatar
      ctx.font = '68px sans-serif';
      ctx.textAlign = 'center';
      const animalEmoji =
        currentLevel.friendAnimal === 'horse'
          ? '🐴'
          : currentLevel.friendAnimal === 'dragon'
          ? '🐲'
          : currentLevel.friendAnimal === 'bear'
          ? '🐻'
          : '🐢';
      ctx.fillText(animalEmoji, 25, 10);

      // Animal Speech bubble if not reached yet
      if (!state.hasReachedGoal) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-40, -135, 130, 36, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 15px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          lang === 'sv' ? 'Mums! Äpplen! 🍎' : 'Yum! Apples! 🍎',
          25,
          -112
        );
      }

      ctx.restore();

      // ----------------------------------------------------
      // DRAW VEHICLE
      // ----------------------------------------------------
      ctx.save();
      ctx.translate(state.carX, state.carY + state.suspension);
      ctx.rotate(state.angle);

      const carColor = vehicleConfig.color;
      const wheelCol = vehicleConfig.wheelColor;

      // Body (Chunky rounded toy chassis)
      ctx.fillStyle = carColor;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-36, -24, 76, 28, 8);
      ctx.fill();
      ctx.stroke();

      // Cabin / Windshield
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.roundRect(-10, -42, 42, 22, 6);
      ctx.fill();
      ctx.stroke();

      // Cute Eyes on windshield!
      ctx.fillStyle = '#0F172A';
      if (state.isBlinking) {
        // Closed happy eyes ^ ^
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(8, -31, 5, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(22, -31, 5, Math.PI, 0);
        ctx.stroke();
      } else {
        // Big round friendly eyes with shine
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

      // Roof item (Flashing Siren for Firetruck, Chimney for Tractor, Antenna for Rover)
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
        // Tractor exhaust chimney
        ctx.fillStyle = '#475569';
        ctx.fillRect(-22, -46, 7, 24);
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.strokeRect(-22, -46, 7, 24);
      }

      // Headlight
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(38, -10, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wheels (Animated rotation)
      const drawWheel = (wx: number, wy: number, r: number) => {
        ctx.save();
        ctx.translate(wx, wy);
        ctx.rotate(state.wheelAngle);

        // Tire
        ctx.fillStyle = wheelCol;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Hubcap rim
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Hub spoke dots
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(r * 0.25, 0, 2.5, 0, Math.PI * 2);
        ctx.arc(-r * 0.25, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      if (currentVehicle === 'tractor') {
        drawWheel(-22, 6, 17); // Big back wheel
        drawWheel(24, 6, 11);  // Smaller front wheel
      } else {
        drawWheel(-22, 6, 13);
        drawWheel(22, 6, 13);
      }

      ctx.restore();

      // ----------------------------------------------------
      // PARTICLES (Smoke, notes, stars)
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

      ctx.restore(); // Restore camera translation

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentVehicle, currentLevel, isShapePuzzleSolved, isColorPuzzleSolved, lang]);

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
