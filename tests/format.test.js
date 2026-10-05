const test = require('node:test');
const assert = require('node:assert/strict');
const { formatTime, formatDuration } = require('../js/format.js');

test('formatTime shows MM:SS', () => {
  assert.equal(formatTime(25 * 60 * 1000), '25:00');
  assert.equal(formatTime(61 * 1000), '01:01');
  assert.equal(formatTime(5 * 1000), '00:05');
});

test('formatTime rounds partial seconds up', () => {
  assert.equal(formatTime(999), '00:01');
  assert.equal(formatTime(1001), '00:02');
});

test('formatTime never goes negative', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(-5000), '00:00');
});

test('formatDuration shows minutes, then hours and minutes', () => {
  assert.equal(formatDuration(0), '0m');
  assert.equal(formatDuration(1500), '25m');
  assert.equal(formatDuration(3600), '1h 0m');
  assert.equal(formatDuration(5400), '1h 30m');
});