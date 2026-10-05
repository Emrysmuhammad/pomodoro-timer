const test = require('node:test');
const assert = require('node:assert/strict');
const { durationMs, nextMode, dotsFilled } = require('../js/cycle.js');

const settings = { focusMin: 25, shortBreakMin: 5, longBreakMin: 15 };

test('durationMs converts minutes to milliseconds', () => {
  assert.equal(durationMs('focus', settings), 1500000);
  assert.equal(durationMs('shortBreak', settings), 300000);
  assert.equal(durationMs('longBreak', settings), 900000);
});

test('durationMs rejects an unknown mode', () => {
  assert.throws(() => durationMs('nap', settings));
});

test('a short break follows focus sessions 1 to 3', () => {
  assert.equal(nextMode('focus', 1, 4), 'shortBreak');
  assert.equal(nextMode('focus', 2, 4), 'shortBreak');
  assert.equal(nextMode('focus', 3, 4), 'shortBreak');
});

test('a long break follows every 4th focus session', () => {
  assert.equal(nextMode('focus', 4, 4), 'longBreak');
  assert.equal(nextMode('focus', 8, 4), 'longBreak');
});

test('the long break interval is configurable', () => {
  assert.equal(nextMode('focus', 2, 2), 'longBreak');
  assert.equal(nextMode('focus', 3, 3), 'longBreak');
});

test('focus always follows a break', () => {
  assert.equal(nextMode('shortBreak', 1, 4), 'focus');
  assert.equal(nextMode('longBreak', 4, 4), 'focus');
});

test('a skipped focus session never triggers a long break', () => {
  assert.equal(nextMode('focus', 4, 4, false), 'shortBreak');
});

test('dotsFilled tracks progress through the cycle', () => {
  assert.equal(dotsFilled('focus', 0, 4), 0);
  assert.equal(dotsFilled('shortBreak', 1, 4), 1);
  assert.equal(dotsFilled('focus', 3, 4), 3);
});

test('dotsFilled shows a full row during the long break, then resets', () => {
  assert.equal(dotsFilled('longBreak', 4, 4), 4);
  assert.equal(dotsFilled('longBreak', 8, 4), 4);
  assert.equal(dotsFilled('focus', 4, 4), 0);
  assert.equal(dotsFilled('longBreak', 0, 4), 0);
});