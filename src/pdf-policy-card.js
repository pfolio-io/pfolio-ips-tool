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
        .card-doc { font-family: Calibri, Arial, sans-serif; color: #1A2233; line-height: 1.45; font-size: 9.5pt; }
        .card-doc .card-header { margin-bottom: 14pt; }
        .card-doc .card-title { font-family: Cambria, Georgia, serif; font-size: 16pt; font-weight: 700; margin: 0 0 4pt; line-height: 1.2; }
        .card-doc .card-meta { font-size: 9pt; color: #3A4255; margin: 0; }
        .card-doc .card-block { margin: 0 0 9pt; }
        .card-doc .card-block h2 { font-family: Cambria, Georgia, serif; font-size: 10.5pt; font-weight: 700; margin: 0 0 3pt; color: #1A2233; }
        .card-doc .card-block p { margin: 0 0 2pt; }
        .card-doc .card-rule { margin: 16pt 0 10pt; }
        .card-doc .card-rule h2 { font-family: Cambria, Georgia, serif; font-size: 11.5pt; font-weight: 700; margin: 0 0 4pt; }
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
