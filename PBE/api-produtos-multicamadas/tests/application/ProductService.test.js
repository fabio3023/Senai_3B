const test = require('node:test');
const assert = require('node:assert/strict');
const ProductService = require('../../src/application/services/ProductService');

class FakeProductRepository {
  constructor(initialProducts = []) {
    this.products = initialProducts.map((product) => ({ ...product }));
  }

  async create(data) {
    const now = new Date();
    const product = {
      id: `00000000-0000-4000-8000-${String(this.products.length + 1).padStart(12, '0')}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.products.push(product);
    return product;
  }

  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    return {
      items: this.products.slice(offset, offset + limit),
      pagination: {
        page,
        limit,
        totalItems: this.products.length,
        totalPages: Math.ceil(this.products.length / limit),
      },
    };
  }

  async findById(id) {
    return this.products.find((product) => product.id === id) || null;
  }

  async findBySku(sku) {
    return this.products.find((product) => product.sku === sku) || null;
  }

  async update(id, data) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index < 0) return null;
    this.products[index] = { ...this.products[index], ...data, updatedAt: new Date() };
    return this.products[index];
  }

  async delete(id) {
    const originalLength = this.products.length;
    this.products = this.products.filter((product) => product.id !== id);
    return this.products.length < originalLength;
  }
}

const baseProduct = {
  id: '11111111-1111-4111-8111-111111111111',
  sku: 'PROD-001',
  name: 'Produto de Teste',
  description: null,
  category: 'Testes',
  price: 10,
  stock: 5,
  active: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

test('cria um produto normalizando o SKU', async () => {
  const service = new ProductService(new FakeProductRepository());
  const result = await service.create({
    sku: ' prod-002 ',
    name: 'Produto Novo',
    category: 'Testes',
    price: 20,
    stock: 3,
  });

  assert.equal(result.sku, 'PROD-002');
  assert.equal(result.category, 'Testes');
  assert.equal(result.price, 20);
  assert.equal(result.stock, 3);
});

test('impede a criação de SKU duplicado', async () => {
  const service = new ProductService(new FakeProductRepository([baseProduct]));

  await assert.rejects(
    () => service.create({
      sku: 'PROD-001',
      name: 'Duplicado',
      category: 'Testes',
      price: 12,
      stock: 1,
    }),
    (error) => error.statusCode === 409,
  );
});

test('retorna erro 404 quando o produto não existe', async () => {
  const service = new ProductService(new FakeProductRepository());

  await assert.rejects(
    () => service.getById('22222222-2222-4222-8222-222222222222'),
    (error) => error.statusCode === 404,
  );
});

test('atualiza parcialmente um produto', async () => {
  const service = new ProductService(new FakeProductRepository([baseProduct]));
  const result = await service.update(baseProduct.id, { price: 15.5, stock: 8 });

  assert.equal(result.price, 15.5);
  assert.equal(result.stock, 8);
  assert.equal(result.name, baseProduct.name);
});

test('remove um produto existente', async () => {
  const repository = new FakeProductRepository([baseProduct]);
  const service = new ProductService(repository);

  await service.remove(baseProduct.id);
  assert.equal(repository.products.length, 0);
});
