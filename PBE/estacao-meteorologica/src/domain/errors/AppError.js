class AppError extends Error {
  constructor({ message, statusCode = 500, code = 'INTERNAL_ERROR', details = null, cause }) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = statusCode < 500;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

module.exports = AppError;
