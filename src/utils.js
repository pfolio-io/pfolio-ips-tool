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
    html2pdf: 'https://unpkg.com/html2pdf.js@0.10.3/dist/html2pdf.bundle.min.js',
    jspdf: 'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js',
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

  async function ensureJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    if (typeof window.jsPDF !== 'undefined') return window.jsPDF;
    await loadScript(CDN.jspdf);
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    if (typeof window.jsPDF !== 'undefined') return window.jsPDF;
    throw new Error('jsPDF failed to load from CDN');
  }

  // ---------- pfolio branding ----------

  const PFOLIO_LOGO_URL = 'https://cdn.prod.website-files.com/60681f344e5efd9d3d0c688e/606ac64809bea4f56f16ee6e_pfolio_logo.svg';
  const PFOLIO_SITE_URL = 'https://pfolio.io';

  // Rasterise the SVG logo to a PNG data URL and report its aspect ratio.
  // Cached on first call so subsequent generations are instant.
  let _logoPromise;
  function loadPfolioLogo() {
    if (_logoPromise) return _logoPromise;
    _logoPromise = (async () => {
      // Fetch the SVG as text so we can blob-render it (same-origin canvas).
      const res = await fetch(PFOLIO_LOGO_URL, { mode: 'cors' });
      if (!res.ok) throw new Error('logo fetch failed: ' + res.status);
      const svgText = await res.text();
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const blobUrl = URL.createObjectURL(blob);
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('logo image failed to decode'));
          img.src = blobUrl;
        });
        // SVG without intrinsic dimensions falls back to a sensible default.
        const w = img.naturalWidth || 480;
        const h = img.naturalHeight || 160;
        // Render at 4× for sharp print output.
        const canvas = document.createElement('canvas');
        canvas.width = w * 4;
        canvas.height = h * 4;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return { dataURL: canvas.toDataURL('image/png'), aspect: w / h };
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    })();
    return _logoPromise;
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
    ensureJsPDF,
    loadPfolioLogo,
    PFOLIO_SITE_URL,
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
