const AppError = require('../../shared/errors/AppError');
const CreateProductDTO = require('../dtos/CreateProductDTO');
const UpdateProductDTO = require('../dtos/UpdateProductDTO');
const ProductResponseDTO = require('../dtos/ProductResponseDTO');

class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async create(payload) {
    const dto = new CreateProductDTO(payload);
    const existingProduct = await this.productRepository.findBySku(dto.sku);

    if (existingProduct) {
      throw AppError.conflict(`Já existe um produto com o SKU ${dto.sku}.`);
    }

    const product = await this.productRepository.create(dto);
    return ProductResponseDTO.from(product);
  }

  async list(filters = {}) {
    const result = await this.productRepository.findAll(filters);

    return {
      items: result.items.map(ProductResponseDTO.from),
      pagination: result.pagination,
    };
  }

  async getById(id) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw AppError.notFound('Produto não encontrado.');
    }

    return ProductResponseDTO.from(product);
  }

  async update(id, payload) {
    const currentProduct = await this.productRepository.findById(id);

    if (!currentProduct) {
      throw AppError.notFound('Produto não encontrado.');
    }

    const dto = new UpdateProductDTO(payload);

    if (dto.sku && dto.sku !== currentProduct.sku) {
      const productWithSameSku = await this.productRepository.findBySku(dto.sku);

      if (productWithSameSku && productWithSameSku.id !== id) {
        throw AppError.conflict(`Já existe um produto com o SKU ${dto.sku}.`);
      }
    }

    const updatedProduct = await this.productRepository.update(id, dto);
    return ProductResponseDTO.from(updatedProduct);
  }

  async remove(id) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw AppError.notFound('Produto não encontrado.');
    }

    await this.productRepository.delete(id);
  }
}

module.exports = ProductService;
