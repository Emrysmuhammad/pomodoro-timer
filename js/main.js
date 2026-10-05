(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const { UI, App } = window.Pomodoro;
    const ui = new UI(document);
    const app = new App(ui);

    const $ = (id) => document.getElementById(id);

    // After a MOUSE click, release focus so keyboard shortcuts keep working.
    // Keyboard activation (event.detail === 0) keeps focus for accessibility.
    function onClick(element, handler) {
      element.addEventListener('click', (event) => {
        handler(event);
        if (event.detail > 0) event.currentTarget.blur();
      });
    }

    onClick($('start-btn'), () => app.toggle());
    onClick($('reset-btn'), () => app.reset());
    onClick($('skip-btn'), () => app.skip());

    document.querySelectorAll('.modes__btn').forEach((btn) => {
      onClick(btn, () => app.switchMode(btn.dataset.mode));
    });

    // Settings panel
    onClick($('settings-toggle'), () => ui.setSettingsOpen(!ui.isSettingsOpen()));
    onClick($('settings-defaults'), () => app.restoreDefaults());
    $('settings-form').addEventListener('submit', (event) => {
      event.preventDefault();
      app.applySettings(ui.readSettings());
    });

    // Keyboard shortcuts: Space = start/pause, R = reset, S = skip
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;

      const tag = event.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      const key = event.key.toLowerCase();
      if (key === ' ') {
        if (tag === 'BUTTON') return;   // a focused button handles Space itself
        event.preventDefault();
        app.toggle();
      } else if (key === 'r') {
        app.reset();
      } else if (key === 's') {
        app.skip();
      }
    });

    // Refresh immediately when returning to the tab
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) app.tick();
    });

    window.pomodoro = app; // handy for debugging in the console
  });
})();