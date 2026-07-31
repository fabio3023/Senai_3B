const LeituraRepository = require('../../src/domain/repositories/LeituraRepository');
const Leitura = require('../../src/domain/entities/Leitura');

class InMemoryLeituraRepository extends LeituraRepository {
  constructor(initialItems = []) {
    super();
    this.items = initialItems;
    this.nextId = initialItems.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
  }

  async findAll({ page, limit, stationId, startDate, endDate }) {
    let filtered = [...this.items];
    if (stationId) filtered = filtered.filter((item) => item.stationId === stationId);
    if (startDate) filtered = filtered.filter((item) => item.timestamp >= startDate);
    if (endDate) filtered = filtered.filter((item) => item.timestamp <= endDate);

    filtered.sort((a, b) => b.timestamp - a.timestamp || b.id - a.id);
    const offset = (page - 1) * limit;

    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length
    };
  }

  async findById(id) {
    return this.items.find((item) => item.id === id) || null;
  }

  async create(entity) {
    const now = new Date();
    const created = Leitura.create({ ...entity, id: this.nextId++, createdAt: now, updatedAt: now });
    this.items.push(created);
    return created;
  }

  async update(id, entity) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index < 0) return null;
    const updated = Leitura.create({
      ...entity,
      id,
      createdAt: this.items[index].createdAt,
      updatedAt: new Date()
    });
    this.items[index] = updated;
    return updated;
  }

  async delete(id) {
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < initialLength;
  }

  async deleteAll() {
    const total = this.items.length;
    this.items = [];
    this.nextId = 1;
    return total;
  }

  async bulkCreate(entities) {
    const created = [];
    for (const entity of entities) created.push(await this.create(entity));
    return created;
  }

  async replaceAll(entities) {
    await this.deleteAll();
    return this.bulkCreate(entities);
  }
}

module.exports = InMemoryLeituraRepository;
