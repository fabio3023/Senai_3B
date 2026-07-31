const http = require('http');
const env = require('./config/env');
const logger = require('./shared/logger');
const ensureDatabaseExists = require('./infrastructure/database/ensureDatabaseExists');
const { migrate } = require('./infrastructure/database/migrationRunner');
const createContainer = require('./bootstrap/createContainer');
const createApp = require('./app');
const createDatabaseConnectionError = require('./infrastructure/database/createDatabaseConnectionError');

async function startServer() {
  await ensureDatabaseExists();

  const container = createContainer();
  try {
    await container.sequelize.authenticate();
  } catch (error) {
    throw createDatabaseConnectionError(error, 'conectar ao banco da aplicação');
  }
  logger.info('Conexão com PostgreSQL estabelecida.');

  if (env.database.runMigrations) {
    await migrate(container.sequelize);
  }

  const app = createApp(container);
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(env.port, resolve));

  logger.info('API iniciada.', {
    url: `http://localhost:${env.port}`,
    api: `http://localhost:${env.port}${env.apiPrefix}`,
    health: `http://localhost:${env.port}${env.apiPrefix}/health/ready`
  });

  let shuttingDown = false;

  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('Encerramento solicitado.', { signal });

    const forceExitTimer = setTimeout(() => {
      logger.error('Encerramento forçado após tempo limite.');
      process.exit(1);
    }, 10000);
    forceExitTimer.unref();

    try {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await container.sequelize.close();
      logger.info('Servidor e conexões encerrados com segurança.');
      process.exit(0);
    } catch (error) {
      logger.error('Falha durante o encerramento.', { message: error.message });
      process.exit(1);
    }
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Promise rejeitada sem tratamento.', {
      message: reason instanceof Error ? reason.message : String(reason)
    });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Exceção não capturada.', { message: error.message, stack: error.stack });
    shutdown('uncaughtException');
  });
}

startServer().catch((error) => {
  logger.error('Não foi possível iniciar a aplicação.', {
    message: error.message,
    code: error.code,
    details: error.details,
    stack: error.stack
  });
  process.exit(1);
});
