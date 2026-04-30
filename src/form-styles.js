/**
 * Form CSS — injected as a <style> tag on first mount.
 * Using neutral classnames prefixed `ips-` to avoid clashing with Webflow's
 * existing global styles. Brand fonts inherit from the page (Source Serif Pro
 * for headings, Poppins for body) on the production page.
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});
  const STYLE_ID = 'pfolio-ips-form-styles';

  const CSS = `
/* Override the page's "loading placeholder" styling once the form is mounted —
   strip padding, white bg, dashed border, centre alignment so the live tool
   sits edge-to-edge inside the host container. */
.ips-form-host, .ips-downloads-host { background: transparent !important; padding: 0 !important; border: none !important; text-align: left !important; color: inherit !important; min-height: 0 !important; }

.ips-form-root { font-family: Poppins, system-ui, sans-serif; color: #1F2F36; line-height: 1.55; accent-color: #1F2F36; background: transparent; padding: 0; margin: 0; }
.ips-form-root * { box-sizing: border-box; }
.ips-form-root input[type="radio"], .ips-form-root input[type="checkbox"] { accent-color: #1F2F36; }

.ips-section { padding: 32px 0; border-top: 1px solid #CED4DA; }
.ips-section:first-child { border-top: none; padding-top: 0; }
.ips-section__header { margin: 0 0 8px; }
.ips-section__title { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 24px; line-height: 1.25; color: #1F2F36; margin: 0; letter-spacing: -0.005em; }
.ips-section__intro { font-size: 14px; line-height: 1.6; color: #6B7280; margin: 4px 0 16px; }

.ips-sub { margin: 24px 0; padding: 0; }
.ips-sub__header { margin: 0 0 8px; }
.ips-sub__title { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 17px; line-height: 1.3; color: #1F2F36; margin: 0; }
.ips-sub--advanced { padding: 0; }

.ips-field { margin: 14px 0; }
.ips-field__label { display: block; font-size: 14px; font-weight: 500; color: #1F2F36; margin: 0 0 6px; line-height: 1.45; }
.ips-field__sublabel { display: block; font-size: 13px; font-weight: 400; color: #6B7280; margin: 0 0 4px; }
.ips-field__guidance { font-size: 12px; line-height: 1.55; color: #9AA0AB; margin: 4px 0 0; font-style: italic; }

.ips-input, .ips-textarea, .ips-select { width: 100%; padding: 9px 12px; border: 1px solid #CED4DA; border-radius: 6px; font: inherit; font-size: 14px; color: #1F2F36; background: #FFFFFF; transition: border-color 0.15s ease; }
.ips-input { max-width: 480px; }
.ips-select { max-width: 480px; }
.ips-input:focus, .ips-textarea:focus, .ips-select:focus { outline: none; border-color: #264653; box-shadow: 0 0 0 0.25rem rgba(38,70,83,0.25); }
.ips-textarea { resize: vertical; min-height: 60px; max-width: 600px; line-height: 1.55; font-family: inherit; }

.ips-input--number { width: 140px; min-width: 0; }
.ips-input-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ips-input-row .ips-select { width: auto; max-width: 160px; min-width: 120px; }
.ips-input-prefix, .ips-input-suffix { font-size: 13px; color: #6B7280; font-variant-numeric: tabular-nums; }
.ips-input-prefix { padding-right: 2px; }
.ips-input--other { width: 220px; }

/* Per-field width overrides */
.ips-form-root [data-field="intended_use"] .ips-textarea,
.ips-form-root [data-field="onboarding_specify"] .ips-input,
.ips-form-root [data-field="liquidity_reserve"] .ips-input { max-width: none; }
.ips-form-root [data-field="target_volatility"] .ips-select { max-width: 280px; }

.ips-radios { display: flex; flex-direction: column; gap: 2px; }
.ips-radios--inline { flex-direction: row; gap: 16px; flex-wrap: wrap; }
.ips-radio { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; padding: 1px 0; }
.ips-radio input { margin-top: 3px; }
.ips-radio__label { font-size: 14px; color: #1F2F36; line-height: 1.5; }

.ips-rich-radios { display: flex; flex-direction: column; gap: 8px; }
.ips-rich-radio { display: flex; gap: 12px; padding: 14px 16px; border: 1px solid #CED4DA; border-radius: 8px; cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease; align-items: flex-start; background: rgba(255,255,255,0.5); }
.ips-rich-radio:hover { border-color: #264653; background: rgba(255,255,255,0.75); }
.ips-rich-radio.is-checked { border-color: #264653; border-width: 2px; padding: 13px 15px; background: #FFFFFF; }
.ips-rich-radio__input { margin-top: 3px; }
.ips-rich-radio__body { display: flex; flex-direction: column; gap: 3px; }
.ips-rich-radio__title { font-size: 14px; font-weight: 600; color: #1F2F36; }
.ips-rich-radio__desc { font-size: 13px; color: #3A4255; line-height: 1.55; }
.ips-rich-radio__example { font-size: 12px; color: #6B7280; font-style: italic; line-height: 1.5; }

.ips-checks { display: flex; flex-direction: column; gap: 2px; }
.ips-check { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; padding: 1px 0; }
.ips-check input { margin-top: 3px; }
.ips-check__label { font-size: 14px; color: #1F2F36; line-height: 1.5; }
.ips-check-with-other { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.ips-check-with-other .ips-check { flex-shrink: 0; }

.ips-toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #6B7280; cursor: pointer; }
.ips-toggle__label { user-select: none; }

.ips-two-numbers { display: flex; gap: 12px; flex-wrap: wrap; }
.ips-two-numbers__item { display: flex; flex-direction: column; gap: 4px; }

.ips-editable-list { display: flex; flex-direction: column; gap: 6px; }
.ips-editable-row { display: flex; gap: 6px; }
.ips-editable-row .ips-input { flex: 1; }

.ips-btn { font-family: inherit; font-size: 13px; padding: 7px 14px; border-radius: 6px; cursor: pointer; transition: background 0.15s ease, border-color 0.15s ease; }
.ips-btn--ghost { background: transparent; color: #6B7280; border: 1px solid #CED4DA; }
.ips-btn--ghost:hover { border-color: #1F2F36; color: #1F2F36; }
.ips-btn--apply { background: #264653; color: #FFFFFF; border: 1px solid #264653; font-weight: 500; }
.ips-btn--apply:hover { background: #1B3640; border-color: #1B3640; }
.ips-btn--outline { background: transparent; color: #1F2F36; border: 1px solid #264653; font-weight: 500; }
.ips-btn--outline:hover { background: #264653; color: #FFFFFF; }
.ips-btn--add { align-self: flex-start; margin-top: 4px; }

.ips-advanced-toggle { background: transparent; color: #1F2F36; border: none; padding: 8px 0; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; display: block; text-align: left; }
.ips-advanced-toggle:hover { text-decoration: underline; }
.ips-advanced-toggle.is-open { color: #1F2F36; }

.ips-helper, .ips-advanced-detail { margin: 8px 0 16px; padding: 14px 16px; background: #FFFFFF; border-left: 3px solid #00BFB2; border-radius: 0 6px 6px 0; }
.ips-advanced-detail .ips-field:first-child { margin-top: 0; }
.ips-advanced-detail .ips-field:last-child { margin-bottom: 0; }
.ips-helper-toggle { background: transparent; color: #1F2F36; border: none; padding: 6px 0; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; display: block; text-align: left; }
.ips-helper-toggle:hover { text-decoration: underline; }
.ips-helper__intro { font-size: 13px; color: #6B7280; margin: 8px 0 12px; line-height: 1.55; }
.ips-helper__preamble { font-size: 13px; color: #3A4255; margin: 8px 0 12px; line-height: 1.6; }
.ips-helper__footnote { font-size: 12px; color: #9AA0AB; margin: 8px 0 0; font-style: italic; }
.ips-helper__advisory { margin: 12px 0 0; padding: 10px 14px; background: #FFFFFF; border-radius: 6px; }
.ips-helper__advisory p { font-size: 13px; color: #1F2F36; margin: 0; line-height: 1.55; }
.ips-helper__body { font-size: 13px; line-height: 1.65; color: #1F2F36; }
.ips-helper__body p { margin: 8px 0; }
.ips-helper__body em { font-style: italic; color: #1F2F36; }
.ips-helper__body strong { font-weight: 600; }
.ips-helper__body ul { margin: 8px 0 12px 18px; padding: 0; }
.ips-helper__body li { margin: 4px 0; line-height: 1.6; }
.ips-helper__body .ips-helper__h { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 14px; line-height: 1.3; margin: 16px 0 6px; color: #1F2F36; }
.ips-helper__body p:first-child { margin-top: 0; }

.ips-suggestion { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 12px 0 0; padding: 10px 14px; background: #FFFFFF; border-left: 3px solid #00BFB2; border-radius: 0 6px 6px 0; }
.ips-suggestion__text { font-size: 13px; color: #1F2F36; line-height: 1.5; flex: 1; min-width: 240px; }

.ips-drawdown { margin: 16px 0 0; padding: 16px; background: #FFFFFF; border: 1px solid #CED4DA; border-radius: 8px; }
.ips-drawdown__intro { font-size: 13px; color: #3A4255; margin: 0 0 10px; line-height: 1.55; }
.ips-drawdown__list { list-style: none; padding: 0; margin: 0 0 14px; }
.ips-drawdown__row { font-size: 13px; line-height: 1.55; color: #1F2F36; padding: 5px 0; border-bottom: 1px dashed #CED4DA; font-variant-numeric: tabular-nums; }
.ips-drawdown__row:last-child { border-bottom: none; }
.ips-drawdown__post { font-size: 13px; color: #3A4255; line-height: 1.6; margin: 14px 0; }
.ips-drawdown__anchors-intro { font-size: 13px; color: #3A4255; margin: 14px 0 6px; }
.ips-drawdown__anchors { list-style: disc inside; padding: 0 0 0 6px; margin: 0 0 8px; font-size: 13px; line-height: 1.55; color: #1F2F36; }
.ips-drawdown__anchors-foot { font-size: 12px; color: #6B7280; margin: 8px 0 0; line-height: 1.55; font-style: italic; }

.ips-boilerplate { padding: 12px 16px; background: #FFFFFF; border-radius: 6px; }
.ips-boilerplate__p { font-size: 13px; color: #1F2F36; line-height: 1.6; margin: 0 0 10px; }
.ips-boilerplate__p:last-child { margin-bottom: 0; }

.ips-storage-warning { margin: 0 0 18px; padding: 10px 14px; background: #FFFFFF; border-left: 3px solid #EF6F6C; font-size: 13px; color: #1F2F36; border-radius: 0 6px 6px 0; }
.ips-reset-banner { display: flex; justify-content: flex-end; margin: 0 0 14px; }
.ips-privacy-note { margin: 0 0 18px; padding: 10px 14px; background: #FFFFFF; border-left: 3px solid #00BFB2; border-radius: 0 6px 6px 0; }
.ips-privacy-note p { font-size: 13px; line-height: 1.55; color: #1F2F36; margin: 0; }
.ips-privacy-note strong { font-weight: 600; }

/* Inline calibrator inside section 3.1 helper */
.ips-calibrator { padding: 0; }
.ips-calibrator__summary { font-size: 12px; color: #6B7280; margin: 0 0 12px; padding: 8px 12px; background: #FFFFFF; border-radius: 6px; line-height: 1.5; }
.ips-calibrator__summary strong { font-weight: 600; color: #1F2F36; }
.ips-calibrator__h { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 15px; line-height: 1.3; margin: 6px 0 6px; color: #1F2F36; }
.ips-calibrator--blocked { background: #FFFFFF; padding: 14px 16px; border-radius: 6px; }
.ips-calibrator__blocker { font-size: 13px; color: #1F2F36; margin: 0 0 10px; line-height: 1.55; }
.ips-helper__cta { margin: 16px 0 0; padding-top: 12px; border-top: 1px dashed #CED4DA; display: flex; }

/* Questionnaire widget (also reused by calibrator inline) */
.ips-q-card { font-family: Poppins, system-ui, sans-serif; color: #1F2F36; line-height: 1.55; padding: 28px 32px; background: #FFFFFF; border: 1px solid #CED4DA; border-radius: 12px; accent-color: #1F2F36; }
.ips-q-card * { box-sizing: border-box; }
.ips-q-h { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 22px; line-height: 1.25; margin: 0 0 6px; color: #1F2F36; }
.ips-q-lede { font-size: 14px; color: #3A4255; margin: 0 0 20px; line-height: 1.6; }
.ips-q-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6B7280; margin: 0 0 14px; }
.ips-q-label { display: block; font-size: 15px; font-weight: 500; color: #1F2F36; margin: 6px 0 14px; line-height: 1.5; }
.ips-q-options { display: flex; flex-direction: column; gap: 8px; margin: 0 0 18px; }
.ips-q-option { text-align: left; padding: 12px 14px; background: rgba(255,255,255,0.5); border: 1px solid #CED4DA; border-radius: 8px; font: inherit; font-size: 14px; color: #1F2F36; cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease; }
.ips-q-option:hover { border-color: #264653; background: rgba(255,255,255,0.75); }
.ips-q-option.is-selected { border-color: #264653; border-width: 2px; padding: 11px 13px; background: #FFFFFF; font-weight: 500; }
.ips-q-checks { display: flex; flex-direction: column; gap: 6px; margin: 0 0 12px; }
.ips-q-check { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.5); border: 1px solid #CED4DA; border-radius: 8px; cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease; font-size: 14px; }
.ips-q-check:hover { background: rgba(255,255,255,0.75); }
.ips-q-check input { margin-top: 3px; }
.ips-q-check.is-selected { border-color: #264653; border-width: 2px; padding: 9px 13px; background: #FFFFFF; }
.ips-q-hint { font-size: 12px; color: #9AA0AB; margin: 4px 0 14px; font-style: italic; }
.ips-q-actions { display: flex; gap: 10px; flex-wrap: wrap; margin: 18px 0 0; align-items: center; }
.ips-q-link { background: transparent; color: #1F2F36; border: none; padding: 6px 0; font-family: inherit; font-size: 13px; cursor: pointer; }
.ips-q-link:hover { text-decoration: underline; }
.ips-q-skip { font-size: 12px; color: #6B7280; }

/* Result panel */
.ips-q-result-h { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 24px; line-height: 1.25; margin: 0 0 12px; color: #1F2F36; }
.ips-q-result-p { font-size: 14px; line-height: 1.65; color: #1F2F36; margin: 0 0 12px; }
.ips-q-result--zero .ips-q-result-p:last-of-type { font-weight: 500; }

.ips-q-grounding { margin: 18px 0; padding: 14px 16px; background: #FFFFFF; border-left: 3px solid #00BFB2; border-radius: 0 6px 6px 0; }
.ips-q-grounding-h { font-family: 'Source Serif Pro', Georgia, serif; font-weight: 700; font-size: 14px; margin: 0 0 8px; color: #1F2F36; }
.ips-q-grounding p { font-size: 13px; line-height: 1.6; color: #1F2F36; margin: 0 0 8px; font-variant-numeric: tabular-nums; }
.ips-q-grounding-note { font-style: italic; color: #3A4255 !important; }

/* Marketing touchpoint 1 card (populated by questionnaire) */
.ips-mkt-card { display: flex; flex-direction: column; gap: 6px; padding: 20px 24px; background: #264653; color: #FFFFFF; border-radius: 12px; text-decoration: none; transition: background 0.2s ease; }
.ips-mkt-card:hover { background: #1B3640; }
.ips-mkt-card__text { font-family: 'Source Serif Pro', Georgia, serif; font-size: 18px; line-height: 1.35; font-weight: 400; }
.ips-mkt-card__text strong { font-weight: 700; }
.ips-mkt-card__cta { font-family: Poppins, system-ui, sans-serif; font-size: 13px; color: #00BFB2; font-weight: 500; }

/* Override phase-1 page-level warm off-white backgrounds with brand Pebble.
   These selectors target the page-level wrapper sections on the IPS template page,
   not the form-internal subsections. */
.ips-hero, .ips-section, .ips-disclaimer-section { background: #E7E7E7; }

/* Download section — policy card is the primary artefact, Word/PDF are backups.
   Scoped to .ips-downloads-host AND uses !important on visual properties to win
   against Webflow's global .w-button / .dl-btn rules that ship with the page. */
.ips-downloads-host { display: block; }
.ips-downloads-host .ips-dl-primary-section { background: #FFFFFF; border: 1px solid #00BFB2; border-radius: 12px; padding: 24px 28px; margin: 0 0 20px; }
.ips-downloads-host .ips-dl-heading { font-family: 'Source Serif Pro', Georgia, serif; font-size: 22px; font-weight: 700; color: #1F2F36 !important; margin: 0 0 6px; line-height: 1.25; }
.ips-downloads-host .ips-dl-lede { font-family: Poppins, system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #1F2F36 !important; margin: 0 0 16px; max-width: 640px; }
/* Match the .ips-btn--apply style used by the "Apply to risk level" button. */
.ips-downloads-host .ips-dl-primary { display: inline-block !important; padding: 12px 22px !important; background: #264653 !important; color: #FFFFFF !important; border: 1px solid #264653 !important; border-radius: 6px !important; font-family: Poppins, system-ui, sans-serif !important; font-size: 15px !important; font-weight: 500 !important; line-height: 1.4 !important; text-decoration: none !important; cursor: pointer !important; transition: background 0.15s ease, border-color 0.15s ease; }
.ips-downloads-host .ips-dl-primary:hover { background: #1B3640 !important; border-color: #1B3640 !important; color: #FFFFFF !important; }
.ips-downloads-host .ips-dl-primary:disabled { background: #264653 !important; border-color: #264653 !important; opacity: 0.5; cursor: not-allowed !important; }

.ips-downloads-host .ips-dl-secondary-section { padding: 0 4px; }
.ips-downloads-host .ips-dl-secondary-label { font-family: Poppins, system-ui, sans-serif; font-size: 13px; font-weight: 500; color: #1F2F36 !important; margin: 0 0 8px; }
.ips-downloads-host .ips-dl-secondary-row { display: flex; gap: 10px; flex-wrap: wrap; }
/* Match the .ips-btn--outline style used by the "use the calibrator" button. */
.ips-downloads-host .ips-dl-secondary { display: inline-block !important; font-family: Poppins, system-ui, sans-serif !important; font-size: 13px !important; padding: 7px 14px !important; border-radius: 6px !important; line-height: 1.4 !important; text-decoration: none !important; cursor: pointer !important; background: transparent !important; color: #1F2F36 !important; border: 1px solid #264653 !important; font-weight: 500 !important; transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
.ips-downloads-host .ips-dl-secondary:hover { background: #264653 !important; color: #FFFFFF !important; border-color: #264653 !important; }
.ips-downloads-host .ips-dl-secondary:disabled { background: transparent !important; color: #1F2F36 !important; border-color: #264653 !important; opacity: 0.5; cursor: not-allowed !important; }

@media (max-width: 640px) {
  .ips-section { padding: 24px 0; }
  .ips-section__title { font-size: 22px; }
  .ips-sub__title { font-size: 16px; }
  .ips-input--number { width: 100%; }
  .ips-input--other { width: 100%; }
  .ips-q-card { padding: 20px 22px; }
  .ips-q-h { font-size: 19px; }
  .ips-q-result-h { font-size: 21px; }
}
`;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  ns.formStyles = { injectStyles };
})();
