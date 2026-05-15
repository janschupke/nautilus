#!/usr/bin/env bash
# Demonstrates cleanup trap registered *after* a failing command (too late under set -e).
set -euo pipefail
base="${1:-work}"
tmp="${base%/}/trap_lab_stale"
rm -rf "$tmp"
mkdir -p "$tmp"
printf 'marker\n' >"${tmp}/marker.txt"
false
trap 'rm -rf "$tmp"' EXIT
printf 'never runs\n'
