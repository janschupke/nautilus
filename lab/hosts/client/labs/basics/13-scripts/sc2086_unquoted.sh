#!/usr/bin/env bash
# Deliberate: unquoted expansion (SC2086).
set -euo pipefail
name="hello world"
# Unquoted expansion is deliberate (SC2086).
printf '%s\n' Message: $name
