const express = require('express');
const createLeituraRoutes = require('./leituraRoutes');
const createHealthRoutes = require('./healthRoutes');

function createApiRoutes({ leituraController, healthController }) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.status(200).json({
      data: {
        name: 'Backend EM',
        version: '2.0.0',
        description: 'API de leituras meteorológicas organizada em n-camadas.',
        endpoints: {
          health_live: 'GET /health/live',
          health_ready: 'GET /health/ready',
          readings: 'GET|POST|DELETE /leituras',
          reading_by_id: 'GET|PUT|PATCH|DELETE /leituras/:id'
        }
      }
    });
  });

  router.use('/health', createHealthRoutes({ healthController }));
  router.use('/leituras', createLeituraRoutes({ leituraController }));

  return router;
}

module.exports = createApiRoutes;
