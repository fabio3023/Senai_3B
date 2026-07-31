const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');

function createLeituraRoutes({ leituraController }) {
  const router = express.Router();

  router.get('/', asyncHandler(leituraController.listar));
  router.get('/:id', asyncHandler(leituraController.buscarPorId));
  router.post('/', asyncHandler(leituraController.criar));
  router.put('/:id', asyncHandler(leituraController.substituir));
  router.patch('/:id', asyncHandler(leituraController.atualizarParcialmente));
  router.delete('/:id', asyncHandler(leituraController.remover));
  router.delete('/', asyncHandler(leituraController.removerTodas));

  return router;
}

module.exports = createLeituraRoutes;
