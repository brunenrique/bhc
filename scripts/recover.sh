#!/usr/bin/env bash
set -euo pipefail

# This script attempts to fix Turbopack/PostCSS issues
# by clearing dependencies and reinstalling.
# It also demonstrates how to run Next.js using Webpack.

# Step 1: clean install artifacts
rm -rf node_modules pnpm-lock.yaml .next

# Step 2: reinstall dependencies
pnpm install

# Step 3: run Next.js with Webpack for verification
npx next dev -p 3000 &
PID=$!
# Give the server time to start
sleep 10
curl -I http://localhost:3000 || true
kill $PID

echo "If the server runs without errors, update package.json to remove --turbopack."

