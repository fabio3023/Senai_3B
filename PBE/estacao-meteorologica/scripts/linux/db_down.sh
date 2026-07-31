#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
echo 'ATENÇÃO: o PostgreSQL local pode ser usado por outros sistemas.'
read -r -p 'Deseja realmente parar o serviço PostgreSQL? [s/N] ' answer
[[ "$answer" =~ ^[sS]$ ]] || exit 0
bash scripts/linux/postgres_service.sh stop
