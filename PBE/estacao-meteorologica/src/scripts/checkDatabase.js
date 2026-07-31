const ensureDatabaseExists = require('../infrastructure/database/ensureDatabaseExists');
const sequelize = require('../infrastructure/database/sequelize');
const createDatabaseConnectionError = require('../infrastructure/database/createDatabaseConnectionError');
const env = require('../config/env');
const logger = require('../shared/logger');

async function main() {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    logger.info('PostgreSQL local acessível.', {
      host: env.database.host,
      port: env.database.port,
      database: env.database.name,
      user: env.database.user
    });
  } catch (error) {
    const diagnostic = error.name === 'DatabaseConnectionError'
      ? error
      : createDatabaseConnectionError(error, 'validar a conexão com o PostgreSQL');

    logger.error(diagnostic.message, {
      code: diagnostic.code,
      details: diagnostic.details
    });
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

main();
