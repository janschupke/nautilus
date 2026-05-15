#!/usr/bin/env bash
# Deliberate: legacy backticks instead of $() (SC2006).
set -euo pipefail
stamp=`date -u +%Y-%m-%dT%H:%M:%SZ`
printf 'stamp=%s\n' "$stamp"
