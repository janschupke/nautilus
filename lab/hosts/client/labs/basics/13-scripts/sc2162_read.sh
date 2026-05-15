#!/usr/bin/env bash
# Deliberate: read without -r (SC2162).
set -euo pipefail
IFS= read user_line
printf 'You typed: %s\n' "$user_line"
