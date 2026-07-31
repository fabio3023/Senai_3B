const { Sequelize } = require('sequelize');
const env = require('../../config/env');
const logger = require('../../shared/logger');

const sequelize = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect: 'postgres',
    dialectOptions: {
      connectionTimeoutMillis: env.database.connectionTimeout
    },
    timezone: env.database.timezone,
    logging: env.database.logging
      ? (sql) => logger.debug('SQL executado.', { sql })
      : false,
    pool: env.database.pool,
    define: {
      freezeTableName: true,
      underscored: true
    }
  }
);

module.exports = sequelize;
