/**
 * Windows 95 Retro Haptic & Audio Feedback Synthesizer
 * Uses Web Audio API for lightweight, in-memory retro sound synthesis (zero external audio files).
 * Audio defaults to OFF; haptics feature-detected and respects reduced-motion.
 */

// Sound & Haptic State Keys
const SOUND_ENABLED_KEY = 'win95_sound_enabled';
const HAPTICS_ENABLED_KEY = 'win95_haptics_enabled';
const THEME_KEY = 'win95_theme';

class FeedbackManager {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = false;
  private hapticsEnabled: boolean = true;

  constructor() {
    // Read user preferences from localStorage (Audio defaults to FALSE as instructed)
    if (typeof window !== 'undefined') {
      this.soundEnabled = localStorage.getItem(SOUND_ENABLED_KEY) === 'true';
      this.hapticsEnabled = localStorage.getItem(HAPTICS_ENABLED_KEY) !== 'false';
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
    if (enabled) {
      this.initAudio();
      this.playClick();
    }
  }

  public isHapticsEnabled(): boolean {
    return this.hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
    localStorage.setItem(HAPTICS_ENABLED_KEY, String(enabled));
  }

  public getTheme(): string {
    return localStorage.getItem(THEME_KEY) || 'classic';
  }

  public setTheme(theme: string) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Subtle retro button click (short 25ms frequency drop)
   */
  public playClick() {
    this.triggerHaptic(12);

    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Audio playback fails silently if browser blocks autoplay
    }
  }

  /**
   * Retro Window Open Sound (Short ascending arpeggio blip)
   */
  public playWindowOpen() {
    this.triggerHaptic(20);

    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      [440, 660, 880].forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        const start = now + idx * 0.035;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.06, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(start);
        osc.stop(start + 0.05);
      });
    } catch {}
  }

  /**
   * Retro Success / Scan Completion Chord (Windows 95 style chord)
   */
  public playSuccess() {
    this.triggerHaptic([30, 40, 50]);

    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C Major triad + octave

      notes.forEach((freq) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(now);
        osc.stop(now + 0.4);
      });
    } catch {}
  }

  /**
   * Classic Double Error Bonk
   */
  public playError() {
    this.triggerHaptic([50, 40, 80]);

    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      [150, 130].forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        const start = now + idx * 0.12;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.09);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(start);
        osc.stop(start + 0.09);
      });
    } catch {}
  }

  /**
   * Tactile vibration pulse for supported mobile devices
   */
  private triggerHaptic(pattern: number | number[]) {
    if (!this.hapticsEnabled) return;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }
}

export const feedback = new FeedbackManager();
