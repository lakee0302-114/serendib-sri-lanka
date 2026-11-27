/* Serendib Travels - Main Client Script */

(function () {
  'use strict';

  var data = window.SERENDIB_DATA;
  var LOCALE_LIST = window.SERENDIB_LOCALE_LIST || [];
  var LOCALES = window.SERENDIB_LOCALES || {};

  var DESTINATIONS_META = data.DESTINATIONS_META;
  var MONSOON_LEVELS = data.MONSOON_LEVELS;
  var MONTH_CODES = data.MONTH_CODES;
  var ITINERARY_PRESETS = data.ITINERARY_PRESETS;

  var STORAGE_KEYS = {
    route: 'serendib_saved_route_v1',
    theme: 'serendib_theme_v1',
    lang: 'serendib_lang_v1'
  };

  var SVG_ICONS = {
    moon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
  };

  var state = {
    lang: getInitialLang(),
    theme: document.documentElement.getAttribute('data-theme') || 'light',
    locale: null,
    activeRegion: 'all',
    atlasExpanded: false,
    activeMonth: 'FEB',
    activeItineraryId: 'classic-arc',
    savedStopIds: loadSavedStops(),
    activeDossierId: null,
    catalogOverrides: {},
    planner: {
      open: false,
      step: 1,
      status: 'before',
      startHub: 'cmbAirport',
      month: 'FEB',
      arrivalDate: '',
      departureDate: '',
      travelers: 2,
      stayTier: 'boutique',
      transport: 'chauffeur',
      foodPrefs: [],
      interests: [],
      modalRegion: 'all',
      nightsByStop: {},
      customStay: '',
      customTransport: '',
      foodOtherEnabled: false,
      customFood: '',
      interestOtherEnabled: false,
      customInterest: '',
      confirmed: null
    },
    account: {
      open: false,
      user: null,
      authMode: 'signin',
      trips: [],
      loadingTrips: false,
      activeTripRef: null,
      pendingTripToSave: null
    }
  };

  function escapeHtml(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function generateRefCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var out = '';
    var bytes = new Uint8Array(6);
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      window.crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    for (var j = 0; j < 6; j++) {
      out += chars.charAt(bytes[j] % chars.length);
    }
    return 'SRD-' + out;
  }

  function getInitialLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEYS.lang);
      for (var i = 0; i < LOCALE_LIST.length; i++) {
        if (LOCALE_LIST[i].code === saved) return saved;
      }
      return 'en';
    } catch (e) {
      return 'en';
    }
  }

  function loadSavedStops() {
    var validIds = DESTINATIONS_META.map(function (d) { return d.id; });
    try {
      var raw = localStorage.getItem(STORAGE_KEYS.route);
      if (!raw) return ['sigiriya', 'ella', 'galle'];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return ['sigiriya', 'ella', 'galle'];
      var seen = {};
      var cleaned = [];
      for (var i = 0; i < parsed.length && cleaned.length < validIds.length; i++) {
        var id = parsed[i];
        if (typeof id === 'string' && validIds.indexOf(id) !== -1 && !seen[id]) {
          seen[id] = true;
          cleaned.push(id);
        }
      }
      return cleaned;
    } catch (e) {
      return ['sigiriya', 'ella', 'galle'];
    }
  }

  function persistSavedStops() {
    try {
      localStorage.setItem(STORAGE_KEYS.route, JSON.stringify(state.savedStopIds));
    } catch (e) {}
  }

  var dom = {
    header: document.getElementById('site-header'),
    scrollProgress: document.getElementById('scroll-progress'),
    brandSub: document.getElementById('brand-sub'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    themeLabel: document.getElementById('theme-label'),
    metaThemeColor: document.getElementById('meta-theme-color'),
    langTrigger: document.getElementById('lang-trigger'),
    langBadge: document.getElementById('lang-badge'),
    langPopover: document.getElementById('lang-popover'),
    mobileQuickLangs: document.getElementById('mobile-quick-langs'),
    mobileNav: document.getElementById('mobile-nav'),
    mobileMenuOpen: document.getElementById('mobile-menu-open'),
    mobileMenuClose: document.getElementById('mobile-menu-close'),
    mobileOpenRoute: document.getElementById('mobile-open-route'),
    quickFinder: document.getElementById('quick-finder'),
    finderMonth: document.getElementById('finder-month'),
    finderFocus: document.getElementById('finder-focus'),
    finderPace: document.getElementById('finder-pace'),
    introDatums: document.getElementById('intro-datums'),
    atlasFilterRail: document.getElementById('atlas-filter-rail'),
    atlasGrid: document.getElementById('atlas-grid'),
    atlasExpandWrap: document.getElementById('atlas-expand-wrap'),
    atlasExpandBtn: document.getElementById('atlas-expand-btn'),
    atlasExpandLabel: document.getElementById('atlas-expand-label'),
    atlasPrev: document.getElementById('atlas-prev'),
    atlasNext: document.getElementById('atlas-next'),
    monthGrid: document.getElementById('month-grid'),
    compassReadout: document.getElementById('compass-readout'),
    itineraryTabs: document.getElementById('itinerary-tabs'),
    itineraryStage: document.getElementById('itinerary-stage'),
    accordionList: document.getElementById('accordion-list'),
    routeCount: document.getElementById('route-count'),
    openRouteBtn: document.getElementById('open-route-drawer'),
    backdrop: document.getElementById('sheet-backdrop'),
    dossierSheet: document.getElementById('dossier-sheet'),
    dossierKicker: document.getElementById('dossier-kicker'),
    dossierBody: document.getElementById('dossier-body'),
    dossierNights: document.getElementById('dossier-nights'),
    dossierSaveBtn: document.getElementById('dossier-save-btn'),
    closeDossierBtn: document.getElementById('close-dossier'),
    routeSheet: document.getElementById('route-sheet'),
    routeSheetBody: document.getElementById('route-sheet-body'),
    routeTotalNights: document.getElementById('route-total-nights'),
    closeRouteBtn: document.getElementById('close-route'),
    clearRouteBtn: document.getElementById('clear-route-btn'),
    applyRouteBtn: document.getElementById('apply-route-to-form'),
    conciergeMonthPill: document.getElementById('concierge-month-pill'),
    conciergeStopsPill: document.getElementById('concierge-stops-pill'),
    inquiryPreview: document.getElementById('inquiry-shortlist-preview'),
    copyBriefBtn: document.getElementById('copy-brief-btn'),
    plannerModal: document.getElementById('planner-modal'),
    plannerBackdrop: document.getElementById('planner-backdrop'),
    closePlannerBtn: document.getElementById('close-planner'),
    plannerSteps: document.getElementById('planner-steps'),
    plannerPane1: document.getElementById('planner-pane-1'),
    plannerPane2: document.getElementById('planner-pane-2'),
    plannerPane3: document.getElementById('planner-pane-3'),
    plannerConfirmed: document.getElementById('planner-confirmed'),
    plannerMonthPills: document.getElementById('planner-month-pills'),
    plannerStatusPills: document.getElementById('planner-status-pills'),
    plannerHubPills: document.getElementById('planner-hub-pills'),
    plannerDateInput: document.getElementById('pln-date'),
    plannerDepartureInput: document.getElementById('pln-departure-date'),
    plannerMonsoonFit: document.getElementById('planner-monsoon-fit'),
    plannerDestHeading: document.getElementById('planner-dest-heading'),
    plannerPresets: document.getElementById('planner-presets'),
    plannerDestFilters: document.getElementById('planner-dest-filters'),
    plannerDestGrid: document.getElementById('planner-dest-grid'),
    plannerRouteBuilder: document.getElementById('planner-route-builder'),
    plannerRouteCards: document.getElementById('planner-route-cards'),
    plannerTravelersVal: document.getElementById('planner-travelers-val'),
    plannerNightsHint: document.getElementById('planner-nights-hint'),
    plannerStayGrid: document.getElementById('planner-stay-grid'),
    plannerStayOtherWrap: document.getElementById('planner-stay-other-wrap'),
    plannerStayOtherInput: document.getElementById('pln-stay-other-input'),
    plannerTransportPills: document.getElementById('planner-transport-pills'),
    plannerTransportOtherWrap: document.getElementById('planner-transport-other-wrap'),
    plannerTransportOtherInput: document.getElementById('pln-transport-other-input'),
    plannerFoodTags: document.getElementById('planner-food-tags'),
    plannerFoodOtherWrap: document.getElementById('planner-food-other-wrap'),
    plannerFoodOtherInput: document.getElementById('pln-food-other-input'),
    plannerInterestTags: document.getElementById('planner-interest-tags'),
    plannerInterestOtherWrap: document.getElementById('planner-interest-other-wrap'),
    plannerInterestOtherInput: document.getElementById('pln-interest-other-input'),
    plannerAuthHint: document.getElementById('planner-auth-hint'),
    plannerMobileReview: document.getElementById('planner-mobile-review'),
    accountTrigger: document.getElementById('account-trigger'),
    accountTriggerLabel: document.getElementById('account-trigger-label'),
    accountTripCount: document.getElementById('account-trip-count'),
    mobileAccountTrigger: document.getElementById('mobile-account-trigger'),
    accountModal: document.getElementById('account-modal'),
    accountBackdrop: document.getElementById('account-backdrop'),
    closeAccountBtn: document.getElementById('close-account'),
    accountModalTitle: document.getElementById('account-modal-title'),
    accountAuthView: document.getElementById('account-auth-view'),
    accountPendingBanner: document.getElementById('account-pending-banner'),
    accGoogleBtn: document.getElementById('acc-google-btn'),
    accTabSignIn: document.getElementById('acc-tab-signin'),
    accTabSignUp: document.getElementById('acc-tab-signup'),
    accountForm: document.getElementById('account-auth-form'),
    accNameGroup: document.getElementById('acc-name-group'),
    accName: document.getElementById('acc-name'),
    accEmail: document.getElementById('acc-email'),
    accPassword: document.getElementById('acc-password'),
    accPwToggle: document.getElementById('acc-pw-toggle'),
    accForgotBtn: document.getElementById('acc-forgot-btn'),
    accountError: document.getElementById('account-error'),
    accountNotice: document.getElementById('account-notice'),
    accSubmitBtn: document.getElementById('acc-submit-btn'),
    accountTripsView: document.getElementById('account-trips-view'),
    accountAvatar: document.getElementById('account-avatar'),
    accountDisplayName: document.getElementById('account-display-name'),
    accountDisplayEmail: document.getElementById('account-display-email'),
    accountPlanNewBtn: document.getElementById('account-plan-new-btn'),
    accountSignoutBtn: document.getElementById('account-signout-btn'),
    accountListPane: document.getElementById('account-list-pane'),
    accountTripsEmpty: document.getElementById('account-trips-empty'),
    accountTripsGrid: document.getElementById('account-trips-grid'),
    accountDetailPane: document.getElementById('account-detail-pane'),
    plannerForm: document.getElementById('planner-form'),
    plannerAside: document.getElementById('planner-aside'),
    plannerAsideCount: document.getElementById('planner-aside-count'),
    plannerAsideTransit: document.getElementById('planner-aside-transit'),
    plannerAsideMonsoon: document.getElementById('planner-aside-monsoon'),
    plannerAsideSpecs: document.getElementById('planner-aside-specs'),
    plannerAsideStops: document.getElementById('planner-aside-stops'),
    plannerFooter: document.getElementById('planner-footer'),
    plannerStepMeta: document.getElementById('planner-step-meta'),
    plannerMobileSummary: document.getElementById('planner-mobile-summary'),
    plannerBackBtn: document.getElementById('planner-back-btn'),
    plannerNextBtn: document.getElementById('planner-next-btn'),
    plannerNextLabel: document.getElementById('planner-next-label'),
    floatingBar: document.getElementById('floating-trip-bar'),
    floatingCount: document.getElementById('floating-trip-count'),
    toast: document.getElementById('toast')
  };

  var toastTimer = null;

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      dom.toast.classList.remove('is-shown');
    }, 2600);
  }

  function getNested(obj, path) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (!cur || cur[parts[i]] === undefined) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function getMergedDestinations(includeHidden) {
    var locDest = state.locale.destinations;
    var overrides = state.catalogOverrides || {};
    var out = [];
    for (var i = 0; i < DESTINATIONS_META.length; i++) {
      var meta = DESTINATIONS_META[i];
      var ov = overrides[meta.id];
      if (ov && ov.hidden && !includeHidden) continue;
      var merged = Object.assign({}, meta, locDest[meta.id]);
      if (ov) {
        if (ov.idealNights) merged.idealNights = ov.idealNights;
        if (ov.pricePerNightUsd > 0) merged.pricePerNightUsd = ov.pricePerNightUsd;
        if (ov.badge) merged.badge = ov.badge;
      }
      out.push(merged);
    }
    return out;
  }

  /* ------------------------------------------------------------------------
     Theme Management (Light / Dark + Circular View Transition Reveal)
     ------------------------------------------------------------------------ */
  function syncThemeUI() {
    var isDark = state.theme === 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    if (dom.metaThemeColor) {
      dom.metaThemeColor.setAttribute('content', isDark ? '#07151D' : '#FFFFFF');
    }

    dom.themeIcon.innerHTML = isDark ? SVG_ICONS.sun : SVG_ICONS.moon;
    if (state.locale) {
      var t = state.locale.ui.theme;
      dom.themeLabel.textContent = isDark ? t.darkLabel : t.lightLabel;
      dom.themeToggle.setAttribute('aria-label', isDark ? t.toLight : t.toDark);
    }
    dom.themeToggle.setAttribute('aria-pressed', String(isDark));
  }

  function toggleTheme(event) {
    var nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    var rect = dom.themeToggle.getBoundingClientRect();
    var x = (event && event.clientX) ? event.clientX : rect.left + rect.width / 2;
    var y = (event && event.clientY) ? event.clientY : rect.top + rect.height / 2;
    document.documentElement.style.setProperty('--vt-x', x + 'px');
    document.documentElement.style.setProperty('--vt-y', y + 'px');

    state.theme = nextTheme;
    try {
      localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
    } catch (e) {}
    syncThemeUI();
  }

  /* ------------------------------------------------------------------------
     Multi-Language Selector & Full i18n Rendering
     ------------------------------------------------------------------------ */
  function renderLanguageMenus() {
    var activeEntry = LOCALE_LIST[0];
    for (var i = 0; i < LOCALE_LIST.length; i++) {
      if (LOCALE_LIST[i].code === state.lang) {
        activeEntry = LOCALE_LIST[i];
        break;
      }
    }
    dom.langBadge.textContent = activeEntry.badge;

    dom.langPopover.innerHTML = LOCALE_LIST.map(function (item) {
      var active = item.code === state.lang;
      return (
        '<button type="button" class="lang-option ' + (active ? 'is-active' : '') + '" ' +
        'data-lang-pick="' + item.code + '" role="menuitemradio" aria-checked="' + active + '">' +
        '<span class="lang-option__native">' + item.native + '</span>' +
        '<span class="lang-option__meta">' + item.label + '</span>' +
        '</button>'
      );
    }).join('');

    dom.langPopover.querySelectorAll('[data-lang-pick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeLangPopover();
        switchLanguage(btn.dataset.langPick, true);
      });
    });

    dom.mobileQuickLangs.innerHTML = LOCALE_LIST.map(function (item) {
      var active = item.code === state.lang;
      return (
        '<button type="button" class="filter-chip ' + (active ? 'is-active' : '') + '" ' +
        'style="min-height:34px; padding:0.25rem 0.7rem; font-size:0.75rem; color:' +
        (active ? '#FFFFFF' : 'rgba(242,248,250,0.85)') +
        '; border-color:rgba(242,248,250,0.28);" data-mobile-lang="' + item.code + '">' +
        item.native +
        '</button>'
      );
    }).join('');

    dom.mobileQuickLangs.querySelectorAll('[data-mobile-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchLanguage(btn.dataset.mobileLang, true);
      });
    });
  }

  function closeLangPopover() {
    dom.langPopover.hidden = true;
    dom.langTrigger.setAttribute('aria-expanded', 'false');
  }

  function switchLanguage(code, notify) {
    var locale = LOCALES[code] || LOCALES.en;
    if (!locale) return;

    state.lang = locale.meta.code;
    state.locale = locale;

    try {
      localStorage.setItem(STORAGE_KEYS.lang, state.lang);
    } catch (e) {}

    var applyAll = function () {
      document.documentElement.setAttribute('lang', locale.meta.code);
      document.documentElement.setAttribute('dir', locale.meta.dir);
      document.title = locale.meta.pageTitle;
      dom.brandSub.textContent = locale.ui.brandSub;

      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var val = getNested(locale.ui, el.dataset.i18n);
        if (val !== undefined) el.textContent = val;
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
        var val = getNested(locale.ui, el.dataset.i18nPlaceholder);
        if (val !== undefined) el.setAttribute('placeholder', val);
      });

      if (dom.introDatums) {
        dom.introDatums.innerHTML = locale.ui.intro.datums.map(function (row) {
          return (
            '<div class="datum-row">' +
            '<span class="mono-label datum-key">' + row.key + '</span>' +
            '<span class="datum-val">' + row.val + '</span>' +
            '</div>'
          );
        }).join('');
      }

      renderFinderSelects();
      renderAtlasFilterRail();
      renderMonthButtons();
      setActiveMonth(state.activeMonth);
      renderItineraries();
      renderFieldNotes();
      renderLanguageMenus();
      syncThemeUI();
      syncRouteUI();

      if (state.activeDossierId && !dom.dossierSheet.hidden) {
        openDossierSheet(state.activeDossierId);
      }
      if (state.planner.open) {
        renderPlannerModal();
      }
      syncAccountHeaderUI();
      if (state.account.open) {
        renderAccountModal();
      }
    };

    applyAll();

    if (notify) {
      showToast(locale.ui.toasts.langChanged);
    }
  }

  function renderFinderSelects() {
    if (!dom.finderMonth || !dom.finderFocus || !dom.finderPace) return;
    var finder = state.locale.ui.finder;
    var prevMonth = dom.finderMonth.value || state.activeMonth;
    var prevFocus = dom.finderFocus.value || state.activeRegion;
    var prevPace = dom.finderPace.value || state.activeItineraryId;

    dom.finderMonth.innerHTML = MONTH_CODES.map(function (code) {
      return '<option value="' + code + '"' + (code === prevMonth ? ' selected' : '') + '>' + state.locale.months[code].fullName + '</option>';
    }).join('');

    dom.finderFocus.innerHTML = Object.keys(finder.focusOptions).map(function (val) {
      return '<option value="' + val + '"' + (val === prevFocus ? ' selected' : '') + '>' + finder.focusOptions[val] + '</option>';
    }).join('');

    dom.finderPace.innerHTML = Object.keys(finder.paceOptions).map(function (val) {
      return '<option value="' + val + '"' + (val === prevPace ? ' selected' : '') + '>' + finder.paceOptions[val] + '</option>';
    }).join('');
  }

  /* ------------------------------------------------------------------------
     Navigation & Scroll Progress
     ------------------------------------------------------------------------ */
  function initNavigation() {
    var supportsScrollTimeline = window.CSS && window.CSS.supports && window.CSS.supports('animation-timeline: scroll()');

    var onScroll = function () {
      dom.header.classList.toggle('is-scrolled', window.scrollY > 40);
      if (dom.floatingBar) {
        var nearBottom = (window.scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 160);
        dom.floatingBar.classList.toggle('is-visible', state.savedStopIds.length > 0 && window.scrollY > 360 && !nearBottom);
      }
      if (!supportsScrollTimeline && dom.scrollProgress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        dom.scrollProgress.style.transform = 'scaleX(' + ratio + ')';
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    dom.themeToggle.addEventListener('click', toggleTheme);

    dom.langTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var opening = dom.langPopover.hidden;
      dom.langPopover.hidden = !opening;
      dom.langTrigger.setAttribute('aria-expanded', String(opening));
    });

    document.addEventListener('click', function (e) {
      if (!dom.langPopover.hidden && !dom.langPopover.contains(e.target) && !dom.langTrigger.contains(e.target)) {
        closeLangPopover();
      }
    });

    var openMobileNav = function () {
      dom.mobileNav.classList.add('is-open');
      dom.mobileNav.setAttribute('aria-hidden', 'false');
      dom.mobileMenuOpen.setAttribute('aria-expanded', 'true');
      document.body.classList.add('drawer-open');
    };

    var closeMobileNav = function () {
      dom.mobileNav.classList.remove('is-open');
      dom.mobileNav.setAttribute('aria-hidden', 'true');
      dom.mobileMenuOpen.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('drawer-open');
    };

    dom.mobileMenuOpen.addEventListener('click', openMobileNav);
    dom.mobileMenuClose.addEventListener('click', closeMobileNav);
    dom.mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });
    dom.mobileOpenRoute.addEventListener('click', function () {
      closeMobileNav();
      openRouteSheet();
    });

    document.querySelectorAll('[data-jump-region]').forEach(function (link) {
      link.addEventListener('click', function () {
        setRegionFilter(link.dataset.jumpRegion);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Destination Atlas & Spotlight Hover
     ------------------------------------------------------------------------ */
  function renderAtlasFilterRail() {
    var filters = state.locale.ui.atlas.filters;
    var order = ['all', 'cultural', 'highlands', 'south', 'wildlife', 'northeast'];
    var activeTotal = getMergedDestinations().length;

    dom.atlasFilterRail.innerHTML = order.map(function (key) {
      var active = state.activeRegion === key;
      var label = key === 'all' && activeTotal !== DESTINATIONS_META.length
        ? filters.all.replace(/\(\d+\)/, '(' + activeTotal + ')')
        : filters[key];
      return (
        '<button type="button" class="filter-chip ' + (active ? 'is-active' : '') + '" ' +
        'data-region="' + key + '" role="tab" aria-selected="' + active + '">' +
        label + '</button>'
      );
    }).join('');

    dom.atlasFilterRail.querySelectorAll('.filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        setRegionFilter(chip.dataset.region);
      });
    });
  }

  function setRegionFilter(regionKey) {
    state.activeRegion = regionKey;
    state.atlasExpanded = false;
    renderAtlasFilterRail();
    renderDestinations();
    dom.atlasGrid.scrollTo({ left: 0, behavior: 'smooth' });
  }

  function updateAtlasExpandUI(totalCount) {
    if (!dom.atlasExpandWrap || !dom.atlasExpandBtn || !dom.atlasExpandLabel || !state.locale) return;
    var rowCap = window.innerWidth >= 1120 ? 4 : (window.innerWidth >= 768 ? 2 : 6);
    var needsExpand = totalCount > rowCap;
    dom.atlasGrid.classList.toggle('is-expanded', state.atlasExpanded || !needsExpand);
    dom.atlasExpandWrap.hidden = !needsExpand;
    if (!needsExpand) return;

    var t = state.locale.ui.atlas;
    dom.atlasExpandBtn.setAttribute('aria-expanded', String(state.atlasExpanded));
    dom.atlasExpandLabel.textContent = state.atlasExpanded
      ? t.showLessBtn
      : t.showAllBtn.replace('{count}', String(totalCount));
  }

  function renderDestinations() {
    var all = getMergedDestinations();
    var filtered = state.activeRegion === 'all'
      ? all
      : all.filter(function (d) { return d.regionKey === state.activeRegion; });
    var t = state.locale.ui.atlas;

    dom.atlasGrid.innerHTML = filtered.map(function (dest) {
      var saved = state.savedStopIds.indexOf(dest.id) !== -1;
      var badgeHtml = dest.badge ? '<span class="dest-card__badge">' + escapeHtml(dest.badge) + '</span>' : '';
      var priceLabel = dest.pricePerNightUsd ? ' · $' + escapeHtml(dest.pricePerNightUsd) + '/nt' : '';
      return (
        '<article class="dest-card" data-dest-id="' + dest.id + '">' +
        '<div class="dest-card__media" data-open-dossier="' + dest.id + '" role="button" tabindex="0" aria-label="' + dest.name + '">' + badgeHtml + '<img src="' + dest.image + '" alt="' + dest.imageAlt + '" decoding="async" /></div>' +
        '<div class="dest-card__body">' +
        '<div class="dest-card__meta">' +
        '<span class="mono-label">' + dest.region + '</span>' +
        '<span class="mono-label" style="opacity:0.75;">' + dest.idealNights + t.nightsUnit + priceLabel + '</span>' +
        '</div>' +
        '<h3 class="dest-card__title" data-open-dossier="' + dest.id + '">' + dest.name + '</h3>' +
        '<div class="dest-card__footer">' +
        '<button type="button" class="text-link-btn" data-open-dossier="' + dest.id + '">' + t.dossierBtn + ' &rarr;</button>' +
        '<button type="button" class="add-stop-btn ' + (saved ? 'is-saved' : '') + '" data-toggle-stop="' + dest.id + '" aria-pressed="' + saved + '">' +
        (saved ? t.savedStop : t.addStop) + '</button>' +
        '</div></div></article>'
      );
    }).join('');

    updateAtlasExpandUI(filtered.length);

    dom.atlasGrid.querySelectorAll('[data-open-dossier]').forEach(function (el) {
      el.addEventListener('click', function () {
        openDossierSheet(el.dataset.openDossier);
      });
      if (el.tagName !== 'BUTTON') {
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openDossierSheet(el.dataset.openDossier);
          }
        });
      }
    });

    dom.atlasGrid.querySelectorAll('[data-toggle-stop]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleSavedStop(btn.dataset.toggleStop);
      });
    });
  }

  function initAtlasControls() {
    dom.atlasPrev.addEventListener('click', function () {
      var dirFactor = document.documentElement.dir === 'rtl' ? 1 : -1;
      dom.atlasGrid.scrollBy({ left: dirFactor * window.innerWidth * 0.82, behavior: 'smooth' });
    });
    dom.atlasNext.addEventListener('click', function () {
      var dirFactor = document.documentElement.dir === 'rtl' ? -1 : 1;
      dom.atlasGrid.scrollBy({ left: dirFactor * window.innerWidth * 0.82, behavior: 'smooth' });
    });

    if (dom.atlasExpandBtn) {
      dom.atlasExpandBtn.addEventListener('click', function () {
        state.atlasExpanded = !state.atlasExpanded;
        var count = dom.atlasGrid.querySelectorAll('.dest-card').length;
        updateAtlasExpandUI(count);
        if (!state.atlasExpanded) {
          document.getElementById('atlas').scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    window.addEventListener('resize', function () {
      if (dom.atlasGrid) {
        updateAtlasExpandUI(dom.atlasGrid.querySelectorAll('.dest-card').length);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Route Shortlist State
     ------------------------------------------------------------------------ */
  function toggleSavedStop(destId) {
    var all = getMergedDestinations();
    var dest = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === destId) { dest = all[i]; break; }
    }
    if (!dest) return;
    var toasts = state.locale.ui.toasts;

    var exists = state.savedStopIds.indexOf(destId) !== -1;
    if (exists) {
      state.savedStopIds = state.savedStopIds.filter(function (id) { return id !== destId; });
      showToast(toasts.removed.replace('{name}', dest.name));
    } else {
      state.savedStopIds = state.savedStopIds.concat([destId]);
      showToast(toasts.added.replace('{name}', dest.name));
    }
    persistSavedStops();
    syncRouteUI();
  }

  function syncRouteUI() {
    dom.routeCount.textContent = String(state.savedStopIds.length);
    renderDestinations();

    var savedObjects = getSavedStopObjects();
    var nights = savedObjects.reduce(function (sum, d) { return sum + d.idealNights; }, 0);
    var c = state.locale.ui.contact;
    var r = state.locale.ui.routeSheet;

    if (dom.inquiryPreview) {
      if (savedObjects.length === 0) {
        dom.inquiryPreview.textContent = c.emptyShortlist;
      } else {
        var names = savedObjects.map(function (d) { return d.name; }).join(' → ');
        dom.inquiryPreview.textContent = names + ' (' + nights + ' ' + c.nightsSuggested + ')';
      }
    }

    if (dom.conciergeMonthPill) {
      var mObj = state.locale.months[state.activeMonth];
      dom.conciergeMonthPill.textContent = mObj ? mObj.fullName : state.activeMonth;
    }
    if (dom.conciergeStopsPill) {
      dom.conciergeStopsPill.textContent = savedObjects.length + ' ' + r.stopsLabel + ' · ' + nights + state.locale.ui.atlas.nightsUnit;
    }

    if (dom.floatingBar && dom.floatingCount) {
      dom.floatingBar.classList.toggle('is-visible', savedObjects.length > 0 && window.scrollY > 360);
      dom.floatingCount.textContent = savedObjects.length + ' ' + r.stopsLabel;
    }

    if (state.activeDossierId) updateDossierFooter(state.activeDossierId);
    if (!dom.routeSheet.hidden) renderRouteSheet();
    if (state.planner.open) renderPlannerModal();
  }

  function getSavedStopObjects() {
    var all = getMergedDestinations();
    return state.savedStopIds.map(function (id) {
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id) return all[i];
      }
      return null;
    }).filter(Boolean);
  }

  /* ------------------------------------------------------------------------
     Monsoon Compass & Cartographic SVG
     ------------------------------------------------------------------------ */
  var ZONE_FILL = { optimal: '#F4A933', good: '#18A999', caution: '#607D8B' };

  function renderMonthButtons() {
    dom.monthGrid.innerHTML = MONTH_CODES.map(function (code) {
      var active = code === state.activeMonth;
      return (
        '<button type="button" class="month-btn ' + (active ? 'is-active' : '') + '" ' +
        'data-month="' + code + '" role="tab" aria-selected="' + active + '">' +
        state.locale.months[code].short + '</button>'
      );
    }).join('');

    dom.monthGrid.querySelectorAll('.month-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setActiveMonth(btn.dataset.month);
      });
    });
  }

  function setActiveMonth(monthCode) {
    state.activeMonth = MONTH_CODES.indexOf(monthCode) !== -1 ? monthCode : 'FEB';
    renderMonthButtons();

    var levels = MONSOON_LEVELS[state.activeMonth];
    var m = state.locale.months[state.activeMonth];
    var ui = state.locale.ui.compass;

    Object.keys(levels).forEach(function (zoneKey) {
      var el = document.getElementById('zone-' + zoneKey);
      if (el) el.setAttribute('fill', ZONE_FILL[levels[zoneKey]]);
    });

    var verdictsHtml = Object.keys(m.verdicts).map(function (key) {
      var v = m.verdicts[key];
      return (
        '<div class="verdict-card">' +
        '<div class="verdict-card__top">' +
        '<span class="verdict-card__region">' + ui.zones[key] + '</span>' +
        '<span class="verdict-pill verdict-pill--' + levels[key] + '">' + v.status + '</span>' +
        '</div>' +
        '<p class="verdict-card__note">' + v.note + '</p>' +
        '</div>'
      );
    }).join('');

    var bestZone = Object.keys(levels).filter(function (z) { return levels[z] === 'optimal'; })[0] ||
      Object.keys(levels).filter(function (z) { return levels[z] === 'good'; })[0] || 'cultural';
    var bestZoneLabel = state.locale.ui.atlas.filters[bestZone] || ui.zones[bestZone];

    dom.compassReadout.innerHTML =
      '<span class="mono-label" style="color: var(--accent-tea); display:block; margin-bottom:0.3rem;">' +
      m.fullName + '</span>' +
      '<h3 class="compass-readout__headline">' + m.headline + '</h3>' +
      '<div class="verdict-grid">' + verdictsHtml + '</div>' +
      '<button type="button" class="compass-jump-btn" data-compass-jump="' + bestZone + '">' +
      bestZoneLabel + ' — ' + state.locale.ui.nav.atlas + ' &rarr;</button>';

    var jumpBtn = dom.compassReadout.querySelector('[data-compass-jump]');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', function () {
        setRegionFilter(jumpBtn.dataset.compassJump);
        document.getElementById('atlas').scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  /* ------------------------------------------------------------------------
     Curated Itineraries
     ------------------------------------------------------------------------ */
  function renderItineraries() {
    var keys = Object.keys(state.locale.itineraries);
    var t = state.locale.ui.itineraries;

    dom.itineraryTabs.innerHTML = keys.map(function (id) {
      var route = state.locale.itineraries[id];
      var active = id === state.activeItineraryId;
      return (
        '<button type="button" class="itinerary-tab ' + (active ? 'is-active' : '') + '" ' +
        'data-itinerary-id="' + id + '" role="tab" aria-selected="' + active + '">' +
        '<span class="mono-label itinerary-tab__num">' + route.number + ' · ' + route.duration + '</span>' +
        '<h3 class="itinerary-tab__title">' + route.title + '</h3>' +
        '<div class="itinerary-tab__meta">' + route.season + '</div>' +
        '</button>'
      );
    }).join('');

    dom.itineraryTabs.querySelectorAll('.itinerary-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.activeItineraryId = tab.dataset.itineraryId;
        renderItineraries();
      });
    });

    var active = state.locale.itineraries[state.activeItineraryId] || state.locale.itineraries[keys[0]];
    var daysHtml = active.days.map(function (item) {
      return (
        '<div class="timeline-item">' +
        '<span class="mono-label timeline-item__day">' + item.day + '</span>' +
        '<div><h4 class="timeline-item__stop">' + item.stop + '</h4>' +
        '<p class="timeline-item__note">' + item.note + '</p></div>' +
        '</div>'
      );
    }).join('');

    dom.itineraryStage.innerHTML =
      '<div>' +
      '<span class="mono-label" style="color:var(--accent-terracotta);">' + active.duration + ' · ' + active.pace + '</span>' +
      '<h3 class="display-serif" style="font-size:clamp(1.75rem, 1.45rem + 1.2vw, 2.4rem); margin:0.35rem 0 0.55rem;">' + active.title + '</h3>' +
      '<div class="itinerary-stage__route">' + active.routeLine + '</div>' +
      '<button type="button" class="btn btn--primary" id="adopt-itinerary-btn">' + t.adoptBtn + ' &rarr;</button>' +
      '</div>' +
      '<div class="timeline-list">' + daysHtml + '</div>';

    document.getElementById('adopt-itinerary-btn').addEventListener('click', function () {
      state.savedStopIds = (ITINERARY_PRESETS[state.activeItineraryId] || ['sigiriya', 'ella', 'galle']).slice();
      persistSavedStops();
      syncRouteUI();
      showToast(state.locale.ui.toasts.loadedRoute.replace('{title}', active.title));
      openPlannerModal(1);
    });
  }

  /* ------------------------------------------------------------------------
     Field Notes Accordion
     ------------------------------------------------------------------------ */
  function renderFieldNotes() {
    if (!dom.accordionList) return;
    dom.accordionList.innerHTML = state.locale.fieldNotes.map(function (note, index) {
      var expanded = false;
      return (
        '<div class="accordion-item">' +
        '<button type="button" class="accordion-btn" aria-expanded="' + expanded + '" aria-controls="note-panel-' + index + '">' +
        '<span>' + note.question + '</span>' +
        '<span class="accordion-plus" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="accordion-panel ' + (expanded ? 'is-open' : '') + '" id="note-panel-' + index + '">' +
        '<div class="accordion-panel__inner"><p>' + note.answer + '</p></div>' +
        '</div></div>'
      );
    }).join('');

    dom.accordionList.querySelectorAll('.accordion-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isExpanded = btn.getAttribute('aria-expanded') === 'true';
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        btn.setAttribute('aria-expanded', String(!isExpanded));
        panel.classList.toggle('is-open', !isExpanded);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Drawers / Bottom Sheets
     ------------------------------------------------------------------------ */
  function closeAllSheets() {
    dom.backdrop.classList.remove('is-open');
    dom.dossierSheet.classList.remove('is-open');
    dom.routeSheet.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    state.activeDossierId = null;

    setTimeout(function () {
      if (!dom.dossierSheet.classList.contains('is-open') && !dom.routeSheet.classList.contains('is-open')) {
        dom.backdrop.hidden = true;
        dom.dossierSheet.hidden = true;
        dom.routeSheet.hidden = true;
      }
    }, 360);
  }

  function openDossierSheet(destId) {
    var all = getMergedDestinations(true);
    var dest = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === destId) { dest = all[i]; break; }
    }
    if (!dest) return;
    state.activeDossierId = destId;
    var d = state.locale.ui.dossier;

    dom.dossierKicker.textContent = dest.number + ' · ' + dest.region.toUpperCase() + ' · ' + dest.sinhala + (dest.badge ? ' · ' + dest.badge : '');
    dom.dossierBody.innerHTML =
      '<div class="dossier-hero"><img src="' + dest.image + '" alt="' + dest.imageAlt + '" /></div>' +
      '<p class="mono-label" style="color:var(--ink-muted); margin:0 0 0.35rem;">' + dest.coords + '</p>' +
      '<h2 class="display-serif" id="dossier-title" style="font-size:2.15rem; margin:0 0 0.75rem;">' + dest.name + '</h2>' +
      '<p style="margin:0; color:var(--ink-secondary);">' + dest.summary + '</p>' +
      '<div class="dossier-specs">' +
      '<div><span class="mono-label">' + d.elevation + '</span><strong>' + dest.elevation + '</strong></div>' +
      '<div><span class="mono-label">' + d.fromColombo + '</span><strong>' + dest.driveFromColombo + '</strong></div>' +
      '<div><span class="mono-label">' + d.primeWindow + '</span><strong>' + dest.bestTime + '</strong></div>' +
      '<div><span class="mono-label">' + d.bestDaylight + '</span><strong>' + dest.daylightWindow + '</strong></div>' +
      (dest.pricePerNightUsd ? '<div><span class="mono-label">GUIDE RATE</span><strong>$' + escapeHtml(dest.pricePerNightUsd) + ' / night</strong></div>' : '') +
      '</div>' +
      '<h3 class="mono-label" style="color:var(--accent-terracotta); margin:0 0 0.5rem;">' + d.highlightsHeading + '</h3>' +
      '<ul class="dossier-list">' + dest.highlights.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>' +
      '<div style="padding-top:0.9rem; border-top:1px solid var(--hairline);">' +
      '<p style="margin:0 0 0.65rem; font-size:0.92rem;"><strong>' + d.atTable + '</strong> ' + dest.culinaryNote + '</p>' +
      '<p style="margin:0; font-size:0.92rem; color:var(--ink-secondary);"><strong>' + d.etiquette + '</strong> ' + dest.etiquette + '</p>' +
      '</div>';

    updateDossierFooter(destId);

    dom.routeSheet.classList.remove('is-open');
    dom.routeSheet.hidden = true;
    dom.backdrop.hidden = false;
    dom.dossierSheet.hidden = false;
    requestAnimationFrame(function () {
      if (state.activeDossierId !== destId) return;
      dom.backdrop.classList.add('is-open');
      dom.dossierSheet.classList.add('is-open');
      document.body.classList.add('drawer-open');
    });
  }

  function updateDossierFooter(destId) {
    var all = getMergedDestinations();
    var dest = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === destId) { dest = all[i]; break; }
    }
    if (!dest) return;
    var d = state.locale.ui.dossier;
    var saved = state.savedStopIds.indexOf(destId) !== -1;
    dom.dossierNights.textContent = dest.idealNights + ' ' + d.nightsRec;
    dom.dossierSaveBtn.textContent = saved ? d.removeBtn : d.addBtn;
  }

  function renderRouteSheet() {
    var all = getMergedDestinations();
    var stops = state.savedStopIds.map(function (id) {
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id) return all[i];
      }
      return null;
    }).filter(Boolean);
    var r = state.locale.ui.routeSheet;
    var nightsUnit = state.locale.ui.atlas.nightsUnit;

    if (stops.length === 0) {
      dom.routeSheetBody.innerHTML =
        '<div style="padding:2rem 0; text-align:center;">' +
        '<p style="color:var(--ink-secondary); margin:0 0 1.25rem;">' + r.emptyText + '</p>' +
        '<button type="button" class="btn btn--outline" id="browse-atlas-empty">' + r.browseBtn + '</button>' +
        '</div>';
      dom.routeTotalNights.textContent = '0 ' + r.nightsLabel;
      var emptyBtn = document.getElementById('browse-atlas-empty');
      if (emptyBtn) {
        emptyBtn.addEventListener('click', function () {
          closeAllSheets();
          document.getElementById('atlas').scrollIntoView({ behavior: 'smooth' });
        });
      }
      return;
    }

    var totalNights = stops.reduce(function (sum, d) { return sum + d.idealNights; }, 0);
    dom.routeTotalNights.textContent = totalNights + ' ' + r.nightsLabel + ' (' + stops.length + ' ' + r.stopsLabel + ')';

    dom.routeSheetBody.innerHTML =
      '<p style="margin:0 0 1rem; color:var(--ink-secondary); font-size:0.92rem;">' + r.introText + '</p>' +
      '<div>' +
      stops.map(function (stop, idx) {
        return (
          '<div class="route-stop-item">' +
          '<div class="route-stop-item__info">' +
          '<img class="route-stop-item__thumb" src="' + stop.image + '" alt="' + stop.name + '" />' +
          '<div>' +
          '<span class="mono-label" style="color:var(--ink-muted);">' + r.stopLabel + ' 0' + (idx + 1) + ' · ' + stop.idealNights + nightsUnit + '</span>' +
          '<div style="font-weight:600; font-size:0.96rem;">' + stop.name + '</div>' +
          '<div style="font-size:0.8rem; color:var(--ink-muted);">' + stop.region + '</div>' +
          '</div></div>' +
          '<button type="button" class="remove-stop-btn" data-remove-stop="' + stop.id + '">' + r.removeStop + '</button>' +
          '</div>'
        );
      }).join('') +
      '</div>';

    dom.routeSheetBody.querySelectorAll('[data-remove-stop]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleSavedStop(btn.dataset.removeStop);
      });
    });
  }

  function openRouteSheet() {
    renderRouteSheet();
    dom.dossierSheet.classList.remove('is-open');
    dom.dossierSheet.hidden = true;
    dom.backdrop.hidden = false;
    dom.routeSheet.hidden = false;
    requestAnimationFrame(function () {
      dom.backdrop.classList.add('is-open');
      dom.routeSheet.classList.add('is-open');
      document.body.classList.add('drawer-open');
    });
  }

  function initSheets() {
    dom.openRouteBtn.addEventListener('click', openRouteSheet);
    dom.closeDossierBtn.addEventListener('click', closeAllSheets);
    dom.closeRouteBtn.addEventListener('click', closeAllSheets);
    dom.backdrop.addEventListener('click', closeAllSheets);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeLangPopover();
        closePlannerModal();
        closeAllSheets();
        dom.mobileNav.classList.remove('is-open');
        dom.mobileNav.setAttribute('aria-hidden', 'true');
        dom.mobileMenuOpen.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('drawer-open');
      }
    });

    dom.dossierSaveBtn.addEventListener('click', function () {
      if (state.activeDossierId) toggleSavedStop(state.activeDossierId);
    });

    dom.clearRouteBtn.addEventListener('click', function () {
      state.savedStopIds = [];
      persistSavedStops();
      syncRouteUI();
      showToast(state.locale.ui.toasts.cleared);
    });

    dom.applyRouteBtn.addEventListener('click', function () {
      closeAllSheets();
      openPlannerModal(1);
    });
  }

  /* ------------------------------------------------------------------------
     Dedicated Interactive Trip Planner Studio Modal
     ------------------------------------------------------------------------ */
  function parseIsoDateUtc(isoStr) {
    if (!isoStr || !/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return null;
    var parts = isoStr.split('-');
    return Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function getCalculatedDateNights() {
    var arrMs = parseIsoDateUtc(state.planner.arrivalDate);
    var depMs = parseIsoDateUtc(state.planner.departureDate);
    if (arrMs === null || depMs === null || depMs < arrMs) return null;
    return Math.round((depMs - arrMs) / 86400000);
  }

  function getStopNights(stop) {
    var custom = state.planner.nightsByStop[stop.id];
    return typeof custom === 'number' && custom >= 1 ? custom : stop.idealNights;
  }

  function getRecommendedNights() {
    var stops = getSavedStopObjects();
    if (!stops.length) return 8;
    return stops.reduce(function (sum, d) { return sum + getStopNights(d); }, 0);
  }

  function getActivePlannerNights() {
    var dateNights = getCalculatedDateNights();
    return dateNights !== null ? dateNights : getRecommendedNights();
  }

  function moveStopOrder(index, delta) {
    var nextIdx = index + delta;
    if (index < 0 || nextIdx < 0 || nextIdx >= state.savedStopIds.length) return;
    var copy = state.savedStopIds.slice();
    var swapped = copy.splice(index, 1)[0];
    copy.splice(nextIdx, 0, swapped);
    state.savedStopIds = copy;
    persistSavedStops();
    syncRouteUI();
    renderPlannerModal();
  }

  function adjustStopNights(stopId, delta) {
    var all = getMergedDestinations();
    var found = all.filter(function (d) { return d.id === stopId; })[0];
    if (!found) return;
    var current = getStopNights(found);
    var nextVal = Math.min(7, Math.max(1, current + delta));
    state.planner.nightsByStop[stopId] = nextVal;
    renderPlannerModal();
  }

  function formatDurationMins(totalMins) {
    var hrs = Math.floor(totalMins / 60);
    var mins = totalMins % 60;
    if (!hrs) return mins + 'm';
    return mins ? (hrs + 'h ' + mins + 'm') : (hrs + 'h');
  }

  function getPreferredDining(dest) {
    var guide = (data.DINING_GUIDE && data.DINING_GUIDE[dest.id]) || [];
    if (!guide.length) {
      return { spot: dest.culinaryNote, detail: dest.name, allSpots: [] };
    }
    var prefs = state.planner.foodPrefs || [];
    var ranked = guide.slice().sort(function (a, b) {
      var aHit = prefs.indexOf(a.style) !== -1 ? 1 : 0;
      var bHit = prefs.indexOf(b.style) !== -1 ? 1 : 0;
      return bHit - aHit;
    });
    return {
      spot: ranked[0].spot,
      detail: ranked[0].detail,
      allSpots: ranked
    };
  }

  function buildLegSummaryText(leg, fromLabel, toLabel, p) {
    if (!leg) return '';
    var dur = formatDurationMins(leg.mins);
    var routePair = fromLabel + ' \u2192 ' + toLabel;
    if (leg.scenicHillRail || (leg.railAvailable && state.planner.transport === 'rail')) {
      return routePair + ' \u00B7 ' + p.scenicRailBadge + ' / ~' + dur + ' (~' + leg.km + ' km)';
    }
    return routePair + ' \u00B7 ~' + dur + ' ' + p.roadBadge + ' (~' + leg.km + ' km)';
  }

  function buildDetailedSchedule() {
    var p = state.locale.ui.planner;
    var stops = getSavedStopObjects();
    var startHubLabel = (p.hubs && p.hubs[state.planner.startHub]) || 'Colombo';
    var cursorDay = 1;
    var totalTransitMins = 0;

    var items = stops.map(function (stop, idx) {
      var nights = getStopNights(stop);
      var dayStart = cursorDay;
      var dayEnd = cursorDay + Math.max(0, nights - 1);
      cursorDay += nights;

      var dayRange = dayStart === dayEnd
        ? (p.dayPrefix + ' ' + dayStart)
        : (p.dayPrefix + ' ' + dayStart + '–' + dayEnd);

      var prevId = idx === 0 ? state.planner.startHub : stops[idx - 1].id;
      var prevLabel = idx === 0 ? startHubLabel : stops[idx - 1].name;
      var leg = typeof data.estimateRouteLeg === 'function'
        ? data.estimateRouteLeg(prevId, stop.id, state.planner.transport)
        : null;
      if (leg) totalTransitMins += leg.mins;

      return {
        idx: idx,
        stop: stop,
        nights: nights,
        dayRange: dayRange,
        leg: leg,
        legText: buildLegSummaryText(leg, prevLabel, stop.name, p),
        dining: getPreferredDining(stop)
      };
    });

    return {
      items: items,
      totalTransitMins: totalTransitMins
    };
  }

  function getMonsoonHighlightText(monthCode) {
    var levels = MONSOON_LEVELS[monthCode] || MONSOON_LEVELS.FEB;
    var zones = state.locale.ui.compass.zones;
    var optimal = Object.keys(levels).filter(function (z) { return levels[z] === 'optimal'; });
    var pick = optimal.length ? optimal : Object.keys(levels).filter(function (z) { return levels[z] === 'good'; });
    var names = pick.map(function (z) { return zones[z]; }).filter(Boolean);
    return names.length ? state.locale.ui.compass.legendOptimal + ': ' + names.join(' · ') : state.locale.months[monthCode].headline;
  }

  function getStayDisplayTitle(p) {
    if (state.planner.stayTier === 'other') {
      return state.planner.customStay.trim() || (p.otherOption || 'Other');
    }
    return (p.stays[state.planner.stayTier] || p.stays.boutique).title;
  }

  function getTransportDisplayLabel(p) {
    if (state.planner.transport === 'other') {
      return state.planner.customTransport.trim() || (p.otherOption || 'Other');
    }
    return p.transports[state.planner.transport] || p.transports.chauffeur;
  }

  function getEffectiveFoodPrefs(p) {
    var list = state.planner.foodPrefs.map(function (k) {
      return (p.foodStyles && p.foodStyles[k]) || k;
    });
    if (state.planner.foodOtherEnabled && state.planner.customFood.trim()) {
      list.push(state.planner.customFood.trim());
    }
    return list;
  }

  function getEffectiveInterests() {
    var list = state.planner.interests.slice();
    if (state.planner.interestOtherEnabled && state.planner.customInterest.trim()) {
      list.push(state.planner.customInterest.trim());
    }
    return list;
  }

  function buildBlueprintText(refCode) {
    var schedule = buildDetailedSchedule();
    var m = state.locale.months[state.planner.month] || state.locale.months.FEB;
    var p = state.locale.ui.planner;
    var nights = getActivePlannerNights();
    var stayTitle = getStayDisplayTitle(p);
    var transLabel = getTransportDisplayLabel(p);
    var statusLabel = state.planner.status === 'in_island' ? p.statusInIsland : p.statusBefore;
    var hubLabel = (p.hubs && p.hubs[state.planner.startHub]) || 'Colombo';
    var dateParts = [];
    if (state.planner.arrivalDate) dateParts.push(p.dateLabel + ': ' + state.planner.arrivalDate);
    if (state.planner.departureDate) dateParts.push(p.departureDateLabel + ': ' + state.planner.departureDate);

    var lines = [
      'SERENDIB SRI LANKA — DAY-BY-DAY TRIP BLUEPRINT' + (refCode ? ' (' + refCode + ')' : ''),
      statusLabel + ' · ' + p.startHubLabel + ': ' + hubLabel,
      'Month: ' + m.fullName + ' (' + m.headline + ')' + (dateParts.length ? ' · ' + dateParts.join(' · ') : ''),
      'Guests & Stay: ' + state.planner.travelers + ' ' + p.summaryMetaTravelers + ' · ' + nights + ' ' + p.summaryMetaNights + ' · ' + stayTitle,
      'Travel Mode: ' + transLabel + (schedule.totalTransitMins ? ' (Total transit ~' + formatDurationMins(schedule.totalTransitMins) + ')' : '')
    ];

    var foodList = getEffectiveFoodPrefs(p);
    if (foodList.length) {
      lines.push('Food Focus: ' + foodList.join(', '));
    }
    var interestList = getEffectiveInterests();
    if (interestList.length) {
      lines.push('Interests: ' + interestList.join(', '));
    }

    if (schedule.items.length) {
      lines.push('');
      schedule.items.forEach(function (entry) {
        lines.push(entry.dayRange + ' — ' + entry.stop.name + ' (' + entry.nights + state.locale.ui.atlas.nightsUnit + ')');
        if (entry.legText) lines.push('  • ' + p.transferLabel + ': ' + entry.legText);
        lines.push('  • ' + p.seeLabel + ': ' + entry.stop.highlights.slice(0, 2).join(' / ') + ' (' + entry.stop.daylightWindow + ')');
        lines.push('  • ' + p.eatLabel + ': ' + entry.dining.spot + ' — ' + entry.dining.detail);
      });
    }
    return lines.join('\n');
  }

  function openPlannerModal(startStep) {
    state.planner.open = true;
    state.planner.confirmed = null;
    state.planner.step = startStep || 1;
    state.planner.month = state.activeMonth;

    if (dom.toast) {
      dom.toast.classList.remove('is-shown');
      clearTimeout(toastTimer);
    }

    dom.dossierSheet.classList.remove('is-open');
    dom.routeSheet.classList.remove('is-open');
    dom.dossierSheet.hidden = true;
    dom.routeSheet.hidden = true;
    dom.backdrop.classList.remove('is-open');
    dom.backdrop.hidden = true;

    renderPlannerModal();
    dom.plannerModal.hidden = false;
    requestAnimationFrame(function () {
      dom.plannerModal.classList.add('is-open');
      document.body.classList.add('drawer-open');
    });
  }

  function closePlannerModal() {
    if (!dom.plannerModal || dom.plannerModal.hidden) return;
    state.planner.open = false;
    dom.plannerModal.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    setTimeout(function () {
      if (!state.planner.open) {
        dom.plannerModal.hidden = true;
      }
    }, 280);
  }

  function setPlannerStep(step) {
    state.planner.confirmed = null;
    state.planner.step = Math.min(3, Math.max(1, step));
    renderPlannerModal();
    var stage = document.getElementById('planner-stage');
    if (stage) stage.scrollTop = 0;
  }

  function renderPlannerStep1(p, r, stops, recNights) {
    if (dom.plannerStatusPills) {
      var statuses = [
        { id: 'before', label: p.statusBefore },
        { id: 'in_island', label: p.statusInIsland }
      ];
      dom.plannerStatusPills.innerHTML = statuses.map(function (st) {
        var active = state.planner.status === st.id;
        return '<button type="button" class="status-pill ' + (active ? 'is-active' : '') + '" data-pln-status="' + st.id + '" aria-pressed="' + active + '">' + st.label + '</button>';
      }).join('');
      dom.plannerStatusPills.querySelectorAll('[data-pln-status]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.planner.status = btn.dataset.plnStatus;
          if (state.planner.status === 'in_island' && state.planner.startHub === 'cmbAirport') {
            state.planner.startHub = 'colombo';
          } else if (state.planner.status === 'before' && state.planner.startHub === 'colombo') {
            state.planner.startHub = 'cmbAirport';
          }
          renderPlannerModal();
        });
      });
    }

    if (dom.plannerHubPills && p.hubs) {
      var hubKeys = (data.START_HUBS || []).map(function (h) { return h.id; });
      dom.plannerHubPills.innerHTML = hubKeys.map(function (hubId) {
        var active = state.planner.startHub === hubId;
        return '<button type="button" class="hub-pill ' + (active ? 'is-active' : '') + '" data-pln-hub="' + hubId + '" aria-pressed="' + active + '">' + (p.hubs[hubId] || hubId) + '</button>';
      }).join('');
      dom.plannerHubPills.querySelectorAll('[data-pln-hub]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.planner.startHub = btn.dataset.plnHub;
          renderPlannerModal();
        });
      });
    }

    dom.plannerMonsoonFit.textContent = getMonsoonHighlightText(state.planner.month);
    dom.plannerMonthPills.innerHTML = MONTH_CODES.map(function (code) {
      var active = code === state.planner.month;
      return '<button type="button" class="planner-month-chip ' + (active ? 'is-active' : '') + '" data-pln-month="' + code + '">' +
        state.locale.months[code].short + '</button>';
    }).join('');
    dom.plannerMonthPills.querySelectorAll('[data-pln-month]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.planner.month = btn.dataset.plnMonth;
        setActiveMonth(state.planner.month);
        renderPlannerModal();
      });
    });

    dom.plannerTravelersVal.textContent = String(state.planner.travelers);
    var dateNights = getCalculatedDateNights();
    if (dom.plannerNightsHint) {
      if (dateNights !== null) {
        dom.plannerNightsHint.textContent = dateNights + ' ' + r.nightsLabel;
      } else {
        dom.plannerNightsHint.textContent = stops.length ? p.nightsAutoHint.replace('{nights}', String(recNights)) : '';
      }
    }

    var todayIso = new Date().toISOString().slice(0, 10);
    if (dom.plannerDateInput) {
      dom.plannerDateInput.min = todayIso;
      dom.plannerDateInput.value = state.planner.arrivalDate || '';
    }
    if (dom.plannerDepartureInput) {
      dom.plannerDepartureInput.min = state.planner.arrivalDate || todayIso;
      dom.plannerDepartureInput.value = state.planner.departureDate || '';
    }

    var stayOrder = ['boutique', 'teaSanctuary', 'honest', 'other'];
    dom.plannerStayGrid.innerHTML = stayOrder.map(function (key) {
      var item = key === 'other'
        ? { title: p.otherOption || 'Other', sub: p.otherStaySub || 'Type your custom stay preference' }
        : p.stays[key];
      var active = state.planner.stayTier === key;
      return (
        '<button type="button" class="stay-card ' + (active ? 'is-active' : '') + '" data-pln-stay="' + key + '" aria-pressed="' + active + '">' +
        '<span class="stay-card__title">' + escapeHtml(item.title) + '</span>' +
        '<span class="stay-card__sub">' + escapeHtml(item.sub) + '</span>' +
        '</button>'
      );
    }).join('');
    if (dom.plannerStayOtherWrap && dom.plannerStayOtherInput) {
      dom.plannerStayOtherWrap.hidden = state.planner.stayTier !== 'other';
      dom.plannerStayOtherInput.value = state.planner.customStay || '';
    }
    dom.plannerStayGrid.querySelectorAll('[data-pln-stay]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.planner.stayTier = btn.dataset.plnStay;
        renderPlannerModal();
        if (state.planner.stayTier === 'other' && dom.plannerStayOtherInput) {
          dom.plannerStayOtherInput.focus();
        }
      });
    });

    var transportOrder = ['chauffeur', 'rail', 'suv', 'other'];
    dom.plannerTransportPills.innerHTML = transportOrder.map(function (key) {
      var active = state.planner.transport === key;
      var label = key === 'other' ? (p.otherOption || 'Other') : p.transports[key];
      return '<button type="button" class="transport-pill ' + (active ? 'is-active' : '') + '" data-pln-transport="' + key + '">' +
        escapeHtml(label) + '</button>';
    }).join('');
    if (dom.plannerTransportOtherWrap && dom.plannerTransportOtherInput) {
      dom.plannerTransportOtherWrap.hidden = state.planner.transport !== 'other';
      dom.plannerTransportOtherInput.value = state.planner.customTransport || '';
    }
    dom.plannerTransportPills.querySelectorAll('[data-pln-transport]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.planner.transport = btn.dataset.plnTransport;
        renderPlannerModal();
        if (state.planner.transport === 'other' && dom.plannerTransportOtherInput) {
          dom.plannerTransportOtherInput.focus();
        }
      });
    });

    if (dom.plannerFoodTags && p.foodStyles) {
      var foodKeys = Object.keys(p.foodStyles);
      var foodHtml = foodKeys.map(function (fk) {
        var picked = state.planner.foodPrefs.indexOf(fk) !== -1;
        return '<button type="button" class="quick-tag-chip ' + (picked ? 'is-picked' : '') + '" data-pln-food="' + fk + '">' +
          (picked ? '&#10003; ' : '+ ') + escapeHtml(p.foodStyles[fk]) + '</button>';
      }).join('');
      foodHtml += '<button type="button" class="quick-tag-chip ' + (state.planner.foodOtherEnabled ? 'is-picked' : '') + '" data-pln-food-other="1">' +
        (state.planner.foodOtherEnabled ? '&#10003; ' : '+ ') + escapeHtml(p.otherOption || 'Other') + '</button>';
      dom.plannerFoodTags.innerHTML = foodHtml;

      if (dom.plannerFoodOtherWrap && dom.plannerFoodOtherInput) {
        dom.plannerFoodOtherWrap.hidden = !state.planner.foodOtherEnabled;
        dom.plannerFoodOtherInput.value = state.planner.customFood || '';
      }
      dom.plannerFoodTags.querySelectorAll('[data-pln-food]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var fk = btn.dataset.plnFood;
          var idx = state.planner.foodPrefs.indexOf(fk);
          if (idx !== -1) state.planner.foodPrefs.splice(idx, 1);
          else state.planner.foodPrefs.push(fk);
          renderPlannerModal();
        });
      });
      var foodOtherBtn = dom.plannerFoodTags.querySelector('[data-pln-food-other]');
      if (foodOtherBtn) {
        foodOtherBtn.addEventListener('click', function () {
          state.planner.foodOtherEnabled = !state.planner.foodOtherEnabled;
          renderPlannerModal();
          if (state.planner.foodOtherEnabled && dom.plannerFoodOtherInput) {
            dom.plannerFoodOtherInput.focus();
          }
        });
      }
    }

    var focusOpts = state.locale.ui.finder.focusOptions;
    var focusKeys = Object.keys(focusOpts).filter(function (k) { return k !== 'all'; });
    var intHtml = focusKeys.map(function (k) {
      var label = focusOpts[k];
      var picked = state.planner.interests.indexOf(label) !== -1;
      return '<button type="button" class="quick-tag-chip ' + (picked ? 'is-picked' : '') + '" data-pln-interest="' + escapeHtml(label) + '">' +
        (picked ? '&#10003; ' : '+ ') + escapeHtml(label) + '</button>';
    }).join('');
    intHtml += '<button type="button" class="quick-tag-chip ' + (state.planner.interestOtherEnabled ? 'is-picked' : '') + '" data-pln-interest-other="1">' +
      (state.planner.interestOtherEnabled ? '&#10003; ' : '+ ') + escapeHtml(p.otherOption || 'Other') + '</button>';
    dom.plannerInterestTags.innerHTML = intHtml;

    if (dom.plannerInterestOtherWrap && dom.plannerInterestOtherInput) {
      dom.plannerInterestOtherWrap.hidden = !state.planner.interestOtherEnabled;
      dom.plannerInterestOtherInput.value = state.planner.customInterest || '';
    }
    dom.plannerInterestTags.querySelectorAll('[data-pln-interest]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tag = btn.dataset.plnInterest;
        var idx = state.planner.interests.indexOf(tag);
        if (idx !== -1) state.planner.interests.splice(idx, 1);
        else state.planner.interests.push(tag);
        renderPlannerModal();
      });
    });
    var intOtherBtn = dom.plannerInterestTags.querySelector('[data-pln-interest-other]');
    if (intOtherBtn) {
      intOtherBtn.addEventListener('click', function () {
        state.planner.interestOtherEnabled = !state.planner.interestOtherEnabled;
        renderPlannerModal();
        if (state.planner.interestOtherEnabled && dom.plannerInterestOtherInput) {
          dom.plannerInterestOtherInput.focus();
        }
      });
    }
  }

  function renderPlannerStep2(p, stops, schedule) {
    var nightsUnit = state.locale.ui.atlas.nightsUnit;
    dom.plannerDestHeading.textContent = p.destinationsHeading.replace('{count}', String(stops.length));
    var presetKeys = Object.keys(state.locale.itineraries);
    dom.plannerPresets.innerHTML = presetKeys.map(function (key) {
      var rt = state.locale.itineraries[key];
      return '<button type="button" class="planner-preset-btn" data-pln-preset="' + key + '">' + rt.duration + ' · ' + rt.title + '</button>';
    }).join('') + (stops.length ? '<button type="button" class="planner-preset-btn" data-pln-clear="1">' + p.clearStops + '</button>' : '');

    dom.plannerPresets.querySelectorAll('[data-pln-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.savedStopIds = (ITINERARY_PRESETS[btn.dataset.plnPreset] || ['sigiriya', 'ella', 'galle']).slice();
        persistSavedStops();
        syncRouteUI();
        renderPlannerModal();
      });
    });
    var clearBtn = dom.plannerPresets.querySelector('[data-pln-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        state.savedStopIds = [];
        persistSavedStops();
        syncRouteUI();
        renderPlannerModal();
      });
    }

    if (dom.plannerDestFilters) {
      var filters = state.locale.ui.atlas.filters;
      var regionKeys = Object.keys(filters);
      dom.plannerDestFilters.innerHTML = regionKeys.map(function (rk) {
        var active = state.planner.modalRegion === rk;
        return '<button type="button" class="planner-filter-chip ' + (active ? 'is-active' : '') + '" data-pln-filter="' + rk + '">' +
          filters[rk] + '</button>';
      }).join('');
      dom.plannerDestFilters.querySelectorAll('[data-pln-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.planner.modalRegion = btn.dataset.plnFilter;
          renderPlannerModal();
        });
      });
    }

    var allDest = getMergedDestinations();
    var filteredDest = state.planner.modalRegion === 'all'
      ? allDest
      : allDest.filter(function (d) { return d.regionKey === state.planner.modalRegion; });

    dom.plannerDestGrid.innerHTML = filteredDest.map(function (dest) {
      var selected = state.savedStopIds.indexOf(dest.id) !== -1;
      return (
        '<button type="button" class="planner-dest-card ' + (selected ? 'is-selected' : '') + '" data-pln-stop="' + dest.id + '" aria-pressed="' + selected + '">' +
        '<div class="planner-dest-card__thumb">' +
        '<img src="' + dest.image + '" alt="' + dest.imageAlt + '" loading="lazy" />' +
        '<span class="planner-dest-card__check" aria-hidden="true">' + (selected ? '&#10003;' : '+') + '</span>' +
        '</div>' +
        '<div class="planner-dest-card__info">' +
        '<div class="planner-dest-card__meta"><span>' + dest.number + ' · ' + dest.region + '</span><span>' + getStopNights(dest) + nightsUnit + (dest.pricePerNightUsd ? ' · $' + escapeHtml(dest.pricePerNightUsd) + '/nt' : '') + '</span></div>' +
        '<span class="planner-dest-card__name">' + dest.name + '</span>' +
        '</div></button>'
      );
    }).join('');
    dom.plannerDestGrid.querySelectorAll('[data-pln-stop]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleSavedStop(btn.dataset.plnStop);
        renderPlannerModal();
      });
    });

    if (dom.plannerRouteBuilder && dom.plannerRouteCards) {
      dom.plannerRouteBuilder.hidden = !schedule.items.length;
      dom.plannerRouteCards.innerHTML = schedule.items.map(function (entry, idx) {
        var totalStops = schedule.items.length;
        return (
          (entry.legText ? '<div class="route-leg-connector">&#10132; ' + p.transferLabel + ': ' + entry.legText + '</div>' : '') +
          '<article class="itinerary-stop-card">' +
          '<div class="itinerary-stop-card__top">' +
          '<div class="itinerary-stop-card__id">' +
          '<img src="' + entry.stop.image + '" alt="' + entry.stop.name + '" />' +
          '<div style="min-width:0;">' +
          '<span class="mono-label" style="color:var(--accent-terracotta); font-size:0.65rem;">' + entry.dayRange + ' · ' + entry.nights + nightsUnit + '</span>' +
          '<h4 class="itinerary-stop-card__title">' + entry.stop.name + '</h4>' +
          '</div></div>' +
          '<div class="itinerary-stop-card__ctrl">' +
          '<button type="button" class="mini-ctrl-btn" data-pln-nights="-1" data-stop-id="' + entry.stop.id + '" aria-label="Fewer nights">&minus;</button>' +
          '<span class="mono-label" style="min-width:24px; text-align:center;">' + entry.nights + nightsUnit + '</span>' +
          '<button type="button" class="mini-ctrl-btn" data-pln-nights="1" data-stop-id="' + entry.stop.id + '" aria-label="More nights">+</button>' +
          '<button type="button" class="mini-ctrl-btn" data-pln-move="-1" data-stop-idx="' + idx + '"' + (idx === 0 ? ' disabled' : '') + ' aria-label="Move earlier">&uarr;</button>' +
          '<button type="button" class="mini-ctrl-btn" data-pln-move="1" data-stop-idx="' + idx + '"' + (idx === totalStops - 1 ? ' disabled' : '') + ' aria-label="Move later">&darr;</button>' +
          '</div></div>' +
          '<div class="itinerary-stop-card__pillars">' +
          '<div class="pillar-box">' +
          '<span class="pillar-box__kicker">' + p.seeLabel + ' · ' + entry.stop.daylightWindow + '</span>' +
          '<strong>' + entry.stop.highlights[0] + '</strong>' +
          '<span>' + (entry.stop.highlights[1] || entry.stop.tagline) + '</span>' +
          '</div>' +
          '<div class="pillar-box pillar-box--eat">' +
          '<span class="pillar-box__kicker">' + p.eatLabel + '</span>' +
          '<strong>' + entry.dining.spot + '</strong>' +
          '<span>' + entry.dining.detail + '</span>' +
          '</div>' +
          '</div></article>'
        );
      }).join('');

      dom.plannerRouteCards.querySelectorAll('[data-pln-nights]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          adjustStopNights(btn.dataset.stopId, Number(btn.dataset.plnNights));
        });
      });
      dom.plannerRouteCards.querySelectorAll('[data-pln-move]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          moveStopOrder(Number(btn.dataset.stopIdx), Number(btn.dataset.plnMove));
        });
      });
    }
  }

  function renderPlannerStep3(p, monthObj, arrivalDisplay, departureDisplay, activeNights, schedule) {
    var nightsUnit = state.locale.ui.atlas.nightsUnit;
    var statusLabel = state.planner.status === 'in_island' ? p.statusInIsland : p.statusBefore;
    var hubLabel = (p.hubs && p.hubs[state.planner.startHub]) || 'Colombo';
    var datesSummary = state.planner.arrivalDate
      ? state.planner.arrivalDate + (state.planner.departureDate ? ' → ' + state.planner.departureDate : '')
      : departureDisplay;

    var daysHtml = schedule.items.length
      ? schedule.items.map(function (entry) {
          return (
            '<div class="day-review-row">' +
            '<div class="day-review-row__head">' +
            '<strong>' + entry.dayRange + ' · ' + entry.stop.name + '</strong>' +
            '<span class="mono-label" style="color:var(--accent-tea);">' + entry.nights + nightsUnit + '</span>' +
            '</div>' +
            '<div class="day-review-row__grid">' +
            (entry.legText ? '<div><strong>' + p.transferLabel + ':</strong> ' + entry.legText + '</div>' : '') +
            '<div><strong>' + p.seeLabel + ':</strong> ' + entry.stop.highlights[0] + '</div>' +
            '<div><strong>' + p.eatLabel + ':</strong> ' + entry.dining.spot + ' — ' + entry.dining.detail + '</div>' +
            '</div></div>'
          );
        }).join('')
      : '<p style="margin:0; font-size:0.84rem; color:var(--ink-muted);">' + p.summaryNoStops + '</p>';

    dom.plannerMobileReview.innerHTML =
      '<div class="day-review-head">' +
      '<div>' +
      '<span class="mono-label" style="color:var(--accent-terracotta); display:block;">' + p.reviewHeading + '</span>' +
      '<strong style="font-size:0.88rem;">' + statusLabel + ' (' + hubLabel + ') · ' + monthObj.fullName + ' · ' + datesSummary + ' · ' + state.planner.travelers + ' ' + p.summaryMetaTravelers + ' · ' + activeNights + nightsUnit + '</strong>' +
      '</div>' +
      '<div class="day-review-actions">' +
      '<button type="button" class="btn btn--outline" id="pln-review-copy">' + p.copySummaryBtn + '</button>' +
      '<button type="button" class="btn btn--outline" id="pln-review-print">' + p.printBtn + '</button>' +
      '</div></div>' +
      '<div class="day-review-list">' + daysHtml + '</div>';

    var copyBtn = document.getElementById('pln-review-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = buildBlueprintText(null);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { showToast(state.locale.ui.toasts.copied); });
        }
      });
    }
    var printBtn = document.getElementById('pln-review-print');
    if (printBtn) {
      printBtn.addEventListener('click', function () { window.print(); });
    }

    if (dom.plannerAuthHint) {
      var acc = state.locale.ui.account || {};
      if (state.account.user) {
        dom.plannerAuthHint.innerHTML = '<span>' + escapeHtml((acc.signedInAutoSave || 'Signed in as {email} — saves automatically to My Trips.').replace('{email}', state.account.user.email || '')) + '</span>';
        dom.plannerAuthHint.hidden = false;
        var nIn = document.getElementById('pln-name');
        var eIn = document.getElementById('pln-email');
        if (nIn && !nIn.value && state.account.user.displayName) nIn.value = state.account.user.displayName;
        if (eIn && !eIn.value && state.account.user.email) eIn.value = state.account.user.email;
      } else {
        dom.plannerAuthHint.innerHTML =
          '<span>' + escapeHtml(acc.savePendingBanner || 'Sign in or create a free account to save this trip and open it anytime.') + '</span>' +
          '<button type="button" class="btn btn--outline" id="pln-step3-signin-btn">' + escapeHtml(acc.navSignIn || 'Sign In') + '</button>';
        dom.plannerAuthHint.hidden = false;
        var sBtn = document.getElementById('pln-step3-signin-btn');
        if (sBtn) {
          sBtn.addEventListener('click', function () {
            openAccountModal(null);
          });
        }
      }
    }
  }

  function renderPlannerAside(p, r, stops, monthObj, arrivalDisplay, departureDisplay, activeNights, schedule) {
    var nightsUnit = state.locale.ui.atlas.nightsUnit;
    var stayTitle = getStayDisplayTitle(p);
    var transLabel = getTransportDisplayLabel(p);
    var statusLabel = state.planner.status === 'in_island' ? p.statusInIsland : p.statusBefore;
    var hubLabel = (p.hubs && p.hubs[state.planner.startHub]) || 'Colombo';

    dom.plannerAsideCount.textContent = stops.length + ' ' + r.stopsLabel + ' · ' + activeNights + nightsUnit;
    if (dom.plannerAsideTransit) {
      dom.plannerAsideTransit.textContent = schedule.totalTransitMins
        ? (p.transferLabel + ': ~' + formatDurationMins(schedule.totalTransitMins) + ' · ' + transLabel)
        : (p.startHubLabel + ': ' + hubLabel + ' · ' + transLabel);
    }

    dom.plannerAsideMonsoon.innerHTML =
      '<span class="mono-label" style="display:block; color:var(--ink-muted); margin-bottom:0.2rem;">' + p.summaryMonsoon + ' · ' + monthObj.fullName + '</span>' +
      '<strong>' + monthObj.headline + '</strong>';
    dom.plannerAsideSpecs.innerHTML =
      '<div><span>' + p.dateLabel + '</span><strong>' + arrivalDisplay + '</strong></div>' +
      '<div><span>' + p.departureDateLabel + '</span><strong>' + departureDisplay + '</strong></div>' +
      '<div><span>' + p.summaryMetaTravelers + '</span><strong>' + state.planner.travelers + '</strong></div>' +
      '<div><span>' + p.summaryMetaNights + '</span><strong>' + activeNights + nightsUnit + '</strong></div>' +
      '<div style="grid-column:1 / -1;"><span>' + statusLabel + ' · ' + p.startHubLabel + '</span><strong>' + escapeHtml(hubLabel + ' · ' + stayTitle) + '</strong></div>';

    if (!schedule.items.length) {
      dom.plannerAsideStops.innerHTML = '<p style="font-size:0.84rem; color:var(--ink-muted); margin:0;">' + p.summaryNoStops + '</p>';
      return;
    }

    dom.plannerAsideStops.innerHTML = schedule.items.map(function (entry, idx) {
      var legShort = entry.leg ? ('~' + formatDurationMins(entry.leg.mins) + (entry.leg.scenicHillRail ? ' · Rail' : '')) : '';
      return (
        (legShort ? '<div class="aside-stop-leg">' + legShort + '</div>' : '') +
        '<div class="aside-stop-row">' +
        '<div class="aside-stop-row__main">' +
        '<img src="' + entry.stop.image + '" alt="' + entry.stop.name + '" />' +
        '<div style="min-width:0;">' +
        '<div class="mono-label" style="font-size:0.62rem; color:var(--ink-muted);">' + entry.dayRange + ' · ' + entry.nights + nightsUnit + '</div>' +
        '<div class="aside-stop-row__title">' + entry.stop.name + '</div>' +
        '<div class="aside-stop-row__sub">' + entry.dining.spot + '</div>' +
        '</div></div>' +
        '<div class="aside-stop-row__actions">' +
        '<button type="button" class="aside-stop-row__rm" data-aside-move="-1" data-aside-idx="' + idx + '"' + (idx === 0 ? ' disabled' : '') + ' aria-label="Move up">&uarr;</button>' +
        '<button type="button" class="aside-stop-row__rm" data-aside-rm="' + entry.stop.id + '" aria-label="' + r.removeStop + '">&times;</button>' +
        '</div></div>'
      );
    }).join('');

    dom.plannerAsideStops.querySelectorAll('[data-aside-rm]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleSavedStop(btn.dataset.asideRm);
        renderPlannerModal();
      });
    });
    dom.plannerAsideStops.querySelectorAll('[data-aside-move]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        moveStopOrder(Number(btn.dataset.asideIdx), Number(btn.dataset.asideMove));
      });
    });
  }

  function renderPlannerModal() {
    if (!dom.plannerModal) return;
    var p = state.locale.ui.planner;
    var r = state.locale.ui.routeSheet;
    var stops = getSavedStopObjects();
    var recNights = getRecommendedNights();
    var activeNights = getActivePlannerNights();
    var nightsUnit = state.locale.ui.atlas.nightsUnit;
    var monthObj = state.locale.months[state.planner.month] || state.locale.months.FEB;
    var schedule = buildDetailedSchedule();

    dom.closePlannerBtn.setAttribute('aria-label', p.closeLabel || 'Close');

    dom.plannerSteps.hidden = Boolean(state.planner.confirmed);
    dom.plannerSteps.querySelectorAll('[data-planner-nav]').forEach(function (btn) {
      var n = Number(btn.dataset.plannerNav);
      btn.classList.toggle('is-active', !state.planner.confirmed && state.planner.step === n);
      btn.classList.toggle('is-done', !state.planner.confirmed && state.planner.step > n);
    });

    dom.plannerPane1.hidden = Boolean(state.planner.confirmed) || state.planner.step !== 1;
    dom.plannerPane2.hidden = Boolean(state.planner.confirmed) || state.planner.step !== 2;
    dom.plannerPane3.hidden = Boolean(state.planner.confirmed) || state.planner.step !== 3;
    dom.plannerConfirmed.hidden = !state.planner.confirmed;
    dom.plannerFooter.hidden = Boolean(state.planner.confirmed);

    var arrivalDisplay = state.planner.arrivalDate || p.dateAny;
    var departureDisplay = state.planner.departureDate || p.dateAny;
    var stayTitle = getStayDisplayTitle(p);
    var routeLine = stops.length ? stops.map(function (s) { return s.name; }).join(' → ') : p.summaryNoStops;

    renderPlannerStep1(p, r, stops, recNights);
    renderPlannerStep2(p, stops, schedule);
    renderPlannerStep3(p, monthObj, arrivalDisplay, departureDisplay, activeNights, schedule);
    renderPlannerAside(p, r, stops, monthObj, arrivalDisplay, departureDisplay, activeNights, schedule);

    dom.plannerStepMeta.textContent = p.stepCounter.replace('{step}', String(state.planner.step));
    dom.plannerMobileSummary.textContent = stops.length + ' ' + r.stopsLabel + ' · ' + activeNights + nightsUnit + ' · ' + monthObj.short;
    dom.plannerBackBtn.hidden = state.planner.step === 1;
    dom.plannerNextLabel.textContent = state.planner.step === 3 ? p.submitBtn : p.nextBtn;

    if (state.planner.confirmed) {
      var conf = state.planner.confirmed;
      var safeName = escapeHtml(conf.name);
      var safeRef = escapeHtml(conf.refCode);
      var safeBadge = escapeHtml(p.confirmedBadge);
      var safeHeading = escapeHtml(p.confirmedHeading).replace('{name}', safeName);
      var safeSub = escapeHtml(p.confirmedSub).replace('{ref}', safeRef);
      var safeMonth = escapeHtml(monthObj.fullName);
      var safeDates = (state.planner.arrivalDate || state.planner.departureDate)
        ? ' (' + escapeHtml(arrivalDisplay) + ' → ' + escapeHtml(departureDisplay) + ')'
        : '';
      var safeStay = escapeHtml(stayTitle);
      var safeTransport = escapeHtml(getTransportDisplayLabel(p));
      var safeRouteLine = escapeHtml(routeLine);
      var acc = state.locale.ui.account || {};

      dom.plannerConfirmed.innerHTML =
        '<div class="confirmed-card">' +
        '<span class="mono-label" style="color:var(--accent-tea);">' + safeBadge + ' · ' + safeRef +
        (conf.cloudSynced ? ' [FIREBASE SYNCED]' : '') + '</span>' +
        '<h3 class="display-serif" style="margin:0.45rem 0 0.35rem; font-size:clamp(1.45rem, 1.2rem + 0.9vw, 1.95rem);">' +
        safeHeading + '</h3>' +
        '<p style="margin:0; color:var(--ink-secondary); font-size:0.92rem;">' + safeSub + '</p>' +
        '<div class="confirmed-meta-grid">' +
        '<div><span>' + escapeHtml(p.monthHeading) + '</span><strong>' + safeMonth + safeDates + '</strong></div>' +
        '<div><span>' + escapeHtml(p.summaryMetaTravelers) + ' &amp; ' + escapeHtml(p.summaryMetaNights) + '</span><strong>' + Number(state.planner.travelers) + ' · ' + Number(activeNights) + escapeHtml(nightsUnit) + '</strong></div>' +
        '<div><span>' + escapeHtml(p.summaryMetaStay) + '</span><strong>' + safeStay + '</strong></div>' +
        '<div><span>' + escapeHtml(p.transportHeading) + '</span><strong>' + safeTransport + '</strong></div>' +
        '<div style="grid-column:1 / -1;"><span>' + escapeHtml(p.summaryStops) + '</span><strong>' + safeRouteLine + '</strong></div>' +
        '</div>' +
        '<div style="display:flex; flex-wrap:wrap; gap:0.6rem;">' +
        '<button type="button" class="btn btn--primary" id="pln-copy-confirmed">' + escapeHtml(p.copySummaryBtn) + '</button>' +
        '<button type="button" class="btn btn--outline" id="pln-print-confirmed">' + escapeHtml(p.printBtn) + '</button>' +
        '<button type="button" class="btn btn--outline" id="pln-edit-confirmed">' + escapeHtml(p.editBtn) + '</button>' +
        (conf.userTripSaved ? '<button type="button" class="btn btn--outline" id="pln-view-mytrips">' + escapeHtml(acc.viewInMyTripsBtn || 'View in My Trips') + '</button>' : '') +
        '<button type="button" class="btn btn--outline" id="pln-done-confirmed">' + escapeHtml(p.doneBtn) + '</button>' +
        '</div>' +
        (!conf.userTripSaved && conf.snapshot
          ? '<div class="confirmed-save-cta"><p>' + escapeHtml(acc.savePendingBanner || 'Sign in or create a free account to save this trip and open it anytime.') + '</p>' +
            '<button type="button" class="btn btn--primary" id="pln-save-account-btn">' + escapeHtml(acc.savePendingBtn || 'Sign In / Save to My Trips') + '</button></div>'
          : '') +
        '</div>';

      document.getElementById('pln-copy-confirmed').addEventListener('click', function () {
        var text = buildBlueprintText(conf.refCode);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showToast(state.locale.ui.toasts.copied);
          }).catch(function () {
            showToast(state.locale.ui.toasts.copyFallback);
          });
        } else {
          showToast(state.locale.ui.toasts.copyFallback);
        }
      });
      document.getElementById('pln-print-confirmed').addEventListener('click', function () { window.print(); });
      document.getElementById('pln-edit-confirmed').addEventListener('click', function () { setPlannerStep(1); });
      document.getElementById('pln-done-confirmed').addEventListener('click', closePlannerModal);
      var myTripsBtn = document.getElementById('pln-view-mytrips');
      if (myTripsBtn) {
        myTripsBtn.addEventListener('click', function () {
          closePlannerModal();
          openAccountModal(null, conf.refCode);
        });
      }
      var saveAccBtn = document.getElementById('pln-save-account-btn');
      if (saveAccBtn) {
        saveAccBtn.addEventListener('click', function () {
          closePlannerModal();
          openAccountModal(conf.snapshot);
        });
      }
    }
  }

  function submitPlannerBrief() {
    var nameInput = document.getElementById('pln-name');
    var emailInput = document.getElementById('pln-email');
    if (dom.plannerForm && !dom.plannerForm.reportValidity()) return;

    var name = (nameInput ? nameInput.value : '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, 120);
    var email = (emailInput ? emailInput.value : '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 160);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    var origin = (document.getElementById('pln-origin') ? document.getElementById('pln-origin').value : '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, 120);
    var notes = (document.getElementById('pln-notes') ? document.getElementById('pln-notes').value : '').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim().slice(0, 1000);
    var schedule = buildDetailedSchedule();
    var p = state.locale.ui.planner;
    var stopObjects = getSavedStopObjects();
    var stopIds = stopObjects.map(function (d) { return d.id; });
    var stops = stopObjects.map(function (d) { return d.name; });
    var activeNights = getActivePlannerNights();
    var refCode = generateRefCode();
    var createdAt = new Date().toISOString();

    var stayDisplay = getStayDisplayTitle(p);
    var stayTierVal = state.planner.stayTier === 'other' && state.planner.customStay.trim()
      ? ('Other: ' + state.planner.customStay.trim()).slice(0, 100)
      : state.planner.stayTier;
    var transportDisplay = getTransportDisplayLabel(p);
    var transportVal = state.planner.transport === 'other' && state.planner.customTransport.trim()
      ? ('Other: ' + state.planner.customTransport.trim()).slice(0, 100)
      : state.planner.transport;

    var effectiveFood = state.planner.foodPrefs.slice();
    if (state.planner.foodOtherEnabled && state.planner.customFood.trim()) {
      effectiveFood.push('Other: ' + state.planner.customFood.trim().slice(0, 70));
    }
    var effectiveInterests = getEffectiveInterests();

    var scheduleCompact = schedule.items.map(function (entry) {
      return {
        stopId: entry.stop.id,
        stopName: entry.stop.name,
        dayRange: entry.dayRange,
        nights: entry.nights,
        legText: entry.legText || '',
        highlight: (entry.stop.highlights && entry.stop.highlights[0]) || '',
        diningSpot: entry.dining ? entry.dining.spot : '',
        diningDetail: entry.dining ? entry.dining.detail : ''
      };
    });

    var tripSnapshot = {
      refCode: refCode,
      name: name,
      email: email,
      month: state.planner.month,
      tripStatus: state.planner.status,
      startHub: state.planner.startHub,
      arrivalDate: state.planner.arrivalDate,
      departureDate: state.planner.departureDate,
      guests: state.planner.travelers + ' guests · ' + activeNights + ' nights',
      travelers: state.planner.travelers,
      nights: activeNights,
      stayTier: stayTierVal,
      stayDisplay: stayDisplay,
      customStay: state.planner.customStay,
      transport: transportVal,
      transportDisplay: transportDisplay,
      customTransport: state.planner.customTransport,
      foodPrefs: effectiveFood,
      foodOther: state.planner.foodOtherEnabled ? state.planner.customFood : '',
      interests: effectiveInterests,
      interestOther: state.planner.interestOtherEnabled ? state.planner.customInterest : '',
      perStopNights: Object.assign({}, state.planner.nightsByStop),
      totalTransitMins: schedule.totalTransitMins,
      origin: origin,
      notes: notes,
      stopIds: stopIds,
      stops: stops,
      schedule: scheduleCompact,
      lang: state.lang,
      createdAt: createdAt
    };

    dom.plannerNextBtn.disabled = true;
    dom.plannerNextLabel.textContent = p.submittingBtn;

    var finish = function (cloudSynced, userTripSaved) {
      dom.plannerNextBtn.disabled = false;
      state.planner.confirmed = {
        refCode: refCode,
        name: name,
        cloudSynced: cloudSynced,
        userTripSaved: userTripSaved,
        snapshot: tripSnapshot
      };
      renderPlannerModal();
      showToast(state.locale.ui.toasts.compiled.replace('{ref}', refCode));
    };

    var fb = window.SERENDIB_FIREBASE;
    if (fb && typeof fb.saveInquiry === 'function') {
      fb.saveInquiry(tripSnapshot).then(function () {
        if (state.account.user && typeof fb.saveUserTrip === 'function') {
          return fb.saveUserTrip(tripSnapshot).then(function () {
            loadAccountTrips();
            finish(true, true);
          }).catch(function () {
            finish(true, false);
          });
        }
        finish(true, false);
      }).catch(function () {
        if (state.account.user && typeof fb.saveUserTrip === 'function') {
          return fb.saveUserTrip(tripSnapshot).then(function () {
            loadAccountTrips();
            finish(false, true);
          }).catch(function () {
            finish(false, false);
          });
        }
        finish(false, false);
      });
    } else {
      finish(false, false);
    }
  }

  /* ------------------------------------------------------------------------
     Quick Finder, Copy & Planner Triggers
     ------------------------------------------------------------------------ */
  function initForms() {
    document.querySelectorAll('[data-open-planner]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        dom.mobileNav.classList.remove('is-open');
        dom.mobileNav.setAttribute('aria-hidden', 'true');
        dom.mobileMenuOpen.setAttribute('aria-expanded', 'false');
        openPlannerModal(1);
      });
    });

    dom.closePlannerBtn.addEventListener('click', closePlannerModal);
    dom.plannerBackdrop.addEventListener('click', closePlannerModal);

    dom.plannerSteps.querySelectorAll('[data-planner-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setPlannerStep(Number(btn.dataset.plannerNav));
      });
    });

    if (dom.plannerDateInput) {
      dom.plannerDateInput.min = new Date().toISOString().slice(0, 10);
      dom.plannerDateInput.addEventListener('change', function () {
        state.planner.arrivalDate = dom.plannerDateInput.value;
        if (state.planner.arrivalDate) {
          var parts = state.planner.arrivalDate.split('-');
          var monthIndex = parseInt(parts[1], 10) - 1;
          if (!isNaN(monthIndex) && MONTH_CODES[monthIndex]) {
            state.planner.month = MONTH_CODES[monthIndex];
            setActiveMonth(state.planner.month);
          }
          if (state.planner.departureDate && state.planner.departureDate < state.planner.arrivalDate) {
            state.planner.departureDate = '';
          }
        }
        renderPlannerModal();
      });
    }

    if (dom.plannerDepartureInput) {
      dom.plannerDepartureInput.min = state.planner.arrivalDate || new Date().toISOString().slice(0, 10);
      dom.plannerDepartureInput.addEventListener('change', function () {
        var val = dom.plannerDepartureInput.value;
        if (state.planner.arrivalDate && val && val < state.planner.arrivalDate) {
          val = '';
        }
        state.planner.departureDate = val;
        renderPlannerModal();
      });
    }

    document.querySelectorAll('[data-step-field]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var field = btn.dataset.stepField;
        var delta = Number(btn.dataset.stepDelta);
        if (field === 'travelers') {
          state.planner.travelers = Math.min(12, Math.max(1, state.planner.travelers + delta));
        }
        renderPlannerModal();
      });
    });

    if (dom.plannerStayOtherInput) {
      dom.plannerStayOtherInput.addEventListener('input', function () {
        state.planner.customStay = dom.plannerStayOtherInput.value.slice(0, 80);
        var p = state.locale.ui.planner;
        var monthObj = state.locale.months[state.planner.month] || state.locale.months.FEB;
        renderPlannerAside(p, state.locale.ui.routeSheet, getSavedStopObjects(), monthObj, state.planner.arrivalDate || p.dateAny, state.planner.departureDate || p.dateAny, getActivePlannerNights(), buildDetailedSchedule());
      });
    }
    if (dom.plannerTransportOtherInput) {
      dom.plannerTransportOtherInput.addEventListener('input', function () {
        state.planner.customTransport = dom.plannerTransportOtherInput.value.slice(0, 80);
        var p = state.locale.ui.planner;
        var monthObj = state.locale.months[state.planner.month] || state.locale.months.FEB;
        renderPlannerAside(p, state.locale.ui.routeSheet, getSavedStopObjects(), monthObj, state.planner.arrivalDate || p.dateAny, state.planner.departureDate || p.dateAny, getActivePlannerNights(), buildDetailedSchedule());
      });
    }
    if (dom.plannerFoodOtherInput) {
      dom.plannerFoodOtherInput.addEventListener('input', function () {
        state.planner.customFood = dom.plannerFoodOtherInput.value.slice(0, 80);
      });
    }
    if (dom.plannerInterestOtherInput) {
      dom.plannerInterestOtherInput.addEventListener('input', function () {
        state.planner.customInterest = dom.plannerInterestOtherInput.value.slice(0, 80);
      });
    }

    dom.plannerBackBtn.addEventListener('click', function () {
      setPlannerStep(state.planner.step - 1);
    });

    dom.plannerNextBtn.addEventListener('click', function () {
      if (state.planner.step < 3) {
        setPlannerStep(state.planner.step + 1);
      } else {
        submitPlannerBrief();
      }
    });

    dom.plannerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      submitPlannerBrief();
    });

    if (dom.quickFinder) {
      dom.quickFinder.addEventListener('submit', function (e) {
        e.preventDefault();
        var monthCode = dom.finderMonth.value;
        var focus = dom.finderFocus.value;
        var pace = dom.finderPace.value;

        setActiveMonth(monthCode);
        state.planner.month = monthCode;
        setRegionFilter(focus);
        state.activeItineraryId = pace;
        renderItineraries();

        var target = focus === 'all' ? document.getElementById('compass') : document.getElementById('atlas');
        target.scrollIntoView({ behavior: 'smooth' });
        var monthName = state.locale.months[monthCode].fullName;
        showToast(state.locale.ui.toasts.matched.replace('{month}', monthName));
      });
    }

    dom.copyBriefBtn.addEventListener('click', function () {
      var text = buildBlueprintText(null);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast(state.locale.ui.toasts.copied);
        }).catch(function () {
          showToast(state.locale.ui.toasts.copyFallback);
        });
      } else {
        showToast(state.locale.ui.toasts.copyFallback);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Scroll Reveal
     ------------------------------------------------------------------------ */
  function initReveals() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  function initHeroSlider() {
    var slider = document.getElementById('hero-slider');
    if (!slider) return;
    var slides = slider.querySelectorAll('.hero__slide');
    var dots = document.querySelectorAll('.hero__dot');
    if (slides.length < 2) return;

    var current = 0;
    var timer = null;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function goTo(index) {
      var next = (index + slides.length) % slides.length;
      if (next === current) return;
      slides[current].classList.remove('is-active');
      if (dots[current]) {
        dots[current].classList.remove('is-active');
        dots[current].setAttribute('aria-selected', 'false');
      }
      current = next;
      slides[current].classList.add('is-active');
      if (dots[current]) {
        dots[current].classList.add('is-active');
        dots[current].setAttribute('aria-selected', 'true');
      }
    }

    function stopAuto() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startAuto() {
      stopAuto();
      if (reduceMotion) return;
      timer = setInterval(function () {
        if (!document.hidden) goTo(current + 1);
      }, 4200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = Number(dot.dataset.heroDot);
        if (!isNaN(idx)) {
          goTo(idx);
          startAuto();
        }
      });
    });

    var heroEl = slider.closest('.hero');
    if (heroEl) {
      heroEl.addEventListener('mouseenter', stopAuto);
      heroEl.addEventListener('mouseleave', startAuto);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAuto();
      else startAuto();
    });

    startAuto();
  }

  /* ------------------------------------------------------------------------
     Customer Account & My Trips Library
     ------------------------------------------------------------------------ */
  function getAccStrings() {
    return (state.locale && state.locale.ui && state.locale.ui.account) || {};
  }

  function findDestThumb(stopId) {
    for (var i = 0; i < DESTINATIONS_META.length; i++) {
      if (DESTINATIONS_META[i].id === stopId) return DESTINATIONS_META[i].image;
    }
    return './assets/images/sigiriya-pidurangala.jpg';
  }

  function syncAccountHeaderUI() {
    var acc = getAccStrings();
    if (dom.accountTriggerLabel) {
      dom.accountTriggerLabel.textContent = state.account.user
        ? (acc.navMyTrips || 'My Trips')
        : (acc.navSignIn || 'Sign In');
    }
    if (dom.accountTripCount) {
      var count = state.account.user ? state.account.trips.length : 0;
      dom.accountTripCount.textContent = String(count);
      dom.accountTripCount.hidden = count === 0;
    }
  }

  function setAccMsg(target, msg) {
    if (!target) return;
    target.textContent = msg || '';
    target.hidden = !msg;
    if (msg && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function friendlyCustomerAuthError(err) {
    var code = (err && err.code) || '';
    if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
      return 'Google or Email sign-in is not enabled yet in Firebase Console (Authentication -> Sign-in method).';
    }
    if (code === 'auth/unauthorized-domain') {
      var host = (window.location && window.location.hostname) || 'this domain';
      return 'Add "' + host + '" under Firebase Console -> Authentication -> Settings -> Authorized domains (or sign in at serendib-sri-lanka.web.app).';
    }
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return 'Google sign-in popup was closed before completing.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Pop-up was blocked by browser — redirecting to Google sign-in...';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return 'Please choose a stronger password (at least 6 characters).';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Incorrect email or password.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please wait a few minutes and try again.';
    }
    return (err && err.message) || 'Authentication error. Please try again.';
  }

  function loadAccountTrips() {
    var fb = window.SERENDIB_FIREBASE;
    if (!fb || typeof fb.loadUserTrips !== 'function' || !state.account.user) {
      state.account.trips = [];
      syncAccountHeaderUI();
      return Promise.resolve([]);
    }
    state.account.loadingTrips = true;
    return fb.loadUserTrips().then(function (list) {
      state.account.trips = list || [];
      state.account.loadingTrips = false;
      syncAccountHeaderUI();
      if (state.account.open) renderAccountModal();
      return state.account.trips;
    }).catch(function () {
      state.account.loadingTrips = false;
      return [];
    });
  }

  function openAccountModal(pendingSnapshot, focusRef) {
    if (pendingSnapshot) state.account.pendingTripToSave = pendingSnapshot;
    if (focusRef) state.account.activeTripRef = focusRef;
    state.account.open = true;

    if (dom.mobileNav && dom.mobileNav.classList.contains('is-open')) {
      dom.mobileNav.classList.remove('is-open');
      dom.mobileNav.setAttribute('aria-hidden', 'true');
      dom.mobileMenuOpen.setAttribute('aria-expanded', 'false');
    }
    dom.dossierSheet.classList.remove('is-open');
    dom.routeSheet.classList.remove('is-open');
    dom.dossierSheet.hidden = true;
    dom.routeSheet.hidden = true;
    dom.backdrop.classList.remove('is-open');
    dom.backdrop.hidden = true;

    renderAccountModal();
    if (dom.accountModal) {
      dom.accountModal.hidden = false;
      requestAnimationFrame(function () {
        dom.accountModal.classList.add('is-open');
        document.body.classList.add('drawer-open');
      });
    }
    if (state.account.user) loadAccountTrips();
  }

  function closeAccountModal() {
    if (!dom.accountModal || dom.accountModal.hidden) return;
    state.account.open = false;
    state.account.activeTripRef = null;
    dom.accountModal.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    setTimeout(function () {
      if (!state.account.open && dom.accountModal) {
        dom.accountModal.hidden = true;
      }
    }, 260);
  }

  function renderAccountAuthMode() {
    var acc = getAccStrings();
    var isSignup = state.account.authMode === 'signup';
    if (dom.accTabSignIn) {
      dom.accTabSignIn.classList.toggle('is-active', !isSignup);
      dom.accTabSignIn.setAttribute('aria-selected', String(!isSignup));
    }
    if (dom.accTabSignUp) {
      dom.accTabSignUp.classList.toggle('is-active', isSignup);
      dom.accTabSignUp.setAttribute('aria-selected', String(isSignup));
    }
    if (dom.accNameGroup) dom.accNameGroup.hidden = !isSignup;
    if (dom.accSubmitBtn) {
      dom.accSubmitBtn.textContent = isSignup ? (acc.createAccountBtn || 'Create Account') : (acc.signInBtn || 'Sign In');
    }
    if (dom.accountPendingBanner) {
      if (state.account.pendingTripToSave) {
        dom.accountPendingBanner.textContent = (acc.savePendingBanner || 'Sign in or create an account to save reference ') + ' (' + state.account.pendingTripToSave.refCode + ').';
        dom.accountPendingBanner.hidden = false;
      } else {
        dom.accountPendingBanner.hidden = true;
      }
    }
  }

  function formatSavedTripPlainText(trip) {
    var lines = [
      'SERENDIB SRI LANKA — SAVED TRIP (' + trip.refCode + ')',
      'Month: ' + trip.month + (trip.arrivalDate ? ' (' + trip.arrivalDate + (trip.departureDate ? ' to ' + trip.departureDate : '') + ')' : ''),
      'Guests & Duration: ' + (trip.travelers || 2) + ' travelers · ' + (trip.nights || 0) + ' nights',
      'Stay: ' + (trip.stayDisplay || trip.stayTier || '—'),
      'Travel Mode: ' + (trip.transportDisplay || trip.transport || '—')
    ];
    if (Array.isArray(trip.foodPrefs) && trip.foodPrefs.length) {
      lines.push('Dining Preferences: ' + trip.foodPrefs.join(', '));
    }
    if (Array.isArray(trip.interests) && trip.interests.length) {
      lines.push('Interests: ' + trip.interests.join(', '));
    }
    if (Array.isArray(trip.schedule) && trip.schedule.length) {
      lines.push('');
      trip.schedule.forEach(function (entry) {
        lines.push(entry.dayRange + ' — ' + entry.stopName + ' (' + entry.nights + 'N)');
        if (entry.legText) lines.push('  • Transfer: ' + entry.legText);
        if (entry.highlight) lines.push('  • Highlight: ' + entry.highlight);
        if (entry.diningSpot) lines.push('  • Dining: ' + entry.diningSpot + (entry.diningDetail ? ' — ' + entry.diningDetail : ''));
      });
    }
    if (trip.notes) lines.push('\nNotes: ' + trip.notes);
    return lines.join('\n');
  }

  function loadTripIntoPlanner(trip) {
    if (!trip) return;
    if (Array.isArray(trip.stopIds) && trip.stopIds.length) {
      var validIds = DESTINATIONS_META.map(function (d) { return d.id; });
      var restored = trip.stopIds.filter(function (id) { return validIds.indexOf(id) !== -1; });
      if (restored.length) {
        state.savedStopIds = restored;
        persistSavedStops();
      }
    }
    if (trip.month && MONTH_CODES.indexOf(trip.month) !== -1) {
      state.activeMonth = trip.month;
      state.planner.month = trip.month;
    }
    state.planner.status = trip.tripStatus === 'in_island' ? 'in_island' : 'before';
    state.planner.startHub = trip.startHub || 'cmbAirport';
    state.planner.arrivalDate = trip.arrivalDate || '';
    state.planner.departureDate = trip.departureDate || '';
    state.planner.travelers = Math.min(12, Math.max(1, Number(trip.travelers) || 2));
    state.planner.nightsByStop = trip.perStopNights && typeof trip.perStopNights === 'object' ? Object.assign({}, trip.perStopNights) : {};

    if (String(trip.stayTier || '').indexOf('Other:') === 0 || trip.stayTier === 'other' || trip.customStay) {
      state.planner.stayTier = 'other';
      state.planner.customStay = trip.customStay || String(trip.stayTier || '').replace(/^Other:\s*/, '');
    } else if (trip.stayTier) {
      state.planner.stayTier = trip.stayTier;
      state.planner.customStay = '';
    }

    if (String(trip.transport || '').indexOf('Other:') === 0 || trip.transport === 'other' || trip.customTransport) {
      state.planner.transport = 'other';
      state.planner.customTransport = trip.customTransport || String(trip.transport || '').replace(/^Other:\s*/, '');
    } else if (trip.transport) {
      state.planner.transport = trip.transport;
      state.planner.customTransport = '';
    }

    var knownFood = state.locale && state.locale.ui && state.locale.ui.planner && state.locale.ui.planner.foodStyles ? Object.keys(state.locale.ui.planner.foodStyles) : [];
    state.planner.foodPrefs = Array.isArray(trip.foodPrefs)
      ? trip.foodPrefs.filter(function (f) { return knownFood.indexOf(f) !== -1; })
      : [];
    if (trip.foodOther) {
      state.planner.foodOtherEnabled = true;
      state.planner.customFood = trip.foodOther;
    } else {
      state.planner.foodOtherEnabled = false;
      state.planner.customFood = '';
    }

    var focusOpts = (state.locale && state.locale.ui && state.locale.ui.finder && state.locale.ui.finder.focusOptions) || {};
    var knownIntVals = Object.keys(focusOpts).map(function (k) { return focusOpts[k]; });
    state.planner.interests = Array.isArray(trip.interests)
      ? trip.interests.filter(function (item) { return item !== trip.interestOther && (knownIntVals.indexOf(item) !== -1 || !trip.interestOther); })
      : [];
    if (trip.interestOther) {
      state.planner.interestOtherEnabled = true;
      state.planner.customInterest = trip.interestOther;
    } else {
      state.planner.interestOtherEnabled = false;
      state.planner.customInterest = '';
    }

    syncRouteUI();
    closeAccountModal();
    setTimeout(function () {
      openPlannerModal(1);
    }, 280);
  }

  function renderAccountTripDetail(trip) {
    var acc = getAccStrings();
    var p = state.locale.ui.planner;
    var nightsUnit = state.locale.ui.atlas.nightsUnit;
    var monthObj = state.locale.months[trip.month] || state.locale.months.FEB;
    var stayText = trip.stayDisplay || trip.stayTier || '—';
    var transportText = trip.transportDisplay || trip.transport || '—';
    var dateRange = trip.arrivalDate
      ? trip.arrivalDate + (trip.departureDate ? ' → ' + trip.departureDate : '')
      : monthObj.fullName;

    var daysHtml = Array.isArray(trip.schedule) && trip.schedule.length
      ? trip.schedule.map(function (entry) {
          var thumb = findDestThumb(entry.stopId);
          return (
            '<article class="trip-day-card">' +
            '<img class="trip-day-card__img" src="' + escapeHtml(thumb) + '" alt="' + escapeHtml(entry.stopName) + '" loading="lazy" />' +
            '<div class="trip-day-card__body">' +
            '<span class="mono-label" style="color:var(--accent-tea);">' + escapeHtml(entry.dayRange) + ' · ' + escapeHtml(entry.nights) + nightsUnit + '</span>' +
            '<h4>' + escapeHtml(entry.stopName) + '</h4>' +
            '<div class="trip-day-card__lines">' +
            (entry.legText ? '<div><strong>' + escapeHtml(p.transferLabel) + ':</strong> ' + escapeHtml(entry.legText) + '</div>' : '') +
            (entry.highlight ? '<div><strong>' + escapeHtml(p.seeLabel) + ':</strong> ' + escapeHtml(entry.highlight) + '</div>' : '') +
            (entry.diningSpot ? '<div><strong>' + escapeHtml(p.eatLabel) + ':</strong> ' + escapeHtml(entry.diningSpot) + (entry.diningDetail ? ' — ' + escapeHtml(entry.diningDetail) : '') + '</div>' : '') +
            '</div></div></article>'
          );
        }).join('')
      : '<p style="color:var(--ink-muted);">' + escapeHtml((trip.stops || []).join(' → ')) + '</p>';

    dom.accountDetailPane.innerHTML =
      '<div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.85rem;">' +
      '<button type="button" class="btn btn--outline" id="acc-detail-back">&larr; ' + escapeHtml(acc.backListBtn || 'All Saved Trips') + '</button>' +
      '<span class="saved-trip-card__ref">' + escapeHtml(trip.refCode) + '</span>' +
      '</div>' +
      '<div class="trip-detail-hero">' +
      '<span class="mono-label" style="color:var(--accent-terracotta); display:block; margin-bottom:0.25rem;">' + escapeHtml(monthObj.fullName) + ' · ' + escapeHtml(monthObj.headline) + '</span>' +
      '<h3 class="display-serif" style="margin:0 0 0.5rem; font-size:clamp(1.35rem, 1.1rem + 0.8vw, 1.8rem);">' + escapeHtml(trip.nights || 0) + ' ' + escapeHtml(p.summaryMetaNights) + ' · ' + escapeHtml((trip.stops || []).join(' → ') || 'Sri Lanka Journey') + '</h3>' +
      '<div class="confirmed-meta-grid">' +
      '<div><span>' + escapeHtml(p.dateLabel) + '</span><strong>' + escapeHtml(dateRange) + '</strong></div>' +
      '<div><span>' + escapeHtml(p.summaryMetaTravelers) + '</span><strong>' + escapeHtml(trip.travelers || 2) + '</strong></div>' +
      '<div><span>' + escapeHtml(p.summaryMetaStay) + '</span><strong>' + escapeHtml(stayText) + '</strong></div>' +
      '<div><span>' + escapeHtml(p.transportHeading) + '</span><strong>' + escapeHtml(transportText) + '</strong></div>' +
      (Array.isArray(trip.foodPrefs) && trip.foodPrefs.length ? '<div><span>' + escapeHtml(p.foodHeading) + '</span><strong>' + escapeHtml(trip.foodPrefs.join(', ')) + '</strong></div>' : '') +
      (Array.isArray(trip.interests) && trip.interests.length ? '<div><span>' + escapeHtml(p.interestsHeading) + '</span><strong>' + escapeHtml(trip.interests.join(', ')) + '</strong></div>' : '') +
      (trip.notes ? '<div style="grid-column:1 / -1;"><span>' + escapeHtml(p.notesLabel) + '</span><strong>' + escapeHtml(trip.notes) + '</strong></div>' : '') +
      '</div>' +
      '<div style="display:flex; flex-wrap:wrap; gap:0.55rem;">' +
      '<button type="button" class="btn btn--primary" id="acc-detail-edit">' + escapeHtml(acc.loadPlannerBtn || 'Edit in Planner') + '</button>' +
      '<button type="button" class="btn btn--outline" id="acc-detail-copy">' + escapeHtml(p.copySummaryBtn) + '</button>' +
      '<button type="button" class="btn btn--outline" id="acc-detail-print">' + escapeHtml(p.printBtn) + '</button>' +
      '<button type="button" class="btn btn--outline" id="acc-detail-delete">' + escapeHtml(acc.deleteTripBtn || 'Delete') + '</button>' +
      '</div></div>' +
      '<div class="trip-detail-days">' + daysHtml + '</div>';

    document.getElementById('acc-detail-back').addEventListener('click', function () {
      state.account.activeTripRef = null;
      renderAccountModal();
    });
    document.getElementById('acc-detail-edit').addEventListener('click', function () {
      loadTripIntoPlanner(trip);
    });
    document.getElementById('acc-detail-copy').addEventListener('click', function () {
      var text = formatSavedTripPlainText(trip);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { showToast(state.locale.ui.toasts.copied); });
      }
    });
    document.getElementById('acc-detail-print').addEventListener('click', function () { window.print(); });

    var delBtn = document.getElementById('acc-detail-delete');
    var armed = false;
    delBtn.addEventListener('click', function () {
      if (!armed) {
        armed = true;
        delBtn.textContent = 'Confirm ' + (acc.deleteTripBtn || 'Delete') + '?';
        return;
      }
      var fb = window.SERENDIB_FIREBASE;
      if (fb && typeof fb.deleteUserTrip === 'function') {
        delBtn.disabled = true;
        fb.deleteUserTrip(trip.refCode).then(function () {
          state.account.activeTripRef = null;
          loadAccountTrips();
          showToast('Deleted ' + trip.refCode);
        }).catch(function (err) {
          showToast(err && err.message ? err.message : 'Delete failed');
        }).finally(function () {
          delBtn.disabled = false;
        });
      }
    });
  }

  function renderAccountModal() {
    if (!dom.accountModal) return;
    var acc = getAccStrings();
    var p = state.locale.ui.planner;
    var user = state.account.user;

    if (dom.accountAuthView) dom.accountAuthView.hidden = Boolean(user);
    if (dom.accountTripsView) dom.accountTripsView.hidden = !user;

    if (!user) {
      if (dom.accountModalTitle) dom.accountModalTitle.textContent = acc.authTitle || 'Sign in to view your trips';
      renderAccountAuthMode();
      return;
    }

    if (dom.accountModalTitle) dom.accountModalTitle.textContent = acc.dashboardTitle || 'Your Saved Sri Lanka Trips';
    var nameStr = user.displayName || (user.email ? user.email.split('@')[0] : 'Traveler');
    if (dom.accountDisplayName) dom.accountDisplayName.textContent = nameStr;
    if (dom.accountDisplayEmail) dom.accountDisplayEmail.textContent = user.email || '';
    if (dom.accountAvatar) dom.accountAvatar.textContent = String(nameStr).charAt(0).toUpperCase() || 'S';

    var activeTrip = null;
    if (state.account.activeTripRef) {
      for (var i = 0; i < state.account.trips.length; i++) {
        if (state.account.trips[i].refCode === state.account.activeTripRef) {
          activeTrip = state.account.trips[i];
          break;
        }
      }
    }

    if (activeTrip && dom.accountDetailPane && dom.accountListPane) {
      dom.accountListPane.hidden = true;
      dom.accountDetailPane.hidden = false;
      renderAccountTripDetail(activeTrip);
      return;
    }

    if (dom.accountListPane) dom.accountListPane.hidden = false;
    if (dom.accountDetailPane) dom.accountDetailPane.hidden = true;

    var trips = state.account.trips || [];
    if (dom.accountTripsEmpty) dom.accountTripsEmpty.hidden = trips.length > 0;
    if (dom.accountTripsGrid) {
      dom.accountTripsGrid.hidden = trips.length === 0;
      dom.accountTripsGrid.innerHTML = trips.map(function (trip) {
        var routeStr = Array.isArray(trip.stops) && trip.stops.length ? trip.stops.join(' → ') : 'Custom Sri Lanka Route';
        var stayStr = trip.stayDisplay || trip.stayTier || '';
        return (
          '<article class="saved-trip-card">' +
          '<div class="saved-trip-card__top">' +
          '<span class="saved-trip-card__ref">' + escapeHtml(trip.refCode) + '</span>' +
          '<span class="mono-label" style="color:var(--ink-muted);">' + escapeHtml(trip.month) + (trip.nights != null ? ' · ' + escapeHtml(trip.nights) + 'N' : '') + '</span>' +
          '</div>' +
          '<h3 class="saved-trip-card__title">' + escapeHtml(routeStr) + '</h3>' +
          '<p class="saved-trip-card__route">' + escapeHtml(stayStr) + (trip.transportDisplay ? ' · ' + escapeHtml(trip.transportDisplay) : '') + '</p>' +
          '<div class="saved-trip-card__meta">' +
          '<span>' + escapeHtml(trip.travelers || 2) + ' ' + escapeHtml(p.summaryMetaTravelers) + '</span>' +
          (trip.arrivalDate ? '<span>' + escapeHtml(trip.arrivalDate) + '</span>' : '') +
          '</div>' +
          '<div class="saved-trip-card__actions">' +
          '<button type="button" class="btn btn--primary" data-acc-view="' + escapeHtml(trip.refCode) + '">' + escapeHtml(acc.viewTripBtn || 'View Full Plan') + '</button>' +
          '<button type="button" class="btn btn--outline" data-acc-edit="' + escapeHtml(trip.refCode) + '">' + escapeHtml(acc.loadPlannerBtn || 'Edit in Planner') + '</button>' +
          '</div></article>'
        );
      }).join('');

      dom.accountTripsGrid.querySelectorAll('[data-acc-view]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.account.activeTripRef = btn.dataset.accView;
          renderAccountModal();
        });
      });
      dom.accountTripsGrid.querySelectorAll('[data-acc-edit]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var targetRef = btn.dataset.accEdit;
          var match = trips.filter(function (t) { return t.refCode === targetRef; })[0];
          if (match) loadTripIntoPlanner(match);
        });
      });
    }
  }

  function initAccount() {
    var fb = window.SERENDIB_FIREBASE;

    if (dom.accountTrigger) {
      dom.accountTrigger.addEventListener('click', function () {
        openAccountModal(null);
      });
    }
    if (dom.mobileAccountTrigger) {
      dom.mobileAccountTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        openAccountModal(null);
      });
    }
    if (dom.closeAccountBtn) dom.closeAccountBtn.addEventListener('click', closeAccountModal);
    if (dom.accountBackdrop) dom.accountBackdrop.addEventListener('click', closeAccountModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.account.open) closeAccountModal();
    });

    if (dom.accGoogleBtn && fb && typeof fb.signInWithGoogle === 'function') {
      dom.accGoogleBtn.addEventListener('click', function () {
        setAccMsg(dom.accountError, '');
        setAccMsg(dom.accountNotice, 'Connecting to Google Sign-In...');
        dom.accGoogleBtn.disabled = true;
        fb.signInWithGoogle().then(function () {
          setAccMsg(dom.accountNotice, '');
        }).catch(function (err) {
          setAccMsg(dom.accountNotice, '');
          setAccMsg(dom.accountError, friendlyCustomerAuthError(err));
        }).finally(function () {
          dom.accGoogleBtn.disabled = false;
        });
      });
    }

    if (fb && typeof fb.handleRedirectResult === 'function') {
      fb.handleRedirectResult().catch(function (err) {
        if (err && err.code) {
          setAccMsg(dom.accountError, friendlyCustomerAuthError(err));
        }
      });
    }

    if (dom.accTabSignIn) {
      dom.accTabSignIn.addEventListener('click', function () {
        state.account.authMode = 'signin';
        setAccMsg(dom.accountError, '');
        setAccMsg(dom.accountNotice, '');
        renderAccountAuthMode();
      });
    }
    if (dom.accTabSignUp) {
      dom.accTabSignUp.addEventListener('click', function () {
        state.account.authMode = 'signup';
        setAccMsg(dom.accountError, '');
        setAccMsg(dom.accountNotice, '');
        renderAccountAuthMode();
      });
    }

    if (dom.accPwToggle && dom.accPassword) {
      dom.accPwToggle.addEventListener('click', function () {
        var showing = dom.accPassword.type === 'text';
        dom.accPassword.type = showing ? 'password' : 'text';
        dom.accPwToggle.textContent = showing ? 'Show' : 'Hide';
      });
    }

    if (dom.accForgotBtn && fb && typeof fb.sendPasswordReset === 'function') {
      dom.accForgotBtn.addEventListener('click', function () {
        var email = (dom.accEmail.value || '').trim();
        setAccMsg(dom.accountError, '');
        setAccMsg(dom.accountNotice, '');
        if (!email) {
          setAccMsg(dom.accountError, 'Enter your email address above first.');
          return;
        }
        fb.sendPasswordReset(email).then(function () {
          setAccMsg(dom.accountNotice, 'Password reset link sent to ' + email + '.');
        }).catch(function (err) {
          setAccMsg(dom.accountError, friendlyCustomerAuthError(err));
        });
      });
    }

    if (dom.accountForm && fb) {
      dom.accountForm.addEventListener('submit', function (e) {
        e.preventDefault();
        setAccMsg(dom.accountError, '');
        setAccMsg(dom.accountNotice, '');

        var email = (dom.accEmail.value || '').trim();
        var password = dom.accPassword.value || '';
        var name = (dom.accName.value || '').trim();
        if (!email || !password) {
          setAccMsg(dom.accountError, 'Please enter both email and password.');
          return;
        }
        if (state.account.authMode === 'signup' && password.length < 6) {
          setAccMsg(dom.accountError, 'Password must be at least 6 characters.');
          return;
        }

        dom.accSubmitBtn.disabled = true;
        var promise = state.account.authMode === 'signup'
          ? fb.registerCustomer(name, email, password)
          : fb.signInCustomer(email, password);

        promise.catch(function (err) {
          setAccMsg(dom.accountError, friendlyCustomerAuthError(err));
        }).finally(function () {
          dom.accSubmitBtn.disabled = false;
        });
      });
    }

    if (dom.accountPlanNewBtn) {
      dom.accountPlanNewBtn.addEventListener('click', function () {
        closeAccountModal();
        setTimeout(function () { openPlannerModal(1); }, 280);
      });
    }
    if (dom.accountSignoutBtn && fb && typeof fb.signOutCustomer === 'function') {
      dom.accountSignoutBtn.addEventListener('click', function () {
        fb.signOutCustomer();
      });
    }

    if (fb && typeof fb.onAuthChange === 'function') {
      fb.onAuthChange(function (user) {
        state.account.user = user || null;
        syncAccountHeaderUI();
        if (!user) {
          state.account.trips = [];
          state.account.activeTripRef = null;
          syncAccountHeaderUI();
          if (state.account.open) renderAccountModal();
          if (state.planner.open) renderPlannerModal();
          return;
        }

        if (state.account.pendingTripToSave && typeof fb.saveUserTrip === 'function') {
          var pending = state.account.pendingTripToSave;
          state.account.pendingTripToSave = null;
          fb.saveUserTrip(pending).then(function (saved) {
            state.account.activeTripRef = saved.refCode;
            showToast(getAccStrings().saveSuccessToast || 'Trip saved to My Trips!');
            return loadAccountTrips();
          }).catch(function () {
            return loadAccountTrips();
          });
        } else {
          loadAccountTrips();
        }

        if (state.planner.open) renderPlannerModal();
      });
    }
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function init() {
    initHeroSlider();
    initNavigation();
    initAtlasControls();
    initSheets();
    initForms();
    initAccount();
    initReveals();
    switchLanguage(state.lang, false);

    if (window.SERENDIB_FIREBASE && typeof window.SERENDIB_FIREBASE.loadCatalogOverrides === 'function') {
      window.SERENDIB_FIREBASE.loadCatalogOverrides().then(function (overrides) {
        if (overrides && Object.keys(overrides).length > 0) {
          state.catalogOverrides = overrides;
          renderAtlasFilterRail();
          renderDestinations();
          if (state.planner.open) renderPlannerModal();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
