const ensureDatabase = require('../config/ensureDatabase');
const sequelize = require('../config/database');
const LeituraService = require('../services/LeituraService');

async function resetLeituras() {
  try {
    await ensureDatabase();
    await sequelize.authenticate();
    await sequelize.sync();

    console.log('Resetando tabela de leituras...');
    await LeituraService.removerTodas();

    // Reinicia sequência do ID serial no PostgreSQL
    await sequelize.query('ALTER SEQUENCE leituras_id_seq RESTART WITH 1;');

    console.log('Tabela limpa e contador de ID reiniciado.');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Erro ao resetar banco:', error.message);
    process.exit(1);
  }
}

resetLeituras();
