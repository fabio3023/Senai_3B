const ensureDatabaseExists = require('../infrastructure/database/ensureDatabaseExists');
const { migrate } = require('../infrastructure/database/migrationRunner');
const createContainer = require('../bootstrap/createContainer');
const logger = require('../shared/logger');

async function main() {
  const container = createContainer();

  try {
    await ensureDatabaseExists();
    await container.sequelize.authenticate();
    await migrate(container.sequelize);
    const result = await container.leituraService.removerTodas();
    logger.info('Tabela leituras limpa.', result);
  } catch (error) {
    logger.error('Falha ao limpar leituras.', { message: error.message, stack: error.stack });
    process.exitCode = 1;
  } finally {
    await container.sequelize.close();
  }
}

main();
