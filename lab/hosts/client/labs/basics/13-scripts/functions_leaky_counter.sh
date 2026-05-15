#!/usr/bin/env bash
# Deliberate: loop counter `i` in a function should be `local` so callers keep their `i`.
set -euo pipefail
count_lines() {
  i=0
  while IFS= read -r line || [[ -n $line ]]; do
    i=$((i + 1))
  done <<'EOF'
alpha
beta
EOF
  printf '%d\n' "$i"
}

count_lines
printf 'after function i=%s\n' "${i:-unset}"
