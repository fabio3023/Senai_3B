const express = require('express');
const validate = require('../middlewares/validate');
const {
  createProductSchema,
  replaceProductSchema,
  updateProductSchema,
  productIdSchema,
  listProductsSchema,
} = require('../validators/productSchemas');

function createProductRoutes(productController) {
  const router = express.Router();

  router.post('/', validate({ body: createProductSchema }), productController.create);
  router.get('/', validate({ query: listProductsSchema }), productController.list);
  router.get('/:id', validate({ params: productIdSchema }), productController.getById);
  router.put(
    '/:id',
    validate({ params: productIdSchema, body: replaceProductSchema }),
    productController.replace,
  );
  router.patch(
    '/:id',
    validate({ params: productIdSchema, body: updateProductSchema }),
    productController.update,
  );
  router.delete('/:id', validate({ params: productIdSchema }), productController.remove);

  return router;
}

module.exports = createProductRoutes;
