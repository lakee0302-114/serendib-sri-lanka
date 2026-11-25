/* ==========================================================================
   SERENDIB — Firebase Integration (Realtime Database & Analytics)
   Project: serendib-sri-lanka
   ========================================================================== */

(function () {
  'use strict';

  var FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDJlBSmevNyHz-ZZJkpEr8QvHmN1C_z02w',
    authDomain: 'serendib-sri-lanka.firebaseapp.com',
    databaseURL: 'https://serendib-sri-lanka-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'serendib-sri-lanka',
    storageBucket: 'serendib-sri-lanka.firebasestorage.app',
    messagingSenderId: '501618747136',
    appId: '1:501618747136:web:e5f86a02f076ac15dff5e5',
    measurementId: 'G-XF4CXBQ6G2'
  };

  var analyticsInstance = null;

  function initFirebase() {
    if (typeof window.firebase === 'undefined') return;
    try {
      if (!window.firebase.apps || !window.firebase.apps.length) {
        window.firebase.initializeApp(FIREBASE_CONFIG);
      }
      if (window.location.protocol.indexOf('http') === 0 && typeof window.firebase.analytics === 'function') {
        analyticsInstance = window.firebase.analytics();
      }
    } catch (e) {
      // Non-blocking: REST fallback remains active
    }
  }

  function saveInquiry(payload) {
    var cleanRef = String(payload.refCode || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleanRef) {
      return Promise.reject(new Error('Missing reference code'));
    }

    var record = {
      refCode: cleanRef,
      name: payload.name,
      email: payload.email,
      month: payload.month,
      guests: payload.guests || '',
      notes: payload.notes || '',
      stops: Array.isArray(payload.stops) ? payload.stops : [],
      lang: payload.lang || 'en',
      createdAt: payload.createdAt || new Date().toISOString(),
      source: window.location.hostname || 'local'
    };

    var sdkPromise = null;
    if (typeof window.firebase !== 'undefined' && typeof window.firebase.database === 'function') {
      try {
        initFirebase();
        sdkPromise = window.firebase.database().ref('inquiries/' + cleanRef).set(record);
      } catch (err) {
        sdkPromise = null;
      }
    }

    var persistPromise = sdkPromise || fetch(
      FIREBASE_CONFIG.databaseURL + '/inquiries/' + encodeURIComponent(cleanRef) + '.json',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      }
    ).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });

    return persistPromise.then(function () {
      logEvent('inquiry_submitted', { month: record.month, lang: record.lang, stops_count: record.stops.length });
      return { synced: true, refCode: cleanRef };
    });
  }

  function logEvent(eventName, params) {
    if (!analyticsInstance) return;
    try {
      analyticsInstance.logEvent(eventName, params || {});
    } catch (e) {}
  }

  initFirebase();

  window.SERENDIB_FIREBASE = {
    config: FIREBASE_CONFIG,
    saveInquiry: saveInquiry,
    logEvent: logEvent
  };
})();
