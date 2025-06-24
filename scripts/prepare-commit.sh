#!/bin/bash

if [ ! -d node_modules ]; then
  echo "Execute pnpm install antes de commitar" >&2
  exit 1
fi

pnpm run lint
pnpm run typecheck
pnpm test
