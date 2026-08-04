const AppError = require('../../shared/errors/AppError');

function formatIssues(error) {
  const issues = error.issues || error.errors || [];

  return issues.map((issue) => ({
    field: issue.path?.join('.') || 'request',
    message: issue.message,
  }));
}

function validate(schemas) {
  return (req, _res, next) => {
    try {
      req.validated = req.validated || {};

      for (const [source, schema] of Object.entries(schemas)) {
        if (!schema) continue;

        const result = schema.safeParse(req[source]);

        if (!result.success) {
          throw AppError.badRequest('Dados da requisição inválidos.', formatIssues(result.error));
        }

        // Express 5 expõe req.query como propriedade somente leitura.
        // Os dados convertidos e validados ficam em req.validated.
        req.validated[source] = result.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = validate;
