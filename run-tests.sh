#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(dirname "$0")"
echo "📦 Instalando dependências via pnpm..."
pnpm install

echo "🔍 Verificando instalação do Jest..."
if ! npx --no-install jest --version >/dev/null 2>&1; then
  echo "❌ Jest não encontrado. Verifique a instalação das dependências." >&2
  exit 1
fi

echo "🔥 Iniciando Firebase Emulator e executando testes..."
npx firebase emulators:exec --project="${FIREBASE_PROJECT:-thalamus-dev}" --only firestore "pnpm run test:all -- --runInBand"
