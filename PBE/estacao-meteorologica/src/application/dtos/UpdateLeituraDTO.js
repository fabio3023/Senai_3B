const ValidationError = require('../../domain/errors/ValidationError');
const parseNumber = require('../../shared/utils/parseNumber');
const { parseDate } = require('../../shared/utils/date');

const FIELD_MAP = Object.freeze({
  station_id: 'stationId',
  timestamp: 'timestamp',
  temperature_c: 'temperatureC',
  humidity_pct: 'humidityPct'
});

class UpdateLeituraDTO {
  constructor(changes) {
    this.changes = Object.freeze(changes);
    Object.freeze(this);
  }

  static fromBody(body, { requireAllFields = false } = {}) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ValidationError('O corpo da requisição deve ser um objeto JSON.');
    }

    const receivedFields = Object.keys(body);
    const allowedFields = Object.keys(FIELD_MAP);
    const unknownFields = receivedFields.filter((field) => !allowedFields.includes(field));

    if (unknownFields.length > 0) {
      throw new ValidationError('O corpo da requisição contém campos não reconhecidos.', {
        unknownFields,
        allowedFields
      });
    }

    if (receivedFields.length === 0) {
      throw new ValidationError('Informe pelo menos um campo para atualização.');
    }

    if (requireAllFields) {
      const missingFields = allowedFields.filter((field) => body[field] === undefined);
      if (missingFields.length > 0) {
        throw new ValidationError('PUT exige todos os campos da leitura.', { missingFields });
      }
    }

    const changes = {};

    if (body.station_id !== undefined) changes.stationId = String(body.station_id).trim();
    if (body.timestamp !== undefined) changes.timestamp = parseDate(body.timestamp, 'timestamp');
    if (body.temperature_c !== undefined) changes.temperatureC = parseNumber(body.temperature_c);
    if (body.humidity_pct !== undefined) changes.humidityPct = parseNumber(body.humidity_pct);

    return new UpdateLeituraDTO(changes);
  }
}

module.exports = UpdateLeituraDTO;
