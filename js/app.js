(function (root) {
  'use strict';

  const {
    Config, Timer, Sound, Notifier,
    formatTime, durationMs, nextMode, dotsFilled,
    sanitizeSettings, loadSettings, saveSettings,
    normalizeStats, recordFocusSession, loadStats, saveStats
  } = root.Pomodoro;

  /**
   * The controller: connects the Timer, the cycle rules, storage, sound
   * and the UI. It owns the current mode and the session counter.
   */
  class App {
    constructor(ui) {
      this.ui = ui;
      this.settings = loadSettings();
      this.stats = loadStats();
      this.mode = 'focus';
      this.completedFocus = 0;   // focus sessions finished since the page opened
      this.timer = new Timer(durationMs(this.mode, this.settings));
      this.interval = null;

      this.ui.fillSettings(this.settings);
      this.render();
    }

    // ---------- user actions ----------

    toggle() {
      if (this.timer.status === 'running') this.pause();
      else this.start();
    }

    start() {
      if (this.timer.status === 'running') return;
      Notifier.requestPermission();   // must happen inside a user action
      Sound.unlock();                 // same for audio
      this.timer.start(Date.now());
      this.startTicking();
      this.render();
    }

    pause() {
      if (this.timer.status !== 'running') return;
      this.timer.pause(Date.now());
      this.stopTicking();
      this.render();
    }

    reset() {
      this.stopTicking();
      this.timer.reset(durationMs(this.mode, this.settings));
      this.render();
    }

    /** Jump to the next mode without counting the session. */
    skip() {
      this.stopTicking();
      this.advance(false);
    }

    switchMode(mode) {
      if (mode === this.mode) return;
      if (this.timer.status !== 'idle' &&
          !root.confirm('Switch mode? The current timer will be reset.')) {
        return;
      }
      this.stopTicking();
      this.mode = mode;
      this.timer.reset(durationMs(mode, this.settings));
      this.render();
    }

    // ---------- ticking ----------

    startTicking() {
      this.stopTicking();
      this.interval = setInterval(() => this.tick(), Config.TICK_MS);
    }

    stopTicking() {
      if (this.interval !== null) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }

    tick() {
      if (this.timer.status !== 'running') return;
      const now = Date.now();
      if (this.timer.isFinished(now)) {
        this.complete();
        return;
      }
      this.renderTime(now);
    }

    // ---------- session flow ----------

    /** A session ran all the way to zero. */
    complete() {
      this.stopTicking();
      const finished = this.mode;

      if (finished === 'focus') {
        this.completedFocus++;
        this.stats = recordFocusSession(this.stats, this.timer.durationMs / 1000);
        saveStats(this.stats);
      }

      this.announce(finished);
      this.advance(true);
      if (this.settings.autoStartNext) this.start();
    }

    advance(wasCompleted) {
      this.mode = nextMode(
        this.mode,
        this.completedFocus,
        this.settings.sessionsBeforeLongBreak,
        wasCompleted
      );
      this.timer.reset(durationMs(this.mode, this.settings));
      this.render();
    }

    announce(finishedMode) {
      const message = finishedMode === 'focus'
        ? 'Focus session complete! Time for a break.'
        : 'Break is over. Ready to focus?';

      if (this.settings.soundEnabled) {
        Sound.play(finishedMode === 'focus' ? 'focusEnd' : 'breakEnd');
      }
      Notifier.notify('Pomodoro Timer', message);
      this.ui.showToast(message);
    }

    // ---------- settings ----------

    applySettings(raw, message) {
      this.settings = sanitizeSettings(raw);
      saveSettings(this.settings);
      this.ui.fillSettings(this.settings);   // show the cleaned-up values

      let note = message || 'Settings saved';
      if (this.timer.status === 'idle') {
        this.timer.reset(durationMs(this.mode, this.settings));
      } else {
        note += '. New durations apply from the next session.';
      }

      this.render();
      this.ui.showToast(note);
    }

    restoreDefaults() {
      this.applySettings(null, 'Defaults restored');
    }

    // ---------- rendering ----------

    render() {
      this.stats = normalizeStats(this.stats);   // rolls over at midnight
      const total = this.settings.sessionsBeforeLongBreak;

      this.ui.setMode(this.mode);
      this.ui.setStatus(this.timer.status);
      this.ui.renderDots(dotsFilled(this.mode, this.completedFocus, total), total);
      this.ui.renderStats(this.stats);
      this.renderTime(Date.now());
    }

    renderTime(now) {
      const remaining = this.timer.remaining(now);
      this.ui.setTime(remaining);
      this.ui.setProgress(this.timer.progress(now));
      this.ui.setTitle(
        this.timer.status === 'idle'
          ? 'Pomodoro Timer'
          : formatTime(remaining) + ' - ' + Config.MODES[this.mode].label
      );
    }
  }

  root.Pomodoro.App = App;
})(typeof window !== 'undefined' ? window : globalThis);