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
