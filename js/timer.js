(function (root) {
  'use strict';

  /**
   * A countdown timer based on TIMESTAMPS, not on counting ticks.
   *
   * Browsers slow down setInterval in background tabs, so a timer that
   * subtracts one second per tick would drift. Here the remaining time is
   * always calculated from the clock, so it stays correct no matter how
   * often (or rarely) the screen is refreshed.
   *
   * Every method receives `now` (milliseconds) so the class never reads the
   * clock itself. That makes it completely deterministic and easy to test.
   *
   * Status: 'idle' -> 'running' <-> 'paused'
   */
  class Timer {
    constructor(durationMs) {
      this.durationMs = durationMs;
      this.reset();
    }

    /** Back to idle with a full countdown. Optionally set a new duration. */
    reset(durationMs) {
      if (durationMs !== undefined) this.durationMs = durationMs;
      this.status = 'idle';
      this.remainingAtStart = this.durationMs; // time left when we last (re)started
      this.startedAt = null;
    }

    start(now) {
      if (this.status === 'running') return;
      this.startedAt = now;
      this.status = 'running';
    }

    pause(now) {
      if (this.status !== 'running') return;
      this.remainingAtStart = this.remaining(now);
      this.startedAt = null;
      this.status = 'paused';
    }

    /** Milliseconds left (never negative). */
    remaining(now) {
      if (this.status === 'running') {
        return Math.max(0, this.remainingAtStart - (now - this.startedAt));
      }
      return this.remainingAtStart;
    }

    /** 0 at the start of a session, 1 when it is finished. */
    progress(now) {
      if (this.durationMs <= 0) return 0;
      return Math.min(1, Math.max(0, 1 - this.remaining(now) / this.durationMs));
    }

    isFinished(now) {
      return this.status === 'running' && this.remaining(now) <= 0;
    }
  }

  const api = { Timer };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Pomodoro = root.Pomodoro || {};
    Object.assign(root.Pomodoro, api);
  }
})(typeof window !== 'undefined' ? window : globalThis);