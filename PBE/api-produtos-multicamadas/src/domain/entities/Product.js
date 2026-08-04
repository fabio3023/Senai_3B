class Product {
  constructor({
    id,
    sku,
    name,
    description = null,
    category,
    price,
    stock = 0,
    active = true,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.sku = sku;
    this.name = name;
    this.description = description;
    this.category = category;
    this.price = Number(price);
    this.stock = Number(stock);
    this.active = Boolean(active);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Product;
