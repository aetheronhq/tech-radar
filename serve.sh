#!/usr/bin/env bash
set -euo pipefail
PORT="${1:-8000}"
HOST="127.0.0.1"
URL="http://$HOST:$PORT/"

# Prefer Python if available
if command -v python3 >/dev/null 2>&1; then
  echo "Serving public/ at http://$HOST:$PORT"
  # Start server from public directory
  ( cd public && python3 -m http.server "$PORT" --bind "$HOST" ) &
  pid=$!
else
  echo "python3 not found. Please install Python 3 or run: npx serve public" >&2
  exit 1
fi

# Try to open the browser (macOS: open)
if command -v open >/dev/null 2>&1; then
  sleep 1
  open "$URL" || true
fi

wait $pid