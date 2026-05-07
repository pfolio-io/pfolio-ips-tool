/**
 * Inline risk calibrator — renders inside the section 3.1 helper.
 *
 * Uses horizon and objective from the IPS form state (sections 2.1, 2.2),
 * asks five remaining questions (savings, knowledge, experience, stated
 * risk_level, stated volatility), and runs the risk profile calculation.
 *
 * Refuses to run if horizon or objective are unfilled — keeps section 3.1
 * downstream of 2.1 and 2.2 rather than parallel to them.
 *
 * "Apply" writes risk_level + target_volatility to the form store and triggers
 * the marketing touchpoint 1 logic (suppress at level 0, populate otherwise).
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});
  const el = () => ns.formFields.el;
  const calc = () => ns.questionnaireCalc;
  const lookup = () => ns.questionnaireLookup;
  const utils = () => ns.utils;

  const BANDS = [
    { value: 'below_5', corr_lo: 5,  corr_hi: 10, sev_lo: 10, sev_hi: 15 },
    { value: '5_75',    corr_lo: 10, corr_hi: 20, sev_lo: 15, sev_hi: 25 },
    { value: '75_10',   corr_lo: 15, corr_hi: 25, sev_lo: 25, sev_hi: 35 },
    { value: '10_15',   corr_lo: 20, corr_hi: 35, sev_lo: 35, sev_hi: 50 },
    { value: 'above_15', corr_lo: 35, corr_hi: 50, sev_lo: 50, sev_hi: null }
  ];

  function roundToHundred(n) { return Math.round(n / 100) * 100; }

  function buildSteps() {
    const c = calc();
    return [
      { id: 'savings', title: 'Savings buffer', label: 'How long could your current savings cover your living expenses? Cash or cash-equivalent only; exclude funds invested through this portfolio.', type: 'single', options: c.SAVINGS },
      { id: 'knowledge', title: 'Investment knowledge', label: 'How would you rate your level of investment knowledge?', type: 'single', options: c.KNOWLEDGE },
      { id: 'experience', title: 'Investment experience', label: 'Which of the following products have you previously invested in? Select all that apply.', type: 'multi', options: c.EXPERIENCE_PRODUCTS },
      { id: 'risk_level', title: 'Risk willingness', label: 'How would you describe your willingness to take investment risk?', type: 'single', options: c.RISK_LEVEL },
      { id: 'volatility', title: 'Volatility tolerance', label: 'What level of annual portfolio fluctuation are you comfortable accepting?', type: 'single', options: c.VOLATILITY }
    ];
  }

  function buildResult(level, volBand) {
    if (level === null || level === undefined) return null;
    const lk = lookup();
    const entry = lk.levels[level];
    return {
      level,
      title: entry.title,
      paragraphs: entry.paragraphs,
      riskLevelValue: lk.levelToRiskLevel[level],
      volBand: volBand || lk.levelToVolatility[level]
    };
  }

  function setCalibrator(store, patch) {
    const cur = store.get().calibrator || {};
    store.set('calibrator', { ...cur, ...patch });
  }

  function setAnswer(store, key, value) {
    const cur = store.get().calibrator || {};
    store.set('calibrator', { ...cur, answers: { ...cur.answers, [key]: value } });
  }

  function renderBlocker(store) {
    const E = el();
    const missing = [];
    const s = store.get();
    if (utils().isEmpty(s.horizon)) missing.push('section 2.1 (horizon)');
    if (utils().isEmpty(s.objective)) missing.push('section 2.2 (objective)');

    return E('div', { class: 'ips-calibrator ips-calibrator--blocked' }, [
      E('p', { class: 'ips-calibrator__blocker' }, [
        'The calibrator uses your answers from earlier sections. Please fill in ',
        missing.join(' and '),
        ' first, then return here.'
      ]),
      E('button', {
        type: 'button',
        class: 'ips-q-link',
        onClick: () => setCalibrator(store, { open: false })
      }, '← Back to framework')
    ]);
  }

  function renderQuestion(state, store, idx) {
    const E = el();
    const steps = buildSteps();
    const step = steps[idx];
    const c = state.calibrator || {};
    const cur = (c.answers || {})[step.id];

    function next() {
      if (idx === steps.length - 1) {
        // Final step — run calculation
        const co = calc();
        const s = store.get();
        // Build full answers including horizon and objective from form state
        const c2 = co.ipsHorizonToQuestionnaire(s.horizon);
        const fullAnswers = {
          ...(c.answers || {}),
          horizon: c2,
          objective: s.objective
        };
        const level = co.calculateLevel(fullAnswers);
        const result = buildResult(level, fullAnswers.volatility);
        setCalibrator(store, { result, step: idx });
      } else {
        setCalibrator(store, { step: idx + 1 });
      }
    }

    function back() {
      if (idx === 0) {
        setCalibrator(store, { open: false });
      } else {
        setCalibrator(store, { step: idx - 1 });
      }
    }

    function isAnswered() {
      if (step.type === 'single') return cur !== null && cur !== undefined && cur !== '';
      if (step.type === 'multi') return Array.isArray(cur);
      return false;
    }

    let optionsNode;
    if (step.type === 'multi') {
      const arr = Array.isArray(cur) ? cur : [];
      optionsNode = E('div', { class: 'ips-q-checks' }, step.options.map((opt) => {
        const checked = arr.includes(opt.value);
        return E('label', { class: 'ips-q-check' + (checked ? ' is-selected' : '') }, [
          E('input', {
            type: 'checkbox',
            checked: checked ? 'checked' : false,
            onChange: () => {
              const cur2 = arr.includes(opt.value) ? arr.filter((v) => v !== opt.value) : [...arr, opt.value];
              setAnswer(store, step.id, cur2);
            }
          }),
          E('span', null, opt.label)
        ]);
      }));
    } else {
      optionsNode = E('div', { class: 'ips-q-options' }, step.options.map((opt) => {
        const isSel = cur === opt.value;
        return E('button', {
          type: 'button',
          class: 'ips-q-option' + (isSel ? ' is-selected' : ''),
          onClick: () => {
            setAnswer(store, step.id, opt.value);
            // Auto-advance for single-select
            if (idx < steps.length - 1) {
              setTimeout(() => setCalibrator(store, { step: idx + 1 }), 120);
            }
          }
        }, opt.label);
      }));
    }

    const noneNote = step.type === 'multi'
      ? E('p', { class: 'ips-q-hint' }, 'Continue without selections if you have not invested in any of these.')
      : null;

    return E('div', { class: 'ips-calibrator' }, [
      E('div', { class: 'ips-calibrator__summary' }, [
        E('span', null, [
          'Using horizon: ',
          E('strong', null, utils().labelFor(utils().HORIZON_LABELS, state.horizon)),
          ' · objective: ',
          E('strong', null, utils().labelFor(utils().OBJECTIVE_LABELS, state.objective))
        ])
      ]),
      E('div', { class: 'ips-q-meta' }, [
        E('span', null, `Question ${idx + 1} of ${steps.length}`)
      ]),
      E('h4', { class: 'ips-calibrator__h' }, step.title),
      E('label', { class: 'ips-q-label' }, step.label),
      optionsNode,
      noneNote,
      E('div', { class: 'ips-q-actions' }, [
        E('button', { type: 'button', class: 'ips-btn ips-btn--ghost', onClick: back }, idx === 0 ? '← Back to framework' : '← Back'),
        E('button', {
          type: 'button',
          class: 'ips-btn ips-btn--outline',
          disabled: !isAnswered() ? 'disabled' : false,
          onClick: () => { if (isAnswered()) next(); }
        }, idx === steps.length - 1 ? 'See result →' : 'Next →')
      ])
    ]);
  }

  function renderResult(state, store) {
    const E = el();
    const result = state.calibrator.result;

    function applyToIps() {
      store.set('risk_level', result.riskLevelValue);
      store.set('target_volatility', result.volBand);
      store.set('questionnaire_result', { level: result.level, riskLevel: result.riskLevelValue, volatility: result.volBand });
      // Marketing touchpoint 1 now renders inline (see below); no separate DOM placeholder.
      setCalibrator(store, { open: false });
    }

    function takeAgain() {
      setCalibrator(store, {
        step: 0,
        answers: { savings: null, knowledge: null, experience: [], risk_level: null, volatility: null },
        result: null
      });
    }

    // Marketing touchpoint 1 (inline). Suppressed at level 0 — the third paragraph
    // already does that work explicitly ("we cannot recommend any pfolio portfolios").
    const mktCard = result.level === 0
      ? null
      : E('a', {
          href: 'https://www.pfolio.io/help/our-portfolios',
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'ips-mkt-card'
        }, [
          E('span', { class: 'ips-mkt-card__text', html: `Your risk profile maps to pfolio's <strong>${result.title}</strong> portfolios.` }),
          E('span', { class: 'ips-mkt-card__cta' }, 'Explore them →')
        ]);

    return E('div', { class: 'ips-calibrator ips-q-result' + (result.level === 0 ? ' ips-q-result--zero' : '') }, [
      E('h4', { class: 'ips-q-result-h' }, result.title),
      ...result.paragraphs.map((p) => E('p', { class: 'ips-q-result-p' }, p)),
      renderDrawdownGrounding(result.volBand, (store.get().funding_status === 'already_funded' ? store.get().current_portfolio_value : store.get().starting_capital), store.get().base_currency || 'USD'),
      mktCard,
      E('div', { class: 'ips-q-actions' }, [
        E('button', { type: 'button', class: 'ips-btn ips-btn--apply', onClick: applyToIps }, 'Apply to risk level →'),
        E('button', { type: 'button', class: 'ips-q-link', onClick: takeAgain }, 'Take it again')
      ])
    ]);
  }

  function renderDrawdownGrounding(volBand, startingCapital, currency) {
    const E = el();
    const band = BANDS.find((b) => b.value === volBand);
    if (!band) return null;
    const u = utils();
    const cap = startingCapital;
    const hasCapital = cap !== null && cap !== undefined && cap > 0;

    let inPractice;
    if (hasCapital) {
      const corrLo = roundToHundred(cap * band.corr_lo / 100);
      const corrHi = roundToHundred(cap * band.corr_hi / 100);
      const sevLo = roundToHundred(cap * band.sev_lo / 100);
      const sevHi = band.sev_hi === null ? null : roundToHundred(cap * band.sev_hi / 100);
      const fmt = (n) => u.formatMoney(n, currency);
      const corrStr = `${fmt(corrLo)} to ${fmt(corrHi)}`;
      const sevStr = sevHi === null ? `${fmt(sevLo)} or more` : `${fmt(sevLo)} to ${fmt(sevHi)}`;
      inPractice = `A normal correction at this volatility level would mean a paper loss of around ${corrStr}. A severe bear market could mean a paper loss of around ${sevStr}.`;
    } else {
      const sevStr = band.sev_hi === null ? '50% or more' : `${band.sev_lo}–${band.sev_hi}%`;
      inPractice = `A normal correction at this volatility level would mean a paper loss of around ${band.corr_lo}–${band.corr_hi}% of capital. A severe bear market could mean a paper loss of around ${sevStr}.`;
    }

    return E('div', { class: 'ips-q-grounding' }, [
      E('h5', { class: 'ips-q-grounding-h' }, 'What this looks like in practice'),
      E('p', null, inPractice),
      E('p', { class: 'ips-q-grounding-note' },
        'Read the figures, not the percentages. The level you can sit with—through months of headlines telling you it will get worse—is the level your portfolio should be designed around.'
      )
    ]);
  }

  /**
   * Public render: returns a DOM node for the calibrator content.
   * Caller is responsible for showing/hiding based on state.calibrator.open.
   */
  function render(state, store) {
    if (utils().isEmpty(state.horizon) || utils().isEmpty(state.objective)) {
      return renderBlocker(store);
    }
    if (state.calibrator && state.calibrator.result) {
      return renderResult(state, store);
    }
    const step = (state.calibrator && state.calibrator.step) || 0;
    return renderQuestion(state, store, step);
  }

  ns.formCalibrator = { render };
})();
