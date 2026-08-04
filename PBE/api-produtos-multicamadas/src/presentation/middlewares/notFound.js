const AppError = require('../../shared/errors/AppError');

function notFound(req, _res, next) {
  next(AppError.notFound(`Rota ${req.method} ${req.originalUrl} não encontrada.`));
}

module.exports = notFound;
