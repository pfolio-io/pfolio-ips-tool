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
