const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leitura = sequelize.define(
  'Leitura',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    station_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    temperature_c: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    humidity_pct: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: 'leituras',
    timestamps: false,
  }
);

module.exports = Leitura;
