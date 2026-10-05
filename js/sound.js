(function (root) {
  'use strict';

  // Notes in Hz. Played one after another as a short chime.
  const PATTERNS = {
    focusEnd: [523.25, 659.25, 783.99, 1046.5],  // rising: great job, take a break
    breakEnd: [783.99, 659.25, 523.25]           // falling: back to work
  };

  /**
   * Generates sounds with the Web Audio API, so the project needs no
   * audio files. Browsers only allow audio after a user gesture, so
   * unlock() is called when the user first presses Start.
   */
  const Sound = {
    ctx: null,

    ensureContext() {
      try {
        if (!this.ctx) {
          const AudioCtx = root.AudioContext || root.webkitAudioContext;
          if (!AudioCtx) return null;
          this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
      } catch (err) {
        return null;
      }
    },

    unlock() {
      this.ensureContext();
    },

    tone(ctx, frequency, startAt, duration) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = frequency;

      // Quick fade in and a smooth fade out, so there are no clicks
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.25, startAt + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + duration + 0.05);
    },

    /** kind: 'focusEnd' | 'breakEnd' */
    play(kind) {
      try {
        const notes = PATTERNS[kind];
        const ctx = this.ensureContext();
        if (!ctx || !notes) return;

        const start = ctx.currentTime;
        notes.forEach((frequency, i) => this.tone(ctx, frequency, start + i * 0.22, 0.32));
      } catch (err) {
        /* sound is optional: ignore any failure */
      }
    }
  };

  root.Pomodoro = root.Pomodoro || {};
  root.Pomodoro.Sound = Sound;
})(typeof window !== 'undefined' ? window : globalThis);