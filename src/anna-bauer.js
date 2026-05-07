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
    funding_status: 'not_funded',
    starting_capital: 45000,
    current_portfolio_value: null,
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
