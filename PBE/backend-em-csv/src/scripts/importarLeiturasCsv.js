require('dotenv').config();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const ensureDatabaseExists = require('../config/ensureDatabase');
const sequelize = require('../config/database');
const Leitura = require('../models/Leitura');

const caminhoCsv = path.resolve(__dirname, '../../data/leituras.csv');

function converterNumero(valor) {
  if (valor === undefined || valor === null || valor === '') {
    return null;
  }

  return Number(String(valor).replace(',', '.'));
}

function lerCsv() {
  return new Promise((resolve, reject) => {
    const leituras = [];

    fs.createReadStream(caminhoCsv)
      .pipe(csv({ separator: ';' }))
      .on('data', (linha) => {
        const leitura = {
          station_id: linha.station_id,
          timestamp: new Date(linha.timestamp),
          temperature_c: converterNumero(linha.temperature_c),
          humidity_pct: converterNumero(linha.humidity_pct),
        };

        leituras.push(leitura);
      })
      .on('end', () => {
        resolve(leituras);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function importarLeituras() {
  try {
    console.log('Iniciando importação do CSV...');
    console.log('Arquivo:', caminhoCsv);

    if (!fs.existsSync(caminhoCsv)) {
      throw new Error('Arquivo CSV não encontrado.');
    }

    const leituras = await lerCsv();

    if (leituras.length === 0) {
      console.log('Nenhuma leitura encontrada no CSV.');
      return;
    }

    await ensureDatabaseExists();

    await sequelize.authenticate();
    console.log('Conexão com PostgreSQL realizada com sucesso.');

    await sequelize.sync();
    console.log('Tabela sincronizada com sucesso.');

    await Leitura.bulkCreate(leituras);

    console.log(`${leituras.length} leituras importadas com sucesso.`);
  } catch (error) {
    console.error('Erro ao importar leituras do CSV:');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

importarLeituras();
