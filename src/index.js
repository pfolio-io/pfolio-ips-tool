/**
 * Public API surface — window.pfolioIPS.
 *
 * Loaded last in the bundle. Exposes:
 *   - generators (phase 2): generateFullIPSWord, generateFullIPSPDF, generatePolicyCardPDF
 *   - form (phase 3):       mountForm(rootEl), createStore()
 *   - legacy/test:           anna (hardcoded data), utils, wireDownloadButtons(getState)
 *   - autoMount():           mounts form into #ips-form and wires #download-buttons
 *                            against the live form state — for use on the production page.
 */
(function () {
  'use strict';

  const internal = (window._pfolioIPS = window._pfolioIPS || {});

  function inferKindFromLabel(text) {
    const lower = (text || '').toLowerCase();
    if (lower.includes('word')) return 'word';
    if (lower.includes('policy card')) return 'policy-card';
    if (lower.includes('pdf')) return 'pdf';
    return null;
  }

  function wireDownloadButtons(getState) {
    const root = document.getElementById('download-buttons');
    if (!root) {
      console.warn('[pfolioIPS] #download-buttons not found; nothing wired');
      return;
    }
    const buttons = root.querySelectorAll('button.dl-btn, [data-dl-kind]');
    buttons.forEach((btn) => {
      const kind = btn.dataset.dlKind || inferKindFromLabel(btn.textContent);
      if (!kind) return;
      btn.disabled = false;
      btn.style.cursor = 'pointer';
      btn.dataset.originalText = btn.textContent;
      btn.addEventListener('click', async (evt) => {
        evt.preventDefault();
        const data = getState();
        const oldText = btn.dataset.originalText;
        try {
          btn.dataset.busy = 'true';
          btn.textContent = 'Generating…';
          if (kind === 'word') await api.generateFullIPSWord(data);
          else if (kind === 'pdf') await api.generateFullIPSPDF(data);
          else if (kind === 'policy-card') await api.generatePolicyCardPDF(data);
        } catch (err) {
          console.error('[pfolioIPS] generation failed', err);
          const detail = err && err.message ? err.message : String(err);
          alert(`Sorry—generation failed.\n\n${detail}\n\nFull error in the browser console.`);
        } finally {
          btn.textContent = oldText;
          delete btn.dataset.busy;
        }
      });
    });
  }

  function mountForm(rootEl) {
    const store = internal.formState.createStore();
    internal.form.mount(rootEl, store);
    return store;
  }

  // Restructure the #download-buttons host so the policy card is the primary
  // download (the user-facing commitment artefact) and the Word/PDF IPS exports
  // are presented as backup/raw-data formats.
  function restructureDownloads(rootEl) {
    if (!rootEl) return;
    // Pull the existing buttons by data-dl-kind so we preserve their event listeners later.
    const cardBtn = rootEl.querySelector('[data-dl-kind="policy-card"]');
    const wordBtn = rootEl.querySelector('[data-dl-kind="word"]');
    const pdfBtn = rootEl.querySelector('[data-dl-kind="pdf"]');
    if (!cardBtn) return; // already restructured or unexpected markup — leave alone

    // Clear existing children and rebuild.
    rootEl.textContent = '';

    // Primary section
    const primary = document.createElement('div');
    primary.className = 'ips-dl-primary-section';

    const heading = document.createElement('h3');
    heading.className = 'ips-dl-heading';
    heading.textContent = 'Your policy card';
    primary.appendChild(heading);

    const lede = document.createElement('p');
    lede.className = 'ips-dl-lede';
    lede.textContent = 'A one-page first-person summary—the document you check before acting on a market move. The full IPS lives below as a Word or PDF export.';
    primary.appendChild(lede);

    cardBtn.classList.add('ips-dl-primary');
    cardBtn.textContent = 'Download policy card (PDF)';
    primary.appendChild(cardBtn);

    rootEl.appendChild(primary);

    // Secondary section
    const secondary = document.createElement('div');
    secondary.className = 'ips-dl-secondary-section';

    const secLabel = document.createElement('p');
    secLabel.className = 'ips-dl-secondary-label';
    secLabel.textContent = 'Full IPS—for your records';
    secondary.appendChild(secLabel);

    const secRow = document.createElement('div');
    secRow.className = 'ips-dl-secondary-row';
    if (wordBtn) {
      wordBtn.classList.add('ips-dl-secondary');
      secRow.appendChild(wordBtn);
    }
    if (pdfBtn) {
      pdfBtn.classList.add('ips-dl-secondary');
      secRow.appendChild(pdfBtn);
    }
    secondary.appendChild(secRow);

    rootEl.appendChild(secondary);
  }

  function autoMount() {
    const formEl = document.getElementById('ips-form');
    if (!formEl) {
      console.warn('[pfolioIPS] autoMount: #ips-form not found');
      return null;
    }
    // Strip the page's "loading placeholder" styling (padding, white bg, dashed
    // border, centre-align, grey text). The mounted form supplies its own.
    formEl.classList.remove('ips-embed-placeholder');
    formEl.classList.add('ips-form-host');

    const store = mountForm(formEl);

    // Restructure the download host BEFORE wiring listeners — wiring queries
    // by data-dl-kind, which restructure preserves.
    const dlEl = document.getElementById('download-buttons');
    if (dlEl) {
      dlEl.classList.remove('ips-embed-placeholder');
      dlEl.classList.add('ips-downloads-host');
      restructureDownloads(dlEl);
    }

    wireDownloadButtons(() => store.get());

    // The risk questionnaire is now an inline calibrator inside section 3.1's helper.
    // The standalone #risk-questionnaire placeholder on the page is no longer used —
    // hide it if present so it does not show empty space.
    const qEl = document.getElementById('risk-questionnaire');
    if (qEl) qEl.style.display = 'none';
    const qHeading = document.querySelector('[data-q-heading]');
    if (qHeading) qHeading.style.display = 'none';

    return store;
  }

  const api = {
    // generators
    generateFullIPSWord: internal.generateFullIPSWord,
    generateFullIPSPDF: internal.generateFullIPSPDF,
    generatePolicyCardPDF: internal.generatePolicyCardPDF,
    // form
    mountForm,
    autoMount,
    createStore: internal.formState && internal.formState.createStore,
    // shared
    anna: internal.anna,
    utils: internal.utils,
    wireDownloadButtons,
    // internals exposed for testing
    _internal: internal
  };

  window.pfolioIPS = api;
})();
