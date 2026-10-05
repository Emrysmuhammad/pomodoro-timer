const test = require('node:test');
const assert = require('node:assert/strict');
const Config = require('../js/config.js');
const {
  sanitizeSettings, loadSettings, saveSettings,
  todayKey, normalizeStats, recordFocusSession, loadStats, saveStats
} = require('../js/storage.js');

// A tiny in-memory stand-in for localStorage
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value))
  };
}

test('loadSettings returns the defaults when nothing is saved', () => {
  assert.deepEqual(loadSettings(fakeStorage()), Config.DEFAULT_SETTINGS);
});

test('settings survive a save and load round trip', () => {
  const storage = fakeStorage();
  const custom = {
    focusMin: 30, shortBreakMin: 10, longBreakMin: 20,
    sessionsBeforeLongBreak: 3, soundEnabled: false, autoStartNext: true
  };
  saveSettings(custom, storage);
  assert.deepEqual(loadSettings(storage), custom);
});

test('out-of-range numbers are clamped to the limits', () => {
  const s = sanitizeSettings({
    focusMin: 999, shortBreakMin: 0, longBreakMin: -5, sessionsBeforeLongBreak: 100
  });
  assert.equal(s.focusMin, 120);
  assert.equal(s.shortBreakMin, 1);
  assert.equal(s.longBreakMin, 1);
  assert.equal(s.sessionsBeforeLongBreak, 8);
});

test('numeric strings from form inputs are accepted and rounded', () => {
  assert.equal(sanitizeSettings({ focusMin: '30' }).focusMin, 30);
  assert.equal(sanitizeSettings({ focusMin: 25.6 }).focusMin, 26);
});

test('invalid values fall back to the defaults', () => {
  const d = Config.DEFAULT_SETTINGS;
  assert.equal(sanitizeSettings({ focusMin: 'abc' }).focusMin, d.focusMin);
  assert.equal(sanitizeSettings({ focusMin: '' }).focusMin, d.focusMin);
  assert.equal(sanitizeSettings({ soundEnabled: 'yes' }).soundEnabled, d.soundEnabled);
  assert.deepEqual(sanitizeSettings(null), d);
  assert.deepEqual(sanitizeSettings('nonsense'), d);
});

test('corrupt saved data falls back to the defaults', () => {
  const storage = fakeStorage({ 'pomodoro.settings': '{not valid json' });
  assert.deepEqual(loadSettings(storage), Config.DEFAULT_SETTINGS);
});

test('missing storage does not crash anything', () => {
  assert.deepEqual(loadSettings(null), Config.DEFAULT_SETTINGS);
  assert.equal(saveSettings(Config.DEFAULT_SETTINGS, null), false);
});

test('todayKey formats the local date as YYYY-MM-DD', () => {
  assert.equal(todayKey(new Date(2026, 0, 5)), '2026-01-05');
  assert.equal(todayKey(new Date(2026, 11, 31)), '2026-12-31');
});

test('stats from a previous day are reset', () => {
  const old = { date: '2026-01-01', sessions: 5, focusSeconds: 7500 };
  assert.deepEqual(normalizeStats(old, '2026-01-02'), {
    date: '2026-01-02', sessions: 0, focusSeconds: 0
  });
});

test('stats from today are kept', () => {
  const today = { date: '2026-01-02', sessions: 3, focusSeconds: 4500 };
  assert.deepEqual(normalizeStats(today, '2026-01-02'), today);
});

test('recordFocusSession adds a session and its time', () => {
  let stats = normalizeStats(null, '2026-01-02');
  stats = recordFocusSession(stats, 1500, '2026-01-02');
  stats = recordFocusSession(stats, 1500, '2026-01-02');
  assert.equal(stats.sessions, 2);
  assert.equal(stats.focusSeconds, 3000);
});

test('recordFocusSession starts fresh on a new day', () => {
  const yesterday = { date: '2026-01-01', sessions: 4, focusSeconds: 6000 };
  const stats = recordFocusSession(yesterday, 1500, '2026-01-02');
  assert.deepEqual(stats, { date: '2026-01-02', sessions: 1, focusSeconds: 1500 });
});

test('stats survive a save and load round trip', () => {
  const storage = fakeStorage();
  const stats = { date: '2026-01-02', sessions: 2, focusSeconds: 3000 };
  saveStats(stats, storage);
  assert.deepEqual(loadStats(storage, '2026-01-02'), stats);
});