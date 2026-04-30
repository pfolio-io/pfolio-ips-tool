/**
 * PDF IPS generator — generateFullIPSPDF(data).
 *
 * Direct jsPDF text rendering. No html2canvas. A4, 25mm margins.
 * Helvetica throughout (built-in jsPDF font, no embedding required).
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  // Page geometry (mm)
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 25;
  const CONTENT_W = PAGE_W - 2 * MARGIN;
  const BOTTOM = PAGE_H - MARGIN;

  // Point → mm conversion (1pt = 1/72 in, 1in = 25.4mm)
  const PT = 25.4 / 72;

  async function generateFullIPSPDF(data) {
    const u = ns.utils;
    const jsPDF = await u.ensureJsPDF();
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    // Best-effort logo load — if it fails (network/CORS), proceed without it.
    let logo = null;
    try { logo = await u.loadPfolioLogo(); } catch (e) { console.warn('[pdf-ips] logo unavailable', e); }

    let y = MARGIN;

    // pfolio logo, top-right, clickable link to pfolio.io
    if (logo) {
      const logoW = 24;
      const logoH = logoW / logo.aspect;
      const logoX = PAGE_W - MARGIN - logoW;
      const logoY = MARGIN;
      doc.addImage(logo.dataURL, 'PNG', logoX, logoY, logoW, logoH);
      doc.link(logoX, logoY, logoW, logoH, { url: u.PFOLIO_SITE_URL });
      // Push content down so the title clears the logo on first page.
      if (logoH > 0) y = MARGIN + logoH + 4;
    }

    function setFont(style) { doc.setFont('helvetica', style); }
    function setSize(pt) { doc.setFontSize(pt); }
    function setColor(r, g, b) { doc.setTextColor(r, g, b); }
    function lineH(pt, factor) { return pt * PT * (factor || 1.4); }
    function space(pt) { y += pt * PT; }

    function ensureSpace(needed) {
      if (y + needed > BOTTOM) { doc.addPage(); y = MARGIN; }
    }

    function writeText(text, opts) {
      opts = opts || {};
      const fontSize = opts.fontSize || 11;
      const fontStyle = opts.fontStyle || 'normal';
      const color = opts.color || [31, 47, 54]; // Deep Slate #1F2F36
      const lineFactor = opts.lineFactor || 1.4;
      const indent = opts.indent || 0;
      const prefix = opts.prefix || '';

      setFont(fontStyle);
      setSize(fontSize);
      setColor(color[0], color[1], color[2]);

      const fullText = prefix + String(text);
      const maxW = CONTENT_W - indent;
      const lines = doc.splitTextToSize(fullText, maxW);
      const lh = lineH(fontSize, lineFactor);

      for (let i = 0; i < lines.length; i++) {
        ensureSpace(lh);
        doc.text(lines[i], MARGIN + indent, y, { baseline: 'top' });
        y += lh;
      }
    }

    function H1(text) { writeText(text, { fontSize: 22, fontStyle: 'bold', lineFactor: 1.2 }); space(6); }
    function SUB(text) { writeText(text, { fontSize: 13, fontStyle: 'italic', color: [68, 68, 68] }); space(18); }

    function H2(text) {
      space(18);
      ensureSpace(lineH(15) + 4);
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
      space(8);
      writeText(text, { fontSize: 15, fontStyle: 'bold', lineFactor: 1.25 });
      space(8);
    }

    function H3(text) { space(12); writeText(text, { fontSize: 12, fontStyle: 'bold' }); space(6); }
    function P(text) { writeText(text, { fontSize: 11, lineFactor: 1.6 }); space(8); }

    function FIELD(label, value) {
      if (value === '' || value === null || value === undefined) return;
      setSize(11);
      setColor(31, 47, 54); // Deep Slate
      setFont('bold');
      const labelText = label + ': ';
      const labelW = doc.getTextWidth(labelText);
      setFont('normal');
      const valueLines = doc.splitTextToSize(String(value), CONTENT_W - labelW);
      const lh = lineH(11);

      ensureSpace(lh);
      setFont('bold');
      doc.text(labelText, MARGIN, y, { baseline: 'top' });
      setFont('normal');
      doc.text(valueLines[0], MARGIN + labelW, y, { baseline: 'top' });
      y += lh;

      for (let i = 1; i < valueLines.length; i++) {
        ensureSpace(lh);
        doc.text(valueLines[i], MARGIN, y, { baseline: 'top' });
        y += lh;
      }
      space(4);
    }

    function BULLET(text) { writeText(text, { fontSize: 11, prefix: '• ', indent: 5 }); space(4); }

    function FOOT(text) {
      space(24);
      writeText(text, { fontSize: 9, fontStyle: 'italic', color: [102, 102, 102], lineFactor: 1.5 });
    }

    function SIG_RULE() {
      space(24);
      ensureSpace(8);
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
      space(12);
    }

    // ---- Build content ----

    const currency = data.base_currency || 'USD';
    const val = (v) => u.isEmpty(v) ? null : v;
    const moneyOrNull = (v) => u.isEmpty(v) ? null : u.formatMoney(v, currency);

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

    // Title and preamble
    H1('Investment policy statement');
    SUB('A personal contract with your future self.');
    P('This document sets out how you intend to invest, why, and under what rules. It exists for one reason: so that the version of you reading it during a market crash defers to the version of you who wrote it. Markets will give you reasons to deviate. This document is what you check before you do.');
    P('It is a framework, not a portfolio. The policies you commit to here define the boundaries within which any portfolio you hold should operate. Different portfolios can satisfy the same framework; the framework outlives any particular one.');

    // Section 1 — Cover and metadata
    if (val(data.drafted_by) || val(data.date_drafted) || val(data.base_currency) || val(data.co_investor)) {
      H2('1. Cover and metadata');
      if (val(data.drafted_by)) FIELD('Drafted by', data.drafted_by);
      if (val(data.date_drafted)) FIELD('Date drafted', u.formatDate(data.date_drafted));
      if (val(data.base_currency)) FIELD('Base currency', data.base_currency);
      if (val(data.co_investor)) FIELD('Co-investor or household member', data.co_investor);
    }

    // Section 2 — Investment objectives
    {
      const has21 = !!horizon;
      const has22 = objective || moneyOrNull(data.target_value) || val(data.secondary_objectives);
      const has23 = val(data.intended_use);
      const has24 = moneyOrNull(data.starting_capital)
        || (data.ongoing_contributions && (data.ongoing_contributions.period === 'none' || data.ongoing_contributions.amount))
        || onboarding || val(data.onboarding_specify) || val(data.withdrawal_approach);

      if (has21 || has22 || has23 || has24) {
        H2('2. Investment objectives');
        if (has21) { H3('2.1 Investment horizon'); P(horizon); }
        if (has22) {
          H3('2.2 Investment objective');
          if (objective) P(objective);
          if (moneyOrNull(data.target_value)) FIELD('Target portfolio value at horizon', u.formatMoney(data.target_value, currency));
          if (val(data.secondary_objectives)) FIELD('Secondary objectives', data.secondary_objectives);
        }
        if (has23) { H3('2.3 Intended use'); P(data.intended_use); }
        if (has24) {
          H3('2.4 Funding the portfolio');
          if (moneyOrNull(data.starting_capital)) FIELD('Starting capital', u.formatMoney(data.starting_capital, currency));
          if (data.ongoing_contributions) {
            const oc = data.ongoing_contributions;
            if (oc.period === 'none') FIELD('Planned ongoing contributions', 'None');
            else if (oc.amount) {
              const periodLabel = u.PERIOD_LABELS[oc.period] || '';
              FIELD('Planned ongoing contributions', u.formatMoney(oc.amount, currency) + (periodLabel ? ' ' + periodLabel : ''));
            }
          }
          if (onboarding) FIELD('Onboarding approach', onboarding);
          if (val(data.onboarding_specify)) P(data.onboarding_specify);
          if (val(data.withdrawal_approach)) FIELD('Withdrawal approach', data.withdrawal_approach);
        }
      }
    }

    // Section 3 — Risk profile
    {
      const has31 = riskLevel || val(data.risk_level_note);
      const has32 = targetVol || val(data.target_volatility_note);
      const has33 = val(data.abandonment_amount) || val(data.abandonment_pct) || val(data.abandonment_note);

      if (has31 || has32 || has33) {
        H2('3. Risk profile');
        if (has31) {
          H3('3.1 Risk level');
          if (riskLevel) P(riskLevel);
          if (val(data.risk_level_note)) P(data.risk_level_note);
        }
        if (has32) {
          H3('3.2 Target volatility');
          if (targetVol) P(targetVol);
          if (val(data.target_volatility_note)) P(data.target_volatility_note);
        }
        if (has33) {
          H3('3.3 Abandonment threshold');
          if (val(data.abandonment_amount)) FIELD('Loss in money', u.formatMoney(data.abandonment_amount, currency));
          if (val(data.abandonment_pct)) FIELD('As a percentage of portfolio value', data.abandonment_pct + '%');
          if (val(data.abandonment_note)) P(data.abandonment_note);
        }
      }
    }

    // Section 4 — Asset universe
    {
      const has41 = assetTypes || val(data.asset_types_other);
      const has42 = assetClasses || val(data.asset_classes_note);
      const has43 = geography || val(data.geography_regions_in) || val(data.geography_regions_out) || val(data.geography_dev_em_mix);
      const esg = data.esg_screening || {};
      const has44 = (esg.enabled || val(esg.screen)) || val(data.excluded_sectors) || val(data.excluded_instruments) || val(data.currency_hedging);
      const has45 = val(data.max_single_position) || val(data.max_asset_class) || val(data.max_sector);

      if (has41 || has42 || has43 || has44 || has45) {
        H2('4. Asset universe');
        if (has41) {
          H3('4.1 Eligible asset types');
          if (assetTypes) P(assetTypes);
          if (val(data.asset_types_other)) P(data.asset_types_other);
        }
        if (has42) {
          H3('4.2 Eligible asset classes');
          if (assetClasses) P(assetClasses);
          if (val(data.asset_classes_note)) P(data.asset_classes_note);
        }
        if (has43) {
          H3('4.3 Geography');
          if (geography) P(geography);
          if (val(data.geography_regions_in)) FIELD('Regions in scope', data.geography_regions_in);
          if (val(data.geography_regions_out)) FIELD('Regions or countries excluded', data.geography_regions_out);
          if (val(data.geography_dev_em_mix)) FIELD('Developed / emerging mix', data.geography_dev_em_mix);
        }
        if (has44) {
          H3('4.4 Filters and exclusions');
          if (esg.enabled || val(esg.screen)) FIELD('ESG screening', esg.screen || (esg.enabled ? 'Yes' : 'No'));
          if (val(data.excluded_sectors)) FIELD('Excluded sectors', data.excluded_sectors);
          if (val(data.excluded_instruments)) FIELD('Excluded instruments', data.excluded_instruments);
          if (val(data.currency_hedging)) FIELD('Currency hedging policy', data.currency_hedging);
        }
        if (has45) {
          H3('4.5 Concentration limits');
          if (val(data.max_single_position)) FIELD('Maximum single position weight', data.max_single_position + '%');
          if (val(data.max_asset_class)) FIELD('Maximum exposure to any single asset class', data.max_asset_class + '%');
          if (val(data.max_sector)) FIELD('Maximum exposure to any single sector', data.max_sector + '%');
        }
      }
    }

    // Section 5 — Portfolio management
    {
      const has51 = style || val(data.management_style_note);
      const has52 = cadence || val(data.drift_threshold);
      const has53 = val(data.tactical_overrides);

      if (has51 || has52 || has53) {
        H2('5. Portfolio management');
        if (has51) {
          H3('5.1 Management style');
          if (style) P(style);
          if (val(data.management_style_note)) P(data.management_style_note);
        }
        if (has52) {
          H3('5.2 Cadence');
          if (cadence) P(cadence);
          if (val(data.drift_threshold)) FIELD('Drift threshold', data.drift_threshold);
        }
        if (has53) {
          H3('5.3 Tactical overrides');
          P(data.tactical_overrides);
        }
      }
    }

    // Section 6 — Constraints
    {
      const has61 = val(data.liquidity_reserve);
      const has62 = val(data.tax_residence) || val(data.account_types) || val(data.tax_considerations);

      if (has61 || has62) {
        H2('6. Constraints');
        if (has61) { H3('6.1 Liquidity reserve'); P(data.liquidity_reserve); }
        if (has62) {
          H3('6.2 Jurisdictional and tax notes');
          if (val(data.tax_residence)) FIELD('Country of tax residence', data.tax_residence);
          if (val(data.account_types)) FIELD('Account types in use', data.account_types);
          if (val(data.tax_considerations)) FIELD('Tax considerations', data.tax_considerations);
        }
      }
    }

    // Section 7 — Review and revision (always renders)
    H2('7. Review and revision');
    if (val(data.annual_review_date)) {
      H3('7.1 Review schedule');
      FIELD('Annual review date', data.annual_review_date);
    }
    if (val(data.personal_benchmark)) {
      H3('7.2 Personal benchmark');
      P(data.personal_benchmark);
    }
    if (Array.isArray(data.life_events) && data.life_events.length) {
      H3('7.3 Triggering life events');
      P('The following life events trigger an off-cycle review:');
      for (const e of data.life_events) BULLET(e);
    }
    H3('7.4 Revision vs deviation');
    for (const p of u.SECTION_7_4_BOILERPLATE) P(p);

    // Signature
    SIG_RULE();
    P('By signing below, I commit to following this document until I revise it under the rules set out in section 7.');
    if (val(data.signature)) FIELD('Signature', data.signature);
    if (val(data.signature_date)) FIELD('Date', u.formatDate(data.signature_date));

    // Footer disclaimer
    FOOT(u.FOOTER_DISCLAIMER);

    // Save
    const filename = u.buildFilename(data.drafted_by, 'ips', 'pdf');
    doc.save(filename);
    u.fireDownloadComplete('pdf');
  }

  ns.generateFullIPSPDF = generateFullIPSPDF;
})();
