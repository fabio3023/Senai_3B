// src/config/ensureDatabase.js

const { Client } = require('pg');
require('dotenv').config();

/*
  Este arquivo verifica se o banco de dados existe.
  Caso o banco não exista, ele cria automaticamente.

  Importante:
  - Para criar um banco, primeiro precisamos conectar em outro banco já existente.
  - Normalmente usamos o banco administrativo chamado "postgres".
*/

/*
  Função para proteger o nome do banco de dados.

  Não podemos usar parâmetros como $1 para nomes de banco no CREATE DATABASE.
  Por isso, fazemos uma proteção simples contra aspas indevidas.
*/
function protegerIdentificador(nome) {
  return `"${String(nome).replace(/"/g, '""')}"`;
}

async function ensureDatabase() {
  const dbName = process.env.DB_NAME || 'db_em';
  const maintenanceDb = process.env.DB_MAINTENANCE_NAME || 'postgres';

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
    database: maintenanceDb,
  });

  try {
    await client.connect();

    console.log(`Verificando se o banco "${dbName}" existe...`);

    const resultado = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (resultado.rowCount > 0) {
      console.log(`Banco "${dbName}" já existe.`);
      return;
    }

    console.log(`Banco "${dbName}" não existe. Criando banco...`);

    await client.query(`CREATE DATABASE ${protegerIdentificador(dbName)}`);

    console.log(`Banco "${dbName}" criado com sucesso.`);
  } finally {
    await client.end();
  }
}

module.exports = ensureDatabase;