#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Arquivo .env criado. Revise DB_USER e DB_PASSWORD antes de continuar."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  npm install
fi

npm start
