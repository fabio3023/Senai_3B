require('dotenv').config();
const ensureDatabaseExists = require('../config/ensureDatabase');
const sequelize = require('../config/database');
require('../models/Leitura');
const leituraService = require('../services/LeituraService');

// SCRIPT PARA LIMPAR A TABELA LEITURAS
// Uso:
// npm run reset:leituras

async function reset() {
  try {
    // Garante que o banco db_em exista antes de importar/alterar dados.
    await ensureDatabaseExists();

    await sequelize.authenticate();
    await sequelize.sync();

    const resultado = await leituraService.removerTodas();
    console.log(resultado.message);
  } catch (error) {
    console.error('Erro ao limpar leituras:', error.message);
  } finally {
    await sequelize.close();
  }
}

reset();
