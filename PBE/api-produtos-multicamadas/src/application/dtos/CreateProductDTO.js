class CreateProductDTO {
  constructor({
    sku,
    name,
    description = null,
    category,
    price,
    stock = 0,
    active = true,
  }) {
    this.sku = sku.trim().toUpperCase();
    this.name = name.trim();
    this.description = description?.trim() || null;
    this.category = category?.trim();
    this.price = Number(price);
    this.stock = Number(stock);
    this.active = Boolean(active);
  }
}

module.exports = CreateProductDTO;
