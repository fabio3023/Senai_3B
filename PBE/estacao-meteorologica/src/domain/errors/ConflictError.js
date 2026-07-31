const AppError = require('./AppError');

class ConflictError extends AppError {
  constructor(message, details = null) {
    super({
      message,
      statusCode: 409,
      code: 'CONFLICT',
      details
    });
  }
}

module.exports = ConflictError;
