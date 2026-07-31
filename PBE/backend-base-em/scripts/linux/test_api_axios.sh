#!/usr/bin/env bash
# Testa a API usando Axios. A API precisa estar ligada antes.
cd "$(dirname "$0")/../.."
npm run test:api
