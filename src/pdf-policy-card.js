/**
 * Policy card PDF generator — generatePolicyCardPDF(data).
 *
 * Single A4 page, 18mm top/bottom, 20mm left/right margins.
 * First-person commitment narrative — the document the user checks before acting on a market move.
 * Direct jsPDF text rendering (Helvetica).
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  const PAGE_W = 210;
  const MARGIN_X = 20;
  const MARGIN_Y = 18;
  const CONTENT_W = PAGE_W - 2 * MARGIN_X;
  const PT = 25.4 / 72;

  function firstSentence(text) {
    if (!text) return text;
    const m = String(text).match(/^([^.!?]*[.!?])/);
    const head = m ? m[1] : String(text);
    return head.trim().replace(/[.!?]+$/, '');
  }

  function lowerFirst(s) {
    if (!s) return s;
    return s.charAt(0).toLowerCase() + s.slice(1);
  }

  function joinList(items) {
    if (!items || !items.length) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }

  // Geography label maps to a phrase that fits the sentence "...in [phrase]".
  const GEO_PHRASES = {
    global: 'global markets',
    developed: 'developed markets only',
    custom: 'a custom-defined geography'
  };

  // Onboarding label maps to a phrase that fits "...deployed [phrase]".
  const ONBOARDING_PHRASES = {
    lump_sum: 'as a lump sum',
    phased: 'in phased tranches',
    hybrid: 'in a hybrid of immediate and phased deployment'
  };

  function buildPolicyCardData(data) {
    const u = ns.utils;
    const currency = data.base_currency || 'USD';

    const name = data.drafted_by || '';
    const draftedDate = u.formatDate(data.date_drafted);
    // annual_review_date is a partial date ("12 March" — no year), so use the raw
    // string. formatDate() would mis-parse it via JS's Date fallback (year 2001).
    const reviewDate = data.annual_review_date || '';

    // Purpose — verbatim intended_use, or fallback
    const purpose = u.isEmpty(data.intended_use)
      ? 'The purpose of this portfolio has not yet been recorded.'
      : data.intended_use;

    // Horizon and capital — constructed sentence
    const horizonLabel = u.labelFor(u.HORIZON_LABELS, data.horizon);
    const horizonPhrase = horizonLabel ? lowerFirst(horizonLabel) : 'an unspecified horizon';

    const startingCapital = u.isEmpty(data.starting_capital)
      ? 'an unspecified amount'
      : u.formatMoney(data.starting_capital, currency);

    let contribPhrase = '';
    if (data.ongoing_contributions) {
      const oc = data.ongoing_contributions;
      if (oc.period === 'none') contribPhrase = ' with no ongoing contributions';
      else if (oc.amount) {
        const periodLabel = u.PERIOD_LABELS[oc.period] || '';
        contribPhrase = ' and adding ' + u.formatMoney(oc.amount, currency) + (periodLabel ? ' ' + periodLabel : '');
      }
    }

    let onboardingSentence = '';
    if (data.onboarding_approach) {
      const phrase = ONBOARDING_PHRASES[data.onboarding_approach] || '';
      if (phrase) {
        onboardingSentence = ' The starting capital is deployed ' + phrase + '.';
        if (!u.isEmpty(data.onboarding_specify)) onboardingSentence += ' ' + data.onboarding_specify;
      }
    }

    const horizonAndCapital = 'I am investing over ' + horizonPhrase
      + ', starting with ' + startingCapital + contribPhrase + '.'
      + onboardingSentence;

    // Risk — three paragraphs
    const riskLevelLabel = u.labelFor(u.RISK_LEVEL_LABELS, data.risk_level);
    let riskPara1 = riskLevelLabel
      ? 'I accept a ' + lowerFirst(riskLevelLabel) + ' risk level.'
      : 'My risk level has not yet been recorded.';
    if (!u.isEmpty(data.risk_level_note)) riskPara1 += ' ' + data.risk_level_note;

    const volLabel = u.labelFor(u.VOLATILITY_LABELS, data.target_volatility);
    let riskPara2 = volLabel
      ? 'I expect annual volatility of ' + lowerFirst(volLabel) + '.'
      : 'My target volatility has not yet been recorded.';
    if (!u.isEmpty(data.target_volatility_note)) riskPara2 += ' ' + data.target_volatility_note;

    let abandonmentPara;
    if (!u.isEmpty(data.abandonment_amount) || !u.isEmpty(data.abandonment_pct)) {
      const parts = [];
      if (!u.isEmpty(data.abandonment_amount)) parts.push(u.formatMoney(data.abandonment_amount, currency));
      if (!u.isEmpty(data.abandonment_pct)) parts.push(data.abandonment_pct + '%');
      abandonmentPara = 'My abandonment threshold is ' + parts.join(' or ') + '.';
      if (!u.isEmpty(data.abandonment_note)) abandonmentPara += ' ' + data.abandonment_note;
    } else if (!u.isEmpty(data.abandonment_note)) {
      // User wrote a free-form note explaining their thinking — use it verbatim,
      // skip the boilerplate so the two don't say the same thing twice.
      abandonmentPara = data.abandonment_note;
    } else {
      abandonmentPara = 'My abandonment threshold is to be set at next review.';
    }

    // Universe
    const types = data.asset_types && data.asset_types.length
      ? joinList(data.asset_types.map((k) => u.ASSET_TYPE_LABELS[k] || k))
      : 'unspecified instruments';
    const classes = data.asset_classes && data.asset_classes.length
      ? lowerFirst(joinList(data.asset_classes.map((k) => u.ASSET_CLASS_LABELS[k] || k)))
      : 'unspecified asset classes';
    const geoPhrase = GEO_PHRASES[data.geography] || 'unspecified geographies';

    let universePara = 'I use ' + types + ' as my instruments, allocated across ' + classes + ', in ' + geoPhrase + '.';

    const exclusionBits = [];
    const esg = data.esg_screening || {};
    if (esg.screen) exclusionBits.push(esg.screen);
    if (data.excluded_sectors) exclusionBits.push(data.excluded_sectors);
    if (data.excluded_instruments) exclusionBits.push(data.excluded_instruments);
    universePara += exclusionBits.length
      ? ' Exclusions: ' + exclusionBits.join('; ') + '.'
      : ' No exclusions.';

    // Management
    const styleLabel = u.labelFor(u.STYLE_LABELS, data.management_style);
    const cadenceLabel = u.labelFor(u.CADENCE_LABELS, data.cadence);
    let managementPara;
    if (styleLabel && cadenceLabel) {
      managementPara = styleLabel + ' approach, rebalancing ' + lowerFirst(cadenceLabel) + '.';
    } else if (styleLabel) {
      managementPara = styleLabel + ' approach.';
    } else {
      managementPara = 'Management approach not yet recorded.';
    }
    const tacticalPhrase = u.isEmpty(data.tactical_overrides)
      ? 'never'
      : lowerFirst(firstSentence(data.tactical_overrides));
    managementPara += ' Tactical overrides: ' + tacticalPhrase + '.';

    // Liquidity reserve — first sentence only (the full prose may be long)
    const liquidityPara = u.isEmpty(data.liquidity_reserve)
      ? 'Liquidity reserve not yet recorded.'
      : firstSentence(data.liquidity_reserve) + '.';

    return {
      name, draftedDate, reviewDate,
      purpose,
      horizonAndCapital,
      riskPara1, riskPara2, abandonmentPara,
      universePara,
      managementPara,
      liquidityPara,
      rule: u.POLICY_CARD_RULE,
      footer: u.POLICY_CARD_FOOTER.replace('[DATE]', draftedDate || '(date not specified)')
    };
  }

  async function generatePolicyCardPDF(data) {
    const u = ns.utils;
    const jsPDF = await u.ensureJsPDF();
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    // Best-effort logo load — if it fails (network/CORS), proceed without it.
    let logo = null;
    try { logo = await u.loadPfolioLogo(); } catch (e) { console.warn('[policy-card] logo unavailable', e); }

    const v = buildPolicyCardData(data);

    let y = MARGIN_Y;

    // pfolio logo, top-right, clickable link to pfolio.io
    if (logo) {
      const logoW = 22;
      const logoH = logoW / logo.aspect;
      const logoX = PAGE_W - MARGIN_X - logoW;
      const logoY = MARGIN_Y;
      doc.addImage(logo.dataURL, 'PNG', logoX, logoY, logoW, logoH);
      doc.link(logoX, logoY, logoW, logoH, { url: u.PFOLIO_SITE_URL });
      // Push content down so the title clears the logo.
      if (logoH > 0) y = MARGIN_Y + logoH + 4;
    }

    function setFont(style) { doc.setFont('helvetica', style); }
    function setSize(pt) { doc.setFontSize(pt); }
    function setColor(r, g, b) { doc.setTextColor(r, g, b); }
    function lineH(pt, factor) { return pt * PT * (factor || 1.4); }
    function space(pt) { y += pt * PT; }

    function writeText(text, opts) {
      opts = opts || {};
      const fontSize = opts.fontSize || 11;
      const fontStyle = opts.fontStyle || 'normal';
      const color = opts.color || [31, 47, 54]; // Deep Slate #1F2F36
      const lineFactor = opts.lineFactor || 1.4;

      setFont(fontStyle);
      setSize(fontSize);
      setColor(color[0], color[1], color[2]);

      const lines = doc.splitTextToSize(String(text), CONTENT_W);
      const lh = lineH(fontSize, lineFactor);
      for (let i = 0; i < lines.length; i++) {
        doc.text(lines[i], MARGIN_X, y, { baseline: 'top' });
        y += lh;
      }
    }

    function block(heading, paragraphs) {
      writeText(heading, { fontSize: 11, fontStyle: 'bold' });
      space(2);
      paragraphs.forEach((p, i) => {
        writeText(p, { fontSize: 10.5, lineFactor: 1.45 });
        if (i < paragraphs.length - 1) space(3);
      });
      space(7);
    }

    // Title
    const titleText = v.name ? v.name + '—investment policy' : 'Investment policy';
    writeText(titleText, { fontSize: 18, fontStyle: 'bold', lineFactor: 1.2 });
    space(3);

    // Meta
    const metaText = 'Drafted ' + (v.draftedDate || '(not specified)')
      + ' · Next review ' + (v.reviewDate || '(not specified)');
    writeText(metaText, { fontSize: 9, fontStyle: 'italic', color: [68, 68, 68] });
    space(11);

    block('Purpose', [v.purpose]);
    block('Horizon and capital', [v.horizonAndCapital]);
    block('Risk', [v.riskPara1, v.riskPara2, v.abandonmentPara]);
    block('Universe', [v.universePara]);
    block('Management', [v.managementPara]);
    block('Liquidity reserve', [v.liquidityPara]);

    // The rule — visually anchored: divider line above + slightly larger heading
    space(4);
    doc.setDrawColor(31, 47, 54); // Deep Slate
    doc.setLineWidth(0.4);
    doc.line(MARGIN_X, y, MARGIN_X + CONTENT_W, y);
    space(7);
    writeText('The rule, when markets move', { fontSize: 13, fontStyle: 'bold' });
    space(4);
    writeText(v.rule, { fontSize: 11, lineFactor: 1.55 });

    // Footer
    space(14);
    writeText(v.footer, { fontSize: 8, fontStyle: 'italic', color: [102, 102, 102], lineFactor: 1.4 });

    const filename = u.buildFilename(data.drafted_by, 'policy-card', 'pdf');
    doc.save(filename);
    u.fireDownloadComplete('policy-card');
  }

  ns.generatePolicyCardPDF = generatePolicyCardPDF;
})();
