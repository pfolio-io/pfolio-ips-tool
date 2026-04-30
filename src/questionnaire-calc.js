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
    { value: 'capital_preservation', label: 'Capital preservation—prioritising safety of principal over returns', score: 0 },
    { value: 'income_generation',    label: 'Income generation—seeking regular income from investments',          score: 2 },
    { value: 'capital_growth',       label: 'Capital growth—aiming to increase the value of your investments',     score: 3 },
    { value: 'speculation',          label: 'Speculation or aggressive growth—taking higher risk for potentially higher returns', score: 4 }
  ];

  const KNOWLEDGE = [
    { value: 'novice',       label: 'Novice—no prior knowledge',     score: 1 },
    { value: 'beginner',     label: 'Beginner—basic understanding',  score: 2 },
    { value: 'intermediate', label: 'Intermediate—moderate understanding', score: 3 },
    { value: 'expert',       label: 'Expert—advanced knowledge',     score: 4 }
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
    { value: 'very_low', label: 'Very low—I want to avoid losses, even if returns are small', score: 0 },
    { value: 'low',      label: 'Low—I prefer safety but can accept minor fluctuations',       score: 1 },
    { value: 'moderate', label: 'Moderate—I am comfortable with some ups and downs for better returns', score: 2 },
    { value: 'high',     label: 'High—I can accept significant fluctuations for higher growth potential', score: 3 },
    { value: 'very_high', label: 'Very high—I seek maximum growth and accept large risks of loss', score: 4 }
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
