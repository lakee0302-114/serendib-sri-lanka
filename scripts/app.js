/* ==========================================================================
   SERENDIB — Dual-Theme Engine, 9-Language i18n, Atlas & Route Builder
   Universal classic script (works seamlessly on both file:/// and http(s)://)
   ========================================================================== */

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
    activeMonth: 'FEB',
    activeItineraryId: 'classic-arc',
    savedStopIds: loadSavedStops(),
    activeDossierId: null
  };

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
    try {
      var raw = localStorage.getItem(STORAGE_KEYS.route);
      if (!raw) return ['sigiriya', 'ella', 'galle'];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : ['sigiriya', 'ella', 'galle'];
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
    inquiryForm: document.getElementById('inquiry-form'),
    inqMonth: document.getElementById('inq-month'),
    inqNotes: document.getElementById('inq-notes'),
    inquiryPreview: document.getElementById('inquiry-shortlist-preview'),
    inquiryStatus: document.getElementById('inquiry-status'),
    copyBriefBtn: document.getElementById('copy-brief-btn'),
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

  function getMergedDestinations() {
    var locDest = state.locale.destinations;
    return DESTINATIONS_META.map(function (meta) {
      return Object.assign({}, meta, locDest[meta.id]);
    });
  }

  /* ------------------------------------------------------------------------
     Theme Management (Light / Dark + Circular View Transition Reveal)
     ------------------------------------------------------------------------ */
  function syncThemeUI() {
    var isDark = state.theme === 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    if (dom.metaThemeColor) {
      dom.metaThemeColor.setAttribute('content', isDark ? '#0D1511' : '#F6F2EA');
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
        (active ? '#FAF8F3' : 'rgba(244,239,230,0.85)') +
        '; border-color:rgba(244,239,230,0.28);" data-mobile-lang="' + item.code + '">' +
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

      dom.introDatums.innerHTML = locale.ui.intro.datums.map(function (row) {
        return (
          '<div class="datum-row">' +
          '<span class="mono-label datum-key">' + row.key + '</span>' +
          '<span class="datum-val">' + row.val + '</span>' +
          '</div>'
        );
      }).join('');

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
    };

    applyAll();

    if (notify) {
      showToast(locale.ui.toasts.langChanged);
    }
  }

  function renderFinderSelects() {
    var finder = state.locale.ui.finder;
    var prevMonth = dom.finderMonth.value || state.activeMonth;
    var prevFocus = dom.finderFocus.value || state.activeRegion;
    var prevPace = dom.finderPace.value || state.activeItineraryId;
    var prevInqMonth = dom.inqMonth.value || state.activeMonth;

    dom.finderMonth.innerHTML = MONTH_CODES.map(function (code) {
      return '<option value="' + code + '"' + (code === prevMonth ? ' selected' : '') + '>' + state.locale.months[code].fullName + '</option>';
    }).join('');

    dom.inqMonth.innerHTML = MONTH_CODES.map(function (code) {
      return '<option value="' + code + '"' + (code === prevInqMonth ? ' selected' : '') + '>' + state.locale.months[code].fullName + '</option>';
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

    dom.atlasFilterRail.innerHTML = order.map(function (key) {
      var active = state.activeRegion === key;
      return (
        '<button type="button" class="filter-chip ' + (active ? 'is-active' : '') + '" ' +
        'data-region="' + key + '" role="tab" aria-selected="' + active + '">' +
        filters[key] + '</button>'
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
    renderAtlasFilterRail();
    renderDestinations();
    dom.atlasGrid.scrollTo({ left: 0, behavior: 'smooth' });
  }

  function renderDestinations() {
    var all = getMergedDestinations();
    var filtered = state.activeRegion === 'all'
      ? all
      : all.filter(function (d) { return d.regionKey === state.activeRegion; });
    var t = state.locale.ui.atlas;

    dom.atlasGrid.innerHTML = filtered.map(function (dest) {
      var saved = state.savedStopIds.indexOf(dest.id) !== -1;
      return (
        '<article class="dest-card" data-dest-id="' + dest.id + '">' +
        '<div class="dest-card__media"><img src="' + dest.image + '" alt="' + dest.imageAlt + '" decoding="async" /></div>' +
        '<div class="dest-card__body">' +
        '<div class="dest-card__meta">' +
        '<span class="mono-label">' + dest.number + ' · ' + dest.region + '</span>' +
        '<span class="mono-label" style="opacity:0.75;">' + dest.idealNights + t.nightsUnit + '</span>' +
        '</div>' +
        '<h3 class="dest-card__title">' + dest.name + '</h3>' +
        '<p class="dest-card__tagline">' + dest.tagline + '</p>' +
        '<div class="dest-card__footer">' +
        '<button type="button" class="text-link-btn" data-open-dossier="' + dest.id + '">' + t.dossierBtn + ' &rarr;</button>' +
        '<button type="button" class="add-stop-btn ' + (saved ? 'is-saved' : '') + '" data-toggle-stop="' + dest.id + '" aria-pressed="' + saved + '">' +
        (saved ? t.savedStop : t.addStop) + '</button>' +
        '</div></div></article>'
      );
    }).join('');

    dom.atlasGrid.querySelectorAll('[data-open-dossier]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openDossierSheet(btn.dataset.openDossier);
      });
    });

    dom.atlasGrid.querySelectorAll('[data-toggle-stop]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleSavedStop(btn.dataset.toggleStop);
      });
    });

    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      dom.atlasGrid.querySelectorAll('.dest-card').forEach(function (card) {
        card.addEventListener('pointermove', function (e) {
          var rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
          card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
        });
      });
    }
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

    var all = getMergedDestinations();
    var savedObjects = state.savedStopIds.map(function (id) {
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id) return all[i];
      }
      return null;
    }).filter(Boolean);

    var c = state.locale.ui.contact;
    if (savedObjects.length === 0) {
      dom.inquiryPreview.textContent = c.emptyShortlist;
    } else {
      var nights = savedObjects.reduce(function (sum, d) { return sum + d.idealNights; }, 0);
      var names = savedObjects.map(function (d) { return d.name; }).join(' → ');
      dom.inquiryPreview.textContent = names + ' (' + nights + ' ' + c.nightsSuggested + ')';
    }

    if (state.activeDossierId) updateDossierFooter(state.activeDossierId);
    if (!dom.routeSheet.hidden) renderRouteSheet();
  }

  /* ------------------------------------------------------------------------
     Monsoon Compass & Cartographic SVG
     ------------------------------------------------------------------------ */
  var ZONE_FILL = { optimal: '#D4A857', good: '#6BA386', caution: '#6C808B' };

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

    dom.compassReadout.innerHTML =
      '<span class="mono-label" style="color: var(--accent-brass); display:block; margin-bottom:0.4rem;">' +
      m.fullName.toUpperCase() + ' · ' + ui.verdictSuffix + '</span>' +
      '<h3 class="compass-readout__headline">' + m.headline + '</h3>' +
      '<p class="compass-readout__summary">' + m.summary + '</p>' +
      '<div class="verdict-grid">' + verdictsHtml + '</div>' +
      '<div class="festival-banner"><span class="mono-label">' + ui.culturalCalendar + '</span>' + m.festival + '</div>';
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
      '<span class="mono-label" style="color:var(--accent-terracotta);">' + active.number + ' · ' + active.pace + '</span>' +
      '<h3 class="display-serif" style="font-size:clamp(1.85rem, 1.5rem + 1.4vw, 2.65rem); margin:0.45rem 0 0.75rem;">' + active.title + '</h3>' +
      '<p style="margin:0; color:var(--ink-secondary);">' + active.summary + '</p>' +
      '<div class="itinerary-stage__route">' + active.routeLine + '</div>' +
      '<button type="button" class="btn btn--primary" id="adopt-itinerary-btn">' + t.adoptBtn + ' &rarr;</button>' +
      '</div>' +
      '<div class="timeline-list">' + daysHtml + '</div>';

    document.getElementById('adopt-itinerary-btn').addEventListener('click', function () {
      state.savedStopIds = (ITINERARY_PRESETS[state.activeItineraryId] || ['sigiriya', 'ella', 'galle']).slice();
      persistSavedStops();
      syncRouteUI();
      showToast(state.locale.ui.toasts.loadedRoute.replace('{title}', active.title));
      openRouteSheet();
    });
  }

  /* ------------------------------------------------------------------------
     Field Notes Accordion
     ------------------------------------------------------------------------ */
  function renderFieldNotes() {
    dom.accordionList.innerHTML = state.locale.fieldNotes.map(function (note, index) {
      var expanded = index === 0;
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
    var all = getMergedDestinations();
    var dest = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === destId) { dest = all[i]; break; }
    }
    if (!dest) return;
    state.activeDossierId = destId;
    var d = state.locale.ui.dossier;

    dom.dossierKicker.textContent = dest.number + ' · ' + dest.region.toUpperCase() + ' · ' + dest.sinhala;
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
      var all = getMergedDestinations();
      var stops = state.savedStopIds.map(function (id) {
        for (var i = 0; i < all.length; i++) {
          if (all[i].id === id) return all[i].name;
        }
        return null;
      }).filter(Boolean);
      if (stops.length > 0 && !dom.inqNotes.value.trim()) {
        dom.inqNotes.value = stops.join(', ');
      }
      closeAllSheets();
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     Quick Finder & Inquiry Desk
     ------------------------------------------------------------------------ */
  function initForms() {
    dom.quickFinder.addEventListener('submit', function (e) {
      e.preventDefault();
      var monthCode = dom.finderMonth.value;
      var focus = dom.finderFocus.value;
      var pace = dom.finderPace.value;

      setActiveMonth(monthCode);
      setRegionFilter(focus);
      state.activeItineraryId = pace;
      renderItineraries();
      dom.inqMonth.value = monthCode;

      var target = focus === 'all' ? document.getElementById('compass') : document.getElementById('atlas');
      target.scrollIntoView({ behavior: 'smooth' });
      var monthName = state.locale.months[monthCode].fullName;
      showToast(state.locale.ui.toasts.matched.replace('{month}', monthName));
    });

    dom.copyBriefBtn.addEventListener('click', function () {
      var all = getMergedDestinations();
      var stops = state.savedStopIds.map(function (id) {
        for (var i = 0; i < all.length; i++) {
          if (all[i].id === id) return all[i];
        }
        return null;
      }).filter(Boolean);
      var totalNights = stops.reduce(function (sum, d) { return sum + d.idealNights; }, 0);
      var monthObj = state.locale.months[dom.inqMonth.value];
      var monthName = monthObj ? monthObj.fullName : dom.inqMonth.value;
      var text = stops.length > 0
        ? 'SERENDIB SRI LANKA (' + state.lang.toUpperCase() + ')\n' + monthName + '\n' +
          stops.map(function (d) { return d.name; }).join(' -> ') + ' (' + totalNights + 'N)'
        : 'SERENDIB SRI LANKA — ' + monthName;

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

    dom.inquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('inq-name').value.trim();
      var email = document.getElementById('inq-email').value.trim();
      var guests = document.getElementById('inq-guests').value.trim();
      var notes = dom.inqNotes.value.trim();
      var monthCode = dom.inqMonth.value;
      var monthObj = state.locale.months[monthCode];
      var monthName = monthObj ? monthObj.fullName : monthCode;
      var all = getMergedDestinations();
      var stops = state.savedStopIds.map(function (id) {
        for (var i = 0; i < all.length; i++) {
          if (all[i].id === id) return all[i].name;
        }
        return null;
      }).filter(Boolean);
      var suffix = Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(10 + Math.random() * 89);
      var refCode = 'SRD-' + suffix;
      var c = state.locale.ui.contact;
      var submitBtn = dom.inquiryForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      var renderSuccess = function (cloudSynced) {
        if (submitBtn) submitBtn.disabled = false;
        dom.inquiryStatus.hidden = false;
        dom.inquiryStatus.innerHTML =
          '<strong>' + c.briefReady + ' (' + refCode + ')</strong> — ' + c.briefPrefix + ', ' + name + '. ' +
          c.briefBody + ' ' + monthName + ' ' +
          (stops.length ? c.briefMid + ' <em>' + stops.join(' → ') + '</em> ' : '') +
          c.briefSuffix +
          (cloudSynced ? ' <span class="mono-label" style="display:inline-block; margin-inline-start:0.4rem; color:var(--accent-tea);">[FIREBASE SYNCED]</span>' : '');
        showToast(state.locale.ui.toasts.compiled.replace('{ref}', refCode));
      };

      if (window.SERENDIB_FIREBASE && typeof window.SERENDIB_FIREBASE.saveInquiry === 'function') {
        window.SERENDIB_FIREBASE.saveInquiry({
          refCode: refCode,
          name: name,
          email: email,
          month: monthCode,
          guests: guests,
          notes: notes,
          stops: stops,
          lang: state.lang,
          createdAt: new Date().toISOString()
        }).then(function () {
          renderSuccess(true);
        }).catch(function () {
          renderSuccess(false);
        });
      } else {
        renderSuccess(false);
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

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function init() {
    initNavigation();
    initAtlasControls();
    initSheets();
    initForms();
    initReveals();
    switchLanguage(state.lang, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
