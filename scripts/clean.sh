#!/bin/bash
rm -rf node_modules .next .jest-cache
pnpm store prune
pnpm install
