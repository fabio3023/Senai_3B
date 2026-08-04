const sequelize = require('./sequelize');

async function initializeDatabase() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: false });
  console.log('Conexão com o PostgreSQL estabelecida e tabelas sincronizadas.');
}

module.exports = initializeDatabase;
