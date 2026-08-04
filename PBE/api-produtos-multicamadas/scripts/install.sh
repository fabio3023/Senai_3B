#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js não encontrado. Instale o Node.js 18 ou superior."
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Arquivo .env criado. Revise principalmente DB_USER e DB_PASSWORD."
fi

npm install
npm run check
echo "Instalação concluída."
