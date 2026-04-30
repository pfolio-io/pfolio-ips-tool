/* pfolio IPS bundle — built 2026-04-30T07:56:46Z */

/**
 * Shared utilities for the IPS document generators.
 * Registers helpers on window._pfolioIPS.utils.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  // ---------- Currency ----------

  const CURRENCY_LABELS = {
    USD: 'USD', EUR: 'EUR', CHF: 'CHF', GBP: 'GBP',
    JPY: 'JPY', AUD: 'AUD', CAD: 'CAD', Other: ''
  };

  function formatMoney(amount, currency) {
    if (amount === null || amount === undefined || amount === '') return '';
    const code = CURRENCY_LABELS[currency] || currency || '';
    const n = Number(amount);
    if (!Number.isFinite(n)) return '';
    const formatted = n.toLocaleString('en-GB', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return code ? `${code} ${formatted}` : formatted;
  }

  // ---------- Dates ----------

  function formatDate(iso) {
    if (!iso) return '';
    // Parse as local midnight so a YYYY-MM-DD doesn't slip back a day in negative TZs
    const parts = String(iso).split('-');
    const d = parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      : new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = d.getDate();
    const month = d.toLocaleString('en-GB', { month: 'long' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function addYearsISO(iso, years) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString().slice(0, 10);
  }

  // ---------- Filenames ----------

  function slugifyName(name) {
    if (!name || !name.trim()) return '';
    return name
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function buildFilename(name, kind, ext) {
    const slug = slugifyName(name);
    const date = todayISO();
    const base = slug ? `${slug}-${kind}-${date}` : `investment-policy-statement-${kind}-${date}`;
    return `${base}.${ext}`;
  }

  // ---------- Field labels (state value → human label) ----------

  const HORIZON_LABELS = {
    lt_1y: 'Less than 1 year',
    '1_3y': '1 to 3 years',
    '3_5y': '3 to 5 years',
    '5_10y': '5 to 10 years',
    '10_15y': '10 to 15 years',
    '15_25y': '15 to 25 years',
    gt_25y: 'More than 25 years'
  };

  const OBJECTIVE_LABELS = {
    capital_preservation: 'Capital preservation',
    income_generation: 'Income generation',
    capital_growth: 'Capital growth',
    speculation: 'Speculation or aggressive growth'
  };

  const RISK_LEVEL_LABELS = {
    very_low: 'Very low',
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    very_high: 'Very high'
  };

  const VOLATILITY_LABELS = {
    below_5: 'Below 5%',
    '5_75': '5% to 7.5%',
    '75_10': '7.5% to 10%',
    '10_15': '10% to 15%',
    above_15: 'Above 15%'
  };

  const ONBOARDING_LABELS = {
    lump_sum: 'Lump sum',
    phased: 'Phased entry',
    hybrid: 'Hybrid'
  };

  const ASSET_TYPE_LABELS = {
    etfs: 'ETFs',
    stocks: 'Individual stocks',
    bonds: 'Bonds and fixed income products',
    crypto: 'Cryptocurrencies',
    commodities: 'Commodities (via ETFs or futures)',
    currencies: 'Currencies',
    real_estate: 'Real estate',
    complex: 'Complex and leveraged products'
  };

  const ASSET_CLASS_LABELS = {
    equities: 'Equities',
    fixed_income: 'Fixed income',
    commodities: 'Commodities',
    cryptocurrencies: 'Cryptocurrencies',
    alternatives: 'Alternatives',
    cash: 'Cash equivalents'
  };

  const GEOGRAPHY_LABELS = {
    global: 'Global, no restriction',
    developed: 'Developed markets only',
    custom: 'Custom'
  };

  const STYLE_LABELS = {
    passive: 'Passive',
    systematic: 'Systematic',
    active: 'Active'
  };

  const CADENCE_LABELS = {
    contributions_only: 'Only when new contributions arrive',
    annually: 'Annually',
    semi_annually: 'Semi-annually',
    quarterly: 'Quarterly',
    monthly: 'Monthly',
    threshold: 'Threshold-based (drift triggers)'
  };

  const PERIOD_LABELS = {
    per_month: 'per month',
    per_year: 'per year',
    none: 'none'
  };

  function labelFor(map, key) {
    if (!key) return '';
    return map[key] || key;
  }

  function labelList(map, keys) {
    if (!Array.isArray(keys) || keys.length === 0) return '';
    return keys.map((k) => map[k] || k).join(', ');
  }

  // ---------- Empty checks ----------

  function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') {
      // Nested object — empty if every leaf is empty (so { amount: null, period: null } is empty)
      return Object.values(value).every(isEmpty);
    }
    return false;
  }

  // ---------- Disclaimers (verbatim) ----------

  const FOOTER_DISCLAIMER =
    'This document is a personal investment policy statement. It is not legal, tax, or financial advice. Investments involve risks, including the potential loss of capital. This template is provided by pfolio GmbH, a financial service provider under the Swiss Financial Services Act (FinSA), registered in Switzerland. Advertising under Art. 68 FinSA. For information only.';

  const POLICY_CARD_FOOTER =
    'This summary is a personal commitment derived from the full investment policy statement dated [DATE]. Refer to the full document for guidance text, advanced sections, and the revision log. This is not legal, tax, or financial advice. Investments involve risks, including the potential loss of capital.';

  const POLICY_CARD_RULE =
    'If I want to deviate from this document, I write down what I want to do and why, set the document aside for one week, and revisit. If the case still holds in calm conditions, it is a revision. If it does not, it was a deviation in disguise, and I do not act.';

  const SECTION_7_4_BOILERPLATE = [
    'This document is meant to evolve as your circumstances change. But revision and deviation are different.',
    'Revision is changing the document because something in your life has genuinely changed—a longer horizon, a higher capacity, a new dependant. Revisions happen at scheduled review points or after triggering life events, and are recorded with a date and a brief note on what changed and why.',
    'Deviation is failing to follow the document because markets are moving and you feel the urge to act. Deviations are the failure mode this document exists to prevent.',
    'If you want to change the rules during a drawdown, write down what you want to do and why, set the document aside for one week, and revisit. If the case still holds in calm conditions, it is a revision. If it does not, it was a deviation in disguise.'
  ];

  // ---------- File download helper ----------

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function fireDownloadComplete(kind) {
    const evt = new CustomEvent('download:complete', { detail: { kind } });
    document.dispatchEvent(evt);
  }

  // ---------- Lazy-load CDN libraries ----------

  const _libCache = {};

  function loadScript(src) {
    if (_libCache[src]) return _libCache[src];
    _libCache[src] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
    return _libCache[src];
  }

  const CDN = {
    docx: 'https://unpkg.com/docx@8.5.0/build/index.umd.js',
    html2pdf: 'https://unpkg.com/html2pdf.js@0.10.2/dist/html2pdf.bundle.min.js',
    fileSaver: 'https://unpkg.com/file-saver@2.0.5/dist/FileSaver.min.js'
  };

  async function ensureDocx() {
    if (typeof window.docx !== 'undefined') return window.docx;
    await loadScript(CDN.docx);
    return window.docx;
  }

  async function ensureHtml2Pdf() {
    if (typeof window.html2pdf !== 'undefined') return window.html2pdf;
    await loadScript(CDN.html2pdf);
    return window.html2pdf;
  }

  // ---------- Export ----------

  ns.utils = {
    formatMoney,
    formatDate,
    todayISO,
    addYearsISO,
    slugifyName,
    buildFilename,
    labelFor,
    labelList,
    isEmpty,
    triggerDownload,
    fireDownloadComplete,
    ensureDocx,
    ensureHtml2Pdf,
    HORIZON_LABELS,
    OBJECTIVE_LABELS,
    RISK_LEVEL_LABELS,
    VOLATILITY_LABELS,
    ONBOARDING_LABELS,
    ASSET_TYPE_LABELS,
    ASSET_CLASS_LABELS,
    GEOGRAPHY_LABELS,
    STYLE_LABELS,
    CADENCE_LABELS,
    PERIOD_LABELS,
    FOOTER_DISCLAIMER,
    POLICY_CARD_FOOTER,
    POLICY_CARD_RULE,
    SECTION_7_4_BOILERPLATE
  };
})();

/**
 * Anna Bauer worked example — hardcoded test data.
 *
 * The form produces an object of this shape; the generators consume it.
 * Used during development to verify generator output without filling the form.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  ns.anna = Object.freeze({
    // section 1 — Cover and metadata
    drafted_by: 'Anna Bauer',
    date_drafted: '2026-03-12',
    base_currency: 'EUR',
    co_investor: '',

    // section 2.1 — Investment horizon
    horizon: '15_25y',
    horizon_helper_age: { current_age: 32, target_age: null },
    horizon_helper_purpose: null,
    horizon_helper_earliest: null,

    // section 2.2 — Investment objective
    objective: 'capital_growth',
    objective_helper_income: null,
    objective_helper_priority: null,
    objective_helper_drawdowns: null,
    target_value: null,
    secondary_objectives: '',

    // section 2.3 — Intended use
    intended_use:
      'General long-term wealth building. The portfolio is intended to give me options in my mid-fifties—earlier retirement, reduced working hours, a sabbatical, or simply more financial flexibility. I am 32 and unmarried with no children, so the eventual use of this money will depend on choices I have not yet made. The framework is designed to flex as those choices come into view.',

    // section 2.4 — Funding the portfolio
    starting_capital: 45000,
    ongoing_contributions: { amount: 1500, period: 'per_month' },
    onboarding_approach: 'hybrid',
    onboarding_specify:
      'Deploy 50% (EUR 22,500) immediately at target allocation; remaining EUR 22,500 in six monthly tranches over the following six months.',
    withdrawal_approach: '',

    // section 3.1 — Risk level
    risk_level: 'high',
    capacity_portfolio_share: null,
    capacity_dependants: 0,
    capacity_income_stability: 'stable',
    capacity_obligations: '',
    risk_level_note:
      'I am 32, my income is stable, I have no dependants, and I have no material financial obligations beyond ordinary expenses. The portfolio is most of my liquid net worth at this stage, but my long horizon and ongoing contributions mean a serious drawdown does not threaten my financial position even if it is uncomfortable to live through.',

    // section 3.2 — Target volatility
    target_volatility: '10_15',
    target_volatility_note:
      'On EUR 45,000 this implies a normal correction in the region of EUR 9,000 to EUR 16,000, and a severe bear market in the region of EUR 16,000 to EUR 22,500. I have not lived through a major drawdown as an invested participant and acknowledge that my real tolerance may be lower than the figure I have stated. To revisit at the next annual review.',

    // section 3.3 — Abandonment threshold
    abandonment_amount: null,
    abandonment_pct: null,
    abandonment_note:
      'To be filled in at next review. The placeholder is a sustained loss of around two-thirds of portfolio value—well above my expected worst-case drawdown—but I want to sit with this question for longer before committing.',

    // section 4.1 — Eligible asset types
    asset_types: ['etfs'],
    asset_types_other: '',

    // section 4.2 — Eligible asset classes
    asset_classes: ['equities', 'fixed_income', 'commodities', 'cryptocurrencies', 'alternatives', 'cash'],
    asset_classes_note:
      'All major asset classes are in scope. The strategy decides which receive weight in any given period; I do not exclude any class.',

    // section 4.3 — Geography
    geography: 'global',
    geography_regions_in: '',
    geography_regions_out: '',
    geography_dev_em_mix: '',

    // section 4.4 — Filters and exclusions
    esg_screening: { enabled: true, screen: 'Yes, broad. Exclude tobacco, controversial weapons, and thermal coal.' },
    excluded_sectors: '',
    excluded_instruments: '',
    currency_hedging: 'To be set at first annual review.',

    // section 4.5 — Concentration limits
    max_single_position: null,
    max_asset_class: null,
    max_sector: null,

    // section 5.1 — Management style
    management_style: 'systematic',
    management_style_note:
      'I am interested in markets but I do not want to spend more than two hours per month managing this, and I would rather follow rules than make judgement calls in real time.',
    style_helper_hours: null,
    style_helper_research: null,
    style_helper_realtime: null,

    // section 5.2 — Cadence
    cadence: 'monthly',
    drift_threshold: '',

    // section 5.3 — Tactical overrides
    tactical_overrides:
      'Never. If I find myself wanting to override the rules during a drawdown, the protocol in section 7.4 applies.',

    // section 6.1 — Liquidity reserve
    liquidity_reserve:
      'Approximately EUR 18,000, equivalent to six months of living expenses, held in a separate savings account outside this portfolio.',

    // section 6.2 — Jurisdictional and tax notes
    tax_residence: 'Germany',
    account_types: 'Standard taxable brokerage account',
    tax_considerations:
      'Capital gains are taxed locally and monthly rebalancing will generate taxable events. To consult a tax adviser before the first annual review.',

    // section 7.1 — Review schedule
    annual_review_date: '12 March',

    // section 7.2 — Personal benchmark
    personal_benchmark:
      'To be defined at first annual review. Initial thinking: a global equity index for total return comparison.',

    // section 7.3 — Triggering life events
    life_events: [
      'Marriage or change in household composition',
      'Birth of a child',
      'Significant change in income or employment',
      'Inheritance or other material change in net worth',
      'Change in country of residence'
    ],

    // signature
    signature: 'Anna Bauer',
    signature_date: '2026-03-12'
  });
})();

/**
 * Word IPS generator — generateFullIPSWord(data).
 *
 * Mirrors ips-template-blank.md, populated from `data` and following
 * the empty-fields rules: omit sections with no filled fields, except
 * section 7.4 boilerplate which is always included. Guidance text is
 * dropped; the user's commitments are what render.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  async function generateFullIPSWord(data) {
    const u = ns.utils;
    const docx = await u.ensureDocx();
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

    const HEADING_FONT = 'Cambria';
    const BODY_FONT = 'Calibri';

    // ---------- Helpers ----------

    function p(text, opts = {}) {
      const runs = Array.isArray(text)
        ? text.map((t) => (typeof t === 'string' ? new TextRun({ text: t, font: BODY_FONT, size: opts.size || 22 }) : t))
        : [new TextRun({ text: text || '', font: BODY_FONT, size: opts.size || 22, italics: !!opts.italics, bold: !!opts.bold })];
      return new Paragraph({
        children: runs,
        spacing: { after: opts.after ?? 160, before: opts.before ?? 0 },
        alignment: opts.alignment
      });
    }

    function h(level, text, opts = {}) {
      const sizeMap = { 1: 40, 2: 30, 3: 24, 4: 22 };
      return new Paragraph({
        heading: HeadingLevel[`HEADING_${level}`],
        children: [
          new TextRun({
            text,
            font: HEADING_FONT,
            size: sizeMap[level] || 22,
            bold: true
          })
        ],
        spacing: {
          before: opts.before ?? (level === 1 ? 360 : level === 2 ? 280 : 200),
          after: opts.after ?? 120
        }
      });
    }

    function spacer(after = 200) {
      return new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after } });
    }

    function fieldLine(label, value) {
      // "Label: value" — bold label, regular value.
      return new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, font: BODY_FONT, size: 22, bold: true }),
          new TextRun({ text: value, font: BODY_FONT, size: 22 })
        ],
        spacing: { after: 120 }
      });
    }

    function bulletLine(text) {
      return new Paragraph({
        children: [new TextRun({ text, font: BODY_FONT, size: 22 })],
        bullet: { level: 0 },
        spacing: { after: 80 }
      });
    }

    // ---------- Data shorthand ----------

    const currency = data.base_currency || 'USD';

    function val(v) { return u.isEmpty(v) ? null : v; }
    function moneyOrNull(v) { return u.isEmpty(v) ? null : u.formatMoney(v, currency); }

    const horizon = u.labelFor(u.HORIZON_LABELS, data.horizon);
    const objective = u.labelFor(u.OBJECTIVE_LABELS, data.objective);
    const riskLevel = u.labelFor(u.RISK_LEVEL_LABELS, data.risk_level);
    const targetVol = u.labelFor(u.VOLATILITY_LABELS, data.target_volatility);
    const onboarding = u.labelFor(u.ONBOARDING_LABELS, data.onboarding_approach);
    const assetTypes = u.labelList(u.ASSET_TYPE_LABELS, data.asset_types);
    const assetClasses = u.labelList(u.ASSET_CLASS_LABELS, data.asset_classes);
    const geography = u.labelFor(u.GEOGRAPHY_LABELS, data.geography);
    const style = u.labelFor(u.STYLE_LABELS, data.management_style);
    const cadence = u.labelFor(u.CADENCE_LABELS, data.cadence);

    // ---------- Document body ----------

    const children = [];

    // Title
    children.push(h(1, 'Investment policy statement', { before: 0 }));
    children.push(p('A personal contract with your future self.', { italics: true, after: 280 }));

    // Preamble (verbatim, always rendered)
    children.push(p('This document sets out how you intend to invest, why, and under what rules. It exists for one reason: so that the version of you reading it during a market crash defers to the version of you who wrote it. Markets will give you reasons to deviate. This document is what you check before you do.'));
    children.push(p('It is a framework, not a portfolio. The policies you commit to here define the boundaries within which any portfolio you hold should operate. Different portfolios can satisfy the same framework; the framework outlives any particular one.'));
    children.push(spacer(320));

    // ---------- Section 1 — Cover and metadata ----------
    {
      const block = [];
      if (val(data.drafted_by)) block.push(fieldLine('Drafted by', data.drafted_by));
      if (val(data.date_drafted)) block.push(fieldLine('Date drafted', u.formatDate(data.date_drafted)));
      if (val(data.base_currency)) block.push(fieldLine('Base currency', data.base_currency));
      if (val(data.co_investor)) block.push(fieldLine('Co-investor or household member', data.co_investor));
      if (block.length) {
        children.push(h(2, '1. Cover and metadata'));
        children.push(...block);
      }
    }

    // ---------- Section 2 — Investment objectives ----------
    {
      const sub21 = [];
      if (horizon) sub21.push(p(horizon));
      if (val(data.intended_use)) {} // handled in 2.3

      const sub22Block = [];
      if (objective) sub22Block.push(p(objective));
      if (moneyOrNull(data.target_value)) sub22Block.push(fieldLine('Target portfolio value at horizon', u.formatMoney(data.target_value, currency)));
      if (val(data.secondary_objectives)) sub22Block.push(fieldLine('Secondary objectives', data.secondary_objectives));

      const sub23Block = [];
      if (val(data.intended_use)) sub23Block.push(p(data.intended_use));

      const sub24Block = [];
      if (moneyOrNull(data.starting_capital)) sub24Block.push(fieldLine('Starting capital', u.formatMoney(data.starting_capital, currency)));
      if (data.ongoing_contributions && (data.ongoing_contributions.amount || data.ongoing_contributions.period)) {
        const oc = data.ongoing_contributions;
        if (oc.period === 'none' || (!oc.amount && !oc.period)) {
          sub24Block.push(fieldLine('Planned ongoing contributions', 'None'));
        } else if (oc.amount) {
          const periodLabel = u.PERIOD_LABELS[oc.period] || '';
          sub24Block.push(fieldLine('Planned ongoing contributions', `${u.formatMoney(oc.amount, currency)}${periodLabel ? ' ' + periodLabel : ''}`));
        }
      }
      if (onboarding) sub24Block.push(fieldLine('Onboarding approach', onboarding));
      if (val(data.onboarding_specify)) sub24Block.push(p(data.onboarding_specify));
      if (val(data.withdrawal_approach)) sub24Block.push(fieldLine('Withdrawal approach', data.withdrawal_approach));

      if (sub21.length || sub22Block.length || sub23Block.length || sub24Block.length) {
        children.push(h(2, '2. Investment objectives'));

        if (sub21.length) {
          children.push(h(3, '2.1 Investment horizon'));
          children.push(...sub21);
        }
        if (sub22Block.length) {
          children.push(h(3, '2.2 Investment objective'));
          children.push(...sub22Block);
        }
        if (sub23Block.length) {
          children.push(h(3, '2.3 Intended use'));
          children.push(...sub23Block);
        }
        if (sub24Block.length) {
          children.push(h(3, '2.4 Funding the portfolio'));
          children.push(...sub24Block);
        }
      }
    }

    // ---------- Section 3 — Risk profile ----------
    {
      const sub31 = [];
      if (riskLevel) sub31.push(p(riskLevel));
      if (val(data.risk_level_note)) sub31.push(p(data.risk_level_note));

      const sub32 = [];
      if (targetVol) sub32.push(p(targetVol));
      if (val(data.target_volatility_note)) sub32.push(p(data.target_volatility_note));

      const sub33 = [];
      if (val(data.abandonment_amount)) sub33.push(fieldLine('Loss in money', u.formatMoney(data.abandonment_amount, currency)));
      if (val(data.abandonment_pct)) sub33.push(fieldLine('As a percentage of portfolio value', `${data.abandonment_pct}%`));
      if (val(data.abandonment_note)) sub33.push(p(data.abandonment_note));

      if (sub31.length || sub32.length || sub33.length) {
        children.push(h(2, '3. Risk profile'));
        if (sub31.length) {
          children.push(h(3, '3.1 Risk level'));
          children.push(...sub31);
        }
        if (sub32.length) {
          children.push(h(3, '3.2 Target volatility'));
          children.push(...sub32);
        }
        if (sub33.length) {
          children.push(h(3, '3.3 Abandonment threshold'));
          children.push(...sub33);
        }
      }
    }

    // ---------- Section 4 — Asset universe ----------
    {
      const sub41 = [];
      if (assetTypes) sub41.push(p(assetTypes));
      if (val(data.asset_types_other)) sub41.push(p(data.asset_types_other));

      const sub42 = [];
      if (assetClasses) sub42.push(p(assetClasses));
      if (val(data.asset_classes_note)) sub42.push(p(data.asset_classes_note));

      const sub43 = [];
      if (geography) sub43.push(p(geography));
      if (val(data.geography_regions_in)) sub43.push(fieldLine('Regions in scope', data.geography_regions_in));
      if (val(data.geography_regions_out)) sub43.push(fieldLine('Regions or countries excluded', data.geography_regions_out));
      if (val(data.geography_dev_em_mix)) sub43.push(fieldLine('Developed / emerging mix', data.geography_dev_em_mix));

      const sub44 = [];
      const esg = data.esg_screening || {};
      if (esg.enabled || val(esg.screen)) {
        sub44.push(fieldLine('ESG screening', esg.screen || (esg.enabled ? 'Yes' : 'No')));
      }
      if (val(data.excluded_sectors)) sub44.push(fieldLine('Excluded sectors', data.excluded_sectors));
      if (val(data.excluded_instruments)) sub44.push(fieldLine('Excluded instruments', data.excluded_instruments));
      if (val(data.currency_hedging)) sub44.push(fieldLine('Currency hedging policy', data.currency_hedging));

      const sub45 = [];
      if (val(data.max_single_position)) sub45.push(fieldLine('Maximum single position weight', `${data.max_single_position}%`));
      if (val(data.max_asset_class)) sub45.push(fieldLine('Maximum exposure to any single asset class', `${data.max_asset_class}%`));
      if (val(data.max_sector)) sub45.push(fieldLine('Maximum exposure to any single sector', `${data.max_sector}%`));

      if (sub41.length || sub42.length || sub43.length || sub44.length || sub45.length) {
        children.push(h(2, '4. Asset universe'));
        if (sub41.length) {
          children.push(h(3, '4.1 Eligible asset types'));
          children.push(...sub41);
        }
        if (sub42.length) {
          children.push(h(3, '4.2 Eligible asset classes'));
          children.push(...sub42);
        }
        if (sub43.length) {
          children.push(h(3, '4.3 Geography'));
          children.push(...sub43);
        }
        if (sub44.length) {
          children.push(h(3, '4.4 Filters and exclusions'));
          children.push(...sub44);
        }
        if (sub45.length) {
          children.push(h(3, '4.5 Concentration limits'));
          children.push(...sub45);
        }
      }
    }

    // ---------- Section 5 — Portfolio management ----------
    {
      const sub51 = [];
      if (style) sub51.push(p(style));
      if (val(data.management_style_note)) sub51.push(p(data.management_style_note));

      const sub52 = [];
      if (cadence) sub52.push(p(cadence));
      if (val(data.drift_threshold)) sub52.push(fieldLine('Drift threshold', data.drift_threshold));

      const sub53 = [];
      if (val(data.tactical_overrides)) sub53.push(p(data.tactical_overrides));

      if (sub51.length || sub52.length || sub53.length) {
        children.push(h(2, '5. Portfolio management'));
        if (sub51.length) {
          children.push(h(3, '5.1 Management style'));
          children.push(...sub51);
        }
        if (sub52.length) {
          children.push(h(3, '5.2 Cadence'));
          children.push(...sub52);
        }
        if (sub53.length) {
          children.push(h(3, '5.3 Tactical overrides'));
          children.push(...sub53);
        }
      }
    }

    // ---------- Section 6 — Constraints ----------
    {
      const sub61 = [];
      if (val(data.liquidity_reserve)) sub61.push(p(data.liquidity_reserve));

      const sub62 = [];
      if (val(data.tax_residence)) sub62.push(fieldLine('Country of tax residence', data.tax_residence));
      if (val(data.account_types)) sub62.push(fieldLine('Account types in use', data.account_types));
      if (val(data.tax_considerations)) sub62.push(fieldLine('Tax considerations', data.tax_considerations));

      if (sub61.length || sub62.length) {
        children.push(h(2, '6. Constraints'));
        if (sub61.length) {
          children.push(h(3, '6.1 Liquidity reserve'));
          children.push(...sub61);
        }
        if (sub62.length) {
          children.push(h(3, '6.2 Jurisdictional and tax notes'));
          children.push(...sub62);
        }
      }
    }

    // ---------- Section 7 — Review and revision ----------
    {
      const sub71 = [];
      if (val(data.annual_review_date)) sub71.push(fieldLine('Annual review date', data.annual_review_date));

      const sub72 = [];
      if (val(data.personal_benchmark)) sub72.push(p(data.personal_benchmark));

      const sub73 = [];
      if (Array.isArray(data.life_events) && data.life_events.length) {
        sub73.push(p('The following life events trigger an off-cycle review:'));
        for (const e of data.life_events) sub73.push(bulletLine(e));
      }

      // Section 7 always renders because 7.4 boilerplate is mandatory.
      children.push(h(2, '7. Review and revision'));
      if (sub71.length) {
        children.push(h(3, '7.1 Review schedule'));
        children.push(...sub71);
      }
      if (sub72.length) {
        children.push(h(3, '7.2 Personal benchmark'));
        children.push(...sub72);
      }
      if (sub73.length) {
        children.push(h(3, '7.3 Triggering life events'));
        children.push(...sub73);
      }

      // 7.4 — always rendered (boilerplate)
      children.push(h(3, '7.4 Revision vs deviation'));
      for (const para of u.SECTION_7_4_BOILERPLATE) {
        children.push(p(para));
      }
    }

    // ---------- Signature ----------
    {
      children.push(spacer(280));
      children.push(p('By signing below, I commit to following this document until I revise it under the rules set out in section 7.'));
      if (val(data.signature)) children.push(fieldLine('Signature', data.signature));
      if (val(data.signature_date)) children.push(fieldLine('Date', u.formatDate(data.signature_date)));
    }

    // ---------- Footer disclaimer ----------
    children.push(spacer(280));
    children.push(p(u.FOOTER_DISCLAIMER, { italics: true, size: 18 }));

    // ---------- Build document ----------

    const doc = new Document({
      creator: 'pfolio',
      title: 'Investment policy statement',
      description: 'Personal investment policy statement generated by pfolio.io',
      styles: {
        default: {
          document: { run: { font: BODY_FONT, size: 22 } }
        }
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 25mm-ish in twips (1440 twips = 1 inch ≈ 25.4mm)
                bottom: 1440,
                left: 1440,
                right: 1440
              }
            }
          },
          children
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const filename = u.buildFilename(data.drafted_by, 'ips', 'docx');
    u.triggerDownload(blob, filename);
    u.fireDownloadComplete('word');
  }

  ns.generateFullIPSWord = generateFullIPSWord;
})();

/**
 * PDF IPS generator — generateFullIPSPDF(data).
 *
 * Builds the same content tree as the Word generator, expressed as HTML,
 * then renders to PDF via html2pdf.js (jsPDF + html2canvas under the hood).
 * A4, 25mm margins.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  // Escape user-supplied strings so we never inject markup.
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function field(label, value) {
    if (value === '' || value === null || value === undefined) return '';
    return `<p class="field"><strong>${esc(label)}:</strong> ${esc(value)}</p>`;
  }

  function para(text) {
    if (!text) return '';
    return `<p>${esc(text)}</p>`;
  }

  function buildIPSHTML(data) {
    const u = ns.utils;
    const currency = data.base_currency || 'USD';

    function val(v) { return u.isEmpty(v) ? null : v; }
    function moneyOrNull(v) { return u.isEmpty(v) ? null : u.formatMoney(v, currency); }

    const horizon = u.labelFor(u.HORIZON_LABELS, data.horizon);
    const objective = u.labelFor(u.OBJECTIVE_LABELS, data.objective);
    const riskLevel = u.labelFor(u.RISK_LEVEL_LABELS, data.risk_level);
    const targetVol = u.labelFor(u.VOLATILITY_LABELS, data.target_volatility);
    const onboarding = u.labelFor(u.ONBOARDING_LABELS, data.onboarding_approach);
    const assetTypes = u.labelList(u.ASSET_TYPE_LABELS, data.asset_types);
    const assetClasses = u.labelList(u.ASSET_CLASS_LABELS, data.asset_classes);
    const geography = u.labelFor(u.GEOGRAPHY_LABELS, data.geography);
    const style = u.labelFor(u.STYLE_LABELS, data.management_style);
    const cadence = u.labelFor(u.CADENCE_LABELS, data.cadence);

    const parts = [];

    // Title and preamble
    parts.push('<h1>Investment policy statement</h1>');
    parts.push('<p class="subtitle"><em>A personal contract with your future self.</em></p>');
    parts.push(para('This document sets out how you intend to invest, why, and under what rules. It exists for one reason: so that the version of you reading it during a market crash defers to the version of you who wrote it. Markets will give you reasons to deviate. This document is what you check before you do.'));
    parts.push(para('It is a framework, not a portfolio. The policies you commit to here define the boundaries within which any portfolio you hold should operate. Different portfolios can satisfy the same framework; the framework outlives any particular one.'));

    // Section 1
    {
      const block = [];
      if (val(data.drafted_by)) block.push(field('Drafted by', data.drafted_by));
      if (val(data.date_drafted)) block.push(field('Date drafted', u.formatDate(data.date_drafted)));
      if (val(data.base_currency)) block.push(field('Base currency', data.base_currency));
      if (val(data.co_investor)) block.push(field('Co-investor or household member', data.co_investor));
      if (block.length) {
        parts.push('<h2>1. Cover and metadata</h2>');
        parts.push(...block);
      }
    }

    // Section 2
    {
      const sub21 = horizon ? [para(horizon)] : [];
      const sub22 = [];
      if (objective) sub22.push(para(objective));
      if (moneyOrNull(data.target_value)) sub22.push(field('Target portfolio value at horizon', u.formatMoney(data.target_value, currency)));
      if (val(data.secondary_objectives)) sub22.push(field('Secondary objectives', data.secondary_objectives));

      const sub23 = val(data.intended_use) ? [para(data.intended_use)] : [];

      const sub24 = [];
      if (moneyOrNull(data.starting_capital)) sub24.push(field('Starting capital', u.formatMoney(data.starting_capital, currency)));
      if (data.ongoing_contributions) {
        const oc = data.ongoing_contributions;
        if (oc.period === 'none') {
          sub24.push(field('Planned ongoing contributions', 'None'));
        } else if (oc.amount) {
          const periodLabel = u.PERIOD_LABELS[oc.period] || '';
          sub24.push(field('Planned ongoing contributions', `${u.formatMoney(oc.amount, currency)}${periodLabel ? ' ' + periodLabel : ''}`));
        }
      }
      if (onboarding) sub24.push(field('Onboarding approach', onboarding));
      if (val(data.onboarding_specify)) sub24.push(para(data.onboarding_specify));
      if (val(data.withdrawal_approach)) sub24.push(field('Withdrawal approach', data.withdrawal_approach));

      if (sub21.length || sub22.length || sub23.length || sub24.length) {
        parts.push('<h2>2. Investment objectives</h2>');
        if (sub21.length) { parts.push('<h3>2.1 Investment horizon</h3>'); parts.push(...sub21); }
        if (sub22.length) { parts.push('<h3>2.2 Investment objective</h3>'); parts.push(...sub22); }
        if (sub23.length) { parts.push('<h3>2.3 Intended use</h3>'); parts.push(...sub23); }
        if (sub24.length) { parts.push('<h3>2.4 Funding the portfolio</h3>'); parts.push(...sub24); }
      }
    }

    // Section 3
    {
      const sub31 = [];
      if (riskLevel) sub31.push(para(riskLevel));
      if (val(data.risk_level_note)) sub31.push(para(data.risk_level_note));

      const sub32 = [];
      if (targetVol) sub32.push(para(targetVol));
      if (val(data.target_volatility_note)) sub32.push(para(data.target_volatility_note));

      const sub33 = [];
      if (val(data.abandonment_amount)) sub33.push(field('Loss in money', u.formatMoney(data.abandonment_amount, currency)));
      if (val(data.abandonment_pct)) sub33.push(field('As a percentage of portfolio value', `${data.abandonment_pct}%`));
      if (val(data.abandonment_note)) sub33.push(para(data.abandonment_note));

      if (sub31.length || sub32.length || sub33.length) {
        parts.push('<h2>3. Risk profile</h2>');
        if (sub31.length) { parts.push('<h3>3.1 Risk level</h3>'); parts.push(...sub31); }
        if (sub32.length) { parts.push('<h3>3.2 Target volatility</h3>'); parts.push(...sub32); }
        if (sub33.length) { parts.push('<h3>3.3 Abandonment threshold</h3>'); parts.push(...sub33); }
      }
    }

    // Section 4
    {
      const sub41 = [];
      if (assetTypes) sub41.push(para(assetTypes));
      if (val(data.asset_types_other)) sub41.push(para(data.asset_types_other));

      const sub42 = [];
      if (assetClasses) sub42.push(para(assetClasses));
      if (val(data.asset_classes_note)) sub42.push(para(data.asset_classes_note));

      const sub43 = [];
      if (geography) sub43.push(para(geography));
      if (val(data.geography_regions_in)) sub43.push(field('Regions in scope', data.geography_regions_in));
      if (val(data.geography_regions_out)) sub43.push(field('Regions or countries excluded', data.geography_regions_out));
      if (val(data.geography_dev_em_mix)) sub43.push(field('Developed / emerging mix', data.geography_dev_em_mix));

      const sub44 = [];
      const esg = data.esg_screening || {};
      if (esg.enabled || val(esg.screen)) {
        sub44.push(field('ESG screening', esg.screen || (esg.enabled ? 'Yes' : 'No')));
      }
      if (val(data.excluded_sectors)) sub44.push(field('Excluded sectors', data.excluded_sectors));
      if (val(data.excluded_instruments)) sub44.push(field('Excluded instruments', data.excluded_instruments));
      if (val(data.currency_hedging)) sub44.push(field('Currency hedging policy', data.currency_hedging));

      const sub45 = [];
      if (val(data.max_single_position)) sub45.push(field('Maximum single position weight', `${data.max_single_position}%`));
      if (val(data.max_asset_class)) sub45.push(field('Maximum exposure to any single asset class', `${data.max_asset_class}%`));
      if (val(data.max_sector)) sub45.push(field('Maximum exposure to any single sector', `${data.max_sector}%`));

      if (sub41.length || sub42.length || sub43.length || sub44.length || sub45.length) {
        parts.push('<h2>4. Asset universe</h2>');
        if (sub41.length) { parts.push('<h3>4.1 Eligible asset types</h3>'); parts.push(...sub41); }
        if (sub42.length) { parts.push('<h3>4.2 Eligible asset classes</h3>'); parts.push(...sub42); }
        if (sub43.length) { parts.push('<h3>4.3 Geography</h3>'); parts.push(...sub43); }
        if (sub44.length) { parts.push('<h3>4.4 Filters and exclusions</h3>'); parts.push(...sub44); }
        if (sub45.length) { parts.push('<h3>4.5 Concentration limits</h3>'); parts.push(...sub45); }
      }
    }

    // Section 5
    {
      const sub51 = [];
      if (style) sub51.push(para(style));
      if (val(data.management_style_note)) sub51.push(para(data.management_style_note));

      const sub52 = [];
      if (cadence) sub52.push(para(cadence));
      if (val(data.drift_threshold)) sub52.push(field('Drift threshold', data.drift_threshold));

      const sub53 = val(data.tactical_overrides) ? [para(data.tactical_overrides)] : [];

      if (sub51.length || sub52.length || sub53.length) {
        parts.push('<h2>5. Portfolio management</h2>');
        if (sub51.length) { parts.push('<h3>5.1 Management style</h3>'); parts.push(...sub51); }
        if (sub52.length) { parts.push('<h3>5.2 Cadence</h3>'); parts.push(...sub52); }
        if (sub53.length) { parts.push('<h3>5.3 Tactical overrides</h3>'); parts.push(...sub53); }
      }
    }

    // Section 6
    {
      const sub61 = val(data.liquidity_reserve) ? [para(data.liquidity_reserve)] : [];
      const sub62 = [];
      if (val(data.tax_residence)) sub62.push(field('Country of tax residence', data.tax_residence));
      if (val(data.account_types)) sub62.push(field('Account types in use', data.account_types));
      if (val(data.tax_considerations)) sub62.push(field('Tax considerations', data.tax_considerations));

      if (sub61.length || sub62.length) {
        parts.push('<h2>6. Constraints</h2>');
        if (sub61.length) { parts.push('<h3>6.1 Liquidity reserve</h3>'); parts.push(...sub61); }
        if (sub62.length) { parts.push('<h3>6.2 Jurisdictional and tax notes</h3>'); parts.push(...sub62); }
      }
    }

    // Section 7 — always renders because 7.4 boilerplate is mandatory
    {
      parts.push('<h2>7. Review and revision</h2>');

      if (val(data.annual_review_date)) {
        parts.push('<h3>7.1 Review schedule</h3>');
        parts.push(field('Annual review date', data.annual_review_date));
      }
      if (val(data.personal_benchmark)) {
        parts.push('<h3>7.2 Personal benchmark</h3>');
        parts.push(para(data.personal_benchmark));
      }
      if (Array.isArray(data.life_events) && data.life_events.length) {
        parts.push('<h3>7.3 Triggering life events</h3>');
        parts.push('<p>The following life events trigger an off-cycle review:</p>');
        parts.push('<ul>');
        for (const e of data.life_events) parts.push(`<li>${esc(e)}</li>`);
        parts.push('</ul>');
      }

      // 7.4 — always rendered
      parts.push('<h3>7.4 Revision vs deviation</h3>');
      for (const p of u.SECTION_7_4_BOILERPLATE) parts.push(para(p));
    }

    // Signature
    parts.push('<div class="signature">');
    parts.push(para('By signing below, I commit to following this document until I revise it under the rules set out in section 7.'));
    if (val(data.signature)) parts.push(field('Signature', data.signature));
    if (val(data.signature_date)) parts.push(field('Date', u.formatDate(data.signature_date)));
    parts.push('</div>');

    // Footer disclaimer
    parts.push(`<p class="footer-disclaimer"><em>${esc(u.FOOTER_DISCLAIMER)}</em></p>`);

    return parts.join('\n');
  }

  function buildPDFContainer(innerHTML) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-10000px';
    wrapper.style.top = '0';
    wrapper.style.width = '170mm'; // A4 width minus margins
    wrapper.innerHTML = `
      <style>
        .ips-pdf-doc { font-family: Poppins, Calibri, Arial, sans-serif; color: #1F2F36; line-height: 1.6; font-size: 11pt; }
        .ips-pdf-doc h1 { font-family: 'Source Serif Pro', Cambria, Georgia, serif; font-size: 22pt; font-weight: 700; margin: 0 0 6pt; line-height: 1.2; }
        .ips-pdf-doc .subtitle { font-size: 13pt; color: #3A4255; margin: 0 0 18pt; }
        .ips-pdf-doc h2 { font-family: 'Source Serif Pro', Cambria, Georgia, serif; font-size: 15pt; font-weight: 700; margin: 18pt 0 8pt; padding-top: 8pt; border-top: 1px solid #DEE2E6; line-height: 1.25; }
        .ips-pdf-doc h3 { font-family: 'Source Serif Pro', Cambria, Georgia, serif; font-size: 12pt; font-weight: 700; margin: 12pt 0 6pt; }
        .ips-pdf-doc p { margin: 0 0 8pt; }
        .ips-pdf-doc .field { margin: 0 0 4pt; }
        .ips-pdf-doc ul { margin: 0 0 8pt 16pt; padding: 0; }
        .ips-pdf-doc li { margin: 0 0 4pt; }
        .ips-pdf-doc .signature { margin-top: 24pt; padding-top: 12pt; border-top: 1px solid #DEE2E6; }
        .ips-pdf-doc .footer-disclaimer { margin-top: 24pt; font-size: 9pt; color: #6B7280; line-height: 1.5; }
      </style>
      <div class="ips-pdf-doc">${innerHTML}</div>
    `;
    return wrapper;
  }

  async function generateFullIPSPDF(data) {
    const u = ns.utils;
    const html2pdf = await u.ensureHtml2Pdf();

    const html = buildIPSHTML(data);
    const container = buildPDFContainer(html);
    document.body.appendChild(container);

    const filename = u.buildFilename(data.drafted_by, 'ips', 'pdf');

    try {
      await html2pdf()
        .set({
          margin: [25, 25, 25, 25],
          filename,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] }
        })
        .from(container.querySelector('.ips-pdf-doc'))
        .save();
      u.fireDownloadComplete('pdf');
    } finally {
      document.body.removeChild(container);
    }
  }

  ns.generateFullIPSPDF = generateFullIPSPDF;
  ns._buildIPSHTML = buildIPSHTML; // exposed for testing
})();

/**
 * Policy card PDF generator — generatePolicyCardPDF(data).
 *
 * Single A4 page, 18mm top/bottom, 20mm left/right margins.
 * Six commitment blocks plus the rule plus footer.
 * Empty-field rules:
 *   abandonment_threshold blank → "To be set at next review"
 *   tactical_overrides blank   → "Never (default)"
 *   any other commitment blank → "(not specified)"
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function or(value, fallback) {
    return ns.utils.isEmpty(value) ? fallback : value;
  }

  // Take the first sentence — for fields whose IPS form is verbose but whose card needs a punchy commitment.
  // Trailing terminal punctuation is dropped to match the label-style convention on the rest of the card.
  function firstSentence(text) {
    if (!text) return text;
    const m = String(text).match(/^([^.!?]*[.!?])/);
    const head = m ? m[1] : String(text);
    return head.trim().replace(/[.!?]+$/, '');
  }

  function buildPolicyCardHTML(data) {
    const u = ns.utils;
    const currency = data.base_currency || 'USD';

    const name = data.drafted_by || '';
    const draftedDate = u.formatDate(data.date_drafted);
    const reviewDate = data.annual_review_date || '';

    // Purpose
    const purpose = or(data.intended_use, '(not specified)');

    // Horizon and capital
    const horizonLabel = u.labelFor(u.HORIZON_LABELS, data.horizon) || '(not specified)';
    const startingCapital = u.isEmpty(data.starting_capital)
      ? '(not specified)'
      : u.formatMoney(data.starting_capital, currency);
    let contributingLine = '(not specified)';
    if (data.ongoing_contributions) {
      const oc = data.ongoing_contributions;
      if (oc.period === 'none') {
        contributingLine = 'No ongoing contributions';
      } else if (oc.amount) {
        const periodLabel = u.PERIOD_LABELS[oc.period] || '';
        contributingLine = `${u.formatMoney(oc.amount, currency)}${periodLabel ? ' ' + periodLabel : ''}`;
      }
    }
    const onboardingLabel = u.labelFor(u.ONBOARDING_LABELS, data.onboarding_approach);
    const onboardingLine = onboardingLabel
      ? (data.onboarding_specify ? `${onboardingLabel} — ${data.onboarding_specify}` : onboardingLabel)
      : '(not specified)';

    // Risk
    const riskLevel = u.labelFor(u.RISK_LEVEL_LABELS, data.risk_level) || '(not specified)';
    const targetVol = u.labelFor(u.VOLATILITY_LABELS, data.target_volatility) || '(not specified)';
    let abandonment = 'To be set at next review';
    if (!u.isEmpty(data.abandonment_amount) || !u.isEmpty(data.abandonment_pct)) {
      const parts = [];
      if (!u.isEmpty(data.abandonment_amount)) parts.push(u.formatMoney(data.abandonment_amount, currency));
      if (!u.isEmpty(data.abandonment_pct)) parts.push(`${data.abandonment_pct}%`);
      abandonment = parts.join(' / ');
    }

    // Universe
    const assetTypes = u.labelList(u.ASSET_TYPE_LABELS, data.asset_types) || '(not specified)';
    const assetClasses = u.labelList(u.ASSET_CLASS_LABELS, data.asset_classes) || '(not specified)';
    const geographyLabel = u.labelFor(u.GEOGRAPHY_LABELS, data.geography) || '(not specified)';
    const exclusions = (() => {
      const bits = [];
      const esg = data.esg_screening || {};
      if (esg.enabled && esg.screen) bits.push(esg.screen);
      else if (esg.screen) bits.push(esg.screen);
      if (data.excluded_sectors) bits.push(data.excluded_sectors);
      if (data.excluded_instruments) bits.push(data.excluded_instruments);
      return bits.length ? bits.join('; ') : 'None';
    })();

    // Management
    const styleLabel = u.labelFor(u.STYLE_LABELS, data.management_style) || '(not specified)';
    const cadenceLabel = u.labelFor(u.CADENCE_LABELS, data.cadence) || '(not specified)';
    const tactical = u.isEmpty(data.tactical_overrides)
      ? 'Never (default)'
      : firstSentence(data.tactical_overrides);

    // Liquidity reserve
    const liquidity = or(data.liquidity_reserve, '(not specified)');

    // Footer
    const footerWithDate = u.POLICY_CARD_FOOTER.replace('[DATE]', draftedDate || '(date not specified)');

    return `
      <div class="card-doc">
        <header class="card-header">
          <h1 class="card-title">${esc(name || 'Investment policy summary')}${name ? ' — investment policy summary' : ''}</h1>
          <p class="card-meta"><em>Drafted ${esc(draftedDate || '(not specified)')} · Next review ${esc(reviewDate || '(not specified)')}</em></p>
        </header>

        <section class="card-block">
          <h2>Purpose</h2>
          <p>${esc(purpose)}</p>
        </section>

        <section class="card-block">
          <h2>Horizon and capital</h2>
          <p>${esc(horizonLabel)}</p>
          <p>Starting capital ${esc(startingCapital)} · Contributing ${esc(contributingLine)}</p>
          <p>Onboarding: ${esc(onboardingLine)}</p>
        </section>

        <section class="card-block">
          <h2>Risk</h2>
          <p>Risk level: ${esc(riskLevel)}</p>
          <p>Target volatility: ${esc(targetVol)}</p>
          <p>Abandonment threshold: ${esc(abandonment)}</p>
        </section>

        <section class="card-block">
          <h2>Universe</h2>
          <p>Asset types: ${esc(assetTypes)}</p>
          <p>Asset classes: ${esc(assetClasses)}</p>
          <p>Geography: ${esc(geographyLabel)}</p>
          <p>Exclusions: ${esc(exclusions)}</p>
        </section>

        <section class="card-block">
          <h2>Management</h2>
          <p>Style: ${esc(styleLabel)}</p>
          <p>Cadence: ${esc(cadenceLabel)}</p>
          <p>Tactical overrides: ${esc(tactical)}</p>
        </section>

        <section class="card-block">
          <h2>Liquidity reserve</h2>
          <p>${esc(liquidity)}</p>
        </section>

        <section class="card-rule">
          <h2>The rule, when markets move</h2>
          <p>${esc(u.POLICY_CARD_RULE)}</p>
        </section>

        <footer class="card-footer">
          <p><em>${esc(footerWithDate)}</em></p>
        </footer>
      </div>
    `;
  }

  function buildContainer(innerHTML) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-10000px';
    wrapper.style.top = '0';
    wrapper.style.width = '170mm';
    wrapper.innerHTML = `
      <style>
        .card-doc { font-family: Poppins, Calibri, Arial, sans-serif; color: #1F2F36; line-height: 1.45; font-size: 9.5pt; }
        .card-doc .card-header { margin-bottom: 14pt; }
        .card-doc .card-title { font-family: 'Source Serif Pro', Cambria, Georgia, serif; font-size: 16pt; font-weight: 700; margin: 0 0 4pt; line-height: 1.2; }
        .card-doc .card-meta { font-size: 9pt; color: #3A4255; margin: 0; }
        .card-doc .card-block { margin: 0 0 9pt; }
        .card-doc .card-block h2 { font-family: 'Source Serif Pro', Cambria, Georgia, serif; font-size: 10.5pt; font-weight: 700; margin: 0 0 3pt; color: #1F2F36; }
        .card-doc .card-block p { margin: 0 0 2pt; }
        .card-doc .card-rule { margin: 16pt 0 10pt; }
        .card-doc .card-rule h2 { font-family: 'Source Serif Pro', Cambria, Georgia, serif; font-size: 11.5pt; font-weight: 700; margin: 0 0 4pt; }
        .card-doc .card-rule p { margin: 0; line-height: 1.5; }
        .card-doc .card-footer { margin-top: 14pt; font-size: 8pt; color: #6B7280; line-height: 1.4; }
        .card-doc .card-footer p { margin: 0; }
      </style>
      ${innerHTML}
    `;
    return wrapper;
  }

  async function generatePolicyCardPDF(data) {
    const u = ns.utils;
    const html2pdf = await u.ensureHtml2Pdf();

    const html = buildPolicyCardHTML(data);
    const container = buildContainer(html);
    document.body.appendChild(container);

    const filename = u.buildFilename(data.drafted_by, 'policy-card', 'pdf');

    try {
      await html2pdf()
        .set({
          margin: [18, 20, 18, 20],
          filename,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all'] }
        })
        .from(container.querySelector('.card-doc'))
        .save();
      u.fireDownloadComplete('policy-card');
    } finally {
      document.body.removeChild(container);
    }
  }

  ns.generatePolicyCardPDF = generatePolicyCardPDF;
  ns._buildPolicyCardHTML = buildPolicyCardHTML;
})();

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

/**
 * Field-type renderers.
 *
 * Each renderer takes (def, value, store, ctx) and returns a DOM node.
 * `def` is the spec definition; `value` is the current state value;
 * `store` is the form state container; `ctx` carries cross-field info
 * (e.g. base_currency for money fields).
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  // ---------- DOM helpers ----------

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'checked' || k === 'disabled' || k === 'selected') {
          if (v) node.setAttribute(k, '');
        } else {
          node.setAttribute(k, v);
        }
      }
    }
    if (children) {
      const arr = Array.isArray(children) ? children : [children];
      for (const c of arr) {
        if (c === null || c === undefined || c === false) continue;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  function fieldWrapper(def, inputNode, opts = {}) {
    return el('div', { class: 'ips-field', 'data-field': def.id }, [
      def.label ? el('label', { class: 'ips-field__label', for: 'f_' + def.id }, def.label) : null,
      inputNode,
      def.guidance && opts.showGuidance ? el('p', { class: 'ips-field__guidance' }, def.guidance) : null
    ]);
  }

  // ---------- Per-type renderers ----------

  function renderText(def, value, store) {
    const input = el('input', {
      type: 'text',
      id: 'f_' + def.id,
      class: 'ips-input',
      value: value || '',
      placeholder: def.placeholder || '',
      onInput: (e) => store.setQuiet(def.id, e.target.value),
      onChange: (e) => store.set(def.id, e.target.value)
    });
    return fieldWrapper(def, input);
  }

  function renderTextarea(def, value, store) {
    const input = el('textarea', {
      id: 'f_' + def.id,
      class: 'ips-textarea',
      rows: def.rows || 3,
      placeholder: def.placeholder || '',
      onInput: (e) => store.setQuiet(def.id, e.target.value),
      onChange: (e) => store.set(def.id, e.target.value)
    });
    input.value = value || '';
    return fieldWrapper(def, input);
  }

  function renderNumber(def, value, store) {
    const input = el('input', {
      type: 'number',
      id: 'f_' + def.id,
      class: 'ips-input ips-input--number',
      value: value === null || value === undefined ? '' : value,
      placeholder: def.placeholder || '',
      min: def.min,
      max: def.max,
      step: def.step || 'any',
      onInput: (e) => {
        const raw = e.target.value;
        store.setQuiet(def.id, raw === '' ? null : Number(raw));
      },
      onChange: (e) => {
        const raw = e.target.value;
        store.set(def.id, raw === '' ? null : Number(raw));
      }
    });
    return fieldWrapper(def, el('div', { class: 'ips-input-row' }, [
      input,
      def.unit ? el('span', { class: 'ips-input-suffix' }, def.unit) : null
    ]));
  }

  function renderPercentage(def, value, store) {
    const clamp = (raw) => {
      let v = raw === '' ? null : Number(raw);
      if (v !== null) v = Math.max(0, Math.min(100, v));
      return v;
    };
    const input = el('input', {
      type: 'number',
      id: 'f_' + def.id,
      class: 'ips-input ips-input--number',
      value: value === null || value === undefined ? '' : value,
      min: 0, max: 100, step: 'any',
      placeholder: def.placeholder || '',
      onInput: (e) => store.setQuiet(def.id, clamp(e.target.value)),
      onChange: (e) => store.set(def.id, clamp(e.target.value))
    });
    return fieldWrapper(def, el('div', { class: 'ips-input-row' }, [
      input,
      el('span', { class: 'ips-input-suffix' }, '%')
    ]));
  }

  function renderMoney(def, value, store, ctx) {
    const currency = (ctx && ctx.baseCurrency) || 'USD';
    const parse = (raw) => raw === '' ? null : Number(raw);
    const input = el('input', {
      type: 'number',
      id: 'f_' + def.id,
      class: 'ips-input ips-input--number',
      value: value === null || value === undefined ? '' : value,
      min: 0, step: 'any',
      placeholder: def.placeholder || '',
      onInput: (e) => store.setQuiet(def.id, parse(e.target.value)),
      onChange: (e) => store.set(def.id, parse(e.target.value))
    });
    return fieldWrapper(def, el('div', { class: 'ips-input-row' }, [
      el('span', { class: 'ips-input-prefix' }, currency),
      input
    ]));
  }

  function renderMoneyWithPeriod(def, value, store, ctx) {
    const v = value || { amount: null, period: null };
    const currency = (ctx && ctx.baseCurrency) || 'USD';
    const periods = def.periods || ['per_month', 'per_year', 'none'];

    const parse = (raw) => raw === '' ? null : Number(raw);
    const amountInput = el('input', {
      type: 'number',
      id: 'f_' + def.id + '_amount',
      class: 'ips-input ips-input--number',
      value: v.amount === null || v.amount === undefined ? '' : v.amount,
      min: 0, step: 'any',
      onInput: (e) => store.setNestedQuiet(def.id, 'amount', parse(e.target.value)),
      onChange: (e) => store.setNested(def.id, 'amount', parse(e.target.value))
    });

    const periodSelect = el('select', {
      class: 'ips-select',
      onChange: (e) => store.setNested(def.id, 'period', e.target.value || null)
    }, [
      el('option', { value: '' }, '—'),
      ...periods.map((p) => {
        const opt = el('option', { value: p }, ns.utils.PERIOD_LABELS[p] || p);
        if (v.period === p) opt.selected = true;
        return opt;
      })
    ]);

    return fieldWrapper(def, el('div', { class: 'ips-input-row' }, [
      el('span', { class: 'ips-input-prefix' }, currency),
      amountInput,
      periodSelect
    ]));
  }

  function renderDate(def, value, store) {
    const input = el('input', {
      type: 'date',
      id: 'f_' + def.id,
      class: 'ips-input',
      value: value || '',
      onInput: (e) => store.setQuiet(def.id, e.target.value),
      onChange: (e) => store.set(def.id, e.target.value)
    });
    return fieldWrapper(def, input);
  }

  function renderDatePartial(def, value, store) {
    // "DD month" — text input, free-form
    const input = el('input', {
      type: 'text',
      id: 'f_' + def.id,
      class: 'ips-input',
      value: value || '',
      placeholder: def.placeholder || 'e.g. 12 March',
      onInput: (e) => store.setQuiet(def.id, e.target.value),
      onChange: (e) => store.set(def.id, e.target.value)
    });
    return fieldWrapper(def, input);
  }

  function renderDropdown(def, value, store) {
    const select = el('select', {
      id: 'f_' + def.id,
      class: 'ips-select',
      onChange: (e) => store.set(def.id, e.target.value || null)
    }, [
      el('option', { value: '' }, '—'),
      ...def.options.map((o) => {
        const optVal = typeof o === 'string' ? o : o.value;
        const optLabel = typeof o === 'string' ? o : o.label;
        const opt = el('option', { value: optVal }, optLabel);
        if (value === optVal) opt.selected = true;
        return opt;
      })
    ]);
    return fieldWrapper(def, select);
  }

  function renderSingleSelect(def, value, store) {
    const name = 'f_' + def.id;
    return fieldWrapper(def, el('div', { class: 'ips-radios' }, def.options.map((o) => {
      const optVal = typeof o === 'string' ? o : o.value;
      const optLabel = typeof o === 'string' ? o : o.label;
      const id = `${name}_${optVal}`;
      return el('label', { class: 'ips-radio', for: id }, [
        el('input', {
          type: 'radio',
          name,
          id,
          value: optVal,
          checked: value === optVal ? 'checked' : false,
          onChange: () => store.set(def.id, optVal)
        }),
        el('span', { class: 'ips-radio__label' }, optLabel)
      ]);
    })));
  }

  function renderSingleSelectRich(def, value, store) {
    const name = 'f_' + def.id;
    return fieldWrapper(def, el('div', { class: 'ips-rich-radios' }, def.options.map((o) => {
      const id = `${name}_${o.value}`;
      const isChecked = value === o.value;
      return el('label', { class: 'ips-rich-radio' + (isChecked ? ' is-checked' : ''), for: id }, [
        el('input', {
          type: 'radio',
          name,
          id,
          value: o.value,
          checked: isChecked ? 'checked' : false,
          class: 'ips-rich-radio__input',
          onChange: () => store.set(def.id, o.value)
        }),
        el('div', { class: 'ips-rich-radio__body' }, [
          el('span', { class: 'ips-rich-radio__title' }, o.label),
          o.description ? el('span', { class: 'ips-rich-radio__desc' }, o.description) : null,
          o.example ? el('span', { class: 'ips-rich-radio__example' }, o.example) : null
        ])
      ]);
    })));
  }

  function renderMultiSelect(def, value, store) {
    const arr = Array.isArray(value) ? value : [];
    return fieldWrapper(def, el('div', { class: 'ips-checks' }, def.options.map((o) => {
      const optVal = typeof o === 'string' ? o : o.value;
      const optLabel = typeof o === 'string' ? o : o.label;
      const id = `f_${def.id}_${optVal}`;
      const checked = arr.includes(optVal);
      return el('label', { class: 'ips-check', for: id }, [
        el('input', {
          type: 'checkbox',
          id,
          value: optVal,
          checked: checked ? 'checked' : false,
          onChange: (e) => {
            const cur = Array.isArray(store.get()[def.id]) ? store.get()[def.id] : [];
            const next = e.target.checked ? [...cur, optVal] : cur.filter((v) => v !== optVal);
            store.set(def.id, next);
          }
        }),
        el('span', { class: 'ips-check__label' }, optLabel)
      ]);
    })));
  }

  function renderMultiSelectWithOther(def, value, store) {
    const arr = Array.isArray(value) ? value : [];
    const otherKey = def.id + '_other';
    const otherValue = store.get()[otherKey] || '';

    return fieldWrapper(def, el('div', { class: 'ips-checks' }, def.options.map((o) => {
      const id = `f_${def.id}_${o.value}`;
      const checked = arr.includes(o.value);
      const elements = [
        el('input', {
          type: 'checkbox',
          id,
          value: o.value,
          checked: checked ? 'checked' : false,
          onChange: (e) => {
            const cur = Array.isArray(store.get()[def.id]) ? store.get()[def.id] : [];
            const next = e.target.checked ? [...cur, o.value] : cur.filter((v) => v !== o.value);
            store.set(def.id, next);
          }
        }),
        el('span', { class: 'ips-check__label' }, o.label)
      ];
      const wrap = el('label', { class: 'ips-check', for: id }, elements);
      if (o.free_text && checked) {
        const otherInput = el('input', {
          type: 'text',
          class: 'ips-input ips-input--other',
          value: otherValue,
          placeholder: 'specify',
          onInput: (e) => store.setQuiet(otherKey, e.target.value),
          onChange: (e) => store.set(otherKey, e.target.value)
        });
        return el('div', { class: 'ips-check-with-other' }, [wrap, otherInput]);
      }
      return wrap;
    })));
  }

  function renderMultiSelectEditable(def, value, store) {
    const arr = Array.isArray(value) ? value : [];
    const root = el('div', { class: 'ips-editable-list' });

    arr.forEach((item, idx) => {
      const row = el('div', { class: 'ips-editable-row' }, [
        el('input', {
          type: 'text',
          class: 'ips-input',
          value: item,
          onInput: (e) => {
            const next = [...arr];
            next[idx] = e.target.value;
            store.setQuiet(def.id, next);
          },
          onChange: (e) => {
            const next = [...arr];
            next[idx] = e.target.value;
            store.set(def.id, next);
          }
        }),
        el('button', {
          type: 'button',
          class: 'ips-btn ips-btn--ghost',
          onClick: () => {
            const next = arr.filter((_, i) => i !== idx);
            store.set(def.id, next);
          }
        }, 'Remove')
      ]);
      root.appendChild(row);
    });

    root.appendChild(el('button', {
      type: 'button',
      class: 'ips-btn ips-btn--ghost ips-btn--add',
      onClick: () => store.set(def.id, [...arr, ''])
    }, '+ Add another item'));

    return fieldWrapper(def, root);
  }

  function renderYesNo(def, value, store) {
    const name = 'f_' + def.id;
    return fieldWrapper(def, el('div', { class: 'ips-radios ips-radios--inline' }, [
      ['yes', 'Yes'], ['no', 'No']
    ].map(([val, label]) => {
      const id = `${name}_${val}`;
      const checked = value === val;
      return el('label', { class: 'ips-radio', for: id }, [
        el('input', {
          type: 'radio',
          name,
          id,
          value: val,
          checked: checked ? 'checked' : false,
          onChange: () => store.set(def.id, val)
        }),
        el('span', { class: 'ips-radio__label' }, label)
      ]);
    })));
  }

  function renderYesNoWithText(def, value, store) {
    const v = value || { enabled: false, screen: '' };
    const name = 'f_' + def.id;

    const radios = el('div', { class: 'ips-radios ips-radios--inline' }, [
      ['yes', true, 'Yes'], ['no', false, 'No']
    ].map(([val, enabled, label]) => {
      const id = `${name}_${val}`;
      return el('label', { class: 'ips-radio', for: id }, [
        el('input', {
          type: 'radio',
          name,
          id,
          checked: v.enabled === enabled ? 'checked' : false,
          onChange: () => store.setNested(def.id, 'enabled', enabled)
        }),
        el('span', { class: 'ips-radio__label' }, label)
      ]);
    }));

    const children = [radios];
    if (v.enabled) {
      children.push(el('div', { class: 'ips-yes-text' }, [
        def.text_label_if_yes ? el('label', { class: 'ips-field__sublabel' }, def.text_label_if_yes) : null,
        el('textarea', {
          class: 'ips-textarea',
          rows: 2,
          placeholder: def.text_placeholder || '',
          onInput: (e) => store.setNestedQuiet(def.id, 'screen', e.target.value),
          onChange: (e) => store.setNested(def.id, 'screen', e.target.value)
        }, v.screen || '')
      ]));
      // Fix textarea value (innerHTML approach above doesn't work for textarea value)
      const ta = children[children.length - 1].querySelector('textarea');
      if (ta) ta.value = v.screen || '';
    }

    return fieldWrapper(def, el('div', null, children));
  }

  function renderTwoNumbers(def, value, store) {
    const v = value || {};
    const subFields = def.fields || [];
    const inputs = subFields.map((f) => {
      const subVal = v[f.id];
      const parse = (raw) => raw === '' ? null : Number(raw);
      return el('div', { class: 'ips-two-numbers__item' }, [
        f.label ? el('label', { class: 'ips-field__sublabel', for: 'f_' + def.id + '_' + f.id }, f.label) : null,
        el('input', {
          type: 'number',
          id: 'f_' + def.id + '_' + f.id,
          class: 'ips-input ips-input--number',
          value: subVal === null || subVal === undefined ? '' : subVal,
          min: f.min, max: f.max,
          onInput: (e) => store.setNestedQuiet(def.id, f.id, parse(e.target.value)),
          onChange: (e) => store.setNested(def.id, f.id, parse(e.target.value))
        })
      ]);
    });
    return fieldWrapper(def, el('div', { class: 'ips-two-numbers' }, inputs));
  }

  function renderNumberOrNone(def, value, store) {
    // Show a number input plus a "none" toggle. "None" stores the literal 0 —
    // zero dependants is a meaningful answer, distinct from "not yet answered".
    const v = value;
    const isNone = v === 0;
    const noneId = `f_${def.id}_none`;

    const numInput = el('input', {
      type: 'number',
      id: 'f_' + def.id,
      class: 'ips-input ips-input--number',
      value: v === null || v === undefined || v === 0 ? '' : v,
      min: 0,
      onInput: (e) => {
        const raw = e.target.value;
        store.setQuiet(def.id, raw === '' ? null : Number(raw));
      },
      onChange: (e) => {
        const raw = e.target.value;
        store.set(def.id, raw === '' ? null : Number(raw));
      }
    });

    return fieldWrapper(def, el('div', { class: 'ips-input-row' }, [
      numInput,
      el('label', { class: 'ips-toggle', for: noneId }, [
        el('input', {
          type: 'checkbox',
          id: noneId,
          checked: isNone ? 'checked' : false,
          onChange: (e) => store.set(def.id, e.target.checked ? 0 : null)
        }),
        el('span', { class: 'ips-toggle__label' }, 'none')
      ])
    ]));
  }

  // ---------- Dispatcher ----------

  function renderField(def, value, store, ctx) {
    switch (def.type) {
      case 'text': return renderText(def, value, store);
      case 'textarea': return renderTextarea(def, value, store);
      case 'number': return renderNumber(def, value, store);
      case 'percentage': return renderPercentage(def, value, store);
      case 'money': return renderMoney(def, value, store, ctx);
      case 'money_with_period': return renderMoneyWithPeriod(def, value, store, ctx);
      case 'date': return renderDate(def, value, store);
      case 'date_partial': return renderDatePartial(def, value, store);
      case 'dropdown': return renderDropdown(def, value, store);
      case 'single_select': return renderSingleSelect(def, value, store);
      case 'single_select_richlabel': return renderSingleSelectRich(def, value, store);
      case 'multi_select': return renderMultiSelect(def, value, store);
      case 'multi_select_with_other': return renderMultiSelectWithOther(def, value, store);
      case 'multi_select_editable': return renderMultiSelectEditable(def, value, store);
      case 'yes_no': return renderYesNo(def, value, store);
      case 'yes_no_with_text': return renderYesNoWithText(def, value, store);
      case 'two_numbers': return renderTwoNumbers(def, value, store);
      case 'number_or_none': return renderNumberOrNone(def, value, store);
      default:
        console.warn('[pfolioIPS] unknown field type:', def.type, def);
        return el('div', { class: 'ips-unknown' }, `Unknown field type: ${def.type}`);
    }
  }

  ns.formFields = { renderField, el };
})();

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
              class: 'ips-btn ips-btn--apply',
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

/**
 * Form specification — sections, subsections, fields.
 *
 * The runtime definition of the IPS form. Field IDs and option values are the
 * stable contract between the form, the state container, and the generators.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  ns.formSpec = {
    sections: [
      {
        id: 'section_1',
        number: '1',
        title: 'Cover and metadata',
        // No subsections — fields directly under the section.
        fields: [
          { id: 'drafted_by', label: 'Drafted by', type: 'text', tier: 'core', placeholder: 'Your name' },
          { id: 'date_drafted', label: 'Date drafted', type: 'date', tier: 'core' },
          {
            id: 'base_currency',
            label: 'Base currency',
            type: 'dropdown',
            tier: 'core',
            options: ['USD', 'EUR', 'CHF', 'GBP', 'JPY', 'AUD', 'CAD', 'Other']
          },
          { id: 'co_investor', label: 'Co-investor or household member, if applicable', type: 'text', tier: 'advanced', placeholder: 'Name, or leave blank' }
        ]
      },

      {
        id: 'section_2',
        number: '2',
        title: 'Investment objectives',
        subsections: [
          {
            id: 'section_2_1',
            number: '2.1',
            title: 'Investment horizon',
            fields: [
              {
                id: 'horizon',
                label: 'How long do you plan to invest this money before needing it?',
                type: 'dropdown',
                tier: 'core',
                options: [
                  { value: 'lt_1y', label: 'Less than 1 year' },
                  { value: '1_3y', label: '1 to 3 years' },
                  { value: '3_5y', label: '3 to 5 years' },
                  { value: '5_10y', label: '5 to 10 years' },
                  { value: '10_15y', label: '10 to 15 years' },
                  { value: '15_25y', label: '15 to 25 years' },
                  { value: 'gt_25y', label: 'More than 25 years' }
                ],
                helpers: {
                  label: 'Not sure? Three quick questions',
                  intro: 'Optional—answer if you would like help deciding.',
                  questions: [
                    {
                      id: 'horizon_helper_age',
                      label: 'Your current age, and the age at which you expect to use this money',
                      type: 'two_numbers',
                      fields: [
                        { id: 'current_age', label: 'Current age', min: 18, max: 100 },
                        { id: 'target_age', label: 'Target age', min: 18, max: 110 }
                      ]
                    },
                    {
                      id: 'horizon_helper_purpose',
                      label: 'The purpose of this portfolio',
                      type: 'single_select',
                      options: [
                        { value: 'near_term', label: 'Near-term goal with a planned spend (house deposit, business, education, large purchase)' },
                        { value: 'retirement', label: 'Retirement' },
                        { value: 'indefinite', label: 'Indefinite long-term wealth building, no fixed end date' }
                      ]
                    },
                    {
                      id: 'horizon_helper_earliest',
                      label: 'If circumstances forced you to start drawing on this money earlier than planned, what is the earliest that could realistically happen?',
                      type: 'number',
                      unit: 'years from today',
                      min: 0
                    }
                  ],
                  footnote: 'Your horizon is the shorter of your target age and your earliest-plausible drawdown date.'
                }
              }
            ]
          },
          {
            id: 'section_2_2',
            number: '2.2',
            title: 'Investment objective',
            fields: [
              {
                id: 'objective',
                label: 'What is the primary objective for this money?',
                type: 'single_select_richlabel',
                tier: 'core',
                options: [
                  { value: 'capital_preservation', label: 'Capital preservation', description: 'Prioritising safety of principal over returns. Suited to short horizons and low-risk profiles. Modest real returns are achievable; the goal is to beat cash without taking material risk.' },
                  { value: 'income_generation', label: 'Income generation', description: 'Seeking regular income through dividends, interest, or distributions. Common in or approaching retirement, where a portion of the portfolio is drawn down each year.' },
                  { value: 'capital_growth', label: 'Capital growth', description: 'Aiming to increase the value of the portfolio over time. The default for long-horizon investors building wealth.' },
                  { value: 'speculation', label: 'Speculation or aggressive growth', description: 'Taking higher risk for potentially higher returns, accepting larger drawdowns in pursuit of stronger long-term outcomes.' }
                ],
                helpers: {
                  label: 'Not sure? Three sequential questions',
                  intro: 'Optional—answer if you would like help deciding.',
                  questions: [
                    { id: 'objective_helper_income', label: 'Do you need this portfolio to generate cash for spending while it remains invested?', type: 'yes_no' },
                    {
                      id: 'objective_helper_priority',
                      label: 'Is the priority growing the portfolio\'s value over time, or making sure you do not lose what you already have?',
                      type: 'single_select',
                      options: [
                        { value: 'growing', label: 'Growing' },
                        { value: 'not_losing', label: 'Not losing' }
                      ]
                    },
                    {
                      id: 'objective_helper_drawdowns',
                      label: 'Are you willing to accept large drawdowns in pursuit of stronger long-term outcomes, or do you want a more measured growth path?',
                      type: 'single_select',
                      options: [
                        { value: 'yes_large', label: 'Yes, large drawdowns acceptable' },
                        { value: 'measured', label: 'No, measured growth' }
                      ]
                    }
                  ]
                }
              },
              { id: 'target_value', label: 'Target portfolio value at horizon, if you have one', type: 'money', tier: 'advanced', placeholder: 'amount, or leave blank' },
              { id: 'secondary_objectives', label: 'Secondary objectives', type: 'textarea', tier: 'advanced', rows: 2, placeholder: 'E.g. income generation in retirement, leaving a legacy, philanthropic giving.' }
            ]
          },
          {
            id: 'section_2_3',
            number: '2.3',
            title: 'Intended use',
            fields: [
              { id: 'intended_use', label: 'What is this money concretely for?', type: 'textarea', tier: 'core', rows: 3, placeholder: 'One or two sentences in your own words.' }
            ]
          },
          {
            id: 'section_2_4',
            number: '2.4',
            title: 'Funding the portfolio',
            fields: [
              { id: 'starting_capital', label: 'Starting capital', type: 'money', tier: 'core' },
              { id: 'ongoing_contributions', label: 'Planned ongoing contributions', type: 'money_with_period', tier: 'core', periods: ['per_month', 'per_year', 'none'] },
              {
                id: 'onboarding_approach',
                label: 'Onboarding approach for starting capital',
                type: 'single_select_richlabel',
                tier: 'core',
                options: [
                  { value: 'lump_sum', label: 'Lump sum', description: 'Invest the full starting amount immediately at the target allocation. Maximises time in market; accepts the timing risk of the entry point.' },
                  { value: 'phased', label: 'Phased entry', description: 'Deploy the starting capital in equal tranches over a defined period (typically 6 to 12 months). Reduces the impact of a poorly timed entry; accepts the cost of cash drag during the deployment window.' },
                  { value: 'hybrid', label: 'Hybrid', description: 'Deploy a portion immediately and the remainder in tranches.' }
                ]
              },
              {
                id: 'onboarding_specify',
                label: 'If phased or hybrid, specify',
                type: 'text',
                tier: 'core',
                show_if: { field: 'onboarding_approach', op: 'in', values: ['phased', 'hybrid'] },
                placeholder: 'E.g. "12 monthly tranches"; "50% immediately, remainder in 6 monthly tranches".'
              },
              { id: 'withdrawal_approach', label: 'Withdrawal approach', type: 'textarea', tier: 'advanced', rows: 2, placeholder: 'How and when you plan to draw on this portfolio.' }
            ]
          }
        ]
      },

      {
        id: 'section_3',
        number: '3',
        title: 'Risk profile',
        intro: 'Risk gets stated in two ways below—risk level and target volatility—because they capture related but distinct things. Risk level is how you describe yourself; volatility is the measurable consequence. Both matter; the lower of the two binds.',
        subsections: [
          {
            id: 'section_3_1',
            number: '3.1',
            title: 'Risk level',
            fields: [
              {
                id: 'risk_level',
                label: 'How would you describe your willingness to take investment risk?',
                type: 'dropdown',
                tier: 'core',
                options: [
                  { value: 'very_low', label: 'Very low—I want to avoid losses, even if returns are small' },
                  { value: 'low', label: 'Low—I prefer safety but can accept minor fluctuations' },
                  { value: 'moderate', label: 'Moderate—I am comfortable with some ups and downs for better returns' },
                  { value: 'high', label: 'High—I can accept significant fluctuations for higher growth potential' },
                  { value: 'very_high', label: 'Very high—I seek maximum growth and accept large risks of loss' }
                ],
                helpers: {
                  label: 'Not sure? Tolerance vs capacity',
                  intro: 'Optional—read if you would like help deciding.',
                  body_html: `
                    <p>Risk level is the <em>lower</em> of two things: your <strong>tolerance</strong> for risk and your <strong>capacity</strong> for it. Tolerance without capacity is a portfolio that will force a sale at the worst possible moment—when prices are lowest and your finances are most strained.</p>

                    <h5 class="ips-helper__h">Risk tolerance—your willingness to endure losses</h5>
                    <p>Tolerance is psychological. Standard ways to think about it:</p>
                    <ul>
                      <li><em>Stated tolerance</em>—how you would describe yourself in calm conditions. Useful starting point, but historically people overestimate this in advance of a real drawdown.</li>
                      <li><em>Behavioural tolerance</em>—how you actually responded to past drawdowns (selling, sitting tight, adding more). The most reliable measure if you have it.</li>
                      <li><em>Sleep test</em>—the loss level at which you would stop sleeping or check your portfolio compulsively. If you cannot answer this honestly, err lower.</li>
                    </ul>

                    <h5 class="ips-helper__h">Risk capacity—your structural ability to absorb losses</h5>
                    <p>Capacity is the net of inflow and outflow over your investment horizon.</p>
                    <ul>
                      <li><em>Inflow</em>—the size and stability of your income relative to your expenses. Stable salaried income is high capacity; volatile freelance income or single-employer concentration is lower.</li>
                      <li><em>Outflow</em>—recurring expenses, dependants' financial needs, planned major commitments (mortgage, education, retirement spending). Low and predictable outflow leaves more headroom for drawdowns.</li>
                    </ul>

                    <h5 class="ips-helper__h">The rule</h5>
                    <p>Set risk level to the <em>lower</em> of tolerance and capacity. Examples:</p>
                    <ul>
                      <li>High stable inflow + low outflow + high tolerance → <strong>high</strong> or <strong>very high</strong> risk level</li>
                      <li>High stable inflow + low outflow + moderate tolerance → <strong>moderate</strong> (tolerance binds)</li>
                      <li>Volatile inflow or high outflow + high tolerance → <strong>low</strong> or <strong>moderate</strong> (capacity binds)</li>
                      <li>Volatile inflow + high outflow + low tolerance → <strong>very low</strong> or <strong>low</strong></li>
                    </ul>

                    <p>If you have not lived through a serious drawdown as an invested participant, you cannot fully know your tolerance. Err lower.</p>

                    <p class="ips-helper__footnote">Liquidity reserve is captured separately in section 6.1.</p>
                  `
                }
              }
            ]
          },
          {
            id: 'section_3_2',
            number: '3.2',
            title: 'Target volatility',
            fields: [
              {
                id: 'target_volatility',
                label: 'What level of annual portfolio fluctuation are you comfortable accepting in pursuit of your objective?',
                type: 'dropdown',
                tier: 'core',
                options: [
                  { value: 'below_5', label: 'Below 5%' },
                  { value: '5_75', label: '5% to 7.5%' },
                  { value: '75_10', label: '7.5% to 10%' },
                  { value: '10_15', label: '10% to 15%' },
                  { value: 'above_15', label: 'Above 15%' }
                ],
                helpers: {
                  label: 'Not sure? Translate volatility into money',
                  intro: 'Optional—answer if you would like help deciding.',
                  preamble: 'The percentages above are abstract until they are translated into money. Loss aversion (Kahneman & Tversky, 1979) acts on the figure on your statement, not the ratio.'
                  // No questions array — drawdown table is rendered programmatically
                }
              }
            ]
          },
          {
            id: 'section_3_3',
            number: '3.3',
            title: 'Abandonment threshold',
            intro: 'At what loss would you seriously consider abandoning this strategy and selling? This number matters more than your comfort threshold. The portfolio should be designed so its expected worst-case drawdown sits meaningfully below it. Optional—leave blank to revisit at next review.',
            fields: [
              { id: 'abandonment_amount', label: 'State the figure in money', type: 'money' },
              { id: 'abandonment_pct', label: 'As a percentage of current portfolio value', type: 'percentage' }
            ]
          }
        ]
      },

      {
        id: 'section_4',
        number: '4',
        title: 'Asset universe',
        intro: 'This section defines what is eligible to enter the portfolio.',
        subsections: [
          {
            id: 'section_4_1',
            number: '4.1',
            title: 'Eligible asset types',
            fields: [
              {
                id: 'asset_types',
                label: 'What kinds of instruments are eligible? Select all that apply.',
                type: 'multi_select_with_other',
                tier: 'core',
                options: [
                  { value: 'etfs', label: 'ETFs' },
                  { value: 'stocks', label: 'Individual stocks' },
                  { value: 'bonds', label: 'Bonds and fixed income products' },
                  { value: 'crypto', label: 'Cryptocurrencies' },
                  { value: 'commodities', label: 'Commodities (via ETFs or futures)' },
                  { value: 'currencies', label: 'Currencies' },
                  { value: 'real_estate', label: 'Real estate (direct property, REITs, real-estate crowdfunding)' },
                  { value: 'complex', label: 'Complex and leveraged products' },
                  { value: 'other', label: 'Other (specify)', free_text: true }
                ]
              }
            ]
          },
          {
            id: 'section_4_2',
            number: '4.2',
            title: 'Eligible asset classes',
            fields: [
              {
                id: 'asset_classes',
                label: 'What kinds of risk exposure are in scope? Select all that apply.',
                type: 'multi_select',
                tier: 'core',
                options: [
                  { value: 'equities', label: 'Equities' },
                  { value: 'fixed_income', label: 'Fixed income' },
                  { value: 'commodities', label: 'Commodities' },
                  { value: 'crypto', label: 'Cryptocurrencies' },
                  { value: 'alternatives', label: 'Alternatives' },
                  { value: 'cash', label: 'Cash equivalents' }
                ]
              }
            ]
          },
          {
            id: 'section_4_3',
            number: '4.3',
            title: 'Geography',
            fields: [
              {
                id: 'geography',
                label: 'Which markets are in scope?',
                type: 'single_select',
                tier: 'core',
                options: [
                  { value: 'global', label: 'Global, no restriction' },
                  { value: 'developed_only', label: 'Developed markets only' },
                  { value: 'custom', label: 'Custom (specify in advanced)' }
                ]
              },
              { id: 'geography_regions_in', label: 'Regions in scope', type: 'textarea', tier: 'advanced', rows: 2, show_if: { field: 'geography', op: '==', value: 'custom' }, placeholder: 'E.g. North America, Europe, Asia-Pacific.' },
              { id: 'geography_regions_out', label: 'Regions or countries excluded', type: 'textarea', tier: 'advanced', rows: 2, show_if: { field: 'geography', op: '==', value: 'custom' } },
              { id: 'geography_dev_em_mix', label: 'Developed / emerging mix', type: 'text', tier: 'advanced', show_if: { field: 'geography', op: '==', value: 'custom' }, placeholder: 'E.g. "85% developed, 15% emerging".' }
            ]
          },
          {
            id: 'section_4_4',
            number: '4.4',
            title: 'Filters and exclusions',
            tier: 'advanced',
            intro: 'Negative screens applied to the universe.',
            fields: [
              { id: 'esg_screening', label: 'ESG screening', type: 'yes_no_with_text', tier: 'advanced', text_label_if_yes: 'If yes, state the screen', text_placeholder: 'E.g. "exclude tobacco, controversial weapons, and companies with material fossil fuel exposure".' },
              { id: 'excluded_sectors', label: 'Excluded sectors', type: 'textarea', tier: 'advanced', rows: 2 },
              { id: 'excluded_instruments', label: 'Excluded instruments', type: 'textarea', tier: 'advanced', rows: 2, placeholder: 'E.g. "no leveraged ETFs"; "no derivatives".' },
              { id: 'currency_hedging', label: 'Currency hedging policy', type: 'text', tier: 'advanced', placeholder: 'Hedged, unhedged, or partial.' }
            ]
          },
          {
            id: 'section_4_5',
            number: '4.5',
            title: 'Concentration limits',
            tier: 'advanced',
            intro: 'Position-size rules — risk controls within the universe.',
            fields: [
              { id: 'max_single_position', label: 'Maximum single position weight', type: 'percentage', tier: 'advanced' },
              { id: 'max_asset_class', label: 'Maximum exposure to any single asset class', type: 'percentage', tier: 'advanced' },
              { id: 'max_sector', label: 'Maximum exposure to any single sector', type: 'percentage', tier: 'advanced' }
            ]
          }
        ]
      },

      {
        id: 'section_5',
        number: '5',
        title: 'Portfolio management',
        intro: 'How active do you want to be in managing this portfolio?',
        subsections: [
          {
            id: 'section_5_1',
            number: '5.1',
            title: 'Management style',
            fields: [
              {
                id: 'management_style',
                label: 'Where on the spectrum from passive to active does your approach sit?',
                type: 'single_select_richlabel',
                tier: 'core',
                options: [
                  { value: 'passive', label: 'Passive', description: 'Committing to a buy-and-hold approach with minimal ongoing decisions. Set weights once, hold through cycles.', example: 'Example: holding a global equity ETF and dollar-cost averaging from monthly contributions, indefinitely.' },
                  { value: 'systematic', label: 'Systematic', description: 'Committing to rules-based decisions made on a regular cadence, with no discretionary input. The rules are set in advance and followed mechanically.', example: 'Examples: a fixed-allocation portfolio rebalanced annually; an adaptive multi-asset portfolio rebalanced monthly based on momentum signals.' },
                  { value: 'active', label: 'Active', description: 'Committing to ongoing research, judgement, and discretionary trades.', example: 'Examples: value investing with fundamental stock selection; sector rotation based on macroeconomic views.' }
                ],
                helpers: {
                  label: 'Not sure? Three quick questions',
                  intro: 'Optional—answer if you would like help deciding.',
                  questions: [
                    {
                      id: 'style_helper_hours',
                      label: 'How many hours per month do you want to spend managing this portfolio?',
                      type: 'single_select',
                      options: [
                        { value: 'none', label: 'None' },
                        { value: '1_2', label: '1–2 hours' },
                        { value: '2_5', label: '2–5 hours' },
                        { value: 'gt_5', label: 'More than 5 hours' }
                      ]
                    },
                    {
                      id: 'style_helper_research',
                      label: 'Are you motivated by researching individual companies and forming your own views about them?',
                      type: 'single_select',
                      options: [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                        { value: 'not_particularly', label: 'Not particularly' }
                      ]
                    },
                    {
                      id: 'style_helper_realtime',
                      label: 'When markets shift, how should decisions be made?',
                      type: 'single_select',
                      options: [
                        { value: 'very', label: 'By my own judgement, in the moment' },
                        { value: 'somewhat', label: 'A mix of rules and judgement' },
                        { value: 'not', label: 'By rules set in advance — whether I never touch them again or follow them on a fixed cadence' }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          {
            id: 'section_5_2',
            number: '5.2',
            title: 'Cadence',
            fields: [
              {
                id: 'cadence',
                label: 'How often do you commit to reviewing and acting on the portfolio?',
                type: 'single_select',
                tier: 'core',
                options: [
                  { value: 'contributions_only', label: 'Only when new contributions arrive' },
                  { value: 'annual', label: 'Annually' },
                  { value: 'semi_annual', label: 'Semi-annually' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'threshold', label: 'Threshold-based (drift triggers)' }
                ]
              },
              { id: 'drift_threshold', label: 'If threshold-based, specify the drift threshold', type: 'text', tier: 'advanced', show_if: { field: 'cadence', op: '==', value: 'threshold' }, placeholder: 'E.g. "rebalance when any asset class drifts more than 5 percentage points from target".' }
            ]
          },
          {
            id: 'section_5_3',
            number: '5.3',
            title: 'Tactical overrides',
            tier: 'advanced',
            intro: 'Conditions under which you allow yourself to deviate from the rules above. The honest default is "never".',
            fields: [
              { id: 'tactical_overrides', label: 'Conditions under which you allow yourself to deviate', type: 'textarea', tier: 'advanced', rows: 3 }
            ]
          }
        ]
      },

      {
        id: 'section_6',
        number: '6',
        title: 'Constraints',
        subsections: [
          {
            id: 'section_6_1',
            number: '6.1',
            title: 'Liquidity reserve',
            fields: [
              { id: 'liquidity_reserve', label: 'Emergency cash reserve held outside this portfolio', type: 'text', tier: 'core', placeholder: 'Months of living expenses, or absolute amount.' }
            ]
          },
          {
            id: 'section_6_2',
            number: '6.2',
            title: 'Jurisdictional and tax notes',
            tier: 'advanced',
            fields: [
              { id: 'tax_residence', label: 'Country of tax residence', type: 'text', tier: 'advanced' },
              { id: 'account_types', label: 'Account types in use', type: 'textarea', tier: 'advanced', rows: 2, placeholder: 'E.g. taxable brokerage, pillar 3a, ISA, IRA.' },
              { id: 'tax_considerations', label: 'Tax considerations', type: 'textarea', tier: 'advanced', rows: 2, placeholder: 'Capital gains treatment, dividend tax, withholding tax on foreign holdings.' }
            ]
          }
        ]
      },

      {
        id: 'section_7',
        number: '7',
        title: 'Review and revision',
        subsections: [
          {
            id: 'section_7_1',
            number: '7.1',
            title: 'Review schedule',
            fields: [
              { id: 'annual_review_date', label: 'Annual review date', type: 'date_partial', tier: 'core', placeholder: 'e.g. 12 March' }
            ]
          },
          {
            id: 'section_7_2',
            number: '7.2',
            title: 'Personal benchmark',
            tier: 'advanced',
            fields: [
              { id: 'personal_benchmark', label: 'What you compare your portfolio\'s performance against during the annual review', type: 'textarea', tier: 'advanced', rows: 2, placeholder: 'E.g. "global equity index"; "60/40 benchmark"; "inflation + 4% per year".' }
            ]
          },
          {
            id: 'section_7_3',
            number: '7.3',
            title: 'Triggering life events',
            tier: 'advanced',
            fields: [
              { id: 'life_events', label: 'Material life events that should trigger an off-cycle review', type: 'multi_select_editable', tier: 'advanced' }
            ]
          },
          {
            id: 'section_7_4',
            number: '7.4',
            title: 'Revision vs deviation',
            tier: 'advanced',
            boilerplate_block: true,
            content: [
              'This document is meant to evolve as your circumstances change. But revision and deviation are different.',
              'Revision is changing the document because something in your life has genuinely changed—a longer horizon, a higher capacity, a new dependant. Revisions happen at scheduled review points or after triggering life events, and are recorded with a date and a brief note on what changed and why.',
              'Deviation is failing to follow the document because markets are moving and you feel the urge to act. Deviations are the failure mode this document exists to prevent.',
              'If you want to change the rules during a drawdown, write down what you want to do and why, set the document aside for one week, and revisit. If the case still holds in calm conditions, it is a revision. If it does not, it was a deviation in disguise.'
            ]
          }
          // section_7_5 (revision log table) is omitted from the in-form view —
          // it lives in the generated documents only.
        ]
      }
    ]
  };
})();

/**
 * Form composition — iterates the SPEC, renders sections, subsections,
 * helpers, and applies tier filtering, show_if conditionals, and
 * advanced-toggle persistence. Re-renders the whole form on every
 * state change (the form is bounded; no need for fine-grained diffing).
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});
  const el = ns.formFields.el;

  // ---------- show_if evaluation ----------

  function evaluateShowIf(rule, state) {
    if (!rule) return true;
    const v = state[rule.field];
    if (rule.op === '==') return v === rule.value;
    if (rule.op === '!=') return v !== rule.value;
    if (rule.op === 'in') return Array.isArray(rule.values) && rule.values.includes(v);
    return true;
  }

  // ---------- Visual helpers ----------

  function sectionHeading(num, title) {
    return el('header', { class: 'ips-section__header' }, [
      el('h2', { class: 'ips-section__title' }, `${num}. ${title}`)
    ]);
  }

  function subsectionHeading(num, title) {
    return el('header', { class: 'ips-sub__header' }, [
      el('h3', { class: 'ips-sub__title' }, `${num} ${title}`)
    ]);
  }

  function sectionIntro(text) {
    return text ? el('p', { class: 'ips-section__intro' }, text) : null;
  }

  function advancedToggleBtn(label, isOpen, onClick) {
    return el('button', {
      type: 'button',
      class: 'ips-advanced-toggle' + (isOpen ? ' is-open' : ''),
      onClick
    }, isOpen ? `Hide ${label} ▾` : `Add ${label} ▸`);
  }

  // ---------- Field group renderers ----------

  function renderFieldsGroup(fields, state, store, ctx) {
    const nodes = [];
    for (const f of fields) {
      if (!evaluateShowIf(f.show_if, state)) continue;
      nodes.push(ns.formFields.renderField(f, state[f.id], store, ctx));
      if (f.helpers) {
        const helperNode = ns.formHelpers.renderHelpers(f, state, store, ctx);
        if (helperNode) nodes.push(helperNode);
      }
    }
    return nodes;
  }

  function renderBoilerplateBlock(sub) {
    const children = [];
    if (sub.intro) children.push(sectionIntro(sub.intro));
    if (Array.isArray(sub.content)) {
      for (const para of sub.content) {
        children.push(el('p', { class: 'ips-boilerplate__p' }, para));
      }
    }
    return el('div', { class: 'ips-boilerplate' }, children);
  }

  // ---------- Subsection renderer ----------

  function renderSubsection(sub, state, store, ctx) {
    const subKey = sub.id; // e.g. "section_3_3"
    const isWholeAdvanced = sub.tier === 'advanced' || (sub.fields && sub.fields.every((f) => f.tier === 'advanced'));

    // For 7.4 boilerplate (no fields, just content)
    if (sub.boilerplate_block) {
      const isOpen = !!state.advanced_open[subKey];
      const inner = el('div', null, [
        subsectionHeading(sub.number, sub.title),
        advancedToggleBtn('detail', isOpen, () => store.toggleAdvancedOpen(subKey)),
        isOpen ? renderBoilerplateBlock(sub) : null
      ]);
      return el('section', { class: 'ips-sub ips-sub--advanced' }, inner);
    }

    if (isWholeAdvanced) {
      const isOpen = !!state.advanced_open[subKey];
      const children = [
        subsectionHeading(sub.number, sub.title),
        advancedToggleBtn('detail', isOpen, () => store.toggleAdvancedOpen(subKey))
      ];
      if (isOpen) {
        if (sub.intro) children.push(sectionIntro(sub.intro));
        children.push(...renderFieldsGroup(sub.fields || [], state, store, ctx));
      }
      return el('section', { class: 'ips-sub ips-sub--advanced' }, children);
    }

    // Mixed subsection: core fields always visible.
    // Conditional advanced fields (with show_if) render inline — their show_if controls visibility.
    // Unconditional advanced fields hide behind a per-subsection "Add detail" toggle.
    const coreFields = (sub.fields || []).filter((f) => f.tier !== 'advanced');
    const advancedFields = (sub.fields || []).filter((f) => f.tier === 'advanced');
    const conditionalAdvanced = advancedFields.filter((f) => f.show_if);
    const optionalAdvanced = advancedFields.filter((f) => !f.show_if);
    const isOpen = !!state.advanced_open[subKey];

    const children = [subsectionHeading(sub.number, sub.title)];
    if (sub.intro) children.push(sectionIntro(sub.intro));
    children.push(...renderFieldsGroup(coreFields, state, store, ctx));
    children.push(...renderFieldsGroup(conditionalAdvanced, state, store, ctx));

    if (optionalAdvanced.length) {
      children.push(advancedToggleBtn('detail', isOpen, () => store.toggleAdvancedOpen(subKey)));
      if (isOpen) {
        children.push(...renderFieldsGroup(optionalAdvanced, state, store, ctx));
      }
    }

    return el('section', { class: 'ips-sub' }, children);
  }

  // Section 2.2 has its own special case: the "optional details" (target_value,
  // secondary_objectives) hide behind a separate toggle named section_2_2_optional.
  // Implementation: when iterating its fields, treat advanced fields as the
  // "optional details" group with the special key.
  function renderSection22Special(sub, state, store, ctx) {
    const subKey = 'section_2_2_optional';
    const coreFields = (sub.fields || []).filter((f) => f.tier !== 'advanced');
    const advancedFields = (sub.fields || []).filter((f) => f.tier === 'advanced');
    const isOpen = !!state.advanced_open[subKey];

    const children = [subsectionHeading(sub.number, sub.title)];
    if (sub.intro) children.push(sectionIntro(sub.intro));
    children.push(...renderFieldsGroup(coreFields, state, store, ctx));

    if (advancedFields.length) {
      children.push(advancedToggleBtn('optional details', isOpen, () => store.toggleAdvancedOpen(subKey)));
      if (isOpen) {
        children.push(...renderFieldsGroup(advancedFields, state, store, ctx));
      }
    }

    return el('section', { class: 'ips-sub' }, children);
  }

  // Section 1 has no subsections — fields directly. Mixed tier.
  function renderSection1(section, state, store, ctx) {
    const subKey = 'section_1';
    const coreFields = (section.fields || []).filter((f) => f.tier !== 'advanced');
    const advancedFields = (section.fields || []).filter((f) => f.tier === 'advanced');
    const isOpen = !!state.advanced_open[subKey];

    const children = [sectionHeading(section.number, section.title)];
    if (section.intro) children.push(sectionIntro(section.intro));
    children.push(...renderFieldsGroup(coreFields, state, store, ctx));

    if (advancedFields.length) {
      children.push(advancedToggleBtn('detail', isOpen, () => store.toggleAdvancedOpen(subKey)));
      if (isOpen) {
        children.push(...renderFieldsGroup(advancedFields, state, store, ctx));
      }
    }
    return el('section', { class: 'ips-section' }, children);
  }

  function renderSection(section, state, store, ctx) {
    if (section.id === 'section_1') return renderSection1(section, state, store, ctx);

    const children = [sectionHeading(section.number, section.title)];
    if (section.intro) children.push(sectionIntro(section.intro));

    for (const sub of (section.subsections || [])) {
      const renderer = sub.id === 'section_2_2' ? renderSection22Special : renderSubsection;
      children.push(renderer(sub, state, store, ctx));
    }

    return el('section', { class: 'ips-section' }, children);
  }

  // ---------- Top-level form ----------

  function renderForm(state, store) {
    const ctx = { baseCurrency: state.base_currency || 'USD' };
    const root = el('div', { class: 'ips-form-root' });

    // Privacy note — top of form, always visible
    root.appendChild(el('div', { class: 'ips-privacy-note' }, [
      el('p', null, [
        el('strong', null, 'Your draft stays in your browser.'),
        ' Nothing is sent to a server, and pfolio never sees what you write. Closing the tab preserves your work; clearing browser data erases it.'
      ])
    ]));

    // Reset banner if user has data
    if (store.hasUserData()) {
      root.appendChild(el('div', { class: 'ips-reset-banner' }, [
        el('button', {
          type: 'button',
          class: 'ips-btn ips-btn--ghost',
          onClick: () => {
            if (window.confirm('Clear all your draft answers and start over?')) store.reset();
          }
        }, 'Clear draft and start over')
      ]));
    }

    if (!store.isStorageAvailable()) {
      root.appendChild(el('div', { class: 'ips-storage-warning' },
        'Your browser does not support draft saving. Your work will be lost if you close this page.'
      ));
    }

    for (const section of ns.formSpec.sections) {
      root.appendChild(renderSection(section, state, store, ctx));
    }
    return root;
  }

  // ---------- Mount ----------

  function mount(rootEl, store) {
    if (!rootEl) {
      console.warn('[pfolioIPS] form mount: no root element');
      return;
    }
    if (ns.formStyles && ns.formStyles.injectStyles) ns.formStyles.injectStyles();
    function rerender() {
      const state = store.get();
      // Preserve focus + caret position across re-renders by remembering
      // the element's data-field id and selection range.
      const active = document.activeElement;
      let focusInfo = null;
      if (active && rootEl.contains(active) && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        focusInfo = {
          fieldHost: active.closest('[data-field]')?.getAttribute('data-field') || null,
          tag: active.tagName,
          start: active.selectionStart,
          end: active.selectionEnd,
          name: active.name || null,
          type: active.type || null,
          inputId: active.id || null
        };
      }
      const next = renderForm(state, store);
      rootEl.replaceChildren(next);
      if (focusInfo && focusInfo.inputId) {
        const restored = rootEl.querySelector('#' + CSS.escape(focusInfo.inputId));
        if (restored) {
          restored.focus();
          if (typeof focusInfo.start === 'number' && restored.setSelectionRange) {
            try { restored.setSelectionRange(focusInfo.start, focusInfo.end); } catch (_e) {}
          }
        }
      }
    }
    rerender();
    const unsub = store.subscribe(() => rerender());
    return { unmount: () => { unsub(); rootEl.replaceChildren(); } };
  }

  ns.form = { mount, renderForm };
})();

/**
 * Form CSS — injected as a <style> tag on first mount.
 * Using neutral classnames prefixed `ips-` to avoid clashing with Webflow's
 * existing global styles. Brand fonts inherit from the page (Source Serif Pro
 * for headings, Poppins for body) on the production page.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});
  const STYLE_ID = 'pfolio-ips-form-styles';

  const CSS = `
/* Override the page's "loading placeholder" styling once the form is mounted —
   strip padding, white bg, dashed border, centre alignment so the live tool
   sits edge-to-edge inside the host container. */
