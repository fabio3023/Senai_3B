class ProductResponseDTO {
  constructor(product) {
    this.id = product.id;
    this.sku = product.sku;
    this.name = product.name;
    this.description = product.description;
    this.price = Number(product.price);
    this.stock = Number(product.stock);
    this.active = Boolean(product.active);
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }

  static from(product) {
    return new ProductResponseDTO(product);
  }
}

module.exports = ProductResponseDTO;
