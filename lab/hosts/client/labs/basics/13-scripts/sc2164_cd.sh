#!/usr/bin/env bash
# Deliberate: cd without explicit error handling (SC2164).
# Note: `set -e` suppresses this ShellCheck warning, so this snippet stays minimal.
cd /this/path/should/not/exist/on/any/machine
printf 'inside=%s\n' "$PWD"
