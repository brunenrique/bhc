#!/bin/bash
set -euo pipefail

# Pasta do projeto (Firebase Studio)
SCRIPT_DIR="$(dirname "$0")"
PROJECT_DIR="$SCRIPT_DIR"

# Ativa Volta para usar versoes fixadas
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
if ! command -v volta >/dev/null 2>&1; then
  echo "Instalando Volta..."
  curl https://get.volta.sh -sSf | bash -s -- --skip-setup
  export PATH="$VOLTA_HOME/bin:$PATH"
fi
# Instala as versoes definidas (se houver)
volta install node npm pnpm >/dev/null 2>&1 || true

cd "$PROJECT_DIR"

echo "Node $(node -v)"
echo "PNPM $(pnpm -v)"
echo "Firebase CLI $(npx firebase --version)"

pnpm install

DATA_DIR="./emulator-data"
mkdir -p "$DATA_DIR"

firebase emulators:start --project="${FIREBASE_PROJECT:-thalamus-dev}" --only firestore,auth \
  --import="$DATA_DIR" --export-on-exit &
EMULATOR_PID=$!

cleanup() {
  echo "Encerrando emuladores..."
  kill $EMULATOR_PID
}
trap cleanup EXIT

sleep 5

pnpm run dev
