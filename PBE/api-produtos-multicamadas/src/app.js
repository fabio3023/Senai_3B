const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const createApiRoutes = require('./presentation/routes');
const notFound = require('./presentation/middlewares/notFound');
const errorHandler = require('./presentation/middlewares/errorHandler');

function createApp({ container, sequelize }) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan(env.app.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.get('/', (_req, res) => {
    res.status(200).json({
      name: 'API de Produtos Multicamadas',
      version: '1.0.0',
      documentation: '/api/products',
      health: '/health',
    });
  });

  app.get('/health', async (_req, res) => {
    try {
      await sequelize.authenticate();
      res.status(200).json({
        status: 'ok',
        database: 'connected',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    } catch (_error) {
      res.status(503).json({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.use('/api', createApiRoutes(container));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
