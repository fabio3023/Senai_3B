class ProductRepository {
  async create(_productData) {
    throw new Error('Método create não implementado.');
  }

  async findAll(_filters) {
    throw new Error('Método findAll não implementado.');
  }

  async findById(_id) {
    throw new Error('Método findById não implementado.');
  }

  async findBySku(_sku) {
    throw new Error('Método findBySku não implementado.');
  }

  async update(_id, _productData) {
    throw new Error('Método update não implementado.');
  }

  async delete(_id) {
    throw new Error('Método delete não implementado.');
  }
}

module.exports = ProductRepository;
