const express = require('express');
const createProductRoutes = require('./productRoutes');

function createApiRoutes({ productController }) {
  const router = express.Router();

  router.use('/products', createProductRoutes(productController));

  return router;
}

module.exports = createApiRoutes;
