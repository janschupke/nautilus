#!/usr/bin/env bash
# Reference pattern: register EXIT cleanup before commands that may fail.
set -euo pipefail
base="${1:-work}"
tmp="${base%/}/trap_lab_stale"
rm -rf "$tmp"
mkdir -p "$tmp"
printf 'marker\n' >"${tmp}/marker.txt"
cleanup() {
  rm -rf "$tmp"
}
trap cleanup EXIT
false
