const { Client } = require('pg');
const env = require('../../config/env');
const logger = require('../../shared/logger');
const createDatabaseConnectionError = require('./createDatabaseConnectionError');

function quoteIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

async function ensureDatabaseExists() {
  if (!env.database.autoCreate) {
    logger.info('Criação automática do banco desativada.');
    return;
  }

  const client = new Client({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.maintenanceName,
    connectionTimeoutMillis: env.database.connectionTimeout
  });

  try {
    await client.connect();
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [env.database.name]
    );

    if (result.rowCount > 0) {
      logger.info('Banco de dados já existe.', { database: env.database.name });
      return;
    }

    await client.query(`CREATE DATABASE ${quoteIdentifier(env.database.name)}`);
    logger.info('Banco de dados criado.', { database: env.database.name });
  } catch (error) {
    throw createDatabaseConnectionError(error, 'verificar ou criar o banco PostgreSQL');
  } finally {
    await client.end();
  }
}

module.exports = ensureDatabaseExists;
