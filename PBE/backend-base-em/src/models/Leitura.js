const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// MODEL / ENTIDADE ORM
// Este arquivo representa a tabela public.leituras dentro do Node.js.
// O ORM Sequelize faz a ponte entre objetos JavaScript e registros do PostgreSQL.
const Leitura = sequelize.define(
  'Leitura',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    station_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    temperature_c: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    humidity_pct: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  },
  {
    tableName: 'leituras',
    schema: 'public',

    // A tabela informada pelo professor não possui created_at nem updated_at.
    // Por isso, desligamos os timestamps automáticos do Sequelize.
    timestamps: false
  }
);

module.exports = Leitura;
