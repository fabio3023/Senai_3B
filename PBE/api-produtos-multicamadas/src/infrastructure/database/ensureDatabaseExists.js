const { Client } = require('pg');
const env = require('../../config/env');

function quoteIdentifier(identifier) {
  return `"${String(identifier).replaceAll('"', '""')}"`;
}

async function ensureDatabaseExists() {
  const client = new Client({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.maintenanceName,
  });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [env.database.name],
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(env.database.name)}`);
      console.log(`Banco de dados "${env.database.name}" criado com sucesso.`);
    }
  } catch (error) {
    const message = [
      `Não foi possível verificar ou criar o banco PostgreSQL em ${env.database.host}:${env.database.port}.`,
      'Confira se o PostgreSQL está ativo e se DB_USER e DB_PASSWORD estão corretos no arquivo .env.',
      'O usuário também precisa ter permissão CREATEDB quando o banco ainda não existir.',
    ].join(' ');

    const wrappedError = new Error(message);
    wrappedError.code = error.code;
    wrappedError.cause = error;
    throw wrappedError;
  } finally {
    await client.end().catch(() => undefined);
  }
}

module.exports = ensureDatabaseExists;
