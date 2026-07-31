const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const createApiRoutes = require('./presentation/http/routes');
const requestContext = require('./presentation/http/middlewares/requestContext');
const requestLogger = require('./presentation/http/middlewares/requestLogger');
const securityHeaders = require('./presentation/http/middlewares/securityHeaders');
const notFoundHandler = require('./presentation/http/middlewares/notFoundHandler');
const errorHandler = require('./presentation/http/middlewares/errorHandler');

function createCorsOptions() {
  if (env.corsOrigins.includes('*')) {
    return { origin: true };
  }

  return {
    origin(origin, callback) {
      // Requisições sem Origin incluem navegador direto, curl, Postman e scripts locais.
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error('Origem não autorizada pelo CORS.');
      error.statusCode = 403;
      error.code = 'CORS_ORIGIN_DENIED';
      return callback(error);
    }
  };
}

function createApp({ leituraController, healthController }) {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestContext);
  app.use(requestLogger);
  app.use(securityHeaders);
  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: env.requestBodyLimit }));

  app.get('/', (req, res) => {
    res.status(200).json({
      data: {
        message: 'API Backend EM em execução.',
        api: env.apiPrefix,
        documentation: `${env.apiPrefix}`,
        health: `${env.apiPrefix}/health/ready`
      }
    });
  });

  app.use(env.apiPrefix, createApiRoutes({ leituraController, healthController }));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
