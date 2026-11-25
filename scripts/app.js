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
    atlasExpanded: false,
    activeMonth: 'FEB',
    activeItineraryId: 'classic-arc',
    savedStopIds: loadSavedStops(),
    activeDossierId: null,
    planner: {
      open: false,
      step: 1,
      month: 'FEB',
      arrivalDate: '',
      departureDate: '',
      travelers: 2,
      stayTier: 'boutique',
      transport: 'chauffeur',
      interests: [],
      confirmed: null
    }
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
    plannerDateInput: document.getElementById('pln-date'),
    plannerDepartureInput: document.getElementById('pln-departure-date'),
    plannerMonsoonFit: document.getElementById('planner-monsoon-fit'),
    plannerDestHeading: document.getElementById('planner-dest-heading'),
    plannerPresets: document.getElementById('planner-presets'),
    plannerDestGrid: document.getElementById('planner-dest-grid'),
    plannerTravelersVal: document.getElementById('planner-travelers-val'),
    plannerNightsHint: document.getElementById('planner-nights-hint'),
    plannerStayGrid: document.getElementById('planner-stay-grid'),
    plannerTransportPills: document.getElementById('planner-transport-pills'),
    plannerInterestTags: document.getElementById('planner-interest-tags'),
    plannerMobileReview: document.getElementById('planner-mobile-review'),
    plannerForm: document.getElementById('planner-form'),
    plannerAside: document.getElementById('planner-aside'),
    plannerAsideCount: document.getElementById('planner-aside-count'),
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
    state.atlasExpanded = false;
    renderAtlasFilterRail();
    renderDestinations();
    dom.atlasGrid.scrollTo({ left: 0, behavior: 'smooth' });
  }

  function updateAtlasExpandUI(totalCount) {
    if (!dom.atlasExpandWrap || !dom.atlasExpandBtn || !dom.atlasExpandLabel || !state.locale) return;
    var rowCap = window.innerWidth >= 1120 ? 4 : 2;
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
      return (
        '<article class="dest-card" data-dest-id="' + dest.id + '">' +
        '<div class="dest-card__media" data-open-dossier="' + dest.id + '" role="button" tabindex="0" aria-label="' + dest.name + '"><img src="' + dest.image + '" alt="' + dest.imageAlt + '" decoding="async" /></div>' +
        '<div class="dest-card__body">' +
        '<div class="dest-card__meta">' +
        '<span class="mono-label">' + dest.region + '</span>' +
        '<span class="mono-label" style="opacity:0.75;">' + dest.idealNights + t.nightsUnit + '</span>' +
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
      dom.floatingBar.classList.toggle('is-visible', savedObjects.length > 0);
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

  function getRecommendedNights() {
    var stops = getSavedStopObjects();
    if (!stops.length) return 8;
    return stops.reduce(function (sum, d) { return sum + d.idealNights; }, 0);
  }

  function getActivePlannerNights() {
    var dateNights = getCalculatedDateNights();
    return dateNights !== null ? dateNights : getRecommendedNights();
  }

  function getMonsoonHighlightText(monthCode) {
    var levels = MONSOON_LEVELS[monthCode] || MONSOON_LEVELS.FEB;
    var zones = state.locale.ui.compass.zones;
    var optimal = Object.keys(levels).filter(function (z) { return levels[z] === 'optimal'; });
    var pick = optimal.length ? optimal : Object.keys(levels).filter(function (z) { return levels[z] === 'good'; });
    var names = pick.map(function (z) { return zones[z]; }).filter(Boolean);
    return names.length ? state.locale.ui.compass.legendOptimal + ': ' + names.join(' · ') : state.locale.months[monthCode].headline;
  }

  function buildBlueprintText(refCode) {
    var stops = getSavedStopObjects();
    var m = state.locale.months[state.planner.month] || state.locale.months.FEB;
    var p = state.locale.ui.planner;
    var nights = getActivePlannerNights();
    var stayObj = p.stays[state.planner.stayTier] || p.stays.boutique;
    var transLabel = p.transports[state.planner.transport] || p.transports.chauffeur;
    var dateParts = [];
    if (state.planner.arrivalDate) dateParts.push('Arrival: ' + state.planner.arrivalDate);
    if (state.planner.departureDate) dateParts.push('Departure: ' + state.planner.departureDate);
    var lines = [
      'SERENDIB SRI LANKA — TRIP BLUEPRINT' + (refCode ? ' (' + refCode + ')' : ''),
      'Month: ' + m.fullName + ' (' + m.headline + ')' + (dateParts.length ? ' · ' + dateParts.join(' · ') : ''),
      'Guests & Pace: ' + state.planner.travelers + ' ' + p.summaryMetaTravelers + ' · ' + nights + ' ' + p.summaryMetaNights,
      'Stay Style: ' + stayObj.title + ' · ' + transLabel,
      'Route: ' + (stops.length ? stops.map(function (d) { return d.name; }).join(' -> ') : 'Open Custom Loop')
    ];
    if (state.planner.interests.length) {
      lines.push('Focus: ' + state.planner.interests.join(', '));
    }
    return lines.join('\n');
  }

  function openPlannerModal(startStep) {
    state.planner.open = true;
    state.planner.confirmed = null;
    state.planner.step = startStep || 1;
    state.planner.month = state.activeMonth;

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

  function renderPlannerModal() {
    if (!dom.plannerModal) return;
    var p = state.locale.ui.planner;
    var r = state.locale.ui.routeSheet;
    var stops = getSavedStopObjects();
    var recNights = getRecommendedNights();
    var activeNights = getActivePlannerNights();
    var nightsUnit = state.locale.ui.atlas.nightsUnit;
    var monthObj = state.locale.months[state.planner.month] || state.locale.months.FEB;

    dom.closePlannerBtn.setAttribute('aria-label', p.closeLabel || 'Close');

    // Stepper header tabs
    dom.plannerSteps.hidden = Boolean(state.planner.confirmed);
    dom.plannerSteps.querySelectorAll('[data-planner-nav]').forEach(function (btn) {
      var n = Number(btn.dataset.plannerNav);
      btn.classList.toggle('is-active', !state.planner.confirmed && state.planner.step === n);
      btn.classList.toggle('is-done', !state.planner.confirmed && state.planner.step > n);
    });

    // Show active pane or confirmed card
    dom.plannerPane1.hidden = Boolean(state.planner.confirmed) || state.planner.step !== 1;
    dom.plannerPane2.hidden = Boolean(state.planner.confirmed) || state.planner.step !== 2;
    dom.plannerPane3.hidden = Boolean(state.planner.confirmed) || state.planner.step !== 3;
    dom.plannerConfirmed.hidden = !state.planner.confirmed;
    dom.plannerFooter.hidden = Boolean(state.planner.confirmed);

    // Render Month Pills & Monsoon Fit Banner
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

    // Render Presets & 16-Stop Visual Destination Selector
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
      });
    });
    var clearBtn = dom.plannerPresets.querySelector('[data-pln-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        state.savedStopIds = [];
        persistSavedStops();
        syncRouteUI();
      });
    }

    var allDest = getMergedDestinations();
    dom.plannerDestGrid.innerHTML = allDest.map(function (dest) {
      var selected = state.savedStopIds.indexOf(dest.id) !== -1;
      return (
        '<button type="button" class="planner-dest-card ' + (selected ? 'is-selected' : '') + '" data-pln-stop="' + dest.id + '" aria-pressed="' + selected + '">' +
        '<div class="planner-dest-card__thumb">' +
        '<img src="' + dest.image + '" alt="' + dest.imageAlt + '" loading="lazy" />' +
        '<span class="planner-dest-card__check" aria-hidden="true">' + (selected ? '&#10003;' : '+') + '</span>' +
        '</div>' +
        '<div class="planner-dest-card__info">' +
        '<div class="planner-dest-card__meta"><span>' + dest.number + ' · ' + dest.region + '</span><span>' + dest.idealNights + nightsUnit + '</span></div>' +
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

    // Step 1 Controls (Dates, Travelers, Stay, Transport, Focus)
    dom.plannerTravelersVal.textContent = String(state.planner.travelers);
    var dateNights = getCalculatedDateNights();
    if (dom.plannerNightsHint) {
      if (dateNights !== null) {
        dom.plannerNightsHint.textContent = dateNights + ' ' + r.nightsLabel;
      } else {
        dom.plannerNightsHint.textContent = stops.length ? p.nightsAutoHint.replace('{nights}', String(recNights)) : '';
      }
    }

    var stayOrder = ['boutique', 'teaSanctuary', 'honest'];
    dom.plannerStayGrid.innerHTML = stayOrder.map(function (key) {
      var item = p.stays[key];
      var active = state.planner.stayTier === key;
      return (
        '<button type="button" class="stay-card ' + (active ? 'is-active' : '') + '" data-pln-stay="' + key + '" aria-pressed="' + active + '">' +
        '<span class="stay-card__title">' + item.title + '</span>' +
        '<span class="stay-card__sub">' + item.sub + '</span>' +
        '</button>'
      );
    }).join('');
    dom.plannerStayGrid.querySelectorAll('[data-pln-stay]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.planner.stayTier = btn.dataset.plnStay;
        renderPlannerModal();
      });
    });

    var transportOrder = ['chauffeur', 'rail', 'suv'];
    dom.plannerTransportPills.innerHTML = transportOrder.map(function (key) {
      var active = state.planner.transport === key;
      return '<button type="button" class="transport-pill ' + (active ? 'is-active' : '') + '" data-pln-transport="' + key + '">' +
        p.transports[key] + '</button>';
    }).join('');
    dom.plannerTransportPills.querySelectorAll('[data-pln-transport]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.planner.transport = btn.dataset.plnTransport;
        renderPlannerModal();
      });
    });

    var focusOpts = state.locale.ui.finder.focusOptions;
    var focusKeys = Object.keys(focusOpts).filter(function (k) { return k !== 'all'; });
    dom.plannerInterestTags.innerHTML = focusKeys.map(function (k) {
      var label = focusOpts[k];
      var picked = state.planner.interests.indexOf(label) !== -1;
      return '<button type="button" class="quick-tag-chip ' + (picked ? 'is-picked' : '') + '" data-pln-interest="' + label.replace(/"/g, '&quot;') + '">' +
        (picked ? '&#10003; ' : '+ ') + label + '</button>';
    }).join('');
    dom.plannerInterestTags.querySelectorAll('[data-pln-interest]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tag = btn.dataset.plnInterest;
        var idx = state.planner.interests.indexOf(tag);
        if (idx !== -1) state.planner.interests.splice(idx, 1);
        else state.planner.interests.push(tag);
        renderPlannerModal();
      });
    });

    // Sync Arrival & Departure Date inputs inside Step 1
    var todayIso = new Date().toISOString().slice(0, 10);
    if (dom.plannerDateInput) {
      dom.plannerDateInput.min = todayIso;
      dom.plannerDateInput.value = state.planner.arrivalDate || '';
    }
    if (dom.plannerDepartureInput) {
      dom.plannerDepartureInput.min = state.planner.arrivalDate || todayIso;
      dom.plannerDepartureInput.value = state.planner.departureDate || '';
    }

    // Mobile Summary Review inside Step 3 & Footer
    var routeLine = stops.length ? stops.map(function (s) { return s.name; }).join(' → ') : p.summaryNoStops;
    var stayTitle = (p.stays[state.planner.stayTier] || p.stays.boutique).title;
    var arrivalDisplay = state.planner.arrivalDate || p.dateAny;
    var departureDisplay = state.planner.departureDate || p.dateAny;
    var datesSummary = state.planner.arrivalDate
      ? state.planner.arrivalDate + (state.planner.departureDate ? ' → ' + state.planner.departureDate : '')
      : departureDisplay;
    dom.plannerMobileReview.innerHTML =
      '<strong>' + monthObj.fullName + ' · ' + datesSummary + ' · ' + state.planner.travelers + ' ' + p.summaryMetaTravelers + ' · ' + activeNights + nightsUnit + '</strong>' +
      '<div style="margin-top:0.25rem; color:var(--accent-tea);">' + stayTitle + '</div>' +
      '<div style="margin-top:0.2rem;">' + routeLine + '</div>';

    // Right Blueprint Sidebar
    dom.plannerAsideCount.textContent = stops.length + ' ' + r.stopsLabel + ' · ' + activeNights + nightsUnit;
    dom.plannerAsideMonsoon.innerHTML =
      '<span class="mono-label" style="display:block; color:var(--ink-muted); margin-bottom:0.2rem;">' + p.summaryMonsoon + ' · ' + monthObj.fullName + '</span>' +
      '<strong>' + monthObj.headline + '</strong>';
    dom.plannerAsideSpecs.innerHTML =
      '<div><span>' + p.dateLabel + '</span><strong>' + arrivalDisplay + '</strong></div>' +
      '<div><span>' + p.departureDateLabel + '</span><strong>' + departureDisplay + '</strong></div>' +
      '<div><span>' + p.summaryMetaTravelers + '</span><strong>' + state.planner.travelers + '</strong></div>' +
      '<div><span>' + p.summaryMetaNights + '</span><strong>' + activeNights + nightsUnit + '</strong></div>' +
      '<div style="grid-column:1 / -1;"><span>' + p.summaryMetaStay + '</span><strong>' + stayTitle + '</strong></div>';

    if (!stops.length) {
      dom.plannerAsideStops.innerHTML = '<p style="font-size:0.84rem; color:var(--ink-muted); margin:0;">' + p.summaryNoStops + '</p>';
    } else {
      dom.plannerAsideStops.innerHTML = stops.map(function (stop, idx) {
        return (
          '<div class="aside-stop-row">' +
          '<div class="aside-stop-row__main">' +
          '<img src="' + stop.image + '" alt="' + stop.name + '" />' +
          '<div style="min-width:0;">' +
          '<div class="mono-label" style="font-size:0.62rem; color:var(--ink-muted);">0' + (idx + 1) + ' · ' + stop.idealNights + nightsUnit + '</div>' +
          '<div class="aside-stop-row__title">' + stop.name + '</div>' +
          '</div></div>' +
          '<button type="button" class="aside-stop-row__rm" data-aside-rm="' + stop.id + '" aria-label="' + r.removeStop + '">&times;</button>' +
          '</div>'
        );
      }).join('');
      dom.plannerAsideStops.querySelectorAll('[data-aside-rm]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          toggleSavedStop(btn.dataset.asideRm);
          renderPlannerModal();
        });
      });
    }

    // Footer Buttons & Counter
    dom.plannerStepMeta.textContent = p.stepCounter.replace('{step}', String(state.planner.step));
    dom.plannerMobileSummary.textContent = stops.length + ' ' + r.stopsLabel + ' · ' + activeNights + nightsUnit + ' · ' + monthObj.short;
    dom.plannerBackBtn.hidden = state.planner.step === 1;
    dom.plannerNextLabel.textContent = state.planner.step === 3 ? p.submitBtn : p.nextBtn;

    // Confirmation View
    if (state.planner.confirmed) {
      var conf = state.planner.confirmed;
      dom.plannerConfirmed.innerHTML =
        '<div class="confirmed-card">' +
        '<span class="mono-label" style="color:var(--accent-tea);">' + p.confirmedBadge + ' · ' + conf.refCode +
        (conf.cloudSynced ? ' [FIREBASE SYNCED]' : '') + '</span>' +
        '<h3 class="display-serif" style="margin:0.45rem 0 0.35rem; font-size:clamp(1.45rem, 1.2rem + 0.9vw, 1.95rem);">' +
        p.confirmedHeading.replace('{name}', conf.name) + '</h3>' +
        '<p style="margin:0; color:var(--ink-secondary); font-size:0.92rem;">' + p.confirmedSub.replace('{ref}', conf.refCode) + '</p>' +
        '<div class="confirmed-meta-grid">' +
        '<div><span>' + p.monthHeading + '</span><strong>' + monthObj.fullName + ((state.planner.arrivalDate || state.planner.departureDate) ? ' (' + arrivalDisplay + ' → ' + departureDisplay + ')' : '') + '</strong></div>' +
        '<div><span>' + p.summaryMetaTravelers + ' &amp; ' + p.summaryMetaNights + '</span><strong>' + state.planner.travelers + ' · ' + activeNights + nightsUnit + '</strong></div>' +
        '<div><span>' + p.summaryMetaStay + '</span><strong>' + stayTitle + '</strong></div>' +
        '<div><span>' + p.transportHeading + '</span><strong>' + p.transports[state.planner.transport] + '</strong></div>' +
        '<div style="grid-column:1 / -1;"><span>' + p.summaryStops + '</span><strong>' + routeLine + '</strong></div>' +
        '</div>' +
        '<div style="display:flex; flex-wrap:wrap; gap:0.6rem;">' +
        '<button type="button" class="btn btn--primary" id="pln-copy-confirmed">' + p.copySummaryBtn + '</button>' +
        '<button type="button" class="btn btn--outline" id="pln-print-confirmed">' + p.printBtn + '</button>' +
        '<button type="button" class="btn btn--outline" id="pln-edit-confirmed">' + p.editBtn + '</button>' +
        '<button type="button" class="btn btn--outline" id="pln-done-confirmed">' + p.doneBtn + '</button>' +
        '</div></div>';

      document.getElementById('pln-copy-confirmed').addEventListener('click', function () {
        var text = buildBlueprintText(conf.refCode);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { showToast(state.locale.ui.toasts.copied); });
        }
      });
      document.getElementById('pln-print-confirmed').addEventListener('click', function () { window.print(); });
      document.getElementById('pln-edit-confirmed').addEventListener('click', function () { setPlannerStep(1); });
      document.getElementById('pln-done-confirmed').addEventListener('click', closePlannerModal);
    }
  }

  function submitPlannerBrief() {
    var nameInput = document.getElementById('pln-name');
    var emailInput = document.getElementById('pln-email');
    if (dom.plannerForm && !dom.plannerForm.reportValidity()) return;

    var name = nameInput ? nameInput.value.trim() : '';
    var email = emailInput ? emailInput.value.trim() : '';
    var origin = document.getElementById('pln-origin') ? document.getElementById('pln-origin').value.trim() : '';
    var notes = document.getElementById('pln-notes') ? document.getElementById('pln-notes').value.trim() : '';
    var stops = getSavedStopObjects().map(function (d) { return d.name; });
    var activeNights = getActivePlannerNights();
    var suffix = Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(10 + Math.random() * 89);
    var refCode = 'SRD-' + suffix;

    dom.plannerNextBtn.disabled = true;
    dom.plannerNextLabel.textContent = state.locale.ui.planner.submittingBtn;

    var finish = function (cloudSynced) {
      dom.plannerNextBtn.disabled = false;
      state.planner.confirmed = { refCode: refCode, name: name, cloudSynced: cloudSynced };
      renderPlannerModal();
      showToast(state.locale.ui.toasts.compiled.replace('{ref}', refCode));
    };

    if (window.SERENDIB_FIREBASE && typeof window.SERENDIB_FIREBASE.saveInquiry === 'function') {
      window.SERENDIB_FIREBASE.saveInquiry({
        refCode: refCode,
        name: name,
        email: email,
        month: state.planner.month,
        arrivalDate: state.planner.arrivalDate,
        departureDate: state.planner.departureDate,
        guests: state.planner.travelers + ' guests · ' + activeNights + ' nights',
        travelers: state.planner.travelers,
        nights: activeNights,
        stayTier: state.planner.stayTier,
        transport: state.planner.transport,
        interests: state.planner.interests.slice(),
        origin: origin,
        notes: notes,
        stops: stops,
        lang: state.lang,
        createdAt: new Date().toISOString()
      }).then(function () { finish(true); }).catch(function () { finish(false); });
    } else {
      finish(false);
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
