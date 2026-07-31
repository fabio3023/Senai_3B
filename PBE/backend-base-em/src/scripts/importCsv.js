require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const ensureDatabaseExists = require('../config/ensureDatabase');
const sequelize = require('../config/database');
const Leitura = require('../models/Leitura');
const LeituraRequestDTO = require('../dtos/LeituraRequestDTO');
const leituraService = require('../services/LeituraService');

// SCRIPT DE IMPORTAÇÃO DO CSV
// Uso padrão:
// npm run import:csv
//
// Para limpar a tabela antes de importar:
// npm run import:csv:clear

const csvPath = path.resolve(__dirname, '../../data/em.csv');
const shouldClearTable = process.argv.includes('--clear');

async function readCsvFile() {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function importCsv() {
  try {
    // Garante que o banco db_em exista antes de importar/alterar dados.
    await ensureDatabaseExists();

    await sequelize.authenticate();
    await sequelize.sync();

    if (!fs.existsSync(csvPath)) {
      throw new Error(`Arquivo CSV não encontrado em: ${csvPath}`);
    }

    if (shouldClearTable) {
      await leituraService.removerTodas();
      console.log('Tabela leituras limpa antes da importação.');
    }

    const rows = await readCsvFile();
    const dtoList = rows.map((row) => LeituraRequestDTO.fromCsvRow(row));

    const resultado = await leituraService.importarLista(dtoList);

    console.log(resultado.message);
    console.log(`Total importado: ${resultado.totalImportado}`);
  } catch (error) {
    console.error('Erro ao importar CSV:', error.message);
  } finally {
    await sequelize.close();
  }
}

importCsv();
