#!/usr/bin/env bash
# Concatenate the six source files into one bundle for upload to Webflow.
# No build chain required — just shell.

set -euo pipefail

cd "$(dirname "$0")"

OUT=dist/pfolio-ips.js
mkdir -p dist

{
  echo "/* pfolio IPS bundle — built $(date -u +%Y-%m-%dT%H:%M:%SZ) */"
  echo
  cat src/utils.js
  echo
  cat src/anna-bauer.js
  echo
  cat src/word-ips.js
  echo
  cat src/pdf-ips.js
  echo
  cat src/pdf-policy-card.js
  echo
  cat src/form-state.js
  echo
  cat src/form-fields.js
  echo
  cat src/form-helpers.js
  echo
  cat src/form-spec.js
  echo
  cat src/form.js
  echo
  cat src/form-styles.js
  echo
  cat src/questionnaire-lookup.js
  echo
  cat src/questionnaire-calc.js
  echo
  cat src/form-questionnaire.js
  echo
  cat src/index.js
} > "$OUT"

bytes=$(wc -c < "$OUT" | tr -d ' ')
kib=$(awk "BEGIN { printf \"%.1f\", $bytes / 1024 }")
echo "Built $OUT — $bytes bytes ($kib KiB)"
