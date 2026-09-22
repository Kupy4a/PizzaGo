#!/usr/bin/env sh
# Starts PizzaGo on Linux/macOS. Usage: ./run.sh [dev|prod]
cd "$(dirname "$0")" || exit 1
exec node scripts/start.mjs "$@"
