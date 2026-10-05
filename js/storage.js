(function (root) {
  'use strict';

  const Config = (typeof module !== 'undefined' && module.exports)
    ? require('./config.js')
    : root.Pomodoro.Config;

  // ---------- safe localStorage access ----------

  function defaultStorage() {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch (err) {
      return null; // access blocked (private mode, strict browser settings)
    }
  }

  function readJson(key, storage) {
    try {
      if (!storage) return null;
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null; // missing, corrupt or inaccessible: fall back to defaults
    }
  }

  function writeJson(key, value, storage) {
    try {
      if (!storage) return false;
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  // ---------- settings ----------

  function toNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') return Number(value);
    return NaN;
  }

  /**
   * Turn ANYTHING into a valid settings object: unknown or invalid values
   * fall back to defaults, numbers are rounded and clamped to their limits.
   */
  function sanitizeSettings(raw) {
    const out = Object.assign({}, Config.DEFAULT_SETTINGS);
    if (!raw || typeof raw !== 'object') return out;

    Object.keys(Config.LIMITS).forEach((key) => {
      const n = toNumber(raw[key]);
      if (Number.isFinite(n)) {
        const { min, max } = Config.LIMITS[key];
        out[key] = Math.min(max, Math.max(min, Math.round(n)));
      }
    });

    if (typeof raw.soundEnabled === 'boolean') out.soundEnabled = raw.soundEnabled;
    if (typeof raw.autoStartNext === 'boolean') out.autoStartNext = raw.autoStartNext;
    return out;
  }

  function loadSettings(storage = defaultStorage()) {
    return sanitizeSettings(readJson(Config.STORAGE_KEYS.SETTINGS, storage));
  }

  function saveSettings(settings, storage = defaultStorage()) {
    return writeJson(Config.STORAGE_KEYS.SETTINGS, sanitizeSettings(settings), storage);
  }

  // ---------- daily stats ----------

  /** Local date as "YYYY-MM-DD". */
  function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function cleanCount(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  /** Stats for `today`. Stats saved on an earlier day are discarded. */
  function normalizeStats(raw, today = todayKey()) {
    if (!raw || typeof raw !== 'object' || raw.date !== today) {
      return { date: today, sessions: 0, focusSeconds: 0 };
    }
    return {
      date: today,
      sessions: cleanCount(raw.sessions),
      focusSeconds: cleanCount(raw.focusSeconds)
    };
  }

  /** Returns NEW stats with one more completed focus session. */
  function recordFocusSession(stats, seconds, today = todayKey()) {
    const base = normalizeStats(stats, today);
    return {
      date: today,
      sessions: base.sessions + 1,
      focusSeconds: base.focusSeconds + Math.max(0, Math.round(seconds))
    };
  }

  function loadStats(storage = defaultStorage(), today = todayKey()) {
    return normalizeStats(readJson(Config.STORAGE_KEYS.STATS, storage), today);
  }

  function saveStats(stats, storage = defaultStorage()) {
    return writeJson(Config.STORAGE_KEYS.STATS, stats, storage);
  }

  const api = {
    sanitizeSettings, loadSettings, saveSettings,
    todayKey, normalizeStats, recordFocusSession, loadStats, saveStats
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Pomodoro = root.Pomodoro || {};
    Object.assign(root.Pomodoro, api);
  }
})(typeof window !== 'undefined' ? window : globalThis);