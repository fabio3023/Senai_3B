#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
[[ -f .env ]] || { echo 'Crie .env a partir de .env.example e ajuste a senha do PostgreSQL.' >&2; exit 1; }
npm run db:check
npm start
