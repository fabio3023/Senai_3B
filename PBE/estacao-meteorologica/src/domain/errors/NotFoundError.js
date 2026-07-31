const AppError = require('./AppError');

class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado.') {
    super({
      message,
      statusCode: 404,
      code: 'NOT_FOUND'
    });
  }
}

module.exports = NotFoundError;
