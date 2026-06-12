const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leitura = sequelize.define('leituras', {
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
}, {
  tableName: 'leituras',
  timestamps: false
});

module.exports = Leitura;
