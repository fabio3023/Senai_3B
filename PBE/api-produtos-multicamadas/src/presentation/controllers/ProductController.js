class ProductController {
  constructor(productService) {
    this.productService = productService;

    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.replace = this.replace.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  async create(req, res, next) {
    try {
      const product = await this.productService.create(req.validated.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const result = await this.productService.list(req.validated.query);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await this.productService.getById(req.validated.params.id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async replace(req, res, next) {
    try {
      const product = await this.productService.update(
        req.validated.params.id,
        req.validated.body,
      );
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await this.productService.update(
        req.validated.params.id,
        req.validated.body,
      );
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await this.productService.remove(req.validated.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
