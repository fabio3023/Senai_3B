#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
bash scripts/linux/postgres_service.sh status
if [[ -f .env ]]; then
  npm run db:check
fi
