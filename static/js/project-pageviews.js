/**
 * Project page read counts via Firebase RTDB (path: pageviews/{slug}).
 * Increments once on every full page load (each navigation / refresh).
 * Requires firebase-app-compat + firebase-database-compat + initializeApp in page head.
 */
(function () {
  'use strict';

  function sanitizeSlug(slug) {
    if (!slug) return '';
    return String(slug).replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  function init() {
    var el = document.getElementById('ps-view-count');
    if (!el) return;

    var slug = sanitizeSlug(el.getAttribute('data-slug') || '');
    if (!slug) return;

    if (typeof firebase === 'undefined' || !firebase.database) {
      el.textContent = '—';
      return;
    }

    var db = firebase.database();
    var ref = db.ref('pageviews/' + slug);

    function renderCount(n) {
      if (typeof n === 'number' && !isNaN(n) && n >= 0) {
        el.textContent = String(n);
      } else {
        el.textContent = '0';
      }
    }

    ref.on(
      'value',
      function (snap) {
        var v = snap.val();
        if (v === null || v === undefined) {
          renderCount(0);
        } else if (typeof v === 'number') {
          renderCount(v);
        } else {
          el.textContent = '—';
        }
      },
      function () {
        el.textContent = '—';
      }
    );

    ref.transaction(function (current) {
      if (current === null || current === undefined) {
        return 1;
      }
      if (typeof current !== 'number' || isNaN(current)) {
        return 1;
      }
      return current + 1;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
