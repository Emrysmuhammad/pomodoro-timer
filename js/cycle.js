(function (root) {
  'use strict';

  /** Duration of a mode in milliseconds, taken from the settings (in minutes). */
  function durationMs(mode, settings) {
    const minutes = {
      focus: settings.focusMin,
      shortBreak: settings.shortBreakMin,
      longBreak: settings.longBreakMin
    }[mode];

    if (minutes === undefined) throw new Error('Unknown mode: ' + mode);
    return minutes * 60 * 1000;
  }

  /**
   * Which mode comes after `current`?
   *
   * - After a break, always focus.
   * - After a COMPLETED focus session: a long break every Nth session,
   *   otherwise a short break.
   * - A focus session that was SKIPPED (wasCompleted = false) never earns a
   *   long break.
   */
  function nextMode(current, completedFocus, sessionsBeforeLongBreak, wasCompleted = true) {
    if (current !== 'focus') return 'focus';
    if (!wasCompleted) return 'shortBreak';
    const longBreakDue = completedFocus > 0 && completedFocus % sessionsBeforeLongBreak === 0;
    return longBreakDue ? 'longBreak' : 'shortBreak';
  }

  /** How many of the cycle dots should be filled right now. */
  function dotsFilled(mode, completedFocus, sessionsBeforeLongBreak) {
    const inCycle = completedFocus % sessionsBeforeLongBreak;
    if (mode !== 'focus' && completedFocus > 0 && inCycle === 0) {
      return sessionsBeforeLongBreak; // cycle just finished: show a full row
    }
    return inCycle;
  }

  const api = { durationMs, nextMode, dotsFilled };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Pomodoro = root.Pomodoro || {};
    Object.assign(root.Pomodoro, api);
  }
})(typeof window !== 'undefined' ? window : globalThis);