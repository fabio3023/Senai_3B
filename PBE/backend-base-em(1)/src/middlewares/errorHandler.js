function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor.';

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message: message
  });
}

module.exports = errorHandler;
