# pfolio IPS tool

Client-side investment policy statement template — drafts a personal IPS
in the browser, persists locally, and exports it as Word, PDF, or a one-page
policy card.

Lives at <https://pfolio.io/tools/investment-policy-statement-template>.

## What's in the box

- **Form** with eighteen core fields plus advanced subsections, persisted to
  `localStorage` (key `pfolio_ips_draft_v1`)
- **Risk calibrator** inside section 3.1's helper — five questions that map
  to a five-level risk profile, mirroring the pfolio platform's logic so
  results are consistent across tool and platform
- **Three generators**, all rendered client-side:
  - Full IPS as Word (`.docx`) via the `docx` library
  - Full IPS as PDF (A4) via direct `jsPDF` text rendering (multi-page,
    Helvetica)
  - One-page policy card PDF via the same `jsPDF` path — first-person
    commitment narrative with the pfolio logo top-right
- **Lazy library loading** — `docx` and `jsPDF` load from a CDN on first
  click, not on page load. The pfolio logo is fetched once and cached.

## Bundle

`dist/pfolio-ips.js` — single hand-concatenated bundle, ~184 KiB.

To rebuild after editing source files:

```bash
./build.sh
```

No Node toolchain required. Build is shell concatenation in dependency order.

## Source layout

```
src/
  utils.js                 — formatters, label maps, lazy CDN loader,
                             disclaimers, pfolio logo loader
  anna-bauer.js            — hardcoded worked-example data (32-year-old
                             long-horizon investor in Berlin)
  word-ips.js              — Word generator (docx)
  pdf-ips.js               — full IPS PDF generator (jsPDF, multi-page)
  pdf-policy-card.js       — single-page policy card PDF generator (jsPDF)
  form-state.js            — state container with localStorage persistence
  form-fields.js           — per-field-type renderers (text, dropdown,
                             money-with-period, percentage, etc.)
  form-helpers.js          — collapsible helper boxes + drawdown table
  form-spec.js             — IPS form definition (sections, subsections, fields)
  form.js                  — composition: iterates spec, applies show_if rules,
                             advanced toggles, mounts and re-renders
  form-styles.js           — inline CSS injected on first mount
  questionnaire-lookup.js  — five-level risk profile prose
  questionnaire-calc.js    — risk profile calculation (port of pfolio's logic)
  form-questionnaire.js    — calibrator widget (lives inside section 3.1 helper)
  index.js                 — public API on window.pfolioIPS

dist/
  pfolio-ips.js            — built bundle, ready to upload to a CDN

test/
  index.html               — local test harness (mount form, trigger
                             downloads, inspect state)
  calc-test.html           — calibrator unit tests (synthetic boundary cases)
  generators-test.html     — generator edge-case tests (empty state,
                             long-text overflow)

build.sh                   — concatenates src/* in dependency order
```

## Public API

After the bundle loads, `window.pfolioIPS` exposes:

```js
pfolioIPS.autoMount()              // mount form into #ips-form, wire #download-buttons
pfolioIPS.mountForm(rootEl)        // mount form into a custom element, returns a store
pfolioIPS.generateFullIPSWord(d)   // → triggers .docx download
pfolioIPS.generateFullIPSPDF(d)    // → triggers .pdf download
pfolioIPS.generatePolicyCardPDF(d) // → triggers .pdf download
pfolioIPS.utils                    // formatters, currency labels, disclaimers
pfolioIPS.anna                     // hardcoded worked-example data
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

Test pages:

- `test/index.html` — full form harness with state inspector
- `test/calc-test.html` — runs the calibrator against synthetic inputs
- `test/generators-test.html` — exercises empty + long-text edge cases on
  all three generators, checks page counts, shows previews

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
- `<div id="download-buttons">` containing three buttons or anchors with
  text "Download as Word", "Download as PDF", and "Download policy card
  (PDF)" — the bundle infers the kind from the label, no `data-*` attributes
  required.

### A note on jsdelivr

If you serve the bundle from `cdn.jsdelivr.net/gh/<user>/<repo>@main/...`,
**pin to a commit SHA, not `@main`**. The `@main` tag is cached aggressively
at jsdelivr's edge nodes and purge propagation is unreliable, so you can end
up with users running an old bundle for hours after publishing. Pinning to a
commit SHA gives every release a unique URL and bypasses the cache entirely:

```
https://cdn.jsdelivr.net/gh/<user>/<repo>@<sha>/dist/pfolio-ips.js
```

Update the SHA in your script tag on each release.

## Empty-field rules

The generators respect these rules so partially filled IPSes still produce
clean documents:

- **Word + full PDF**: omit any subsection whose fields are all empty.
  Section 7.4 (Revision vs deviation) always renders because its boilerplate
  is mandatory. Guidance text from the form is dropped — only the user's
  commitments render.
- **Policy card**:
  - `abandonment_threshold` blank with no note → "To be set at next review"
  - `tactical_overrides` blank → "never (default)"
  - any other commitment blank → "(not specified)"
  - Free-form notes (`risk_level_note`, `target_volatility_note`,
    `abandonment_note`) override the boilerplate when present so the card
    doesn't say the same thing twice.

## Privacy

The tool is fully client-side. The form state lives in `localStorage` only.
No server, no analytics, no telemetry. The CDN libraries (`docx`, `jsPDF`)
and the pfolio logo are fetched on first download click only.

## Licence

MIT — see [LICENSE](./LICENSE).
