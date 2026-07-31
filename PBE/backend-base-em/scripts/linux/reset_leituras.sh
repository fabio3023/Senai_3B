#!/usr/bin/env bash
# Remove todos os registros da tabela leituras
cd "$(dirname "$0")/../.."
npm run reset:leituras
