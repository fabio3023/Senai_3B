const { Sequelize } = require('sequelize');
require('dotenv').config();

// Este arquivo concentra a configuração de conexão com o banco de dados.
// Assim, se o banco mudar no futuro, alteramos apenas este ponto do projeto.
const sequelize = new Sequelize(
  process.env.DB_NAME || 'db_em',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',

    // Em aula, manter false deixa o terminal mais limpo.
    // Se quiser ver os SQLs gerados pelo Sequelize, troque para console.log.
    logging: false,

    // Configuração simples de pool de conexões.
    // Pool evita abrir uma nova conexão para cada requisição.
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    // Mantém datas trabalhando com timezone.
    timezone: '-03:00'
  }
);

module.exports = sequelize;
