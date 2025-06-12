#!/bin/bash
# Merge feature branch into main and deploy
set -e

BRANCH=${1:-}
if [ -z "$BRANCH" ]; then
  echo "Usage: $0 feature/branch-name" >&2
  exit 1
fi

git checkout main
git pull origin main
git merge --no-ff "$BRANCH"

# Push to trigger Vercel build
git push origin main

# Deploy Firestore rules and hosting
firebase deploy --only hosting,firestore
