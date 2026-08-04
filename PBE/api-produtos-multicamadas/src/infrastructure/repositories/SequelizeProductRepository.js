const { Op } = require('sequelize');
const Product = require('../../domain/entities/Product');
const ProductRepository = require('../../domain/repositories/ProductRepository');

class SequelizeProductRepository extends ProductRepository {
  constructor(ProductModel) {
    super();
    this.ProductModel = ProductModel;
  }

  toEntity(model) {
    if (!model) return null;
    return new Product(model.get({ plain: true }));
  }

  async create(productData) {
    const model = await this.ProductModel.create(productData);
    return this.toEntity(model);
  }

  async findAll({
    page = 1,
    limit = 10,
    name,
    sku,
    category,
    active,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    order = 'DESC',
  } = {}) {
    const where = {};

    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (sku) where.sku = { [Op.iLike]: `%${sku}%` };
    if (category) where.category = { [Op.iLike]: `%${category}%` };
    if (active !== undefined) where.active = active;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await this.ProductModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, order]],
    });

    return {
      items: rows.map((row) => this.toEntity(row)),
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id) {
    const model = await this.ProductModel.findByPk(id);
    return this.toEntity(model);
  }

  async findBySku(sku) {
    const model = await this.ProductModel.findOne({ where: { sku } });
    return this.toEntity(model);
  }

  async update(id, productData) {
    const model = await this.ProductModel.findByPk(id);
    if (!model) return null;

    await model.update(productData);
    return this.toEntity(model);
  }

  async delete(id) {
    const deletedRows = await this.ProductModel.destroy({ where: { id } });
    return deletedRows > 0;
  }
}

module.exports = SequelizeProductRepository;
