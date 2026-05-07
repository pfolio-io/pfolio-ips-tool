/**
 * Form composition — iterates the SPEC, renders sections, subsections,
 * helpers, and applies tier filtering, show_if conditionals, and
 * advanced-toggle persistence. Re-renders the whole form on every
 * state change (the form is bounded; no need for fine-grained diffing).
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});
  const el = ns.formFields.el;

  // ---------- show_if evaluation ----------

  function evaluateShowIf(rule, state) {
    if (!rule) return true;
    if (Array.isArray(rule.all)) return rule.all.every((r) => evaluateShowIf(r, state));
    if (Array.isArray(rule.any)) return rule.any.some((r) => evaluateShowIf(r, state));
    const v = state[rule.field];
    if (rule.op === '==') return v === rule.value;
    if (rule.op === '!=') return v !== rule.value;
    if (rule.op === 'in') return Array.isArray(rule.values) && rule.values.includes(v);
    return true;
  }

  // ---------- Visual helpers ----------

  function sectionHeading(num, title) {
    return el('header', { class: 'ips-section__header' }, [
      el('h2', { class: 'ips-section__title' }, `${num}. ${title}`)
    ]);
  }

  function subsectionHeading(num, title) {
    return el('header', { class: 'ips-sub__header' }, [
      el('h3', { class: 'ips-sub__title' }, `${num} ${title}`)
    ]);
  }

  function sectionIntro(text) {
    return text ? el('p', { class: 'ips-section__intro' }, text) : null;
  }

  function advancedToggleBtn(label, isOpen, onClick) {
    return el('button', {
      type: 'button',
      class: 'ips-advanced-toggle' + (isOpen ? ' is-open' : ''),
      onClick
    }, isOpen ? `Hide ${label} ▾` : `Add ${label} ▸`);
  }

  // ---------- Field group renderers ----------

  function renderFieldsGroup(fields, state, store, ctx) {
    const nodes = [];
    for (const f of fields) {
      if (!evaluateShowIf(f.show_if, state)) continue;
      nodes.push(ns.formFields.renderField(f, state[f.id], store, ctx));
      if (f.helpers) {
        const helperNode = ns.formHelpers.renderHelpers(f, state, store, ctx);
        if (helperNode) nodes.push(helperNode);
      }
    }
    return nodes;
  }

  function renderBoilerplateBlock(sub) {
    const children = [];
    if (sub.intro) children.push(sectionIntro(sub.intro));
    if (Array.isArray(sub.content)) {
      for (const para of sub.content) {
        children.push(el('p', { class: 'ips-boilerplate__p' }, para));
      }
    }
    return el('div', { class: 'ips-boilerplate' }, children);
  }

  // ---------- Subsection renderer ----------

  function renderSubsection(sub, state, store, ctx) {
    const subKey = sub.id; // e.g. "section_3_3"
    const isWholeAdvanced = sub.tier === 'advanced' || (sub.fields && sub.fields.every((f) => f.tier === 'advanced'));

    // For 7.4 boilerplate (no fields, just content)
    if (sub.boilerplate_block) {
      const isOpen = !!state.advanced_open[subKey];
      const inner = el('div', null, [
        subsectionHeading(sub.number, sub.title),
        advancedToggleBtn('detail', isOpen, () => store.toggleAdvancedOpen(subKey)),
        isOpen ? renderBoilerplateBlock(sub) : null
      ]);
      return el('section', { class: 'ips-sub ips-sub--advanced' }, inner);
    }

    if (isWholeAdvanced) {
      const isOpen = !!state.advanced_open[subKey];
      const children = [
        subsectionHeading(sub.number, sub.title),
        advancedToggleBtn('detail', isOpen, () => store.toggleAdvancedOpen(subKey))
      ];
      if (isOpen) {
        const inner = [];
        if (sub.intro) inner.push(sectionIntro(sub.intro));
        inner.push(...renderFieldsGroup(sub.fields || [], state, store, ctx));
        children.push(el('div', { class: 'ips-advanced-detail' }, inner));
      }
      return el('section', { class: 'ips-sub ips-sub--advanced' }, children);
    }

    // Mixed subsection: core fields always visible.
    // Conditional advanced fields (with show_if) render inline — their show_if controls visibility.
    // Unconditional advanced fields hide behind a per-subsection "Add detail" toggle.
    const coreFields = (sub.fields || []).filter((f) => f.tier !== 'advanced');
    const advancedFields = (sub.fields || []).filter((f) => f.tier === 'advanced');
    const conditionalAdvanced = advancedFields.filter((f) => f.show_if);
    const optionalAdvanced = advancedFields.filter((f) => !f.show_if);
    const isOpen = !!state.advanced_open[subKey];

    const children = [subsectionHeading(sub.number, sub.title)];
    if (sub.intro) children.push(sectionIntro(sub.intro));
    children.push(...renderFieldsGroup(coreFields, state, store, ctx));
    children.push(...renderFieldsGroup(conditionalAdvanced, state, store, ctx));

    if (optionalAdvanced.length) {
      children.push(advancedToggleBtn('detail', isOpen, () => store.toggleAdvancedOpen(subKey)));
      if (isOpen) {
        children.push(el('div', { class: 'ips-advanced-detail' }, renderFieldsGroup(optionalAdvanced, state, store, ctx)));
      }
    }

    return el('section', { class: 'ips-sub' }, children);
  }

  // Section 2.2 has its own special case: the "optional details" (target_value,
  // secondary_objectives) hide behind a separate toggle named section_2_2_optional.
  // Implementation: when iterating its fields, treat advanced fields as the
  // "optional details" group with the special key.
  function renderSection22Special(sub, state, store, ctx) {
    const subKey = 'section_2_2_optional';
    const coreFields = (sub.fields || []).filter((f) => f.tier !== 'advanced');
    const advancedFields = (sub.fields || []).filter((f) => f.tier === 'advanced');
    const isOpen = !!state.advanced_open[subKey];

    const children = [subsectionHeading(sub.number, sub.title)];
    if (sub.intro) children.push(sectionIntro(sub.intro));
    children.push(...renderFieldsGroup(coreFields, state, store, ctx));

    if (advancedFields.length) {
      children.push(advancedToggleBtn('optional details', isOpen, () => store.toggleAdvancedOpen(subKey)));
      if (isOpen) {
        children.push(el('div', { class: 'ips-advanced-detail' }, renderFieldsGroup(advancedFields, state, store, ctx)));
      }
    }

    return el('section', { class: 'ips-sub' }, children);
  }

  // Section 1 has no subsections — fields directly. Mixed tier.
  function renderSection1(section, state, store, ctx) {
    const subKey = 'section_1';
    const coreFields = (section.fields || []).filter((f) => f.tier !== 'advanced');
    const advancedFields = (section.fields || []).filter((f) => f.tier === 'advanced');
    const isOpen = !!state.advanced_open[subKey];

    const children = [sectionHeading(section.number, section.title)];
    if (section.intro) children.push(sectionIntro(section.intro));
    children.push(...renderFieldsGroup(coreFields, state, store, ctx));

    if (advancedFields.length) {
      children.push(advancedToggleBtn('detail', isOpen, () => store.toggleAdvancedOpen(subKey)));
      if (isOpen) {
        children.push(el('div', { class: 'ips-advanced-detail' }, renderFieldsGroup(advancedFields, state, store, ctx)));
      }
    }
    return el('section', { class: 'ips-section' }, children);
  }

  function renderSection(section, state, store, ctx) {
    if (section.id === 'section_1') return renderSection1(section, state, store, ctx);

    const children = [sectionHeading(section.number, section.title)];
    if (section.intro) children.push(sectionIntro(section.intro));

    for (const sub of (section.subsections || [])) {
      const renderer = sub.id === 'section_2_2' ? renderSection22Special : renderSubsection;
      children.push(renderer(sub, state, store, ctx));
    }

    return el('section', { class: 'ips-section' }, children);
  }

  // ---------- Top-level form ----------

  function renderForm(state, store) {
    const ctx = { baseCurrency: state.base_currency || 'USD' };
    const root = el('div', { class: 'ips-form-root' });

    // Privacy note — top of form, always visible
    root.appendChild(el('div', { class: 'ips-privacy-note' }, [
      el('p', null, [
        el('strong', null, 'Your draft stays in your browser.'),
        ' Nothing is sent to a server, and pfolio never sees what you write. Closing the tab preserves your work; clearing browser data erases it.'
      ])
    ]));

    // Reset banner if user has data
    if (store.hasUserData()) {
      root.appendChild(el('div', { class: 'ips-reset-banner' }, [
        el('button', {
          type: 'button',
          class: 'ips-btn ips-btn--ghost',
          onClick: () => {
            if (window.confirm('Clear all your draft answers and start over?')) store.reset();
          }
        }, 'Clear draft and start over')
      ]));
    }

    if (!store.isStorageAvailable()) {
      root.appendChild(el('div', { class: 'ips-storage-warning' },
        'Your browser does not support draft saving. Your work will be lost if you close this page.'
      ));
    }

    for (const section of ns.formSpec.sections) {
      root.appendChild(renderSection(section, state, store, ctx));
    }
    return root;
  }

  // ---------- Mount ----------

  function mount(rootEl, store) {
    if (!rootEl) {
      console.warn('[pfolioIPS] form mount: no root element');
      return;
    }
    if (ns.formStyles && ns.formStyles.injectStyles) ns.formStyles.injectStyles();
    function rerender() {
      const state = store.get();
      // Preserve focus + caret position across re-renders by remembering
      // the element's data-field id and selection range.
      const active = document.activeElement;
      let focusInfo = null;
      if (active && rootEl.contains(active) && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        focusInfo = {
          fieldHost: active.closest('[data-field]')?.getAttribute('data-field') || null,
          tag: active.tagName,
          start: active.selectionStart,
          end: active.selectionEnd,
          name: active.name || null,
          type: active.type || null,
          inputId: active.id || null
        };
      }
      const next = renderForm(state, store);
      rootEl.replaceChildren(next);
      if (focusInfo && focusInfo.inputId) {
        const restored = rootEl.querySelector('#' + CSS.escape(focusInfo.inputId));
        if (restored) {
          restored.focus();
          if (typeof focusInfo.start === 'number' && restored.setSelectionRange) {
            try { restored.setSelectionRange(focusInfo.start, focusInfo.end); } catch (_e) {}
          }
        }
      }
    }
    rerender();
    const unsub = store.subscribe(() => rerender());
    return { unmount: () => { unsub(); rootEl.replaceChildren(); } };
  }

  ns.form = { mount, renderForm };
})();
