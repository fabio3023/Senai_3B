const ensureDatabaseExists = require('./ensureDatabaseExists');
const sequelize = require('./sequelize');
require('./models/ProductModel');

async function resetDatabase() {
  if (!process.argv.includes('--yes')) {
    console.error('Operação cancelada. Use --yes para confirmar a recriação das tabelas.');
    process.exitCode = 1;
    return;
  }

  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('Tabelas recriadas com sucesso. Todos os dados anteriores foram removidos.');
  } catch (error) {
    console.error('Falha ao recriar as tabelas:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close().catch(() => undefined);
  }
}

resetDatabase();
