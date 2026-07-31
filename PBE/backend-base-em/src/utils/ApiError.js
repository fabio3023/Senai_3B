// Classe simples para representar erros esperados da API.
// Exemplo: erro 400 de validação ou erro 404 quando um registro não existe.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
