/* Serendib Travels - Staff Admin Portal */

(function () {
  'use strict';

  var ALLOWED_ADMIN_USERNAME = 'lakee1121';
  var ALLOWED_ADMIN_EMAIL = 'lakditha2008@gmail.com';
  var STATUS_LIST = ['new', 'contacted', 'confirmed', 'archived'];
  var META_LIST = (window.SERENDIB_DATA && window.SERENDIB_DATA.DESTINATIONS_META) || [];

  var SVG_ICONS = {
    moon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
  };

  var state = {
    theme: document.documentElement.getAttribute('data-theme') || 'light',
    user: null,
    activeTab: 'inquiries',
    inquiries: [],
    catalogOverrides: {},
    activeInquiryRef: null,
    pendingDeleteRef: null,
    inquiriesRef: null,
    inquiriesHandler: null,
    toastTimer: null
  };

  var dom = {};

  function el(id) {
    return document.getElementById(id);
  }

  function escapeHtml(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg;
    dom.toast.classList.add('is-shown');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () {
      dom.toast.classList.remove('is-shown');
    }, 3200);
  }

  function syncThemeUI() {
    var isDark = state.theme === 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    if (dom.metaThemeColor) {
      dom.metaThemeColor.setAttribute('content', isDark ? '#07151D' : '#FFFFFF');
    }
    if (dom.themeIcon) dom.themeIcon.innerHTML = isDark ? SVG_ICONS.sun : SVG_ICONS.moon;
    if (dom.themeLabel) dom.themeLabel.textContent = isDark ? 'Light' : 'Dark';
    if (dom.themeToggle) dom.themeToggle.setAttribute('aria-pressed', String(isDark));
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('serendib_theme_v1', state.theme);
    } catch (e) {}
    syncThemeUI();
  }

  function formatDestName(destId) {
    for (var i = 0; i < META_LIST.length; i++) {
      if (META_LIST[i].id === destId) {
        return META_LIST[i].id.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      }
    }
    return String(destId || '').replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(isoStr).slice(0, 10);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function showAlert(target, msg) {
    if (!target) return;
    target.textContent = msg || '';
    target.hidden = !msg;
  }

  function setViewGate(mode) {
    dom.authLoading.hidden = mode !== 'loading';
    dom.loginGate.hidden = mode !== 'login';
    dom.verifyGate.hidden = mode !== 'verify';
    dom.dashboard.hidden = mode !== 'dashboard';

    var signedInDash = mode === 'dashboard';
    dom.userPill.hidden = !signedInDash;
    dom.publicLink.hidden = !signedInDash;
    if (dom.changePwBtn) dom.changePwBtn.hidden = !signedInDash;
    dom.logoutBtn.hidden = !signedInDash;
  }

  function getFirebaseAuth() {
    if (typeof window.firebase === 'undefined' || typeof window.firebase.auth !== 'function') {
      return null;
    }
    if ((!window.firebase.apps || !window.firebase.apps.length) && window.SERENDIB_FIREBASE && typeof window.SERENDIB_FIREBASE.ensureInitialized === 'function') {
      window.SERENDIB_FIREBASE.ensureInitialized();
    }
    return window.firebase.auth();
  }

  function getFirebaseDb() {
    if (typeof window.firebase === 'undefined' || typeof window.firebase.database !== 'function') {
      return null;
    }
    return window.firebase.database();
  }

  function friendlyAuthError(err) {
    var code = (err && err.code) || '';
    if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
      return 'Email/Password sign-in is not enabled yet in Firebase Console (Authentication -> Sign-in method -> Email/Password).';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Incorrect username or password. Please check your credentials.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please wait a few minutes or reset your password.';
    }
    if (code === 'auth/weak-password') {
      return 'Password must be at least 8 characters long.';
    }
    return (err && err.message) || 'Sign-in failed. Please try again.';
  }

  /* ------------------------------------------------------------------------
     Firebase Realtime Data Listeners
     ------------------------------------------------------------------------ */
  function detachRealtimeListeners() {
    if (state.inquiriesRef && state.inquiriesHandler) {
      state.inquiriesRef.off('value', state.inquiriesHandler);
    }
    state.inquiriesRef = null;
    state.inquiriesHandler = null;
  }

  function loadStudioData() {
    var db = getFirebaseDb();
    if (!db) {
      showToast('Firebase Database SDK unavailable.');
      return;
    }
    dom.syncLabel.textContent = 'SYNCING...';

    detachRealtimeListeners();
    var ref = db.ref('inquiries');
    var handler = function (snapshot) {
      var raw = snapshot.val() || {};
      var list = [];
      Object.keys(raw).forEach(function (k) {
        if (raw[k] && typeof raw[k] === 'object') {
          list.push(Object.assign({ _key: k }, raw[k]));
        }
      });
      list.sort(function (a, b) {
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      });
      state.inquiries = list;
      dom.syncLabel.textContent = 'LIVE SYNC';
      renderDashboardMetrics();
      renderInquiriesTable();
    };
    state.inquiriesRef = ref;
    state.inquiriesHandler = handler;
    ref.on('value', handler, function (err) {
      dom.syncLabel.textContent = 'ACCESS DENIED';
      showToast(err && err.message ? err.message : 'Unable to read inquiries.');
    });

    db.ref('catalogOverrides').once('value').then(function (snap) {
      state.catalogOverrides = snap.val() || {};
      renderDashboardMetrics();
      renderCatalogGrid();
    }).catch(function () {
      showToast('Could not load catalog overrides.');
    });
  }

  /* ------------------------------------------------------------------------
     KPIs & Inquiries Table
     ------------------------------------------------------------------------ */
  function renderDashboardMetrics() {
    var list = state.inquiries;
    var newCount = 0;
    var confirmedCount = 0;
    var quotedSum = 0;
    var monthCounts = {};

    list.forEach(function (item) {
      var st = item.adminStatus || 'new';
      if (st === 'new') newCount++;
      if (st === 'confirmed') confirmedCount++;
      if (Number.isFinite(Number(item.quotedPriceUsd)) && Number(item.quotedPriceUsd) > 0) {
        quotedSum += Number(item.quotedPriceUsd);
      }
      var m = item.month || '';
      if (m) monthCounts[m] = (monthCounts[m] || 0) + 1;
    });

    var topMonth = '—';
    var topCount = 0;
    Object.keys(monthCounts).forEach(function (m) {
      if (monthCounts[m] > topCount) {
        topCount = monthCounts[m];
        topMonth = m;
      }
    });

    var activeDest = 0;
    var pricedDest = 0;
    META_LIST.forEach(function (meta) {
      var ov = state.catalogOverrides[meta.id] || {};
      if (!ov.hidden) activeDest++;
      if (Number(ov.pricePerNightUsd) > 0) pricedDest++;
    });

    dom.kpiTotal.textContent = String(list.length);
    dom.kpiNew.textContent = newCount + ' new';
    dom.kpiConfirmed.textContent = String(confirmedCount);
    dom.kpiQuoted.textContent = '$' + quotedSum.toLocaleString('en-US') + ' quoted';
    dom.kpiTopMonth.textContent = topMonth;
    dom.kpiTopMonthCount.textContent = topCount + ' requests';
    dom.kpiActiveDest.textContent = activeDest + ' / ' + META_LIST.length;
    dom.kpiPricedDest.textContent = pricedDest + ' priced';
    dom.tabBadgeInq.textContent = String(list.length);
    dom.tabBadgeCat.textContent = String(META_LIST.length);
  }

  function getFilteredInquiries() {
    var q = (dom.inqSearch.value || '').trim().toLowerCase();
    var statusFilter = dom.inqStatusFilter.value;
    var monthFilter = dom.inqMonthFilter.value;

    return state.inquiries.filter(function (item) {
      var st = STATUS_LIST.indexOf(item.adminStatus) !== -1 ? item.adminStatus : 'new';
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (monthFilter !== 'ALL' && item.month !== monthFilter) return false;
      if (!q) return true;
      var haystack = [
        item.refCode,
        item.name,
        item.email,
        item.origin,
        item.notes,
        item.adminNote,
        Array.isArray(item.stops) ? item.stops.join(' ') : ''
      ].join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
  }

  function renderInquiriesTable() {
    var rows = getFilteredInquiries();
    dom.inqEmpty.hidden = rows.length > 0;
    dom.inqTableWrap.hidden = rows.length === 0;

    if (!rows.length) {
      dom.inqTableBody.innerHTML = '';
      return;
    }

    dom.inqTableBody.innerHTML = rows.map(function (item) {
      var ref = item.refCode || item._key;
      var status = STATUS_LIST.indexOf(item.adminStatus) !== -1 ? item.adminStatus : 'new';
      var stopsText = Array.isArray(item.stops) && item.stops.length
        ? item.stops.map(formatDestName).join(' -> ')
        : 'Flexible route';
      var schedule = (item.month || 'FEB') +
        (item.nights != null ? ' · ' + item.nights + 'N' : '') +
        (item.travelers != null ? ' · ' + item.travelers + ' pax' : '');
      var quoteHtml = Number(item.quotedPriceUsd) > 0
        ? '<span class="quote-tag">$' + Number(item.quotedPriceUsd).toLocaleString('en-US') + '</span>'
        : '';

      return (
        '<tr>' +
        '<td><span class="ref-code">' + escapeHtml(ref) + '</span><span class="meta-sub">' + escapeHtml(formatDate(item.createdAt)) + '</span></td>' +
        '<td><span class="guest-name">' + escapeHtml(item.name) + '</span><span class="meta-sub">' + escapeHtml(item.email) + (item.origin ? ' · ' + escapeHtml(item.origin) : '') + '</span></td>' +
        '<td><span>' + escapeHtml(schedule) + '</span>' + (item.arrivalDate ? '<span class="meta-sub">' + escapeHtml(item.arrivalDate) + '</span>' : '') + '</td>' +
        '<td><div class="stops-summary">' + escapeHtml(stopsText) + '</div></td>' +
        '<td><span class="status-pill status-pill--' + escapeHtml(status) + '">' + escapeHtml(status) + '</span>' + (quoteHtml ? '<br>' + quoteHtml : '') + '</td>' +
        '<td class="td-actions"><button type="button" class="admin-ghost-btn" data-inspect-ref="' + escapeHtml(ref) + '">Manage</button><button type="button" class="admin-danger-btn" data-quick-delete="' + escapeHtml(item._key || ref) + '">Delete</button></td>' +
        '</tr>'
      );
    }).join('');

    dom.inqTableBody.querySelectorAll('[data-inspect-ref]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openInquiryModal(btn.dataset.inspectRef);
      });
    });

    dom.inqTableBody.querySelectorAll('[data-quick-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        requestDeleteInquiry(btn.dataset.quickDelete);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Inquiry Modal & Delete Confirmation
     ------------------------------------------------------------------------ */
  function findInquiry(ref) {
    for (var i = 0; i < state.inquiries.length; i++) {
      if (state.inquiries[i].refCode === ref || state.inquiries[i]._key === ref) {
        return state.inquiries[i];
      }
    }
    return null;
  }

  function openInquiryModal(ref) {
    var item = findInquiry(ref);
    if (!item) return;
    state.activeInquiryRef = ref;

    dom.modalCreated.textContent = 'SUBMITTED ' + formatDate(item.createdAt) + (item.lang ? ' · ' + String(item.lang).toUpperCase() : '');
    dom.modalTitle.textContent = ref;

    var specs = [
      ['Guest Name', escapeHtml(item.name)],
      ['Email', '<a href="mailto:' + escapeHtml(item.email) + '">' + escapeHtml(item.email) + '</a>'],
      ['Origin', escapeHtml(item.origin || '—')],
      ['Month & Dates', escapeHtml(item.month + (item.arrivalDate ? ' (' + item.arrivalDate + (item.departureDate ? ' to ' + item.departureDate : '') + ')' : ''))],
      ['Arrival Status', escapeHtml(item.tripStatus === 'in_island' ? 'Already in Sri Lanka' : 'Before Arrival')],
      ['Start Hub', escapeHtml(formatDestName(item.startHub || 'cmbAirport'))],
      ['Guests / Nights', escapeHtml((item.travelers || item.guests || '—') + ' guests · ' + (item.nights != null ? item.nights + ' nights' : '—'))],
      ['Stay Tier', escapeHtml(item.stayTier || '—')],
      ['Transport', escapeHtml(item.transport || '—')],
      ['Food & Focus', escapeHtml([].concat(item.foodPrefs || [], item.interests || []).join(', ') || '—')]
    ];

    dom.modalSpecs.innerHTML = specs.map(function (row) {
      return '<dt>' + row[0] + '</dt><dd>' + row[1] + '</dd>';
    }).join('');

    var stops = Array.isArray(item.stops) ? item.stops : [];
    var nightsMap = item.perStopNights || {};
    dom.modalStops.innerHTML = stops.length
      ? stops.map(function (id, idx) {
          var n = nightsMap[id];
          return '<li>' + (idx + 1) + '. ' + escapeHtml(formatDestName(id)) + (n ? ' (' + escapeHtml(n) + 'N)' : '') + '</li>';
        }).join('')
      : '<li>No fixed stops picked</li>';

    dom.modalNotes.textContent = item.notes || 'No extra guest notes.';

    dom.editStatus.value = STATUS_LIST.indexOf(item.adminStatus) !== -1 ? item.adminStatus : 'new';
    dom.editQuote.value = item.quotedPriceUsd != null ? String(item.quotedPriceUsd) : '';
    dom.editAdminNote.value = item.adminNote || '';

    dom.inquiryModal.hidden = false;
  }

  function closeInquiryModal() {
    dom.inquiryModal.hidden = true;
    state.activeInquiryRef = null;
  }

  function saveInquiryChanges(e) {
    e.preventDefault();
    var ref = state.activeInquiryRef;
    var db = getFirebaseDb();
    if (!ref || !db) return;
    var item = findInquiry(ref);
    var dbKey = (item && item._key) ? item._key : ref;

    var status = dom.editStatus.value;
    if (STATUS_LIST.indexOf(status) === -1) status = 'new';

    var rawQuote = dom.editQuote.value.trim();
    var patch = {
      adminStatus: status,
      adminNote: dom.editAdminNote.value.trim().slice(0, 1000)
    };
    if (rawQuote !== '') {
      var qNum = Number(rawQuote);
      if (!Number.isFinite(qNum) || qNum < 0 || qNum > 100000) {
        showToast('Quote must be between 0 and 100,000 USD.');
        return;
      }
      patch.quotedPriceUsd = Math.round(qNum);
    } else {
      patch.quotedPriceUsd = null;
    }

    dom.modalSaveBtn.disabled = true;
    db.ref('inquiries/' + dbKey).update(patch).then(function () {
      showToast('Updated ' + ref);
      closeInquiryModal();
    }).catch(function (err) {
      showToast(err && err.message ? err.message : 'Save failed.');
    }).finally(function () {
      dom.modalSaveBtn.disabled = false;
    });
  }

  function copyReplyDraft() {
    var item = findInquiry(state.activeInquiryRef);
    if (!item) return;
    var stopsLine = Array.isArray(item.stops) && item.stops.length
      ? item.stops.map(formatDestName).join(' -> ')
      : 'Custom Sri Lanka Route';
    var quoteVal = dom.editQuote.value.trim();
    var text = [
      'Ayubowan ' + item.name + ',',
      '',
      'Thank you for your Serendib Sri Lanka inquiry (' + item.refCode + ') for ' + item.month + '.',
      'Proposed route: ' + stopsLine,
      item.nights != null ? 'Duration: ' + item.nights + ' nights / ' + (item.travelers || 2) + ' guests' : '',
      quoteVal ? 'Estimated package guide: USD ' + Number(quoteVal).toLocaleString('en-US') : '',
      '',
      'Warm regards,',
      'Serendib Travel Desk'
    ].filter(Boolean).join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Reply draft copied.');
      }).catch(function () {
        showToast('Clipboard permission denied.');
      });
    } else {
      showToast('Clipboard not supported here.');
    }
  }

  function requestDeleteInquiry(ref) {
    state.pendingDeleteRef = ref;
    dom.confirmCopy.textContent = 'Permanently delete inquiry ' + ref + ' from Firebase? This cannot be undone.';
    dom.confirmModal.hidden = false;
  }

  function executeDeleteInquiry() {
    var ref = state.pendingDeleteRef;
    var db = getFirebaseDb();
    if (!ref || !db) return;
    var item = findInquiry(ref);
    var dbKey = (item && item._key) ? item._key : ref;

    dom.acceptConfirmBtn.disabled = true;
    db.ref('inquiries/' + dbKey).remove().then(function () {
      showToast('Deleted ' + ref);
      dom.confirmModal.hidden = true;
      state.pendingDeleteRef = null;
      if (state.activeInquiryRef === ref || (item && item.refCode === state.activeInquiryRef)) {
        closeInquiryModal();
      }
    }).catch(function (err) {
      showToast(err && err.message ? err.message : 'Delete failed.');
    }).finally(function () {
      dom.acceptConfirmBtn.disabled = false;
    });
  }

  function csvSafeCell(val) {
    var str = String(val == null ? '' : val).replace(/\r?\n/g, ' ');
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    return '"' + str.replace(/"/g, '""') + '"';
  }

  function exportFilteredCsv() {
    var rows = getFilteredInquiries();
    if (!rows.length) {
      showToast('No inquiries match current filters.');
      return;
    }
    var headers = ['RefCode', 'Status', 'CreatedAt', 'Name', 'Email', 'Origin', 'Month', 'Travelers', 'Nights', 'StayTier', 'Transport', 'Stops', 'QuotedUSD', 'AdminNote', 'GuestNotes'];
    var lines = [headers.join(',')];
    rows.forEach(function (item) {
      lines.push([
        item.refCode || item._key,
        item.adminStatus || 'new',
        item.createdAt || '',
        item.name || '',
        item.email || '',
        item.origin || '',
        item.month || '',
        item.travelers != null ? item.travelers : '',
        item.nights != null ? item.nights : '',
        item.stayTier || '',
        item.transport || '',
        Array.isArray(item.stops) ? item.stops.join(' | ') : '',
        item.quotedPriceUsd != null ? item.quotedPriceUsd : '',
        item.adminNote || '',
        item.notes || ''
      ].map(csvSafeCell).join(','));
    });

    var blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'serendib-inquiries-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported ' + rows.length + ' inquiries.');
  }

  /* ------------------------------------------------------------------------
     Destinations & Pricing CMS
     ------------------------------------------------------------------------ */
  function renderCatalogGrid() {
    var q = (dom.catSearch.value || '').trim().toLowerCase();
    var reg = dom.catRegionFilter.value;

    var items = META_LIST.filter(function (meta) {
      if (reg !== 'all' && meta.regionKey !== reg) return false;
      if (!q) return true;
      var ov = state.catalogOverrides[meta.id] || {};
      var hay = [meta.id, meta.sinhala, meta.regionKey, ov.badge || ''].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    dom.catalogGrid.innerHTML = items.map(function (meta) {
      var ov = state.catalogOverrides[meta.id] || {};
      var hidden = Boolean(ov.hidden);
      var nights = Number.isFinite(Number(ov.idealNights)) ? Number(ov.idealNights) : meta.idealNights;
      var price = Number.isFinite(Number(ov.pricePerNightUsd)) ? Number(ov.pricePerNightUsd) : 0;
      var badge = ov.badge || '';

      return (
        '<article class="cms-card ' + (hidden ? 'is-hidden-stop' : '') + '" data-cms-id="' + escapeHtml(meta.id) + '">' +
        '<div class="cms-card__top">' +
        '<img class="cms-card__thumb" src="' + escapeHtml(meta.image) + '" alt="' + escapeHtml(formatDestName(meta.id)) + '" loading="lazy" />' +
        '<div class="cms-card__info">' +
        '<span class="mono-label">' + escapeHtml(meta.number) + ' · ' + escapeHtml(meta.regionKey) + '</span>' +
        '<h3 class="cms-card__title">' + escapeHtml(formatDestName(meta.id)) + '</h3>' +
        '<span class="meta-sub">' + escapeHtml(meta.sinhala) + '</span>' +
        '</div></div>' +
        '<form class="cms-card__form" data-cms-form="' + escapeHtml(meta.id) + '">' +
        '<label class="cms-toggle-row">' +
        '<span>Visible on Public Site</span>' +
        '<input type="checkbox" name="visible" ' + (!hidden ? 'checked' : '') + ' />' +
        '</label>' +
        '<div class="cms-fields-row">' +
        '<div class="field-group"><label class="field-label">Nights (1-14)</label>' +
        '<input type="number" name="idealNights" class="field-input" min="1" max="14" value="' + escapeHtml(nights) + '" required /></div>' +
        '<div class="field-group"><label class="field-label">USD / Night</label>' +
        '<input type="number" name="pricePerNightUsd" class="field-input" min="0" max="20000" step="10" value="' + escapeHtml(price) + '" /></div>' +
        '</div>' +
        '<div class="field-group"><label class="field-label">Promo Badge (max 36 chars)</label>' +
        '<input type="text" name="badge" class="field-input" maxlength="36" placeholder="e.g. Peak Season" value="' + escapeHtml(badge) + '" /></div>' +
        '<div class="cms-card__actions">' +
        '<button type="submit" class="btn-primary-admin">Save Stop</button>' +
        '<button type="button" class="admin-ghost-btn" data-cms-reset="' + escapeHtml(meta.id) + '">Reset</button>' +
        '</div></form></article>'
      );
    }).join('');

    dom.catalogGrid.querySelectorAll('[data-cms-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveCatalogStop(form.dataset.cmsForm, form);
      });
    });

    dom.catalogGrid.querySelectorAll('[data-cms-reset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        resetCatalogStop(btn.dataset.cmsReset);
      });
    });
  }

  function saveCatalogStop(destId, form) {
    var db = getFirebaseDb();
    if (!db) return;

    var visible = form.elements.visible.checked;
    var nights = Math.min(14, Math.max(1, Math.round(Number(form.elements.idealNights.value) || 1)));
    var priceRaw = Number(form.elements.pricePerNightUsd.value);
    var price = Number.isFinite(priceRaw) ? Math.min(20000, Math.max(0, Math.round(priceRaw))) : 0;
    var badge = form.elements.badge.value.trim().slice(0, 36);

    var payload = {
      hidden: !visible,
      idealNights: nights,
      pricePerNightUsd: price,
      badge: badge
    };

    db.ref('catalogOverrides/' + destId).set(payload).then(function () {
      state.catalogOverrides[destId] = payload;
      renderDashboardMetrics();
      renderCatalogGrid();
      showToast('Saved changes for ' + formatDestName(destId));
    }).catch(function (err) {
      showToast(err && err.message ? err.message : 'Save failed.');
    });
  }

  function resetCatalogStop(destId) {
    var db = getFirebaseDb();
    if (!db) return;
    db.ref('catalogOverrides/' + destId).remove().then(function () {
      delete state.catalogOverrides[destId];
      renderDashboardMetrics();
      renderCatalogGrid();
      showToast('Reset ' + formatDestName(destId) + ' to defaults.');
    }).catch(function (err) {
      showToast(err && err.message ? err.message : 'Reset failed.');
    });
  }

  /* ------------------------------------------------------------------------
     Tabs & Auth Actions
     ------------------------------------------------------------------------ */
  function switchTab(tabName) {
    state.activeTab = tabName;
    var isInq = tabName === 'inquiries';
    dom.tabBtnInq.classList.toggle('is-active', isInq);
    dom.tabBtnInq.setAttribute('aria-selected', String(isInq));
    dom.panelInq.hidden = !isInq;

    dom.tabBtnCat.classList.toggle('is-active', !isInq);
    dom.tabBtnCat.setAttribute('aria-selected', String(!isInq));
    dom.panelCat.hidden = isInq;
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    var auth = getFirebaseAuth();
    if (!auth) {
      showAlert(dom.loginError, 'Firebase Authentication SDK failed to load.');
      return;
    }

    var username = dom.loginUsername.value.trim().toLowerCase();
    var password = dom.loginPassword.value;
    showAlert(dom.loginError, '');
    showAlert(dom.loginNotice, '');

    if (!username) {
      showAlert(dom.loginError, 'Please enter your username.');
      return;
    }
    if (username !== ALLOWED_ADMIN_USERNAME) {
      showAlert(dom.loginError, 'Invalid administrator username. Access denied.');
      return;
    }
    if (!password) {
      showAlert(dom.loginError, 'Please enter your password.');
      return;
    }

    dom.loginSubmit.disabled = true;
    auth.signInWithEmailAndPassword(ALLOWED_ADMIN_EMAIL, password).catch(function (err) {
      showAlert(dom.loginError, friendlyAuthError(err));
    }).finally(function () {
      dom.loginSubmit.disabled = false;
    });
  }

  function handleForgotPassword() {
    var auth = getFirebaseAuth();
    if (!auth) return;
    showAlert(dom.loginError, '');
    showAlert(dom.loginNotice, '');

    auth.sendPasswordResetEmail(ALLOWED_ADMIN_EMAIL).then(function () {
      showAlert(dom.loginNotice, 'Password reset link sent to your registered admin recovery mailbox. Check Inbox & Spam.');
    }).catch(function (err) {
      showAlert(dom.loginError, friendlyAuthError(err));
    });
  }

  function openPasswordModal() {
    if (!dom.passwordModal) return;
    dom.changePwForm.reset();
    showAlert(dom.pwError, '');
    dom.passwordModal.hidden = false;
    if (dom.pwCurrent) dom.pwCurrent.focus();
  }

  function closePasswordModal() {
    if (dom.passwordModal) dom.passwordModal.hidden = true;
  }

  function handleChangePasswordSubmit(e) {
    e.preventDefault();
    var auth = getFirebaseAuth();
    var user = auth && auth.currentUser;
    if (!user) return;

    var cur = dom.pwCurrent.value;
    var next = dom.pwNew.value;
    var conf = dom.pwConfirm.value;
    showAlert(dom.pwError, '');

    if (!cur) {
      showAlert(dom.pwError, 'Please enter your current password.');
      return;
    }
    if (next.length < 8) {
      showAlert(dom.pwError, 'New password must be at least 8 characters.');
      return;
    }
    if (next !== conf) {
      showAlert(dom.pwError, 'New passwords do not match.');
      return;
    }

    dom.savePwBtn.disabled = true;
    var cred = window.firebase.auth.EmailAuthProvider.credential(user.email, cur);
    user.reauthenticateWithCredential(cred).then(function () {
      return user.updatePassword(next);
    }).then(function () {
      closePasswordModal();
      showToast('Admin password updated successfully.');
    }).catch(function (err) {
      showAlert(dom.pwError, friendlyAuthError(err));
    }).finally(function () {
      dom.savePwBtn.disabled = false;
    });
  }

  function init() {
    dom = {
      metaThemeColor: el('meta-theme-color'),
      themeToggle: el('admin-theme-toggle'),
      themeIcon: el('admin-theme-icon'),
      themeLabel: el('admin-theme-label'),
      userPill: el('admin-user-pill'),
      userEmail: el('admin-user-email'),
      publicLink: el('admin-public-link'),
      changePwBtn: el('admin-change-pw-btn'),
      logoutBtn: el('admin-logout-btn'),
      authLoading: el('auth-loading'),
      loginGate: el('login-gate'),
      loginForm: el('admin-login-form'),
      loginUsername: el('login-username'),
      loginPassword: el('login-password'),
      togglePwBtn: el('toggle-password-btn'),
      forgotPwBtn: el('forgot-password-btn'),
      loginError: el('login-error'),
      loginNotice: el('login-notice'),
      loginSubmit: el('login-submit-btn'),
      verifyGate: el('verify-gate'),
      verifyEmailLabel: el('verify-email-label'),
      verifyError: el('verify-error'),
      verifyNotice: el('verify-notice'),
      sendVerifyBtn: el('send-verify-btn'),
      reloadVerifyBtn: el('reload-verify-btn'),
      verifySignoutBtn: el('verify-signout-btn'),
      dashboard: el('admin-dashboard'),
      kpiTotal: el('kpi-total-inquiries'),
      kpiNew: el('kpi-new-count'),
      kpiConfirmed: el('kpi-confirmed-count'),
      kpiQuoted: el('kpi-quoted-total'),
      kpiTopMonth: el('kpi-top-month'),
      kpiTopMonthCount: el('kpi-top-month-count'),
      kpiActiveDest: el('kpi-active-dest'),
      kpiPricedDest: el('kpi-priced-dest'),
      tabBtnInq: el('tab-btn-inquiries'),
      tabBtnCat: el('tab-btn-catalog'),
      tabBadgeInq: el('tab-badge-inquiries'),
      tabBadgeCat: el('tab-badge-catalog'),
      syncLabel: el('sync-status-label'),
      refreshBtn: el('refresh-data-btn'),
      panelInq: el('panel-inquiries'),
      panelCat: el('panel-catalog'),
      inqSearch: el('inq-search-input'),
      inqStatusFilter: el('inq-status-filter'),
      inqMonthFilter: el('inq-month-filter'),
      exportCsvBtn: el('export-csv-btn'),
      inqEmpty: el('inq-empty-state'),
      inqTableWrap: el('inq-table-wrap'),
      inqTableBody: el('inq-table-body'),
      catSearch: el('cat-search-input'),
      catRegionFilter: el('cat-region-filter'),
      catalogGrid: el('catalog-grid'),
      inquiryModal: el('inquiry-modal'),
      closeModalBtn: el('close-inquiry-modal-btn'),
      modalCreated: el('modal-created-label'),
      modalTitle: el('modal-ref-title'),
      modalSpecs: el('modal-spec-list'),
      modalStops: el('modal-stops-list'),
      modalNotes: el('modal-guest-notes'),
      modalEditForm: el('modal-edit-form'),
      editStatus: el('edit-status'),
      editQuote: el('edit-quote'),
      editAdminNote: el('edit-admin-note'),
      modalSaveBtn: el('modal-save-btn'),
      modalCopyReplyBtn: el('modal-copy-reply-btn'),
      modalDeleteBtn: el('modal-delete-btn'),
      confirmModal: el('confirm-modal'),
      confirmCopy: el('confirm-copy'),
      closeConfirmBtn: el('close-confirm-btn'),
      cancelConfirmBtn: el('cancel-confirm-btn'),
      acceptConfirmBtn: el('accept-confirm-btn'),
      passwordModal: el('password-modal'),
      closePwModalBtn: el('close-pw-modal-btn'),
      cancelPwModalBtn: el('cancel-pw-modal-btn'),
      changePwForm: el('change-pw-form'),
      pwCurrent: el('pw-current'),
      pwNew: el('pw-new'),
      pwConfirm: el('pw-confirm'),
      pwError: el('pw-error'),
      savePwBtn: el('save-pw-btn'),
      toast: el('admin-toast')
    };

    syncThemeUI();
    dom.themeToggle.addEventListener('click', toggleTheme);

    dom.togglePwBtn.addEventListener('click', function () {
      var showing = dom.loginPassword.type === 'text';
      dom.loginPassword.type = showing ? 'password' : 'text';
      dom.togglePwBtn.textContent = showing ? 'Show' : 'Hide';
      dom.togglePwBtn.setAttribute('aria-pressed', String(!showing));
    });

    dom.loginForm.addEventListener('submit', handleLoginSubmit);
    dom.forgotPwBtn.addEventListener('click', handleForgotPassword);

    dom.tabBtnInq.addEventListener('click', function () { switchTab('inquiries'); });
    dom.tabBtnCat.addEventListener('click', function () { switchTab('catalog'); });
    dom.refreshBtn.addEventListener('click', loadStudioData);

    dom.inqSearch.addEventListener('input', renderInquiriesTable);
    dom.inqStatusFilter.addEventListener('change', renderInquiriesTable);
    dom.inqMonthFilter.addEventListener('change', renderInquiriesTable);
    dom.exportCsvBtn.addEventListener('click', exportFilteredCsv);

    dom.catSearch.addEventListener('input', renderCatalogGrid);
    dom.catRegionFilter.addEventListener('change', renderCatalogGrid);

    dom.closeModalBtn.addEventListener('click', closeInquiryModal);
    dom.modalEditForm.addEventListener('submit', saveInquiryChanges);
    dom.modalCopyReplyBtn.addEventListener('click', copyReplyDraft);
    dom.modalDeleteBtn.addEventListener('click', function () {
      if (state.activeInquiryRef) requestDeleteInquiry(state.activeInquiryRef);
    });

    dom.closeConfirmBtn.addEventListener('click', function () { dom.confirmModal.hidden = true; });
    dom.cancelConfirmBtn.addEventListener('click', function () { dom.confirmModal.hidden = true; });
    dom.acceptConfirmBtn.addEventListener('click', executeDeleteInquiry);

    if (dom.changePwBtn) dom.changePwBtn.addEventListener('click', openPasswordModal);
    if (dom.closePwModalBtn) dom.closePwModalBtn.addEventListener('click', closePasswordModal);
    if (dom.cancelPwModalBtn) dom.cancelPwModalBtn.addEventListener('click', closePasswordModal);
    if (dom.changePwForm) dom.changePwForm.addEventListener('submit', handleChangePasswordSubmit);
    if (dom.passwordModal) {
      dom.passwordModal.addEventListener('click', function (e) {
        if (e.target === dom.passwordModal) closePasswordModal();
      });
    }

    dom.inquiryModal.addEventListener('click', function (e) {
      if (e.target === dom.inquiryModal) closeInquiryModal();
    });
    dom.confirmModal.addEventListener('click', function (e) {
      if (e.target === dom.confirmModal) dom.confirmModal.hidden = true;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (dom.passwordModal && !dom.passwordModal.hidden) closePasswordModal();
        else if (!dom.confirmModal.hidden) dom.confirmModal.hidden = true;
        else if (!dom.inquiryModal.hidden) closeInquiryModal();
      }
    });

    var auth = getFirebaseAuth();
    if (!auth) {
      setViewGate('login');
      showAlert(dom.loginError, 'Firebase Authentication SDK could not initialize.');
      return;
    }

    var doSignOut = function () {
      detachRealtimeListeners();
      auth.signOut();
    };
    dom.logoutBtn.addEventListener('click', doSignOut);
    dom.verifySignoutBtn.addEventListener('click', doSignOut);

    dom.sendVerifyBtn.addEventListener('click', function () {
      if (!auth.currentUser) return;
      showAlert(dom.verifyError, '');
      showAlert(dom.verifyNotice, '');
      auth.currentUser.sendEmailVerification().then(function () {
        showAlert(dom.verifyNotice, 'Verification email sent to ' + auth.currentUser.email + '. Click the link inside, then press Refresh Session.');
      }).catch(function (err) {
        showAlert(dom.verifyError, friendlyAuthError(err));
      });
    });

    dom.reloadVerifyBtn.addEventListener('click', function () {
      if (!auth.currentUser) return;
      showAlert(dom.verifyError, '');
      auth.currentUser.reload().then(function () {
        return auth.currentUser.getIdToken(true);
      }).then(function () {
        if (auth.currentUser.emailVerified) {
          dom.userEmail.textContent = ALLOWED_ADMIN_USERNAME;
          setViewGate('dashboard');
          loadStudioData();
        } else {
          showAlert(dom.verifyError, 'Email still shows unverified. Please click the verification link in your inbox.');
        }
      }).catch(function (err) {
        showAlert(dom.verifyError, friendlyAuthError(err));
      });
    });

    auth.onAuthStateChanged(function (user) {
      state.user = user;
      if (!user) {
        detachRealtimeListeners();
        state.inquiries = [];
        setViewGate('login');
        return;
      }

      if (String(user.email || '').toLowerCase() !== ALLOWED_ADMIN_EMAIL) {
        auth.signOut();
        setViewGate('login');
        showAlert(dom.loginError, 'Access denied: ' + (user.email || 'this account') + ' is not an authorized administrator.');
        return;
      }

      if (!user.emailVerified) {
        dom.verifyEmailLabel.textContent = 'the administrator account';
        setViewGate('verify');
        return;
      }

      dom.userEmail.textContent = ALLOWED_ADMIN_USERNAME;
      setViewGate('dashboard');
      loadStudioData();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
