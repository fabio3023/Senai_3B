const ValidationError = require('../../domain/errors/ValidationError');
const { parseStartDate, parseEndDate } = require('../../shared/utils/date');

function parsePositiveInteger(value, defaultValue, fieldName, maxValue = Number.MAX_SAFE_INTEGER) {
  if (value === undefined || value === '') return defaultValue;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maxValue) {
    throw new ValidationError(
      `O parâmetro ${fieldName} deve ser um inteiro entre 1 e ${maxValue}.`
    );
  }

  return parsed;
}

class ListLeiturasQueryDTO {
  constructor({ page, limit, stationId, startDate, endDate }) {
    this.page = page;
    this.limit = limit;
    this.stationId = stationId;
    this.startDate = startDate;
    this.endDate = endDate;
    Object.freeze(this);
  }

  static fromQuery(query = {}) {
    const page = parsePositiveInteger(query.page, 1, 'page');
    const limit = parsePositiveInteger(query.limit, 20, 'limit', 100);
    const stationId = query.station_id ? String(query.station_id).trim() : undefined;
    const startDate = parseStartDate(query.data_inicio);
    const endDate = parseEndDate(query.data_fim);

    if (startDate && endDate && startDate > endDate) {
      throw new ValidationError('data_inicio não pode ser posterior a data_fim.');
    }

    return new ListLeiturasQueryDTO({ page, limit, stationId, startDate, endDate });
  }

  toRepositoryFilters() {
    return {
      page: this.page,
      limit: this.limit,
      stationId: this.stationId,
      startDate: this.startDate,
      endDate: this.endDate
    };
  }
}

module.exports = ListLeiturasQueryDTO;
