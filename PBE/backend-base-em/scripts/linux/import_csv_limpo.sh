#!/usr/bin/env bash
# Limpa a tabela leituras e depois importa o arquivo data/em.csv
cd "$(dirname "$0")/../.."
npm run import:csv:clear
