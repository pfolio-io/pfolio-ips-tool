/**
 * Helper resolution logic for the five helpers, plus the drawdown table.
 *
 * Helpers do not auto-set the field they help with; they suggest. The user
 * remains the decision-maker.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});
  const el = ns.formFields.el;

  // ---------- Resolution functions ----------

  // Horizon helper: min(target_age - current_age, earliest_plausible). Map to band.
  // Purpose-based cap: near-term goals (house deposit, business funding, education, large purchase)
  // are bounded at the 5-10 year band regardless of target age — a near-term framing rules out long bands.
  const HORIZON_BANDS = ['lt_1y', '1_3y', '3_5y', '5_10y', '10_15y', '15_25y', 'gt_25y'];

  function yearsToBandIndex(years) {
    if (years < 1) return 0;
    if (years < 3) return 1;
    if (years < 5) return 2;
    if (years <= 10) return 3;
    if (years <= 15) return 4;
    if (years <= 25) return 5;
    return 6;
  }

  function resolveHorizon(state) {
    const age = state.horizon_helper_age || {};
    const current = age.current_age;
    const target = age.target_age;
    const earliest = state.horizon_helper_earliest;
    const purpose = state.horizon_helper_purpose;

    if (current == null || target == null || earliest == null) return null;

    const yearsToTarget = target - current;
    if (yearsToTarget <= 0) return null;

    const years = Math.min(yearsToTarget, earliest);
    let idx = yearsToBandIndex(years);
    if (purpose === 'near_term') idx = Math.min(idx, 3); // clamp to '5_10y'
    return HORIZON_BANDS[idx];
  }

  // Objective helper: first question to resolve wins.
  // Q1 yes → income_generation; Q2 not_losing → capital_preservation;
  // Q3 either answer → capital_growth (helper never volunteers speculation;
  // users who want it can still pick it directly in the main field).
  function resolveObjective(state) {
    if (state.objective_helper_income === 'yes') return 'income_generation';
    if (state.objective_helper_income !== 'no') return null;
    if (state.objective_helper_priority === 'not_losing') return 'capital_preservation';
    if (state.objective_helper_priority !== 'growing') return null;
    if (state.objective_helper_drawdowns === 'yes_large' || state.objective_helper_drawdowns === 'measured') {
      return 'capital_growth';
    }
    return null;
  }

  // Management style helper: score-based.
  // Hours: none=0, 1-2=1, 2-5=2, gt_5=3.
  // Research: no=0, not_particularly=1, yes=2.
  // Realtime: not=0, somewhat=1, very=2.
  // Sum 0-2 → passive; 3-5 → systematic; 6-7 → active.
  function resolveManagementStyle(state) {
    const HOURS = { none: 0, '1_2': 1, '2_5': 2, gt_5: 3 };
    const RESEARCH = { no: 0, not_particularly: 1, yes: 2 };
    const REALTIME = { not: 0, somewhat: 1, very: 2 };

    const h = HOURS[state.style_helper_hours];
    const r = RESEARCH[state.style_helper_research];
    const t = REALTIME[state.style_helper_realtime];
    if (h == null || r == null || t == null) return null;

    const sum = h + r + t;
    if (sum <= 2) return 'passive';
    if (sum <= 5) return 'systematic';
    return 'active';
  }

  // ---------- Suggestion box ----------

  function suggestionBox(label, suggestionLabel, onApply) {
    return el('div', { class: 'ips-suggestion' }, [
      el('span', { class: 'ips-suggestion__text' }, [
        'Based on your answers, the suggested choice is ',
        el('strong', null, suggestionLabel),
        '.'
      ]),
      el('button', {
        type: 'button',
        class: 'ips-btn ips-btn--apply',
        onClick: onApply
      }, 'Apply')
    ]);
  }

  // ---------- Drawdown table ----------

  // Bands match ips-tool-spec.json section_3_2.helpers.drawdown_bands.
  const BANDS = [
    { value: 'below_5', label: 'Below 5%', corr_lo: 5, corr_hi: 10, sev_lo: 10, sev_hi: 15 },
    { value: '5_75', label: '5% to 7.5%', corr_lo: 10, corr_hi: 20, sev_lo: 15, sev_hi: 25 },
    { value: '75_10', label: '7.5% to 10%', corr_lo: 15, corr_hi: 25, sev_lo: 25, sev_hi: 35 },
    { value: '10_15', label: '10% to 15%', corr_lo: 20, corr_hi: 35, sev_lo: 35, sev_hi: 50 },
    { value: 'above_15', label: 'Above 15%', corr_lo: 35, corr_hi: 50, sev_lo: 50, sev_hi: null }
  ];

  function roundToHundred(n) {
    return Math.round(n / 100) * 100;
  }

  function renderDrawdownTable(state, store) {
    const cap = state.starting_capital;
    const currency = state.base_currency || 'USD';
    const hasCapital = cap !== null && cap !== undefined && cap > 0;

    const rows = BANDS.map((b) => {
      let text;
      if (hasCapital) {
        const corrLo = roundToHundred(cap * b.corr_lo / 100);
        const corrHi = roundToHundred(cap * b.corr_hi / 100);
        const sevLo = roundToHundred(cap * b.sev_lo / 100);
        const sevHi = b.sev_hi === null
          ? null
          : roundToHundred(cap * b.sev_hi / 100);
        const fmt = (n) => ns.utils.formatMoney(n, currency);
        const corrStr = `${fmt(corrLo)} to ${fmt(corrHi)}`;
        const sevStr = sevHi === null
          ? `${fmt(sevLo)} or more`
          : `${fmt(sevLo)} to ${fmt(sevHi)}`;
        text = `${b.label} → corrections around ${corrStr}; severe bear markets around ${sevStr}`;
      } else {
        const sevStr = b.sev_hi === null ? '50% or more' : `${b.sev_lo}–${b.sev_hi}%`;
        text = `${b.label} → corrections around ${b.corr_lo}–${b.corr_hi}% of capital; severe bear markets around ${sevStr}`;
      }
      return el('li', { class: 'ips-drawdown__row' }, text);
    });

    return el('div', { class: 'ips-drawdown' }, [
      el('p', { class: 'ips-drawdown__intro' }, hasCapital
        ? `For a portfolio worth your starting capital, expected drawdowns at each volatility band are roughly:`
        : 'For a portfolio worth your starting capital, expected drawdowns at each volatility band are roughly:'),
      el('ul', { class: 'ips-drawdown__list' }, rows),
      el('p', { class: 'ips-drawdown__post' },
        'Read the figures, not the percentages. The level you can sit with—through months of headlines telling you it will get worse—is the level your portfolio should be designed around. Not the level you would prefer to handle.'
      ),
      el('p', { class: 'ips-drawdown__anchors-intro' }, 'For context, the drawdowns global equities have actually delivered in living memory:'),
      el('ul', { class: 'ips-drawdown__anchors' }, [
        el('li', null, '1973–1974: roughly 45%'),
        el('li', null, '2000–2002: roughly 45%'),
        el('li', null, '2007–2009: roughly 50%'),
        el('li', null, 'March 2020: roughly 34% in five weeks')
      ]),
      el('p', { class: 'ips-drawdown__anchors-foot' },
        'These are not edge cases. They recur every decade or two, and the next one is on its way at some point you cannot predict. Pick the volatility band you would still hold through the next one of these.'
      )
    ]);
  }

  // ---------- Helper block renderer ----------

  function renderHelpers(parentField, state, store, ctx) {
    const helpers = parentField.helpers;
    if (!helpers) return null;

    const helperKey = parentField.id; // matches state.helpers_open keys for our 5 helpers
    const isOpen = !!state.helpers_open[helperKey];

    const label = helpers.label || 'Not sure?';
    const toggleBtn = el('button', {
      type: 'button',
      class: 'ips-helper-toggle' + (isOpen ? ' is-open' : ''),
      onClick: () => store.toggleHelperOpen(helperKey)
    }, `${label} ${isOpen ? '▾' : '▸'}`);

    if (!isOpen) return toggleBtn;

    // Open — render the helper body
    const children = [toggleBtn];
    if (helpers.intro) children.push(el('p', { class: 'ips-helper__intro' }, helpers.intro));
    if (helpers.preamble) children.push(el('p', { class: 'ips-helper__preamble' }, helpers.preamble));

    // Text-only helpers (e.g. risk_level): render the body_html block, no questions, no auto-suggest.
    if (helpers.body_html) {
      const calibratorOpen = helperKey === 'risk_level' && state.calibrator && state.calibrator.open;
      if (calibratorOpen && ns.formCalibrator) {
        children.push(ns.formCalibrator.render(state, store));
      } else {
        const body = el('div', { class: 'ips-helper__body' });
        body.innerHTML = helpers.body_html;
        children.push(body);
        // For risk_level, offer the calibrator as an alternative path
        if (helperKey === 'risk_level') {
          children.push(el('div', { class: 'ips-helper__cta' }, [
            el('button', {
              type: 'button',
              class: 'ips-btn ips-btn--outline',
              onClick: () => {
                const cur = store.get().calibrator || {};
                store.set('calibrator', { ...cur, open: true, step: 0, result: null });
              }
            }, 'Or use the calibrator to suggest a level →')
          ]));
        }
      }
      return el('div', { class: 'ips-helper' }, children);
    }

    // Render each helper question (when the helper has structured inputs)
    if (Array.isArray(helpers.questions)) {
      for (const q of helpers.questions) {
        const value = state[q.id];
        children.push(ns.formFields.renderField(q, value, store, ctx));
      }
    }

    if (helpers.footnote) children.push(el('p', { class: 'ips-helper__footnote' }, helpers.footnote));

    // Special UI blocks for specific helpers
    if (helperKey === 'target_volatility') {
      children.push(renderDrawdownTable(state, store));
    }

    // Suggestion boxes for the auto-resolving helpers
    if (helperKey === 'horizon') {
      const suggestion = resolveHorizon(state);
      if (suggestion) {
        const label = ns.utils.HORIZON_LABELS[suggestion];
        children.push(suggestionBox('Suggested horizon', label, () => store.set('horizon', suggestion)));
      }
    } else if (helperKey === 'objective') {
      const suggestion = resolveObjective(state);
      if (suggestion) {
        const label = ns.utils.OBJECTIVE_LABELS[suggestion];
        children.push(suggestionBox('Suggested objective', label, () => store.set('objective', suggestion)));
      }
    } else if (helperKey === 'management_style') {
      const suggestion = resolveManagementStyle(state);
      if (suggestion) {
        const label = ns.utils.STYLE_LABELS[suggestion];
        children.push(suggestionBox('Suggested style', label, () => store.set('management_style', suggestion)));
      }
    }
    // target_volatility helper uses drawdown table; risk_level helper uses body_html.

    return el('div', { class: 'ips-helper' }, children);
  }

  ns.formHelpers = { resolveHorizon, resolveObjective, resolveManagementStyle, renderHelpers, renderDrawdownTable };
})();
