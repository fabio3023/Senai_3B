const { Client } = require('pg');
require('dotenv').config();

async function ensureDatabase() {
  const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_MAINTENANCE_NAME}`;
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log(`Verificando se o banco "${process.env.DB_NAME}" existe...`);

    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [process.env.DB_NAME]);

    if (res.rowCount === 0) {
      console.log(`Banco "${process.env.DB_NAME}" não encontrado. Criando...`);
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`Banco "${process.env.DB_NAME}" criado com sucesso.`);
    } else {
      console.log(`Banco "${process.env.DB_NAME}" já existe.`);
    }
  } catch (error) {
    console.error('Erro crítico ao verificar/criar o banco de dados:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

module.exports = ensureDatabase;
