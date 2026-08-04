const env = require('./config/env');
const ensureDatabaseExists = require('./infrastructure/database/ensureDatabaseExists');
const initializeDatabase = require('./infrastructure/database/initializeDatabase');
const sequelize = require('./infrastructure/database/sequelize');
const createContainer = require('./bootstrap/createContainer');
const createApp = require('./app');

let httpServer;
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\nSinal ${signal} recebido. Encerrando a aplicação...`);

  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }

  await sequelize.close().catch(() => undefined);
  console.log('Aplicação encerrada com segurança.');
  process.exit(0);
}

async function start() {
  try {
    await ensureDatabaseExists();
    await initializeDatabase();

    const container = createContainer();
    const app = createApp({ container, sequelize });

    httpServer = app.listen(env.app.port, () => {
      console.log(`API disponível em http://localhost:${env.app.port}`);
      console.log(`Health check: http://localhost:${env.app.port}/health`);
      console.log(`Produtos: http://localhost:${env.app.port}/api/products`);
    });
  } catch (error) {
    console.error('Não foi possível iniciar a API.');
    console.error(error.message);

    if (error.code) {
      console.error(`Código do erro: ${error.code}`);
    }

    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('Promise rejeitada sem tratamento:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Exceção não tratada:', error);
  process.exit(1);
});

start();
