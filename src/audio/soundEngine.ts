// Web Audio synthesizer engine for instant, zero-asset, lag-free audio

class SoundEngine {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isMuted: boolean = false;

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
    if (muted && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // 1. Play Jump / Bounce Boing
  public playJump() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.18);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // 2. Item Collect Chime (with count-based pitch)
  public playCollect(step: number = 1) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    const t = ctx.currentTime;
    const pitches = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5, D5, E5, G5, A5, C6
    const baseFreq = pitches[Math.min(step - 1, pitches.length - 1)] || 523.25;

    // Harmonic bell pair
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

  // 3. Funny Horns
  public playHorn(type: 'horn' | 'quack' | 'siren' | 'boing' = 'horn') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    const t = ctx.currentTime;

    if (type === 'horn') {
      // Dual tone classic horn: A4 (440) + C#5 (554)
      [440, 554].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        // Low-pass filter for warm horn sound
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
      // Duck quack sound
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
      // Fire engine wee-woo sweep
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
    } else {
      // Spring boing
      this.playJump();
    }
  }

  // 4. Shape snap / Bridge repair
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

  // 5. Victory Fanfare
  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.init();

    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.4 },  // C6
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

  // 6. Voice speech prompt for 5yo
  public speak(text: string, lang: 'sv' | 'en' = 'sv') {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'sv' ? 'sv-SE' : 'en-US';
      utterance.rate = 0.95; // Friendly, clear pace for kids
      utterance.pitch = 1.25; // Warm, encouraging tone
      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}

export const sounds = new SoundEngine();
