class CreateProductDTO {
  constructor({ sku, name, description = null, price, stock = 0, active = true }) {
    this.sku = sku.trim().toUpperCase();
    this.name = name.trim();
    this.description = description?.trim() || null;
    this.price = Number(price);
    this.stock = Number(stock);
    this.active = Boolean(active);
  }
}

module.exports = CreateProductDTO;
