const { Op } = require('sequelize');
const Leitura = require('../models/Leitura');

// REPOSITORY / CAMADA DE ACESSO A DADOS
// O Repository é responsável por conversar com o banco de dados.
// Controller e Service não precisam saber detalhes do Sequelize.
class LeituraRepository {
  async findAll({ page = 1, limit = 20, station_id, data_inicio, data_fim }) {
    const where = {};

    if (station_id) {
      where.station_id = station_id;
    }

    if (data_inicio || data_fim) {
      where.timestamp = {};

      if (data_inicio) {
        where.timestamp[Op.gte] = new Date(data_inicio);
      }

      if (data_fim) {
        where.timestamp[Op.lte] = new Date(data_fim);
      }
    }

    const offset = (page - 1) * limit;

    return Leitura.findAndCountAll({
      where,
      limit,
      offset,
      order: [['timestamp', 'DESC'], ['id', 'DESC']]
    });
  }

  async findById(id) {
    return Leitura.findByPk(id);
  }

  async create(data) {
    return Leitura.create(data);
  }

  async update(id, data) {
    const leitura = await this.findById(id);

    if (!leitura) {
      return null;
    }

    return leitura.update(data);
  }

  async delete(id) {
    const leitura = await this.findById(id);

    if (!leitura) {
      return false;
    }

    await leitura.destroy();
    return true;
  }

  async deleteAll() {
    // truncate remove todos os registros.
    // cascade garante limpeza caso existam relações futuras.
    // restartIdentity reinicia o id serial em 1.
    return Leitura.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    });
  }

  async bulkCreate(dataList) {
    return Leitura.bulkCreate(dataList, {
      validate: true
    });
  }
}

module.exports = new LeituraRepository();
