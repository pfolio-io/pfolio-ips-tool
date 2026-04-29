/**
 * Form state container with localStorage persistence.
 *
 * Single state object covering every IPS field. Subscribers re-render on
 * change. Saves debounced to localStorage; loads and merges on mount.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  const STORAGE_KEY = 'pfolio_ips_draft_v1';
  const DEBOUNCE_MS = 500;

  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  // Default state — every field initialised.
  function defaultState() {
    return {
      // section 1
      drafted_by: '',
      date_drafted: todayISO(),
      base_currency: 'USD',
      co_investor: '',

      // section 2.1
      horizon: null,
      horizon_helper_age: { current_age: null, target_age: null },
      horizon_helper_purpose: null,
      horizon_helper_earliest: null,

      // section 2.2
      objective: null,
      objective_helper_income: null,
      objective_helper_priority: null,
      objective_helper_drawdowns: null,
      target_value: null,
      secondary_objectives: '',

      // section 2.3
      intended_use: '',

      // section 2.4
      starting_capital: null,
      ongoing_contributions: { amount: null, period: null },
      onboarding_approach: null,
      onboarding_specify: '',
      withdrawal_approach: '',

      // section 3.1
      risk_level: null,
      capacity_portfolio_share: null,
      capacity_dependants: null,
      capacity_income_stability: null,
      capacity_obligations: '',
      risk_level_note: '',

      // section 3.2
      target_volatility: null,
      target_volatility_note: '',

      // section 3.3
      abandonment_amount: null,
      abandonment_pct: null,
      abandonment_note: '',

      // section 4.1
      asset_types: ['etfs'],
      asset_types_other: '',

      // section 4.2
      asset_classes: ['equities', 'fixed_income', 'commodities', 'alternatives', 'cash'],
      asset_classes_note: '',

      // section 4.3
      geography: 'global',
      geography_regions_in: '',
      geography_regions_out: '',
      geography_dev_em_mix: '',

      // section 4.4
      esg_screening: { enabled: false, screen: '' },
      excluded_sectors: '',
      excluded_instruments: '',
      currency_hedging: '',

      // section 4.5
      max_single_position: null,
      max_asset_class: null,
      max_sector: null,

      // section 5.1
      management_style: null,
      style_helper_hours: null,
      style_helper_research: null,
      style_helper_realtime: null,
      management_style_note: '',

      // section 5.2
      cadence: null,
      drift_threshold: '',

      // section 5.3
      tactical_overrides: 'Never.',

      // section 6
      liquidity_reserve: '',
      tax_residence: '',
      account_types: '',
      tax_considerations: '',

      // section 7
      annual_review_date: '',
      personal_benchmark: '',
      life_events: [
        'Marriage, divorce, or change in household composition',
        'Birth or adoption of a child',
        'Significant change in income or employment',
        'Inheritance or other material change in net worth',
        'Approaching retirement (within 5 years)',
        'Change in country of residence',
        "Material change in dependants' financial situation"
      ],

      // signature
      signature: '',
      signature_date: '',

      // UI state
      advanced_open: {
        section_1: false,
        section_2_2_optional: false,
        section_2_4: false,
        section_3_3: false,
        section_4_3: false,
        section_4_4: false,
        section_4_5: false,
        section_5_2: false,
        section_5_3: false,
        section_6_2: false,
        section_7_2: false,
        section_7_3: false,
        section_7_4: false,
        section_7_5: false
      },
      helpers_open: {
        horizon: false,
        objective: false,
        risk_level: false,
        target_volatility: false,
        management_style: false
      },

      // questionnaire result (written when the calibrator's Apply runs)
      questionnaire_result: null,

      // Inline calibrator widget (lives inside the section 3.1 helper)
      calibrator: {
        open: false,
        step: 0,
        answers: {
          savings: null,
          knowledge: null,
          experience: [],
          risk_level: null,
          volatility: null
        },
        result: null
      }
    };
  }

  // Deep-merge a stored partial into the default state.
  // Preserves shape: if a stored field is missing, the default fills it in.
  function merge(base, overlay) {
    if (overlay === null || overlay === undefined) return base;
    if (typeof base !== 'object' || base === null) return overlay;
    if (Array.isArray(base)) return Array.isArray(overlay) ? overlay : base;
    const out = { ...base };
    for (const k of Object.keys(overlay)) {
      if (k in base && typeof base[k] === 'object' && base[k] !== null && !Array.isArray(base[k])) {
        out[k] = merge(base[k], overlay[k]);
      } else {
        out[k] = overlay[k];
      }
    }
    return out;
  }

  function createStore() {
    let state = defaultState();
    const subscribers = new Set();
    let saveTimer = null;
    let storageAvailable = false;

    // Detect localStorage availability — private mode / disabled storage will throw.
    try {
      const k = '__pfolio_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      storageAvailable = true;
    } catch (_e) {
      storageAvailable = false;
    }

    function load() {
      if (!storageAvailable) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        state = merge(defaultState(), parsed);
      } catch (_e) {
        // Corrupt blob — fall back to defaults
      }
    }

    function persistNow() {
      if (!storageAvailable) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (_e) {
        // Quota or other failure — silently ignore
      }
    }

    function schedulePersist() {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(persistNow, DEBOUNCE_MS);
    }

    function notify(changedKey) {
      for (const fn of subscribers) {
        try { fn(state, changedKey); } catch (e) { console.error('[pfolioIPS] subscriber threw', e); }
      }
    }

    function get() {
      return state;
    }

    function set(key, value) {
      state[key] = value;
      schedulePersist();
      notify(key);
    }

    // Like set() but does NOT notify subscribers — used by text/textarea/number
    // inputs on each keystroke to avoid tearing down the DOM mid-typing.
    // The matching set() is fired on blur (input.onchange) which then triggers re-render.
    function setQuiet(key, value) {
      state[key] = value;
      schedulePersist();
    }

    // For nested-object fields (ongoing_contributions, esg_screening, etc.)
    function setNested(parentKey, childKey, value) {
      state[parentKey] = { ...(state[parentKey] || {}), [childKey]: value };
      schedulePersist();
      notify(parentKey);
    }

    function setNestedQuiet(parentKey, childKey, value) {
      state[parentKey] = { ...(state[parentKey] || {}), [childKey]: value };
      schedulePersist();
    }

    // Advanced subsection toggle
    function setAdvancedOpen(sectionKey, open) {
      state.advanced_open = { ...state.advanced_open, [sectionKey]: !!open };
      schedulePersist();
      notify('advanced_open');
    }

    function toggleAdvancedOpen(sectionKey) {
      setAdvancedOpen(sectionKey, !state.advanced_open[sectionKey]);
    }

    // Helper visibility toggle
    function setHelperOpen(helperKey, open) {
      state.helpers_open = { ...state.helpers_open, [helperKey]: !!open };
      schedulePersist();
      notify('helpers_open');
    }

    function toggleHelperOpen(helperKey) {
      setHelperOpen(helperKey, !state.helpers_open[helperKey]);
    }

    function subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }

    function reset() {
      state = defaultState();
      persistNow();
      notify('*reset*');
    }

    function isStorageAvailable() {
      return storageAvailable;
    }

    function hasUserData() {
      const def = defaultState();
      // Compare a handful of fields that the user typically touches.
      // Any divergence from defaults (other than date_drafted, which is auto-set today) counts.
      const checks = [
        'drafted_by', 'horizon', 'objective', 'intended_use',
        'starting_capital', 'risk_level', 'target_volatility',
        'liquidity_reserve', 'annual_review_date'
      ];
      return checks.some((k) => JSON.stringify(state[k]) !== JSON.stringify(def[k]));
    }

    // Initial load
    load();

    // Public way to fire a notify() — used by quiet setters on blur to trigger re-render
    function flush(key) { notify(key || '*flush*'); }

    return {
      get, set, setQuiet, setNested, setNestedQuiet, flush,
      setAdvancedOpen, toggleAdvancedOpen,
      setHelperOpen, toggleHelperOpen,
      subscribe, reset,
      isStorageAvailable, hasUserData,
      _persistNow: persistNow,
      _defaultState: defaultState
    };
  }

  ns.formState = { createStore, defaultState, STORAGE_KEY };
})();
