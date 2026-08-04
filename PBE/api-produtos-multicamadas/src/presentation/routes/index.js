const express = require('express');
const createProductRoutes = require('./productRoutes');

function createApiRoutes({ productController }) {
  const router = express.Router();
  const productRoutes = createProductRoutes(productController);

  router.use('/products', productRoutes);
  router.use('/produtos', productRoutes);

  return router;
}

module.exports = createApiRoutes;
