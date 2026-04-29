/**
 * Field-type renderers.
 *
 * Each renderer takes (def, value, store, ctx) and returns a DOM node.
 * `def` is the spec definition; `value` is the current state value;
 * `store` is the form state container; `ctx` carries cross-field info
 * (e.g. base_currency for money fields).
 */
(function () {
  'use strict';

  const ns = (window._pfolioIPS = window._pfolioIPS || {});

  // ---------- DOM helpers ----------

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'checked' || k === 'disabled' || k === 'selected') {
          if (v) node.setAttribute(k, '');
        } else {
          node.setAttribute(k, v);
        }
      }
    }
    if (children) {
      const arr = Array.isArray(children) ? children : [children];
      for (const c of arr) {
        if (c === null || c === undefined || c === false) continue;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  function fieldWrapper(def, inputNode, opts = {}) {
    return el('div', { class: 'ips-field', 'data-field': def.id }, [
      def.label ? el('label', { class: 'ips-field__label', for: 'f_' + def.id }, def.label) : null,
      inputNode,
      def.guidance && opts.showGuidance ? el('p', { class: 'ips-field__guidance' }, def.guidance) : null
    ]);
  }

  // ---------- Per-type renderers ----------

  function renderText(def, value, store) {
    const input = el('input', {
      type: 'text',
      id: 'f_' + def.id,
      class: 'ips-input',
      value: value || '',
      placeholder: def.placeholder || '',
      onInput: (e) => store.setQuiet(def.id, e.target.value),
      onChange: (e) => store.set(def.id, e.target.value)
    });
    return fieldWrapper(def, input);
  }

  function renderTextarea(def, value, store) {
    const input = el('textarea', {
      id: 'f_' + def.id,
      class: 'ips-textarea',
      rows: def.rows || 3,
      placeholder: def.placeholder || '',
      onInput: (e) => store.setQuiet(def.id, e.target.value),
      onChange: (e) => store.set(def.id, e.target.value)
    });
    input.value = value || '';
    return fieldWrapper(def, input);
  }

  function renderNumber(def, value, store) {
    const input = el('input', {
      type: 'number',
      id: 'f_' + def.id,
      class: 'ips-input ips-input--number',
      value: value === null || value === undefined ? '' : value,
      placeholder: def.placeholder || '',
      min: def.min,
      max: def.max,
      step: def.step || 'any',
      onInput: (e) => {
        const raw = e.target.value;
        store.setQuiet(def.id, raw === '' ? null : Number(raw));
      },
      onChange: (e) => {
        const raw = e.target.value;
        store.set(def.id, raw === '' ? null : Number(raw));
      }
    });
    return fieldWrapper(def, el('div', { class: 'ips-input-row' }, [
      input,
      def.unit ? el('span', { class: 'ips-input-suffix' }, def.unit) : null
    ]));
  }

  function renderPercentage(def, value, store) {
    const clamp = (raw) => {
      let v = raw === '' ? null : Number(raw);
      if (v !== null) v = Math.max(0, Math.min(100, v));
      return v;
    };
    const input = el('input', {
      type: 'number',
      id: 'f_' + def.id,
      class: 'ips-input ips-input--number',
      value: value === null || value === undefined ? '' : value,
      min: 0, max: 100, step: 'any',
      placeholder: def.placeholder || '',
      onInput: (e) => store.setQuiet(def.id, clamp(e.target.value)),
      onChange: (e) => store.set(def.id, clamp(e.target.value))
    });
    return fieldWrapper(def, el('div', { class: 'ips-input-row' }, [
      input,
      el('span', { class: 'ips-input-suffix' }, '%')
    ]));
  }

  function renderMoney(def, value, store, ctx) {
    const currency = (ctx && ctx.baseCurrency) || 'USD';
    const parse = (raw) => raw === '' ? null : Number(raw);
    const input = el('input', {
      type: 'number',
      id: 'f_' + def.id,
      class: 'ips-input ips-input--number',
      value: value === null || value === undefined ? '' : value,
      min: 0, step: 'any',
      placeholder: def.placeholder || '',
      onInput: (e) => store.setQuiet(def.id, parse(e.target.value)),
      onChange: (e) => store.set(def.id, parse(e.target.value))
    });
    return fieldWrapper(def, el('div', { class: 'ips-input-row' }, [
      el('span', { class: 'ips-input-prefix' }, currency),
      input
    ]));
  }

  function renderMoneyWithPeriod(def, value, store, ctx) {
    const v = value || { amount: null, period: null };
    const currency = (ctx && ctx.baseCurrency) || 'USD';
    const periods = def.periods || ['per_month', 'per_year', 'none'];

    const parse = (raw) => raw === '' ? null : Number(raw);
    const amountInput = el('input', {
      type: 'number',
      id: 'f_' + def.id + '_amount',
      class: 'ips-input ips-input--number',
      value: v.amount === null || v.amount === undefined ? '' : v.amount,
      min: 0, step: 'any',
      onInput: (e) => store.setNestedQuiet(def.id, 'amount', parse(e.target.value)),
      onChange: (e) => store.setNested(def.id, 'amount', parse(e.target.value))
    });

    const periodSelect = el('select', {
      class: 'ips-select',
      onChange: (e) => store.setNested(def.id, 'period', e.target.value || null)
    }, [
      el('option', { value: '' }, '—'),
      ...periods.map((p) => {
        const opt = el('option', { value: p }, ns.utils.PERIOD_LABELS[p] || p);
        if (v.period === p) opt.selected = true;
        return opt;
      })
    ]);

    return fieldWrapper(def, el('div', { class: 'ips-input-row' }, [
      el('span', { class: 'ips-input-prefix' }, currency),
      amountInput,
      periodSelect
    ]));
  }

  function renderDate(def, value, store) {
    const input = el('input', {
      type: 'date',
      id: 'f_' + def.id,
      class: 'ips-input',
      value: value || '',
      onInput: (e) => store.setQuiet(def.id, e.target.value),
      onChange: (e) => store.set(def.id, e.target.value)
    });
    return fieldWrapper(def, input);
  }

  function renderDatePartial(def, value, store) {
    // "DD month" — text input, free-form
    const input = el('input', {
      type: 'text',
      id: 'f_' + def.id,
      class: 'ips-input',
      value: value || '',
      placeholder: def.placeholder || 'e.g. 12 March',
      onInput: (e) => store.setQuiet(def.id, e.target.value),
      onChange: (e) => store.set(def.id, e.target.value)
    });
    return fieldWrapper(def, input);
  }

  function renderDropdown(def, value, store) {
    const select = el('select', {
      id: 'f_' + def.id,
      class: 'ips-select',
      onChange: (e) => store.set(def.id, e.target.value || null)
    }, [
      el('option', { value: '' }, '—'),
      ...def.options.map((o) => {
        const optVal = typeof o === 'string' ? o : o.value;
        const optLabel = typeof o === 'string' ? o : o.label;
        const opt = el('option', { value: optVal }, optLabel);
        if (value === optVal) opt.selected = true;
        return opt;
      })
    ]);
    return fieldWrapper(def, select);
  }

  function renderSingleSelect(def, value, store) {
    const name = 'f_' + def.id;
    return fieldWrapper(def, el('div', { class: 'ips-radios' }, def.options.map((o) => {
      const optVal = typeof o === 'string' ? o : o.value;
      const optLabel = typeof o === 'string' ? o : o.label;
      const id = `${name}_${optVal}`;
      return el('label', { class: 'ips-radio', for: id }, [
        el('input', {
          type: 'radio',
          name,
          id,
          value: optVal,
          checked: value === optVal ? 'checked' : false,
          onChange: () => store.set(def.id, optVal)
        }),
        el('span', { class: 'ips-radio__label' }, optLabel)
      ]);
    })));
  }

  function renderSingleSelectRich(def, value, store) {
    const name = 'f_' + def.id;
    return fieldWrapper(def, el('div', { class: 'ips-rich-radios' }, def.options.map((o) => {
      const id = `${name}_${o.value}`;
      const isChecked = value === o.value;
      return el('label', { class: 'ips-rich-radio' + (isChecked ? ' is-checked' : ''), for: id }, [
        el('input', {
          type: 'radio',
          name,
          id,
          value: o.value,
          checked: isChecked ? 'checked' : false,
          class: 'ips-rich-radio__input',
          onChange: () => store.set(def.id, o.value)
        }),
        el('div', { class: 'ips-rich-radio__body' }, [
          el('span', { class: 'ips-rich-radio__title' }, o.label),
          o.description ? el('span', { class: 'ips-rich-radio__desc' }, o.description) : null,
          o.example ? el('span', { class: 'ips-rich-radio__example' }, o.example) : null
        ])
      ]);
    })));
  }

  function renderMultiSelect(def, value, store) {
    const arr = Array.isArray(value) ? value : [];
    return fieldWrapper(def, el('div', { class: 'ips-checks' }, def.options.map((o) => {
      const optVal = typeof o === 'string' ? o : o.value;
      const optLabel = typeof o === 'string' ? o : o.label;
      const id = `f_${def.id}_${optVal}`;
      const checked = arr.includes(optVal);
      return el('label', { class: 'ips-check', for: id }, [
        el('input', {
          type: 'checkbox',
          id,
          value: optVal,
          checked: checked ? 'checked' : false,
          onChange: (e) => {
            const cur = Array.isArray(store.get()[def.id]) ? store.get()[def.id] : [];
            const next = e.target.checked ? [...cur, optVal] : cur.filter((v) => v !== optVal);
            store.set(def.id, next);
          }
        }),
        el('span', { class: 'ips-check__label' }, optLabel)
      ]);
    })));
  }

  function renderMultiSelectWithOther(def, value, store) {
    const arr = Array.isArray(value) ? value : [];
    const otherKey = def.id + '_other';
    const otherValue = store.get()[otherKey] || '';

    return fieldWrapper(def, el('div', { class: 'ips-checks' }, def.options.map((o) => {
      const id = `f_${def.id}_${o.value}`;
      const checked = arr.includes(o.value);
      const elements = [
        el('input', {
          type: 'checkbox',
          id,
          value: o.value,
          checked: checked ? 'checked' : false,
          onChange: (e) => {
            const cur = Array.isArray(store.get()[def.id]) ? store.get()[def.id] : [];
            const next = e.target.checked ? [...cur, o.value] : cur.filter((v) => v !== o.value);
            store.set(def.id, next);
          }
        }),
        el('span', { class: 'ips-check__label' }, o.label)
      ];
      const wrap = el('label', { class: 'ips-check', for: id }, elements);
      if (o.free_text && checked) {
        const otherInput = el('input', {
          type: 'text',
          class: 'ips-input ips-input--other',
          value: otherValue,
          placeholder: 'specify',
          onInput: (e) => store.setQuiet(otherKey, e.target.value),
          onChange: (e) => store.set(otherKey, e.target.value)
        });
        return el('div', { class: 'ips-check-with-other' }, [wrap, otherInput]);
      }
      return wrap;
    })));
  }

  function renderMultiSelectEditable(def, value, store) {
    const arr = Array.isArray(value) ? value : [];
    const root = el('div', { class: 'ips-editable-list' });

    arr.forEach((item, idx) => {
      const row = el('div', { class: 'ips-editable-row' }, [
        el('input', {
          type: 'text',
          class: 'ips-input',
          value: item,
          onInput: (e) => {
            const next = [...arr];
            next[idx] = e.target.value;
            store.setQuiet(def.id, next);
          },
          onChange: (e) => {
            const next = [...arr];
            next[idx] = e.target.value;
            store.set(def.id, next);
          }
        }),
        el('button', {
          type: 'button',
          class: 'ips-btn ips-btn--ghost',
          onClick: () => {
            const next = arr.filter((_, i) => i !== idx);
            store.set(def.id, next);
          }
        }, 'Remove')
      ]);
      root.appendChild(row);
    });

    root.appendChild(el('button', {
      type: 'button',
      class: 'ips-btn ips-btn--ghost ips-btn--add',
      onClick: () => store.set(def.id, [...arr, ''])
    }, '+ Add another item'));

    return fieldWrapper(def, root);
  }

  function renderYesNo(def, value, store) {
    const name = 'f_' + def.id;
    return fieldWrapper(def, el('div', { class: 'ips-radios ips-radios--inline' }, [
      ['yes', 'Yes'], ['no', 'No']
    ].map(([val, label]) => {
      const id = `${name}_${val}`;
      const checked = value === val;
      return el('label', { class: 'ips-radio', for: id }, [
        el('input', {
          type: 'radio',
          name,
          id,
          value: val,
          checked: checked ? 'checked' : false,
          onChange: () => store.set(def.id, val)
        }),
        el('span', { class: 'ips-radio__label' }, label)
      ]);
    })));
  }

  function renderYesNoWithText(def, value, store) {
    const v = value || { enabled: false, screen: '' };
    const name = 'f_' + def.id;

    const radios = el('div', { class: 'ips-radios ips-radios--inline' }, [
      ['yes', true, 'Yes'], ['no', false, 'No']
    ].map(([val, enabled, label]) => {
      const id = `${name}_${val}`;
      return el('label', { class: 'ips-radio', for: id }, [
        el('input', {
          type: 'radio',
          name,
          id,
          checked: v.enabled === enabled ? 'checked' : false,
          onChange: () => store.setNested(def.id, 'enabled', enabled)
        }),
        el('span', { class: 'ips-radio__label' }, label)
      ]);
    }));

    const children = [radios];
    if (v.enabled) {
      children.push(el('div', { class: 'ips-yes-text' }, [
        def.text_label_if_yes ? el('label', { class: 'ips-field__sublabel' }, def.text_label_if_yes) : null,
        el('textarea', {
          class: 'ips-textarea',
          rows: 2,
          placeholder: def.text_placeholder || '',
          onInput: (e) => store.setNestedQuiet(def.id, 'screen', e.target.value),
          onChange: (e) => store.setNested(def.id, 'screen', e.target.value)
        }, v.screen || '')
      ]));
      // Fix textarea value (innerHTML approach above doesn't work for textarea value)
      const ta = children[children.length - 1].querySelector('textarea');
      if (ta) ta.value = v.screen || '';
    }

    return fieldWrapper(def, el('div', null, children));
  }

  function renderTwoNumbers(def, value, store) {
    const v = value || {};
    const subFields = def.fields || [];
    const inputs = subFields.map((f) => {
      const subVal = v[f.id];
      const parse = (raw) => raw === '' ? null : Number(raw);
      return el('div', { class: 'ips-two-numbers__item' }, [
        f.label ? el('label', { class: 'ips-field__sublabel', for: 'f_' + def.id + '_' + f.id }, f.label) : null,
        el('input', {
          type: 'number',
          id: 'f_' + def.id + '_' + f.id,
          class: 'ips-input ips-input--number',
          value: subVal === null || subVal === undefined ? '' : subVal,
          min: f.min, max: f.max,
          onInput: (e) => store.setNestedQuiet(def.id, f.id, parse(e.target.value)),
          onChange: (e) => store.setNested(def.id, f.id, parse(e.target.value))
        })
      ]);
    });
    return fieldWrapper(def, el('div', { class: 'ips-two-numbers' }, inputs));
  }

  function renderNumberOrNone(def, value, store) {
    // Show a number input plus a "none" toggle. "None" stores the literal 0 —
    // zero dependants is a meaningful answer, distinct from "not yet answered".
    const v = value;
    const isNone = v === 0;
    const noneId = `f_${def.id}_none`;

    const numInput = el('input', {
      type: 'number',
      id: 'f_' + def.id,
      class: 'ips-input ips-input--number',
      value: v === null || v === undefined || v === 0 ? '' : v,
      min: 0,
      onInput: (e) => {
        const raw = e.target.value;
        store.setQuiet(def.id, raw === '' ? null : Number(raw));
      },
      onChange: (e) => {
        const raw = e.target.value;
        store.set(def.id, raw === '' ? null : Number(raw));
      }
    });

    return fieldWrapper(def, el('div', { class: 'ips-input-row' }, [
      numInput,
      el('label', { class: 'ips-toggle', for: noneId }, [
        el('input', {
          type: 'checkbox',
          id: noneId,
          checked: isNone ? 'checked' : false,
          onChange: (e) => store.set(def.id, e.target.checked ? 0 : null)
        }),
        el('span', { class: 'ips-toggle__label' }, 'none')
      ])
    ]));
  }

  // ---------- Dispatcher ----------

  function renderField(def, value, store, ctx) {
    switch (def.type) {
      case 'text': return renderText(def, value, store);
      case 'textarea': return renderTextarea(def, value, store);
      case 'number': return renderNumber(def, value, store);
      case 'percentage': return renderPercentage(def, value, store);
      case 'money': return renderMoney(def, value, store, ctx);
      case 'money_with_period': return renderMoneyWithPeriod(def, value, store, ctx);
      case 'date': return renderDate(def, value, store);
      case 'date_partial': return renderDatePartial(def, value, store);
      case 'dropdown': return renderDropdown(def, value, store);
      case 'single_select': return renderSingleSelect(def, value, store);
      case 'single_select_richlabel': return renderSingleSelectRich(def, value, store);
      case 'multi_select': return renderMultiSelect(def, value, store);
      case 'multi_select_with_other': return renderMultiSelectWithOther(def, value, store);
      case 'multi_select_editable': return renderMultiSelectEditable(def, value, store);
      case 'yes_no': return renderYesNo(def, value, store);
      case 'yes_no_with_text': return renderYesNoWithText(def, value, store);
      case 'two_numbers': return renderTwoNumbers(def, value, store);
      case 'number_or_none': return renderNumberOrNone(def, value, store);
      default:
        console.warn('[pfolioIPS] unknown field type:', def.type, def);
        return el('div', { class: 'ips-unknown' }, `Unknown field type: ${def.type}`);
    }
  }

  ns.formFields = { renderField, el };
})();
