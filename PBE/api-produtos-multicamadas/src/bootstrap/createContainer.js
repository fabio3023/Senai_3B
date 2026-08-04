const ProductModel = require('../infrastructure/database/models/ProductModel');
const SequelizeProductRepository = require('../infrastructure/repositories/SequelizeProductRepository');
const ProductService = require('../application/services/ProductService');
const ProductController = require('../presentation/controllers/ProductController');

function createContainer() {
  const productRepository = new SequelizeProductRepository(ProductModel);
  const productService = new ProductService(productRepository);
  const productController = new ProductController(productService);

  return {
    productRepository,
    productService,
    productController,
  };
}

module.exports = createContainer;
