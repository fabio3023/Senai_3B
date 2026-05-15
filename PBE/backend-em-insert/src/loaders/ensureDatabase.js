require('dotenv').config();

const { Client } = require('pg');

async function ensureDatabaseExists() {
  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  await adminClient.connect();

  try {
    const dbName = process.env.DB_NAME;
    const result = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

    if (result.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`Banco ${dbName} criado com sucesso.`);
    } else {
      console.log(`Banco ${dbName} já existe.`);
    }
  } finally {
    await adminClient.end();
  }
}

module.exports = ensureDatabaseExists;
