const ValidationError = require('../../domain/errors/ValidationError');
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value, fieldName) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`O campo ${fieldName} deve conter uma data válida.`);
  }
  return date;
}

function parseStartDate(value, fieldName = 'data_inicio') {
  if (!value) return undefined;

  if (DATE_ONLY_PATTERN.test(String(value))) {
    return parseDate(`${value}T00:00:00.000${process.env.DB_TIMEZONE || '-03:00'}`, fieldName);
  }

  return parseDate(value, fieldName);
}

function parseEndDate(value, fieldName = 'data_fim') {
  if (!value) return undefined;

  // Quando o aluno informa somente YYYY-MM-DD, o filtro inclui o dia inteiro
  // no fuso configurado para a aplicação.
  if (DATE_ONLY_PATTERN.test(String(value))) {
    return parseDate(`${value}T23:59:59.999${process.env.DB_TIMEZONE || '-03:00'}`, fieldName);
  }

  return parseDate(value, fieldName);
}

module.exports = {
  parseDate,
  parseStartDate,
  parseEndDate
};
