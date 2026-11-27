/* Serendib Travels - Firebase Realtime Database & Auth */

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

    var currentUser = getCurrentUser();
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
      stayTier: cleanText(payload.stayTier || '', 100, false),
      transport: cleanText(payload.transport || '', 100, false),
      foodPrefs: cleanStringArray(payload.foodPrefs, 15, 80),
      interests: cleanStringArray(payload.interests, 15, 80),
      perStopNights: cleanPerStopNights(payload.perStopNights),
      totalTransitMins: Number.isFinite(transitNum) ? Math.min(20000, Math.max(0, Math.round(transitNum))) : null,
      origin: cleanText(payload.origin || '', 120, false),
      notes: cleanText(payload.notes || '', 1000, true),
      stops: cleanStringArray(payload.stops, 25, 80),
      lang: /^[a-z]{2}$/.test(String(payload.lang || '')) ? payload.lang : 'en',
      createdAt: new Date().toISOString(),
      source: cleanText(window.location.hostname || 'local', 80, false)
    };
    if (currentUser && currentUser.uid) {
      record.userId = cleanText(currentUser.uid, 128, false);
    }

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

  function cleanCatalogOverrides(raw) {
    var out = {};
    if (!raw || typeof raw !== 'object') return out;
    var keys = Object.keys(raw);
    for (var i = 0; i < keys.length && i < 40; i++) {
      var id = keys[i];
      if (!/^[a-z0-9-]{2,40}$/.test(id) || !Object.prototype.hasOwnProperty.call(raw, id)) continue;
      var entry = raw[id];
      if (!entry || typeof entry !== 'object') continue;
      var nightsNum = Number(entry.idealNights);
      var priceNum = Number(entry.pricePerNightUsd);
      out[id] = {
        hidden: Boolean(entry.hidden),
        idealNights: Number.isFinite(nightsNum) && nightsNum >= 1 ? Math.min(14, Math.round(nightsNum)) : null,
        pricePerNightUsd: Number.isFinite(priceNum) && priceNum >= 0 ? Math.min(20000, Math.round(priceNum)) : 0,
        badge: cleanText(entry.badge || '', 36, false)
      };
    }
    return out;
  }

  function loadCatalogOverrides() {
    return fetch(FIREBASE_CONFIG.databaseURL + '/catalogOverrides.json', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) return {};
        return res.json();
      })
      .then(cleanCatalogOverrides)
      .catch(function () {
        return {};
      });
  }

  function getAuthInstance() {
    if (typeof window.firebase === 'undefined' || typeof window.firebase.auth !== 'function') {
      return null;
    }
    initFirebase();
    return window.firebase.auth();
  }

  function getCurrentUser() {
    var auth = getAuthInstance();
    return auth ? auth.currentUser : null;
  }

  function onAuthChange(cb) {
    var auth = getAuthInstance();
    if (!auth || typeof cb !== 'function') {
      return function () {};
    }
    return auth.onAuthStateChanged(cb);
  }

  function signInCustomer(email, password) {
    var auth = getAuthInstance();
    if (!auth) return Promise.reject(new Error('Authentication unavailable'));
    return auth.signInWithEmailAndPassword(cleanText(email, 160, false), String(password || ''));
  }

  function registerCustomer(name, email, password) {
    var auth = getAuthInstance();
    if (!auth) return Promise.reject(new Error('Authentication unavailable'));
    var cleanName = cleanText(name, 120, false);
    return auth.createUserWithEmailAndPassword(cleanText(email, 160, false), String(password || '')).then(function (cred) {
      if (cleanName && cred && cred.user && typeof cred.user.updateProfile === 'function') {
        return cred.user.updateProfile({ displayName: cleanName }).then(function () { return cred; }).catch(function () { return cred; });
      }
      return cred;
    });
  }

  function sendPasswordReset(email) {
    var auth = getAuthInstance();
    if (!auth) return Promise.reject(new Error('Authentication unavailable'));
    return auth.sendPasswordResetEmail(cleanText(email, 160, false));
  }

  function signOutCustomer() {
    var auth = getAuthInstance();
    if (!auth) return Promise.resolve();
    return auth.signOut();
  }

  function cleanScheduleItems(arr) {
    if (!Array.isArray(arr)) return [];
    var out = [];
    for (var i = 0; i < arr.length && i < 20; i++) {
      var item = arr[i];
      if (!item || typeof item !== 'object') continue;
      var n = Number(item.nights);
      out.push({
        stopId: cleanText(item.stopId || '', 40, false),
        stopName: cleanText(item.stopName || '', 80, false),
        dayRange: cleanText(item.dayRange || '', 32, false),
        nights: Number.isFinite(n) ? Math.min(14, Math.max(1, Math.round(n))) : 1,
        legText: cleanText(item.legText || '', 140, false),
        highlight: cleanText(item.highlight || '', 160, false),
        diningSpot: cleanText(item.diningSpot || '', 80, false),
        diningDetail: cleanText(item.diningDetail || '', 160, false)
      });
    }
    return out;
  }

  function saveUserTrip(payload) {
    var user = getCurrentUser();
    if (!user || !user.uid) return Promise.reject(new Error('Not signed in'));
    if (!payload || typeof payload !== 'object') return Promise.reject(new Error('Invalid trip payload'));

    var cleanRef = String(payload.refCode || '').replace(/[^A-Z0-9-]/g, '');
    if (!/^SRD-[A-Z0-9]{6,10}$/.test(cleanRef)) return Promise.reject(new Error('Invalid reference code'));

    var cleanMonth = String(payload.month || '').toUpperCase();
    if (ALLOWED_MONTHS.indexOf(cleanMonth) === -1) cleanMonth = 'FEB';

    var travelersNum = Number(payload.travelers);
    var nightsNum = Number(payload.nights);
    var transitNum = Number(payload.totalTransitMins);

    var tripRecord = {
      refCode: cleanRef,
      name: cleanText(payload.name || user.displayName || 'Guest', 120, false),
      email: cleanText(payload.email || user.email || '', 160, false),
      month: cleanMonth,
      tripStatus: payload.tripStatus === 'in_island' ? 'in_island' : 'before',
      startHub: cleanText(payload.startHub || 'cmbAirport', 32, false),
      arrivalDate: /^\d{4}-\d{2}-\d{2}$/.test(String(payload.arrivalDate || '')) ? payload.arrivalDate : '',
      departureDate: /^\d{4}-\d{2}-\d{2}$/.test(String(payload.departureDate || '')) ? payload.departureDate : '',
      travelers: Number.isFinite(travelersNum) ? Math.min(30, Math.max(1, Math.round(travelersNum))) : 2,
      nights: Number.isFinite(nightsNum) ? Math.min(60, Math.max(0, Math.round(nightsNum))) : 0,
      stayTier: cleanText(payload.stayTier || 'boutique', 100, false),
      stayDisplay: cleanText(payload.stayDisplay || '', 100, false),
      customStay: cleanText(payload.customStay || '', 80, false),
      transport: cleanText(payload.transport || 'chauffeur', 100, false),
      transportDisplay: cleanText(payload.transportDisplay || '', 100, false),
      customTransport: cleanText(payload.customTransport || '', 80, false),
      foodPrefs: cleanStringArray(payload.foodPrefs, 15, 80),
      foodOther: cleanText(payload.foodOther || '', 80, false),
      interests: cleanStringArray(payload.interests, 15, 80),
      interestOther: cleanText(payload.interestOther || '', 80, false),
      perStopNights: cleanPerStopNights(payload.perStopNights),
      stopIds: cleanStringArray(payload.stopIds, 25, 40),
      stops: cleanStringArray(payload.stops, 25, 80),
      totalTransitMins: Number.isFinite(transitNum) ? Math.min(20000, Math.max(0, Math.round(transitNum))) : 0,
      origin: cleanText(payload.origin || '', 120, false),
      notes: cleanText(payload.notes || '', 1000, true),
      schedule: cleanScheduleItems(payload.schedule),
      createdAt: payload.createdAt && String(payload.createdAt).length <= 40 ? String(payload.createdAt) : new Date().toISOString()
    };

    if (typeof window.firebase === 'undefined' || typeof window.firebase.database !== 'function') {
      return Promise.reject(new Error('Database unavailable'));
    }
    initFirebase();
    return window.firebase.database().ref('userTrips/' + user.uid + '/' + cleanRef).set(tripRecord).then(function () {
      return tripRecord;
    });
  }

  function loadUserTrips() {
    var user = getCurrentUser();
    if (!user || !user.uid) return Promise.resolve([]);
    if (typeof window.firebase === 'undefined' || typeof window.firebase.database !== 'function') {
      return Promise.reject(new Error('Database unavailable'));
    }
    initFirebase();
    return window.firebase.database().ref('userTrips/' + user.uid).once('value').then(function (snap) {
      var raw = snap.val() || {};
      var list = [];
      Object.keys(raw).forEach(function (k) {
        if (raw[k] && typeof raw[k] === 'object') {
          list.push(raw[k]);
        }
      });
      list.sort(function (a, b) {
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      });
      return list;
    });
  }

  function deleteUserTrip(refCode) {
    var user = getCurrentUser();
    var cleanRef = String(refCode || '').replace(/[^A-Z0-9-]/g, '');
    if (!user || !user.uid || !/^SRD-[A-Z0-9]{6,10}$/.test(cleanRef)) {
      return Promise.reject(new Error('Invalid trip deletion request'));
    }
    initFirebase();
    return window.firebase.database().ref('userTrips/' + user.uid + '/' + cleanRef).remove();
  }

  function logEvent(eventName, params) {
    if (!analyticsInstance) return;
    try {
      analyticsInstance.logEvent(cleanText(eventName, 40, false), params || {});
    } catch (e) {}
  }

  initFirebase();

  window.SERENDIB_FIREBASE = Object.freeze({
    ensureInitialized: initFirebase,
    saveInquiry: saveInquiry,
    loadCatalogOverrides: loadCatalogOverrides,
    getCurrentUser: getCurrentUser,
    onAuthChange: onAuthChange,
    signInCustomer: signInCustomer,
    registerCustomer: registerCustomer,
    sendPasswordReset: sendPasswordReset,
    signOutCustomer: signOutCustomer,
    saveUserTrip: saveUserTrip,
    loadUserTrips: loadUserTrips,
    deleteUserTrip: deleteUserTrip,
    logEvent: logEvent
  });
})();
