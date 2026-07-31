const { Op } = require('sequelize');
const LeituraRepository = require('../../domain/repositories/LeituraRepository');
const Leitura = require('../../domain/entities/Leitura');
const ConflictError = require('../../domain/errors/ConflictError');

class SequelizeLeituraRepository extends LeituraRepository {
  constructor({ model, sequelize }) {
    super();
    this.model = model;
    this.sequelize = sequelize;
  }

  #toEntity(record) {
    if (!record) return null;
    const data = record.get ? record.get({ plain: true }) : record;
    return Leitura.create(data);
  }

  #toPersistence(entity) {
    return {
      stationId: entity.stationId,
      timestamp: entity.timestamp,
      temperatureC: entity.temperatureC,
      humidityPct: entity.humidityPct
    };
  }

  async findAll({ page, limit, stationId, startDate, endDate }) {
    const where = {};

    if (stationId) where.stationId = stationId;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = startDate;
      if (endDate) where.timestamp[Op.lte] = endDate;
    }

    const result = await this.model.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['timestamp', 'DESC'], ['id', 'DESC']]
    });

    return {
      items: result.rows.map((row) => this.#toEntity(row)),
      total: result.count
    };
  }

  async findById(id) {
    return this.#toEntity(await this.model.findByPk(id));
  }

  async create(entity, options = {}) {
    try {
      const record = await this.model.create(
        this.#toPersistence(entity),
        { transaction: options.transaction }
      );
      return this.#toEntity(record);
    } catch (error) {
      this.#translatePersistenceError(error);
    }
  }

  async update(id, entity, options = {}) {
    const record = await this.model.findByPk(id, { transaction: options.transaction });
    if (!record) return null;

    try {
      await record.update(this.#toPersistence(entity), {
        transaction: options.transaction
      });
      return this.#toEntity(record);
    } catch (error) {
      this.#translatePersistenceError(error);
    }
  }

  async delete(id, options = {}) {
    const total = await this.model.destroy({
      where: { id },
      transaction: options.transaction
    });
    return total > 0;
  }

  async deleteAll(options = {}) {
    return this.model.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true,
      transaction: options.transaction
    });
  }

  async bulkCreate(entities, options = {}) {
    try {
      const records = await this.model.bulkCreate(
        entities.map((entity) => this.#toPersistence(entity)),
        {
          validate: true,
          returning: true,
          transaction: options.transaction
        }
      );
      return records.map((record) => this.#toEntity(record));
    } catch (error) {
      this.#translatePersistenceError(error);
    }
  }

  async replaceAll(entities) {
    return this.sequelize.transaction(async (transaction) => {
      await this.deleteAll({ transaction });
      return this.bulkCreate(entities, { transaction });
    });
  }

  #translatePersistenceError(error) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      throw new ConflictError(
        'Já existe uma leitura para esta estação na mesma data e hora.',
        { fields: error.fields }
      );
    }

    throw error;
  }
}

module.exports = SequelizeLeituraRepository;
