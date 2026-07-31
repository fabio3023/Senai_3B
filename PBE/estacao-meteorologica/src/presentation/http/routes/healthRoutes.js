const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');

function createHealthRoutes({ healthController }) {
  const router = express.Router();

  router.get('/live', healthController.liveness);
  router.get('/ready', asyncHandler(healthController.readiness));

  return router;
}

module.exports = createHealthRoutes;