.ips-form-host, .ips-downloads-host { background: transparent !important; padding: 0 !important; border: none !important; text-align: left !important; color: inherit !important; min-height: 0 !important; }

.ips-form-root { font-family: Poppins, system-ui, sans-serif; color: #1F2F36; line-height: 1.55; accent-color: #1F2F36; background: transparent; padding: 0; margin: 0; }
.ips-form-root * { box-sizing: border-box; }
.ips-form-root input[type="radio"], .ips-form-root input[type="checkbox"] { accent-color: #1F2F36; }

.ips-section { padding: 32px 0; border-top: 1px solid #264653; }
.ips-section:first-child { border-top: none; padding-top: 0; }
.ips-section__header { margin: 0 0 8px; }
.ips-section__title { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 24px; line-height: 1.25; color: #1F2F36; margin: 0; letter-spacing: -0.005em; }
.ips-section__intro { font-size: 14px; line-height: 1.6; color: #6B7280; margin: 4px 0 16px; }

.ips-sub { margin: 24px 0; padding: 0; }
.ips-sub__header { margin: 0 0 8px; }
.ips-sub__title { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 17px; line-height: 1.3; color: #1F2F36; margin: 0; }
.ips-sub--advanced { padding: 0; }

.ips-field { margin: 14px 0; }
.ips-field__label { display: block; font-size: 14px; font-weight: 500; color: #1F2F36; margin: 0 0 6px; line-height: 1.45; }
.ips-field__sublabel { display: block; font-size: 13px; font-weight: 400; color: #6B7280; margin: 0 0 4px; }
.ips-field__guidance { font-size: 12px; line-height: 1.55; color: #9AA0AB; margin: 4px 0 0; font-style: italic; }

.ips-input, .ips-textarea, .ips-select { width: 100%; padding: 9px 12px; border: 1px solid #264653; border-radius: 6px; font: inherit; font-size: 14px; color: #1F2F36; background: #FFFFFF; transition: border-color 0.15s ease; }
.ips-input { max-width: 480px; }
.ips-select { max-width: 480px; }
.ips-input:focus, .ips-textarea:focus, .ips-select:focus { outline: none; border-color: #00BFB2; box-shadow: 0 0 0 3px rgba(0,191,178,0.18); }
.ips-textarea { resize: vertical; min-height: 60px; max-width: 600px; line-height: 1.55; font-family: inherit; }

.ips-input--number { width: 140px; min-width: 0; }
.ips-input-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ips-input-prefix, .ips-input-suffix { font-size: 13px; color: #6B7280; font-variant-numeric: tabular-nums; }
.ips-input-prefix { padding-right: 2px; }
.ips-input--other { width: 220px; }

.ips-radios { display: flex; flex-direction: column; gap: 8px; }
.ips-radios--inline { flex-direction: row; gap: 16px; flex-wrap: wrap; }
.ips-radio { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; padding: 4px 0; }
.ips-radio input { margin-top: 3px; }
.ips-radio__label { font-size: 14px; color: #1F2F36; line-height: 1.5; }

.ips-rich-radios { display: flex; flex-direction: column; gap: 8px; }
.ips-rich-radio { display: flex; gap: 12px; padding: 14px 16px; border: 1px solid #264653; border-radius: 8px; cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease; align-items: flex-start; }
.ips-rich-radio:hover { border-color: #1F2F36; }
.ips-rich-radio.is-checked { border-color: #1F2F36; border-width: 2px; padding: 13px 15px; background: #FFFFFF; }
.ips-rich-radio__input { margin-top: 3px; }
.ips-rich-radio__body { display: flex; flex-direction: column; gap: 3px; }
.ips-rich-radio__title { font-size: 14px; font-weight: 600; color: #1F2F36; }
.ips-rich-radio__desc { font-size: 13px; color: #3A4255; line-height: 1.55; }
.ips-rich-radio__example { font-size: 12px; color: #6B7280; font-style: italic; line-height: 1.5; }

.ips-checks { display: flex; flex-direction: column; gap: 6px; }
.ips-check { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; padding: 4px 0; }
.ips-check input { margin-top: 3px; }
.ips-check__label { font-size: 14px; color: #1F2F36; line-height: 1.5; }
.ips-check-with-other { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.ips-check-with-other .ips-check { flex-shrink: 0; }

.ips-toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #6B7280; cursor: pointer; }
.ips-toggle__label { user-select: none; }

.ips-two-numbers { display: flex; gap: 12px; flex-wrap: wrap; }
.ips-two-numbers__item { display: flex; flex-direction: column; gap: 4px; }

.ips-editable-list { display: flex; flex-direction: column; gap: 6px; }
.ips-editable-row { display: flex; gap: 6px; }
.ips-editable-row .ips-input { flex: 1; }

.ips-btn { font-family: inherit; font-size: 13px; padding: 7px 14px; border-radius: 6px; cursor: pointer; transition: background 0.15s ease, border-color 0.15s ease; }
.ips-btn--ghost { background: transparent; color: #6B7280; border: 1px solid #264653; }
.ips-btn--ghost:hover { border-color: #1F2F36; color: #1F2F36; }
.ips-btn--apply { background: #00BFB2; color: #FFFFFF; border: 1px solid #00BFB2; font-weight: 500; }
.ips-btn--apply:hover { background: #009993; border-color: #009993; }
.ips-btn--add { align-self: flex-start; margin-top: 4px; }

.ips-advanced-toggle { background: transparent; color: #1F2F36; border: none; padding: 8px 0; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.ips-advanced-toggle:hover { text-decoration: underline; }
.ips-advanced-toggle.is-open { color: #1F2F36; }

.ips-helper { margin: 8px 0 16px; padding: 14px 16px; background: #FFFFFF; border-left: 3px solid #00BFB2; border-radius: 0 6px 6px 0; }
.ips-helper-toggle { background: transparent; color: #1F2F36; border: none; padding: 6px 0; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; }
.ips-helper-toggle:hover { text-decoration: underline; }
.ips-helper__intro { font-size: 13px; color: #6B7280; margin: 8px 0 12px; line-height: 1.55; }
.ips-helper__preamble { font-size: 13px; color: #3A4255; margin: 8px 0 12px; line-height: 1.6; }
.ips-helper__footnote { font-size: 12px; color: #9AA0AB; margin: 8px 0 0; font-style: italic; }
.ips-helper__advisory { margin: 12px 0 0; padding: 10px 14px; background: #FFFFFF; border-radius: 6px; }
.ips-helper__advisory p { font-size: 13px; color: #1F2F36; margin: 0; line-height: 1.55; }
.ips-helper__body { font-size: 13px; line-height: 1.65; color: #1F2F36; }
.ips-helper__body p { margin: 8px 0; }
.ips-helper__body em { font-style: italic; color: #1F2F36; }
.ips-helper__body strong { font-weight: 600; }
.ips-helper__body ul { margin: 8px 0 12px 18px; padding: 0; }
.ips-helper__body li { margin: 4px 0; line-height: 1.6; }
.ips-helper__body .ips-helper__h { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 14px; line-height: 1.3; margin: 16px 0 6px; color: #1F2F36; }
.ips-helper__body p:first-child { margin-top: 0; }

.ips-suggestion { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 12px 0 0; padding: 10px 14px; background: #FFFFFF; border-left: 3px solid #00BFB2; border-radius: 0 6px 6px 0; }
.ips-suggestion__text { font-size: 13px; color: #1F2F36; line-height: 1.5; flex: 1; min-width: 240px; }

.ips-drawdown { margin: 16px 0 0; padding: 16px; background: #FFFFFF; border: 1px solid #264653; border-radius: 8px; }
.ips-drawdown__intro { font-size: 13px; color: #3A4255; margin: 0 0 10px; line-height: 1.55; }
.ips-drawdown__list { list-style: none; padding: 0; margin: 0 0 14px; }
.ips-drawdown__row { font-size: 13px; line-height: 1.55; color: #1F2F36; padding: 5px 0; border-bottom: 1px dashed #264653; font-variant-numeric: tabular-nums; }
.ips-drawdown__row:last-child { border-bottom: none; }
.ips-drawdown__post { font-size: 13px; color: #3A4255; line-height: 1.6; margin: 14px 0; }
.ips-drawdown__anchors-intro { font-size: 13px; color: #3A4255; margin: 14px 0 6px; }
.ips-drawdown__anchors { list-style: disc inside; padding: 0 0 0 6px; margin: 0 0 8px; font-size: 13px; line-height: 1.55; color: #1F2F36; }
.ips-drawdown__anchors-foot { font-size: 12px; color: #6B7280; margin: 8px 0 0; line-height: 1.55; font-style: italic; }

.ips-boilerplate { padding: 12px 16px; background: #FFFFFF; border-radius: 6px; }
.ips-boilerplate__p { font-size: 13px; color: #1F2F36; line-height: 1.6; margin: 0 0 10px; }
.ips-boilerplate__p:last-child { margin-bottom: 0; }

.ips-storage-warning { margin: 0 0 18px; padding: 10px 14px; background: #FFFFFF; border-left: 3px solid #EF6F6C; font-size: 13px; color: #1F2F36; border-radius: 0 6px 6px 0; }
.ips-reset-banner { display: flex; justify-content: flex-end; margin: 0 0 14px; }
.ips-privacy-note { margin: 0 0 18px; padding: 10px 14px; background: #FFFFFF; border-left: 3px solid #00BFB2; border-radius: 0 6px 6px 0; }
.ips-privacy-note p { font-size: 13px; line-height: 1.55; color: #1F2F36; margin: 0; }
.ips-privacy-note strong { font-weight: 600; }

/* Inline calibrator inside section 3.1 helper */
.ips-calibrator { padding: 14px 0; }
.ips-calibrator__summary { font-size: 12px; color: #6B7280; margin: 0 0 12px; padding: 8px 12px; background: #FFFFFF; border-radius: 6px; line-height: 1.5; }
.ips-calibrator__summary strong { font-weight: 600; color: #1F2F36; }
.ips-calibrator__h { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 15px; line-height: 1.3; margin: 6px 0 6px; color: #1F2F36; }
.ips-calibrator--blocked { background: #FFFFFF; padding: 14px 16px; border-radius: 6px; }
.ips-calibrator__blocker { font-size: 13px; color: #1F2F36; margin: 0 0 10px; line-height: 1.55; }
.ips-helper__cta { margin: 16px 0 0; padding-top: 12px; border-top: 1px dashed #264653; display: flex; }

/* Questionnaire widget (also reused by calibrator inline) */
.ips-q-card { font-family: Poppins, system-ui, sans-serif; color: #1F2F36; line-height: 1.55; padding: 28px 32px; background: #FFFFFF; border: 1px solid #264653; border-radius: 12px; accent-color: #1F2F36; }
.ips-q-card * { box-sizing: border-box; }
.ips-q-h { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 22px; line-height: 1.25; margin: 0 0 6px; color: #1F2F36; }
.ips-q-lede { font-size: 14px; color: #3A4255; margin: 0 0 20px; line-height: 1.6; }
.ips-q-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6B7280; margin: 0 0 14px; }
.ips-q-label { display: block; font-size: 15px; font-weight: 500; color: #1F2F36; margin: 6px 0 14px; line-height: 1.5; }
.ips-q-options { display: flex; flex-direction: column; gap: 8px; margin: 0 0 18px; }
.ips-q-option { text-align: left; padding: 12px 14px; background: #FFFFFF; border: 1px solid #264653; border-radius: 8px; font: inherit; font-size: 14px; color: #1F2F36; cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease; }
.ips-q-option:hover { border-color: #1F2F36; background: #FFFFFF; }
.ips-q-option.is-selected { border-color: #1F2F36; border-width: 2px; padding: 11px 13px; background: #FFFFFF; font-weight: 500; }
.ips-q-checks { display: flex; flex-direction: column; gap: 6px; margin: 0 0 12px; }
.ips-q-check { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; background: #FFFFFF; border: 1px solid #264653; border-radius: 8px; cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease; font-size: 14px; }
.ips-q-check input { margin-top: 3px; }
.ips-q-check.is-selected { border-color: #1F2F36; border-width: 2px; padding: 9px 13px; background: #FFFFFF; }
.ips-q-hint { font-size: 12px; color: #9AA0AB; margin: 4px 0 14px; font-style: italic; }
.ips-q-actions { display: flex; gap: 10px; flex-wrap: wrap; margin: 18px 0 0; align-items: center; }
.ips-q-link { background: transparent; color: #1F2F36; border: none; padding: 6px 0; font-family: inherit; font-size: 13px; cursor: pointer; }
.ips-q-link:hover { text-decoration: underline; }
.ips-q-skip { font-size: 12px; color: #6B7280; }

/* Result panel */
.ips-q-result-h { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 24px; line-height: 1.25; margin: 0 0 12px; color: #1F2F36; }
.ips-q-result-p { font-size: 14px; line-height: 1.65; color: #1F2F36; margin: 0 0 12px; }
.ips-q-result--zero .ips-q-result-p:last-of-type { font-weight: 500; }

.ips-q-grounding { margin: 18px 0; padding: 14px 16px; background: #FFFFFF; border-left: 3px solid #00BFB2; border-radius: 0 6px 6px 0; }
.ips-q-grounding-h { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 14px; margin: 0 0 8px; color: #1F2F36; }
.ips-q-grounding p { font-size: 13px; line-height: 1.6; color: #1F2F36; margin: 0 0 8px; font-variant-numeric: tabular-nums; }
.ips-q-grounding-note { font-style: italic; color: #3A4255 !important; }

/* Marketing touchpoint 1 card (populated by questionnaire) */
.ips-mkt-card { display: flex; flex-direction: column; gap: 6px; padding: 20px 24px; background: #1F2F36; color: #FFFFFF; border-radius: 12px; text-decoration: none; transition: background 0.2s ease; }
.ips-mkt-card:hover { background: #0F1F26; }
.ips-mkt-card__text { font-family: 'Source Serif Pro', Georgia, serif; font-size: 18px; line-height: 1.35; font-weight: 400; }
.ips-mkt-card__text strong { font-weight: 700; }
.ips-mkt-card__cta { font-family: Poppins, system-ui, sans-serif; font-size: 13px; color: #00BFB2; font-weight: 500; }

/* Override phase-1 page-level warm off-white backgrounds with brand Pebble.
   These selectors target the page-level wrapper sections on the IPS template page,
   not the form-internal subsections. */
.ips-hero, .ips-section, .ips-disclaimer-section { background: #E7E7E7; }

@media (max-width: 640px) {
  .ips-section { padding: 24px 0; }
  .ips-section__title { font-size: 22px; }
  .ips-sub__title { font-size: 16px; }
  .ips-input--number { width: 100%; }
  .ips-input--other { width: 100%; }
  .ips-q-card { padding: 20px 22px; }
  .ips-q-h { font-size: 19px; }
  .ips-q-result-h { font-size: 21px; }
}
`;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  ns.formStyles = { injectStyles };
})();

/**
 * Five-level risk profile prose.
 *
 * Use these texts exactly as written. Level 0's third paragraph is required
 * and is the brand-defining honesty moment — render it verbatim, suppress
 * marketing touchpoint 1.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  ns.questionnaireLookup = Object.freeze({
    // level integer → IPS form risk_level field value
    levelToRiskLevel: {
      0: 'very_low',
      1: 'low',
      2: 'moderate',
      3: 'high',
      4: 'very_high'
    },
    // level integer → IPS form target_volatility field value
    levelToVolatility: {
      0: 'below_5',
      1: '5_75',
      2: '75_10',
      3: '10_15',
      4: 'above_15'
    },
    levels: {
      0: {
        title: 'Very Low Risk',
        paragraphs: [
          'You are an investor who prioritises the safety of your money above all else. Your main goal is to avoid losses at any cost, and you are content with smaller returns if it means your principal is protected.',
          'You prefer extremely stable investments and are uncomfortable with any significant market swings. Your investment strategy is designed to keep annual volatility well below 5%.',
          'Given your profile, we cannot recommend any pfolio portfolios. Instead, you may wish to consider money market funds or short-term government bonds.'
        ]
      },
      1: {
        title: 'Low Risk',
        paragraphs: [
          "You are a cautious investor who prefers safety but can accept minor fluctuations in your portfolio's value. You are willing to tolerate a small amount of risk to achieve slightly better returns than the most conservative options.",
          'Your focus is on steady, reliable growth, and you feel most comfortable with a strategy that maintains annual volatility between 5% and 7.5%.'
        ]
      },
      2: {
        title: 'Moderate Risk',
        paragraphs: [
          'You are a balanced investor who is comfortable with a moderate level of market ups and downs. You understand that some volatility is necessary to achieve better long-term growth, and you have the patience to ride out short-term fluctuations without worry.',
          'You seek a healthy mix of growth and stability, aiming for a portfolio with annual volatility typically between 7.5% and 10%.'
        ]
      },
      3: {
        title: 'High Risk',
        paragraphs: [
          'You are a growth-oriented investor who is willing to accept significant short-term volatility for the potential of higher returns. You have a longer time horizon and can watch your portfolio experience larger swings without making impulsive decisions.',
          'You understand that larger gains come with a higher risk of loss, and you are comfortable with a strategy that sees annual volatility between 10% and 15%.'
        ]
      },
      4: {
        title: 'Very High Risk',
        paragraphs: [
          "You are an aggressive investor who seeks maximum growth and are fully accepting of large, frequent fluctuations in your portfolio's value. You have a high tolerance for risk and understand that substantial losses are a real possibility in pursuit of high rewards.",
          'Your investment approach is speculative and ambitious, with an annual volatility that you expect to be above 15%.'
        ]
      }
    }
  });
})();

/**
 * Risk profile calculation.
 *
 * Computes a five-level risk profile (0 = very low to 4 = very high) from
 * seven inputs: investment horizon, investment objective, savings buffer,
 * investment knowledge, investment experience, stated risk willingness,
 * stated volatility tolerance.
 *
 * Logic mirrors pfolio's risk profiling so users moving between this tool
 * and the platform see consistent results.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  // Option lists. Each entry is [value_token, integer_score].
  const SAVINGS = [
    { value: 'lt_1m', label: 'Less than 1 month', score: 0 },
    { value: '1_3m',  label: '1 to 3 months',     score: 1 },
    { value: '3_6m',  label: '3 to 6 months',     score: 2 },
    { value: '6_12m', label: '6 to 12 months',    score: 3 },
    { value: 'gt_12m', label: 'More than 12 months', score: 4 }
  ];

  const HORIZON = [
    { value: 'lt_1y', label: 'Less than 1 year', score: 0 },
    { value: '1_3y',  label: '1 to 3 years',     score: 1 },
    { value: '3_5y',  label: '3 to 5 years',     score: 2 },
    { value: '5_10y', label: '5 to 10 years',    score: 3 },
    { value: 'gt_10y', label: 'More than 10 years', score: 4 }
  ];

  const OBJECTIVE = [
    { value: 'capital_preservation', label: 'Capital preservation — prioritising safety of principal over returns', score: 0 },
    { value: 'income_generation',    label: 'Income generation — seeking regular income from investments',          score: 2 },
    { value: 'capital_growth',       label: 'Capital growth — aiming to increase the value of your investments',     score: 3 },
    { value: 'speculation',          label: 'Speculation or aggressive growth — taking higher risk for potentially higher returns', score: 4 }
  ];

  const KNOWLEDGE = [
    { value: 'novice',       label: 'Novice — no prior knowledge',     score: 1 },
    { value: 'beginner',     label: 'Beginner — basic understanding',  score: 2 },
    { value: 'intermediate', label: 'Intermediate — moderate understanding', score: 3 },
    { value: 'expert',       label: 'Expert — advanced knowledge',     score: 4 }
  ];

  // The exact list of products. count of selections drives the experience score.
  const EXPERIENCE_PRODUCTS = [
    { value: 'stocks',     label: 'Stocks' },
    { value: 'etfs',       label: 'Exchange-Traded Funds (ETFs)' },
    { value: 'bonds',      label: 'Bonds / Fixed Income Products' },
    { value: 'commodities', label: 'Commodities (e.g. gold, crude oil)' },
    { value: 'currencies', label: 'Currencies / Foreign Exchange' },
    { value: 'crypto',     label: 'Cryptocurrencies' },
    { value: 'futures',    label: 'Futures Contracts' },
    { value: 'complex',    label: 'Complex and Leveraged Products' }
  ];

  const RISK_LEVEL = [
    { value: 'very_low', label: 'Very low — I want to avoid losses, even if returns are small', score: 0 },
    { value: 'low',      label: 'Low — I prefer safety but can accept minor fluctuations',       score: 1 },
    { value: 'moderate', label: 'Moderate — I am comfortable with some ups and downs for better returns', score: 2 },
    { value: 'high',     label: 'High — I can accept significant fluctuations for higher growth potential', score: 3 },
    { value: 'very_high', label: 'Very high — I seek maximum growth and accept large risks of loss', score: 4 }
  ];

  const VOLATILITY = [
    { value: 'below_5',  label: 'Below 5%',     score: 0 },
    { value: '5_75',     label: '5% to 7.5%',   score: 1 },
    { value: '75_10',    label: '7.5% to 10%',  score: 2 },
    { value: '10_15',    label: '10% to 15%',   score: 3 },
    { value: 'above_15', label: 'Above 15%',    score: 4 }
  ];

  function scoreFor(list, value) {
    const item = list.find((o) => o.value === value);
    return item ? item.score : null;
  }

  /**
   * Compute the level (0-4) given an answers object.
   * Inputs must be the value tokens from the constant lists above.
   * `experience` is an array of selected product value tokens.
   *
   * Steps:
   *   1. self-reported floor: min(risk_level, volatility)
   *   2. capacity floor: min(self, savings, horizon)
   *   3. objective forces 0 (preservation) or modulates downward
   *   4. skills modulator: novice + zero experience floors at knowledge,
   *      otherwise (knowledge + experience) / 2 reduces if lower than current
   *   5. clamp to 0-4 and round
   */
  function calculateLevel(answers) {
    const userRisk = scoreFor(RISK_LEVEL, answers.risk_level);
    const userVol = scoreFor(VOLATILITY, answers.volatility);
    const savings = scoreFor(SAVINGS, answers.savings);
    const horizon = scoreFor(HORIZON, answers.horizon);
    const knowledge = scoreFor(KNOWLEDGE, answers.knowledge);
    const objective = scoreFor(OBJECTIVE, answers.objective);

    if ([userRisk, userVol, savings, horizon, knowledge, objective].some((v) => v === null || v === undefined)) {
      return null;
    }

    const experienceCount = Array.isArray(answers.experience) ? answers.experience.length : 0;

    // Step 1: self-reported floor
    let selfReported = Math.min(userRisk, userVol);

    // Step 2: capacity floor
    let calc = Math.min(selfReported, savings, horizon);

    // Step 3: objective
    if (objective === 0) {
      calc = 0;
    } else if (objective < calc) {
      calc = calc - Math.min(Math.abs(calc - objective), 2);
    }

    // Step 4: skills modulator
    if (knowledge === 1 && experienceCount === 0) {
      // Novice + no experience: floor at knowledge level (= 1).
      // This means calc cannot go below 1 here, but is not reduced if already higher.
      calc = Math.max(calc, knowledge);
    } else {
      // experience = min(((count + 2) / total) * 4, 4) — total = 8 products
      const expScore = Math.min(((experienceCount + 2) / EXPERIENCE_PRODUCTS.length) * 4, 4);
      const skills = (knowledge + expScore) / 2;
      if (skills < calc) {
        calc = calc - Math.min(Math.abs(calc - skills), 2);
      }
    }

    // Step 5: round + clamp
    return Math.max(0, Math.min(4, Math.round(calc)));
  }

  /**
   * Direct path: a single volatility band maps straight to a level
   * (band index === level).
   */
  function levelFromVolatility(volatilityValue) {
    return scoreFor(VOLATILITY, volatilityValue);
  }

  /**
   * Map the IPS form's 7-band horizon to the calibrator's 5-band score.
   * Used when prefilling Q1 from existing IPS state.
   */
  function ipsHorizonToQuestionnaire(ipsHorizon) {
    const map = {
      lt_1y: 'lt_1y',
      '1_3y': '1_3y',
      '3_5y': '3_5y',
      '5_10y': '5_10y',
      '10_15y': 'gt_10y',
      '15_25y': 'gt_10y',
      gt_25y: 'gt_10y'
    };
    return map[ipsHorizon] || null;
  }

  ns.questionnaireCalc = {
    calculateLevel,
    levelFromVolatility,
    ipsHorizonToQuestionnaire,
    SAVINGS,
    HORIZON,
    OBJECTIVE,
    KNOWLEDGE,
    EXPERIENCE_PRODUCTS,
    RISK_LEVEL,
    VOLATILITY
  };
})();

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
          class: 'ips-btn ips-btn--apply',
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
          href: '/portfolios',
          class: 'ips-mkt-card'
        }, [
          E('span', { class: 'ips-mkt-card__text', html: `Your risk profile maps to pfolio's <strong>${result.title}</strong> portfolios.` }),
          E('span', { class: 'ips-mkt-card__cta' }, 'Explore them →')
        ]);

    return E('div', { class: 'ips-calibrator ips-q-result' + (result.level === 0 ? ' ips-q-result--zero' : '') }, [
      E('h4', { class: 'ips-q-result-h' }, result.title),
      ...result.paragraphs.map((p) => E('p', { class: 'ips-q-result-p' }, p)),
      renderDrawdownGrounding(result.volBand, store.get().starting_capital, store.get().base_currency || 'USD'),
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

/**
 * Public API surface — window.pfolioIPS.
 *
 * Loaded last in the bundle. Exposes:
 *   - generators (phase 2): generateFullIPSWord, generateFullIPSPDF, generatePolicyCardPDF
 *   - form (phase 3):       mountForm(rootEl), createStore()
 *   - legacy/test:           anna (hardcoded data), utils, wireDownloadButtons(getState)
 *   - autoMount():           mounts form into #ips-form and wires #download-buttons
 *                            against the live form state — for use on the production page.
 */
(function () {
  'use strict';

  const internal = (window._pfolioIPS = window._pfolioIPS || {});

  function inferKindFromLabel(text) {
    const lower = (text || '').toLowerCase();
    if (lower.includes('word')) return 'word';
    if (lower.includes('policy card')) return 'policy-card';
    if (lower.includes('pdf')) return 'pdf';
    return null;
  }

  function wireDownloadButtons(getState) {
    const root = document.getElementById('download-buttons');
    if (!root) {
      console.warn('[pfolioIPS] #download-buttons not found; nothing wired');
      return;
    }
    const buttons = root.querySelectorAll('button.dl-btn, [data-dl-kind]');
    buttons.forEach((btn) => {
      const kind = btn.dataset.dlKind || inferKindFromLabel(btn.textContent);
      if (!kind) return;
      btn.disabled = false;
      btn.style.cursor = 'pointer';
      btn.dataset.originalText = btn.textContent;
      btn.addEventListener('click', async (evt) => {
        evt.preventDefault();
        const data = getState();
        const oldText = btn.dataset.originalText;
        try {
          btn.dataset.busy = 'true';
          btn.textContent = 'Generating…';
          if (kind === 'word') await api.generateFullIPSWord(data);
          else if (kind === 'pdf') await api.generateFullIPSPDF(data);
          else if (kind === 'policy-card') await api.generatePolicyCardPDF(data);
        } catch (err) {
          console.error('[pfolioIPS] generation failed', err);
          alert('Sorry — something went wrong generating that file. Check the console for details.');
        } finally {
          btn.textContent = oldText;
          delete btn.dataset.busy;
        }
      });
    });
  }

  function mountForm(rootEl) {
    const store = internal.formState.createStore();
    internal.form.mount(rootEl, store);
    return store;
  }

  function autoMount() {
    const formEl = document.getElementById('ips-form');
    if (!formEl) {
      console.warn('[pfolioIPS] autoMount: #ips-form not found');
      return null;
    }
    // Strip the page's "loading placeholder" styling (padding, white bg, dashed
    // border, centre-align, grey text). The mounted form supplies its own.
    formEl.classList.remove('ips-embed-placeholder');
    formEl.classList.add('ips-form-host');

    const store = mountForm(formEl);
    wireDownloadButtons(() => store.get());

    // Same cleanup for the download buttons placeholder.
    const dlEl = document.getElementById('download-buttons');
    if (dlEl) {
      dlEl.classList.remove('ips-embed-placeholder');
      dlEl.classList.add('ips-downloads-host');
    }

    // The risk questionnaire is now an inline calibrator inside section 3.1's helper.
    // The standalone #risk-questionnaire placeholder on the page is no longer used —
    // hide it if present so it does not show empty space.
    const qEl = document.getElementById('risk-questionnaire');
    if (qEl) qEl.style.display = 'none';
    const qHeading = document.querySelector('[data-q-heading]');
    if (qHeading) qHeading.style.display = 'none';

    return store;
  }

  const api = {
    // generators
    generateFullIPSWord: internal.generateFullIPSWord,
    generateFullIPSPDF: internal.generateFullIPSPDF,
    generatePolicyCardPDF: internal.generatePolicyCardPDF,
    // form
    mountForm,
    autoMount,
    createStore: internal.formState && internal.formState.createStore,
    // shared
    anna: internal.anna,
    utils: internal.utils,
    wireDownloadButtons,
    // internals exposed for testing
    _internal: internal
  };

  window.pfolioIPS = api;
})();
