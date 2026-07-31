// Middleware centralizado de tratamento de erros.
// Isso evita repetir try/catch detalhado em todas as rotas.
function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV !== 'test') {
    console.error('Erro capturado pelo middleware:', error.message);
  }

  return res.status(statusCode).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

module.exports = errorHandler;
