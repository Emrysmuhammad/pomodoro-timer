(function (root) {
  'use strict';

  /**
   * Central place for every tweakable value.
   * Durations are stored in MINUTES here and converted to milliseconds
   * by the cycle module.
   */
  const Config = Object.freeze({
    MODES: Object.freeze({
      focus: Object.freeze({ label: 'Focus' }),
      shortBreak: Object.freeze({ label: 'Short Break' }),
      longBreak: Object.freeze({ label: 'Long Break' })
    }),

    DEFAULT_SETTINGS: Object.freeze({
      focusMin: 25,
      shortBreakMin: 5,
      longBreakMin: 15,
      sessionsBeforeLongBreak: 4,
      soundEnabled: true,
      autoStartNext: false
    }),

    // Allowed range for each numeric setting (values outside are clamped)
    LIMITS: Object.freeze({
      focusMin: Object.freeze({ min: 1, max: 120 }),
      shortBreakMin: Object.freeze({ min: 1, max: 60 }),
      longBreakMin: Object.freeze({ min: 1, max: 90 }),
      sessionsBeforeLongBreak: Object.freeze({ min: 2, max: 8 })
    }),

    STORAGE_KEYS: Object.freeze({
      SETTINGS: 'pomodoro.settings',
      STATS: 'pomodoro.stats'
    }),

    TICK_MS: 250   // how often the screen refreshes while the timer runs
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;                 // Node (unit tests)
  } else {
    root.Pomodoro = root.Pomodoro || {};
    root.Pomodoro.Config = Config;           // Browser
  }
})(typeof window !== 'undefined' ? window : globalThis);