const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const LeituraModel = sequelize.define(
  'LeituraModel',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    stationId: {
      field: 'station_id',
      type: DataTypes.STRING(100),
      allowNull: false
    },

    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },

    temperatureC: {
      field: 'temperature_c',
      type: DataTypes.DOUBLE,
      allowNull: false
    },

    humidityPct: {
      field: 'humidity_pct',
      type: DataTypes.DOUBLE,
      allowNull: false
    },

    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'leituras',
    schema: 'public',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
);

module.exports = LeituraModel;