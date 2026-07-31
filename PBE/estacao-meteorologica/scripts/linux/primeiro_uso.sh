#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
command -v node >/dev/null || { echo 'Node.js não encontrado.' >&2; exit 1; }
command -v npm >/dev/null || { echo 'npm não encontrado.' >&2; exit 1; }
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo 'Arquivo .env criado. Ajuste DB_USER e DB_PASSWORD e execute novamente.'
  exit 0
fi
npm install
bash scripts/linux/postgres_service.sh start
npm run db:check
npm run db:migrate
echo 'Projeto preparado. Execute: bash scripts/linux/start.sh'
