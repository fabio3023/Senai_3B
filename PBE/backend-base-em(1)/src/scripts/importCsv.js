const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const ensureDatabase = require('../config/ensureDatabase');
const sequelize = require('../config/database');
const LeituraService = require('../services/LeituraService');
const LeituraRequestDTO = require('../dtos/LeituraRequestDTO');

const csvPath = path.join(__dirname, '../../data/em.csv');
const clearTable = process.argv.includes('--clear');

async function importCsv() {
  try {
    await ensureDatabase();
    await sequelize.authenticate();
    await sequelize.sync();

    if (clearTable) {
      console.log('Parâmetro --clear detectado. Limpando registros antigos...');
      await LeituraService.removerTodas();
      console.log('Tabela limpa.');
    }

    console.log(`Iniciando leitura de: ${csvPath}`);
    const dtos = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        dtos.push(new LeituraRequestDTO(row));
      })
      .on('end', async () => {
        try {
          console.log(`Validando e persistindo ${dtos.length} registros...`);
          await LeituraService.criarEmLote(dtos);
          console.log('Importação concluída com absoluto sucesso!');
          await sequelize.close();
          process.exit(0);
        } catch (err) {
          console.error('Erro durante a gravação em lote:', err.message);
          process.exit(1);
        }
      });
  } catch (error) {
    console.error('Erro na carga inicial da importação:', error.message);
    process.exit(1);
  }
}

importCsv();
