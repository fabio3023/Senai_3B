#!/usr/bin/env bash
# Importa o arquivo data/em.csv sem limpar a tabela antes
cd "$(dirname "$0")/../.."
npm run import:csv
