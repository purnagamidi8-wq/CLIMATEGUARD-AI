/**
 * ClimateGuard AI Emergency Audio Chime & Vibration System
 * Uses Web Audio API synthesizer — zero external assets, works offline in any modern browser.
 */

class AlertSoundService {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a distinct multi-tone alert chime.
   * Type can be:
   *  - 'severe': Urgent two-tone broadcast alarm (880Hz -> 660Hz -> 880Hz)
   *  - 'high': Notice chime (587Hz -> 880Hz)
   *  - 'info': Subtle soft chime (523Hz -> 659Hz)
   */
  playChime(type = 'severe') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'severe') {
        // High-low-high pulsed alarm
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(659, now + 0.15);
        osc.frequency.setValueAtTime(880, now + 0.30);
        osc.frequency.setValueAtTime(659, now + 0.45);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
        gain.gain.setValueAtTime(0.35, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.start(now);
        osc.stop(now + 0.8);
      } else if (type === 'high') {
        // Warning chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.18); // A5

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
      } else {
        // Info chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.15); // E5

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      console.warn('Audio alert playback not allowed or not supported:', e);
    }
  }

  /**
   * Vibrates the physical device (supported on mobile Android/Chrome).
   */
  vibrate(pattern = [200, 100, 200, 100, 400]) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      console.warn('Vibration API not supported or blocked:', e);
    }
  }
}

export const alertSound = new AlertSoundService();
