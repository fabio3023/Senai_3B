class AppError extends Error {
  constructor(message, statusCode = 400, code = 'APP_ERROR', details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message, details) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static notFound(message) {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message, details) {
    return new AppError(message, 409, 'CONFLICT', details);
  }
}

module.exports = AppError;
