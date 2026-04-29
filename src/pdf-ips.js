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
        .ips-pdf-doc { font-family: Poppins, Calibri, Arial, sans-serif; color: #1A2233; line-height: 1.6; font-size: 11pt; }
        .ips-pdf-doc h1 { font-family: 'Source Serif Pro', Cambria, Georgia, serif; font-size: 22pt; font-weight: 700; margin: 0 0 6pt; line-height: 1.2; }
        .ips-pdf-doc .subtitle { font-size: 13pt; color: #3A4255; margin: 0 0 18pt; }
        .ips-pdf-doc h2 { font-family: 'Source Serif Pro', Cambria, Georgia, serif; font-size: 15pt; font-weight: 700; margin: 18pt 0 8pt; padding-top: 8pt; border-top: 1px solid #E6E2DA; line-height: 1.25; }
        .ips-pdf-doc h3 { font-family: 'Source Serif Pro', Cambria, Georgia, serif; font-size: 12pt; font-weight: 700; margin: 12pt 0 6pt; }
        .ips-pdf-doc p { margin: 0 0 8pt; }
        .ips-pdf-doc .field { margin: 0 0 4pt; }
        .ips-pdf-doc ul { margin: 0 0 8pt 16pt; padding: 0; }
        .ips-pdf-doc li { margin: 0 0 4pt; }
        .ips-pdf-doc .signature { margin-top: 24pt; padding-top: 12pt; border-top: 1px solid #E6E2DA; }
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
