require('dotenv').config();

const { Client } = require('pg');

function validarNomeBanco(nomeBanco) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(nomeBanco);
}

async function ensureDatabaseExists() {
  const databaseName = process.env.DB_NAME || 'db_em';

  if (!validarNomeBanco(databaseName)) {
    throw new Error(
      'Nome do banco inválido. Use apenas letras, números e underline. O nome não pode começar com número.'
    );
  }

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  await client.connect();

  try {
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`Banco de dados "${databaseName}" criado com sucesso.`);
    } else {
      console.log(`Banco de dados "${databaseName}" já existe.`);
    }
  } finally {
    await client.end();
  }
}

module.exports = ensureDatabaseExists;
