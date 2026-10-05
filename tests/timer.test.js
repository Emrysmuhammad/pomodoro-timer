const test = require('node:test');
const assert = require('node:assert/strict');
const { Timer } = require('../js/timer.js');

test('a new timer is idle with the full duration', () => {
  const t = new Timer(25000);
  assert.equal(t.status, 'idle');
  assert.equal(t.remaining(123456), 25000);
  assert.equal(t.progress(123456), 0);
});

test('remaining time counts down while running', () => {
  const t = new Timer(25000);
  t.start(0);
  assert.equal(t.status, 'running');
  assert.equal(t.remaining(10000), 15000);
});

test('pausing freezes the remaining time', () => {
  const t = new Timer(25000);
  t.start(0);
  t.pause(10000);
  assert.equal(t.status, 'paused');
  assert.equal(t.remaining(10000), 15000);
  assert.equal(t.remaining(99999), 15000);
});

test('resuming continues from where it paused', () => {
  const t = new Timer(25000);
  t.start(0);
  t.pause(10000);
  t.start(20000);
  assert.equal(t.remaining(25000), 10000);
});

test('starting twice does not restart the countdown', () => {
  const t = new Timer(25000);
  t.start(0);
  t.start(5000);
  assert.equal(t.remaining(10000), 15000);
});

test('isFinished becomes true exactly when time runs out', () => {
  const t = new Timer(1000);
  t.start(0);
  assert.equal(t.isFinished(999), false);
  assert.equal(t.isFinished(1000), true);
  assert.equal(t.remaining(5000), 0);
});

test('a paused or idle timer is never finished', () => {
  const t = new Timer(1000);
  assert.equal(t.isFinished(5000), false);
  t.start(0);
  t.pause(500);
  assert.equal(t.isFinished(99999), false);
});

test('progress goes from 0 to 1', () => {
  const t = new Timer(10000);
  t.start(0);
  assert.equal(t.progress(5000), 0.5);
  assert.equal(t.progress(10000), 1);
  assert.equal(t.progress(20000), 1);
});

test('reset returns to idle and can set a new duration', () => {
  const t = new Timer(10000);
  t.start(0);
  t.reset(3000);
  assert.equal(t.status, 'idle');
  assert.equal(t.durationMs, 3000);
  assert.equal(t.remaining(50000), 3000);
});