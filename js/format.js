(function (root) {
  'use strict';

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /**
   * Milliseconds -> "MM:SS". Rounds UP to the next whole second so the
   * display shows 00:01 until the very last moment, never 00:00 too early.
   */
  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return pad(minutes) + ':' + pad(seconds);
  }

  /** Seconds -> short label such as "25m" or "1h 30m" (used for daily stats). */
  function formatDuration(totalSeconds) {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    return hours > 0 ? hours + 'h ' + minutes + 'm' : minutes + 'm';
  }

  const api = { formatTime, formatDuration };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Pomodoro = root.Pomodoro || {};
    Object.assign(root.Pomodoro, api);
  }
})(typeof window !== 'undefined' ? window : globalThis);