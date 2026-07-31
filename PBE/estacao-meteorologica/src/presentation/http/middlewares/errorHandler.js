const AppError = require('../../../domain/errors/AppError');
const logger = require('../../../shared/logger');
const env = require('../../../config/env');

function normalizeError(error) {
  if (error instanceof AppError) return error;

  if (error?.type === 'entity.parse.failed') {
    return new AppError({
      message: 'O corpo enviado não contém um JSON válido.',
      statusCode: 400,
      code: 'INVALID_JSON'
    });
  }

  if (error?.name === 'SequelizeValidationError') {
    return new AppError({
      message: 'Os dados não atendem às regras do banco de dados.',
      statusCode: 400,
      code: 'DATABASE_VALIDATION_ERROR',
      details: error.errors?.map((item) => ({ field: item.path, message: item.message }))
    });
  }

  if (Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode <= 599) {
    return new AppError({
      message: error.message || 'Falha ao processar a requisição.',
      statusCode: error.statusCode,
      code: error.code || 'REQUEST_ERROR',
      details: error.details,
      cause: error
    });
  }

  return new AppError({
    message: 'Ocorreu um erro interno no servidor.',
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    cause: error
  });
}

function errorHandler(error, req, res, next) {
  const normalized = normalizeError(error);

  logger.error('Erro processando requisição.', {
    requestId: req.requestId,
    code: normalized.code,
    statusCode: normalized.statusCode,
    message: error.message,
    stack: env.isProduction ? undefined : error.stack
  });

  const payload = {
    error: {
      code: normalized.code,
      message: normalized.message,
      request_id: req.requestId
    }
  };

  if (normalized.details) payload.error.details = normalized.details;
  if (!env.isProduction && normalized.statusCode >= 500) payload.error.debug = error.message;

  res.status(normalized.statusCode).json(payload);
}

module.exports = errorHandler;
