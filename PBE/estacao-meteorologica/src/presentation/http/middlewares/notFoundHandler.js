const NotFoundError = require('../../../domain/errors/NotFoundError');

function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

module.exports = notFoundHandler;
