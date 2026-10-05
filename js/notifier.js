(function (root) {
  'use strict';

  /**
   * Thin wrapper around the browser Notification API.
   * Everything is optional: if notifications are unsupported or denied,
   * the app still works and shows an in-page message instead.
   */
  const Notifier = {
    supported() {
      return typeof root.Notification !== 'undefined';
    },

    /** Ask for permission once. Call this from a user action such as pressing Start. */
    requestPermission() {
      if (!this.supported()) return;
      if (root.Notification.permission === 'default') {
        try {
          root.Notification.requestPermission();
        } catch (err) {
          /* ignore */
        }
      }
    },

    notify(title, body) {
      if (!this.supported() || root.Notification.permission !== 'granted') return false;
      try {
        new root.Notification(title, { body: body, tag: 'pomodoro' });
        return true;
      } catch (err) {
        return false;
      }
    }
  };

  root.Pomodoro = root.Pomodoro || {};
  root.Pomodoro.Notifier = Notifier;
})(typeof window !== 'undefined' ? window : globalThis);