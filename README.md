# pfolio IPS tool

Client-side investment policy statement template — drafts a personal IPS
in the browser, persists locally, and exports it as Word, PDF, or a one-page
policy card.

Lives at <https://pfolio.io/tools/investment-policy-statement-template>.

## What's in the box

- **Form** with eighteen core fields plus advanced subsections, persisted to
  `localStorage` (key `pfolio_ips_draft_v1`)
- **Risk calibrator** inside section 3.1's helper — five questions that map
  to a five-level risk profile
- **Three generators**:
  - Full IPS as Word (`.docx`) via `docx` library
  - Full IPS as PDF (A4) via `html2pdf.js`
  - One-page policy card PDF via the same library
- **Lazy library loading** — `docx` and `html2pdf.js` load from a CDN on first
  click, not on page load

## Bundle

`dist/pfolio-ips.js` — single hand-concatenated bundle, ~170 KiB.

To rebuild after editing source files:

```bash
./build.sh
```

No Node toolchain required. Build is shell concatenation in dependency order.

## Source layout

```
src/
  utils.js                 — formatters, label maps, lazy CDN loader, disclaimers
  anna-bauer.js            — hardcoded test data
  word-ips.js              — Word generator (docx)
  pdf-ips.js               — full IPS PDF generator
  pdf-policy-card.js       — policy card PDF generator
  form-state.js            — state container with localStorage persistence
  form-fields.js           — per-field-type renderers (text, dropdown, etc.)
  form-helpers.js          — helper resolution logic + drawdown table
  form-spec.js             — IPS form definition (sections, subsections, fields)
  form.js                  — composition: iterates spec, applies show_if rules,
                             advanced toggles, mounts and re-renders
  form-styles.js           — inline CSS injected on first mount
  questionnaire-lookup.js  — five-level risk profile prose
  questionnaire-calc.js    — risk profile calculation
  form-questionnaire.js    — calibrator widget (lives inside section 3.1 helper)
  index.js                 — public API on window.pfolioIPS

dist/
  pfolio-ips.js            — built bundle, ready to upload to a CDN

test/
  index.html               — local test harness
build.sh                   — concatenates src/* in dependency order
```

## Public API

After the bundle loads, `window.pfolioIPS` exposes:

```js
pfolioIPS.autoMount()            // mount form into #ips-form, wire #download-buttons
pfolioIPS.mountForm(rootEl)      // mount form into a custom element, returns a store
pfolioIPS.generateFullIPSWord(d) // → triggers .docx download
pfolioIPS.generateFullIPSPDF(d)  // → triggers .pdf download
pfolioIPS.generatePolicyCardPDF(d) // → triggers .pdf download
pfolioIPS.utils                  // formatters, currency labels, disclaimers
pfolioIPS.anna                   // hardcoded test data
```

`autoMount()` is what production pages call. It looks for `#ips-form` and
`#download-buttons` on the page and wires them up.

A `download:complete` event fires on `document` after each successful download.

## Running locally

```bash
cd ips-tool-build
python3 -m http.server 8080
# open http://127.0.0.1:8080/test/
```

The test harness lets you fill the form, open the calibrator, trigger
downloads, and inspect the live state JSON.

## Production deployment

Upload `dist/pfolio-ips.js` to your CDN of choice, then add this to the IPS
page (Webflow custom code embed, footer code section, or similar):

```html
<script src="<your-cdn-url>/pfolio-ips.js" defer></script>
<script>
  document.addEventListener('DOMContentLoaded', () => pfolioIPS.autoMount());
</script>
```

Required placeholders on the page:

- `<div id="ips-form"></div>`
- `<div id="download-buttons">…three buttons with class `dl-btn`…</div>`

## Empty-field rules

The generators respect these rules so partially filled IPSes still produce
clean documents:

- **Word + full PDF**: omit any subsection whose fields are all empty.
  Section 7.4 (Revision vs deviation) always renders because its boilerplate
  is mandatory. Guidance text from the form is dropped — only the user's
  commitments render.
- **Policy card**:
  - `abandonment_threshold` blank → "To be set at next review"
  - `tactical_overrides` blank → "Never (default)"
  - any other commitment blank → "(not specified)"

## Privacy

The tool is fully client-side. The form state lives in `localStorage` only.
No server, no analytics, no telemetry.
