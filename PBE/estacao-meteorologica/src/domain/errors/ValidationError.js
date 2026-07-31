const AppError = require('./AppError');

class ValidationError extends AppError {
  constructor(message, details = null) {
    super({
      message,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details
    });
  }
}

module.exports = ValidationError;
