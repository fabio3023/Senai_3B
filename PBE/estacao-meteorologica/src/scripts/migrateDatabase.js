const ensureDatabaseExists = require('../infrastructure/database/ensureDatabaseExists');
const sequelize = require('../infrastructure/database/sequelize');
const { migrate } = require('../infrastructure/database/migrationRunner');
const logger = require('../shared/logger');

async function main() {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    const result = await migrate(sequelize);
    logger.info('Migrações concluídas.', result);
  } catch (error) {
    logger.error('Falha ao aplicar migrações.', { message: error.message, stack: error.stack });
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

main();
