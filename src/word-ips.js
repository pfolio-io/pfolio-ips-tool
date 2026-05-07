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
    const TEXT_COLOR = '1F2F36'; // Deep Slate — pfolio body color

    // ---------- Helpers ----------

    function p(text, opts = {}) {
      const runs = Array.isArray(text)
        ? text.map((t) => (typeof t === 'string' ? new TextRun({ text: t, font: BODY_FONT, size: opts.size || 22, color: TEXT_COLOR }) : t))
        : [new TextRun({ text: text || '', font: BODY_FONT, size: opts.size || 22, italics: !!opts.italics, bold: !!opts.bold, color: TEXT_COLOR })];
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
            bold: true,
            color: TEXT_COLOR
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
          new TextRun({ text: `${label}: `, font: BODY_FONT, size: 22, bold: true, color: TEXT_COLOR }),
          new TextRun({ text: value, font: BODY_FONT, size: 22, color: TEXT_COLOR })
        ],
        spacing: { after: 120 }
      });
    }

    function bulletLine(text) {
      return new Paragraph({
        children: [new TextRun({ text, font: BODY_FONT, size: 22, color: TEXT_COLOR })],
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
      const alreadyFunded = data.funding_status === 'already_funded';
      if (alreadyFunded) {
        if (moneyOrNull(data.current_portfolio_value)) sub24Block.push(fieldLine('Current portfolio value', u.formatMoney(data.current_portfolio_value, currency)));
      } else {
        if (moneyOrNull(data.starting_capital)) sub24Block.push(fieldLine('Starting capital', u.formatMoney(data.starting_capital, currency)));
      }
      if (data.ongoing_contributions && (data.ongoing_contributions.amount || data.ongoing_contributions.period)) {
        const oc = data.ongoing_contributions;
        if (oc.period === 'none' || (!oc.amount && !oc.period)) {
          sub24Block.push(fieldLine('Planned ongoing contributions', 'None'));
        } else if (oc.amount) {
          const periodLabel = u.PERIOD_LABELS[oc.period] || '';
          sub24Block.push(fieldLine('Planned ongoing contributions', `${u.formatMoney(oc.amount, currency)}${periodLabel ? ' ' + periodLabel : ''}`));
        }
      }
      if (!alreadyFunded) {
        if (onboarding) sub24Block.push(fieldLine('Onboarding approach', onboarding));
        if (val(data.onboarding_specify)) sub24Block.push(p(data.onboarding_specify));
      }
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
