#!/usr/bin/env bash
# Fails under set -e because grep returns 1 when there is no match.
set -euo pipefail
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
grep -Fx 'delta' "$HERE/lines.txt"
echo 'this line is never reached'
