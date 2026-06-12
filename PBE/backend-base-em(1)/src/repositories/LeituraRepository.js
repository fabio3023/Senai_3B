const Leitura = require('../models/Leitura');

class LeituraRepository {
  async findAndCountAll(options) {
    return await Leitura.findAndCountAll(options);
  }

  async findByPk(id) {
    return await Leitura.findByPk(id);
  }

  async create(data) {
    return await Leitura.create(data);
  }

  async bulkCreate(dataArray) {
    return await Leitura.bulkCreate(dataArray);
  }

  async update(id, data) {
    const leitura = await Leitura.findByPk(id);
    if (!leitura) return null;
    return await leitura.update(data);
  }

  async destroy(id) {
    const leitura = await Leitura.findByPk(id);
    if (!leitura) return false;
    await leitura.destroy();
    return true;
  }

  async destroyAll() {
    return await Leitura.destroy({ where: {}, truncate: false });
  }
}

module.exports = new LeituraRepository();
