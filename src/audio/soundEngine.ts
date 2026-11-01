// Web Audio synthesizer engine for rich, lag-free, tactile audio, engine rumble & speech

function makeDistortionCurve(amount: number = 15): Float32Array {
  const n_samples = 256;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

function triggerHaptic(durationMs: number = 15) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(durationMs);
    } catch {}
  }
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;

  // Continuous Tactile Engine Synthesizer Nodes
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineLfo: OscillatorNode | null = null;
  private engineLfoGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineDistortion: WaveShaperNode | null = null;
  private currentVehicleType: string = 'fire';

  // Playful Background Chime Melody Generator with Web Audio Look-Ahead Scheduler
  private isMusicPlaying: boolean = false;
  private musicSchedulerTimer: any = null;
  private nextNoteTime: number = 0;
  private currentMelodyStep: number = 0;
  private readonly NOTE_STEP_SECONDS = 0.42; // ~142 BPM
  private readonly melodyNotes = [
    261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00,
    329.63, 392.00, 440.00, 523.25, 392.00, 329.63, 293.66, 261.63,
  ]; // Friendly C-major pentatonic chime loop

  private cachedVoices: SpeechSynthesisVoice[] = [];
  private audioBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.isMusicMuted = localStorage.getItem('knatte_music_muted') === 'true';
      } catch {}

      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          try {
            this.cachedVoices = window.speechSynthesis.getVoices();
          } catch {}
        };
      }
    }
  }

  private getContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
    return this.ctx;
  }

  public init() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopEngine();
      this.stopMusic();
    } else {
      this.startEngine(this.currentVehicleType);
      if (!this.isMusicMuted) {
        this.startMusic();
      }
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // ------------------------------------------------------------------
  // 1. CONTINUOUS TACTILE ENGINE RUMBLE SYNTHESIS
  // ------------------------------------------------------------------
  public startEngine(vehicleType: string = 'fire') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    // If engine already running for this vehicle, keep it
    if (this.engineOsc && this.currentVehicleType === vehicleType) return;
    this.stopEngine();

    this.currentVehicleType = vehicleType;

    try {
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const shaper = ctx.createWaveShaper();

      // Configure based on vehicle
      if (vehicleType === 'tractor') {
        // Deep chugging diesel stroke rumble
        osc.type = 'sawtooth';
        subOsc.type = 'triangle';
        osc.frequency.setValueAtTime(36, ctx.currentTime);
        subOsc.frequency.setValueAtTime(18, ctx.currentTime);
        lfo.frequency.setValueAtTime(6.0, ctx.currentTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, ctx.currentTime);
      } else if (vehicleType === 'rocket') {
        // Sci-Fi ionic energy thruster
        osc.type = 'sine';
        subOsc.type = 'triangle';
        osc.frequency.setValueAtTime(75, ctx.currentTime);
        subOsc.frequency.setValueAtTime(150, ctx.currentTime);
        lfo.frequency.setValueAtTime(12.0, ctx.currentTime);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(440, ctx.currentTime);
      } else {
        // Fire truck / Jeep V8 rumble
        osc.type = 'triangle';
        subOsc.type = 'sawtooth';
        osc.frequency.setValueAtTime(46, ctx.currentTime);
        subOsc.frequency.setValueAtTime(23, ctx.currentTime);
        lfo.frequency.setValueAtTime(8.0, ctx.currentTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(340, ctx.currentTime);
      }

      shaper.curve = makeDistortionCurve(16) as any;
      shaper.oversample = '2x';

      lfoGain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.setValueAtTime(0.045, ctx.currentTime);

      // Connect LFO cylinder firing pulse to gain
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(shaper);
      shaper.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      subOsc.start();
      lfo.start();

      this.engineOsc = osc;
      this.engineSubOsc = subOsc;
      this.engineLfo = lfo;
      this.engineLfoGain = lfoGain;
      this.engineGain = gain;
      this.engineFilter = filter;
      this.engineDistortion = shaper;
    } catch {}
  }

  public updateEngine(speedRatio: number, isDriving: boolean) {
    if (this.isMuted || !this.engineOsc || !this.engineGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    const clampedSpeed = Math.min(Math.max(speedRatio, 0), 1.6);

    let baseFreq = 46;
    let lfoBase = 8.0;
    if (this.currentVehicleType === 'tractor') {
      baseFreq = 36;
      lfoBase = 6.0;
    }
    if (this.currentVehicleType === 'rocket') {
      baseFreq = 75;
      lfoBase = 12.0;
    }
    if (this.currentVehicleType === 'rescue') {
      baseFreq = 54;
      lfoBase = 9.5;
    }

    const targetFreq = baseFreq + clampedSpeed * 70;
    const targetLfo = lfoBase + clampedSpeed * 14;
    const targetGain = isDriving ? 0.085 + clampedSpeed * 0.05 : 0.04;

    this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.06);
    if (this.engineSubOsc) {
      this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, t, 0.06);
    }
    if (this.engineLfo) {
      this.engineLfo.frequency.setTargetAtTime(targetLfo, t, 0.08);
    }
    this.engineGain.gain.setTargetAtTime(targetGain, t, 0.05);

    if (this.engineFilter) {
      this.engineFilter.frequency.setTargetAtTime(280 + clampedSpeed * 480, t, 0.08);
    }
  }

  public stopEngine() {
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
        this.engineOsc = null;
      }
      if (this.engineSubOsc) {
        this.engineSubOsc.stop();
        this.engineSubOsc.disconnect();
        this.engineSubOsc = null;
      }
      if (this.engineLfo) {
        this.engineLfo.stop();
        this.engineLfo.disconnect();
        this.engineLfo = null;
      }
      if (this.engineLfoGain) {
        this.engineLfoGain.disconnect();
        this.engineLfoGain = null;
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
        this.engineGain = null;
      }
      if (this.engineFilter) {
        this.engineFilter.disconnect();
        this.engineFilter = null;
      }
      if (this.engineDistortion) {
        this.engineDistortion.disconnect();
        this.engineDistortion = null;
      }
    } catch {}
  }

  // ------------------------------------------------------------------
  // 2. DISCRETE ACTION EFFECTS
  // ------------------------------------------------------------------

  // Jump / Spring Boing
  public playJump(power: number = 1.0) {
    if (this.isMuted) return;
    triggerHaptic(12);
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(460 * power, t + 0.19);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // Deep Suspension Landing Thud
  public playLand(strength: number = 1.0) {
    if (this.isMuted) return;
    triggerHaptic(18);
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.12);

    gain.gain.setValueAtTime(Math.min(0.4 * strength, 0.5), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Tire Skid / Dirt Scratch
  public playSkid() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.15);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);
    filter.Q.setValueAtTime(3, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.17);
  }

  // Water Cannon Spray (for Firetruck)
  public playWaterSpray() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(650, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  // Turbo Boost ignition
  public playTurbo() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.35);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.39);
  }

  // Item Collect Bell Chime
  public playCollect(step: number = 1) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    const t = ctx.currentTime;
    const pitches = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const baseFreq = pitches[Math.min(step - 1, pitches.length - 1)] || 523.25;

    [baseFreq, baseFreq * 2].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const amp = idx === 0 ? 0.3 : 0.15;
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  // Upgrade Purchased Chime
  public playUpgrade() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A major chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  // Horns
  public playHorn(type: 'horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog' = 'horn') {
    if (this.isMuted) return;
    triggerHaptic(20);
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    const t = ctx.currentTime;

    if (type === 'horn') {
      [440, 554].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, t);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.29);
      });
    } else if (type === 'quack') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.25);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.Q.setValueAtTime(4, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    } else if (type === 'siren') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.linearRampToValueAtTime(950, t + 0.18);
      osc.frequency.linearRampToValueAtTime(650, t + 0.36);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.41);
    } else if (type === 'cat') {
      // Katten Misse meow: gentle feline formant glide
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      sub.type = 'sine';

      // Pitch glide: 420Hz -> 680Hz -> 360Hz
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(680, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(360, t + 0.38);

      sub.frequency.setValueAtTime(210, t);
      sub.frequency.exponentialRampToValueAtTime(340, t + 0.15);
      sub.frequency.exponentialRampToValueAtTime(180, t + 0.38);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, t);
      filter.Q.setValueAtTime(3.2, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      sub.start(t);
      osc.stop(t + 0.41);
      sub.stop(t + 0.41);
    } else if (type === 'dog') {
      // Hunden Buster happy double bark: two quick percussive bursts
      [0, 0.16].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const st = t + offset;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, st);
        osc.frequency.exponentialRampToValueAtTime(105, st + 0.11);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, st);

        gain.gain.setValueAtTime(0.35, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.13);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(st);
        osc.stop(st + 0.14);
      });
    } else {
      this.playJump(1.2);
    }
  }

  // ------------------------------------------------------------------
  // 2.5 BACKGROUND PLAYFUL CHIME MELODY (LOOK-AHEAD WEB AUDIO SCHEDULER)
  // ------------------------------------------------------------------
  public startMusic() {
    if (this.isMuted || this.isMusicMuted || this.isMusicPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    this.isMusicPlaying = true;
    this.currentMelodyStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.05;
    this.scheduleMusic();
  }

  private scheduleMusic = () => {
    if (!this.isMusicPlaying || this.isMuted || this.isMusicMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Look-ahead schedule notes 200ms ahead to prevent jitter or background timer drift
    while (this.nextNoteTime < ctx.currentTime + 0.22) {
      this.playChimeNote(this.nextNoteTime);
      this.nextNoteTime += this.NOTE_STEP_SECONDS;
    }

    this.musicSchedulerTimer = setTimeout(this.scheduleMusic, 50);
  };

  private playChimeNote(targetTime: number) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const noteFreq = this.melodyNotes[this.currentMelodyStep % this.melodyNotes.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(noteFreq, targetTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, targetTime);

      // Low volume chime that softly accompanies gameplay without overpowering SFX
      gain.gain.setValueAtTime(0.045, targetTime);
      gain.gain.exponentialRampToValueAtTime(0.001, targetTime + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(targetTime);
      osc.stop(targetTime + 0.4);

      this.currentMelodyStep++;
    } catch {}
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicSchedulerTimer) {
      clearTimeout(this.musicSchedulerTimer);
      this.musicSchedulerTimer = null;
    }
  }

  public toggleMusic(): boolean {
    const next = !this.isMusicMuted;
    this.isMusicMuted = next;
    try {
      localStorage.setItem('knatte_music_muted', String(next));
    } catch {}
    if (next) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return !next;
  }

  public isMusicOn(): boolean {
    return !this.isMusicMuted;
  }

  // ------------------------------------------------------------------
  // 2.6 ANIMAL FRIENDS VOICE TRACKS
  // ------------------------------------------------------------------
  public playAnimalVoice(animal: 'cat' | 'dog', lang: 'sv' | 'en' = 'sv') {
    if (this.isMuted) return;
    if (animal === 'cat') {
      this.playHorn('cat');
      const text =
        lang === 'sv'
          ? 'Mjau! Hej kompis, jag heter Katten Misse! Ska vi rejsa?'
          : 'Meow! Hi buddy, I am Misse the Cat! Shall we race?';
      setTimeout(() => {
        this.playVoiceClip('cat_misse', text, lang);
      }, 350);
    } else {
      this.playHorn('dog');
      const text =
        lang === 'sv'
          ? 'Voff voff! Hej där! Jag heter Hunden Buster och jag älskar att köra fort!'
          : 'Woof woof! Hello there! I am Buster the Dog and I love driving fast!';
      setTimeout(() => {
        this.playVoiceClip('dog_buster', text, lang);
      }, 300);
    }
  }

  public playSnap() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    const notes = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.4 },
    ];

    let start = ctx.currentTime;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + note.d + 0.02);

      start += note.d * 0.85;
    });
  }

  // ------------------------------------------------------------------
  // 3. STUDIO HUMAN VOICE CLIPS (NATURAL SWEDISH PRONUNCIATION)
  // ------------------------------------------------------------------
  public async playVoiceClip(clipId: string, fallbackText?: string, lang: 'sv' | 'en' = 'sv') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    const prefix = lang === 'sv' ? 'sv_' : 'en_';
    const fullKey = clipId.startsWith('sv_') || clipId.startsWith('en_') ? clipId : `${prefix}${clipId}`;
    const url = `/audio/voices/${fullKey}.mp3`;

    try {
      let buffer = this.audioBuffers.get(fullKey);
      if (!buffer) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Clip ${fullKey} not found`);
        const arrayBuf = await res.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuf);
        this.audioBuffers.set(fullKey, buffer);
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.95, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      return;
    } catch {
      // Fallback gracefully to Web Speech API
      if (fallbackText) {
        this.speak(fallbackText, lang);
      }
    }
  }

  // ------------------------------------------------------------------
  // 4. EXPRESSIVE FALLBACK SYNTHESIS
  // ------------------------------------------------------------------
  public speak(text: string, lang: 'sv' | 'en' = 'sv') {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'sv' ? 'sv-SE' : 'en-US';

      // Pick the most natural voice available
      const voices =
        this.cachedVoices.length > 0
          ? this.cachedVoices
          : window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        if (lang === 'sv') {
          // Prioritize high-quality Swedish voices (Apple Alva/Oskar, Google Svenska, etc.)
          const preferredSv = voices.find(
            (v) =>
              v.lang.startsWith('sv') &&
              (v.name.includes('Alva') ||
                v.name.includes('Oskar') ||
                v.name.includes('Klara') ||
                v.name.includes('Google') ||
                v.name.includes('Natural'))
          );
          const fallbackSv = voices.find((v) => v.lang.startsWith('sv'));
          if (preferredSv) utterance.voice = preferredSv;
          else if (fallbackSv) utterance.voice = fallbackSv;
        } else {
          const preferredEn = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Samantha') ||
                v.name.includes('Daniel') ||
                v.name.includes('Natural') ||
                v.name.includes('Google'))
          );
          if (preferredEn) utterance.voice = preferredEn;
        }
      }

      // Friendly, expressive cadence for 5-year-olds
      utterance.rate = 0.95;
      utterance.pitch = 1.15;

      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}

export const sounds = new SoundEngine();
