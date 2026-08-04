class UpdateProductDTO {
  constructor(payload) {
    if (payload.sku !== undefined) this.sku = payload.sku.trim().toUpperCase();
    if (payload.name !== undefined) this.name = payload.name.trim();
    if (payload.description !== undefined) {
      this.description = payload.description?.trim() || null;
    }
    if (payload.price !== undefined) this.price = Number(payload.price);
    if (payload.stock !== undefined) this.stock = Number(payload.stock);
    if (payload.active !== undefined) this.active = Boolean(payload.active);
  }
}

module.exports = UpdateProductDTO;
