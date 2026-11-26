/* ==========================================================================
   SERENDIB — Firebase Integration (Realtime Database & Analytics)
   Project: serendib-sri-lanka
   ========================================================================== */

(function () {
  'use strict';

  var FIREBASE_CONFIG = Object.freeze({
    apiKey: 'AIzaSyDJlBSmevNyHz-ZZJkpEr8QvHmN1C_z02w',
    authDomain: 'serendib-sri-lanka.firebaseapp.com',
    databaseURL: 'https://serendib-sri-lanka-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'serendib-sri-lanka',
    storageBucket: 'serendib-sri-lanka.firebasestorage.app',
    messagingSenderId: '501618747136',
    appId: '1:501618747136:web:e5f86a02f076ac15dff5e5',
    measurementId: 'G-XF4CXBQ6G2'
  });

  var ALLOWED_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var analyticsInstance = null;

  function cleanText(val, maxLen, keepNewlines) {
    var str = String(val == null ? '' : val);
    str = keepNewlines
      ? str.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
      : str.replace(/[\u0000-\u001F\u007F]/g, ' ');
    str = str.trim();
    return str.length > maxLen ? str.slice(0, maxLen) : str;
  }

  function cleanStringArray(arr, maxItems, maxItemLen) {
    if (!Array.isArray(arr)) return [];
    var out = [];
    for (var i = 0; i < arr.length && out.length < maxItems; i++) {
      var item = cleanText(arr[i], maxItemLen, false);
      if (item) out.push(item);
    }
    return out;
  }

  function cleanPerStopNights(obj) {
    var clean = {};
    if (!obj || typeof obj !== 'object') return clean;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length && i < 25; i++) {
      var k = keys[i];
      if (!/^[a-z0-9-]{1,40}$/.test(k)) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var v = Number(obj[k]);
      if (Number.isFinite(v) && v >= 1 && v <= 14) {
        clean[k] = Math.round(v);
      }
    }
    return clean;
  }

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
    if (!payload || typeof payload !== 'object') {
      return Promise.reject(new Error('Invalid inquiry payload'));
    }

    var cleanRef = String(payload.refCode || '').replace(/[^A-Z0-9-]/g, '');
    if (!/^SRD-[A-Z0-9]{6,10}$/.test(cleanRef)) {
      return Promise.reject(new Error('Invalid reference code'));
    }

    var cleanName = cleanText(payload.name, 120, false);
    var cleanEmail = cleanText(payload.email, 160, false);
    if (!cleanName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return Promise.reject(new Error('Invalid contact details'));
    }

    var cleanMonth = String(payload.month || '').toUpperCase();
    if (ALLOWED_MONTHS.indexOf(cleanMonth) === -1) cleanMonth = 'FEB';

    var travelersNum = Number(payload.travelers);
    var nightsNum = Number(payload.nights);
    var transitNum = Number(payload.totalTransitMins);

    var record = {
      refCode: cleanRef,
      name: cleanName,
      email: cleanEmail,
      month: cleanMonth,
      tripStatus: payload.tripStatus === 'in_island' ? 'in_island' : 'before',
      startHub: cleanText(payload.startHub || 'cmbAirport', 32, false),
      arrivalDate: /^\d{4}-\d{2}-\d{2}$/.test(String(payload.arrivalDate || '')) ? payload.arrivalDate : '',
      departureDate: /^\d{4}-\d{2}-\d{2}$/.test(String(payload.departureDate || '')) ? payload.departureDate : '',
      guests: cleanText(payload.guests || '', 64, false),
      travelers: Number.isFinite(travelersNum) ? Math.min(30, Math.max(1, Math.round(travelersNum))) : null,
      nights: Number.isFinite(nightsNum) ? Math.min(60, Math.max(0, Math.round(nightsNum))) : null,
      stayTier: cleanText(payload.stayTier || '', 32, false),
      transport: cleanText(payload.transport || '', 32, false),
      foodPrefs: cleanStringArray(payload.foodPrefs, 12, 40),
      interests: cleanStringArray(payload.interests, 12, 40),
      perStopNights: cleanPerStopNights(payload.perStopNights),
      totalTransitMins: Number.isFinite(transitNum) ? Math.min(20000, Math.max(0, Math.round(transitNum))) : null,
      origin: cleanText(payload.origin || '', 120, false),
      notes: cleanText(payload.notes || '', 1000, true),
      stops: cleanStringArray(payload.stops, 25, 80),
      lang: /^[a-z]{2}$/.test(String(payload.lang || '')) ? payload.lang : 'en',
      createdAt: new Date().toISOString(),
      source: cleanText(window.location.hostname || 'local', 80, false)
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
      analyticsInstance.logEvent(cleanText(eventName, 40, false), params || {});
    } catch (e) {}
  }

  initFirebase();

  window.SERENDIB_FIREBASE = Object.freeze({
    saveInquiry: saveInquiry,
    logEvent: logEvent
  });
})();
