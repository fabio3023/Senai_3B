const { UniqueConstraintError, ValidationError } = require('sequelize');
const AppError = require('../../shared/errors/AppError');
const env = require('../../config/env');

function errorHandler(error, _req, res, _next) {
  let normalizedError = error;

  if (error instanceof UniqueConstraintError) {
    normalizedError = AppError.conflict('Já existe um registro com os mesmos dados únicos.',
      error.errors?.map((item) => ({ field: item.path, message: item.message })));
  } else if (error instanceof ValidationError) {
    normalizedError = AppError.badRequest('O banco rejeitou os dados informados.',
      error.errors?.map((item) => ({ field: item.path, message: item.message })));
  } else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    normalizedError = AppError.badRequest('O corpo JSON da requisição está malformado.');
  }

  const statusCode = normalizedError.statusCode || 500;
  const response = {
    success: false,
    error: {
      code: normalizedError.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode === 500
        ? 'Ocorreu um erro interno no servidor.'
        : normalizedError.message,
    },
  };

  if (normalizedError.details) {
    response.error.details = normalizedError.details;
  }

  if (statusCode === 500) {
    console.error(normalizedError);

    if (env.app.nodeEnv === 'development') {
      response.error.developmentMessage = normalizedError.message;
    }
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
