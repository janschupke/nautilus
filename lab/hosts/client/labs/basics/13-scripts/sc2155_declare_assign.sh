#!/usr/bin/env bash
# Deliberate: `local` + command substitution masks inner exit status (SC2155).
set -euo pipefail

false_cmd() { return 1; }

masked_assign() {
  local masked="$(false_cmd)"
  printf 'masked=%s\n' "$masked"
}

masked_assign
