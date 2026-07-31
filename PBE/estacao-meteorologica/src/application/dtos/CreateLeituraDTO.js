const ValidationError = require('../../domain/errors/ValidationError');
const parseNumber = require('../../shared/utils/parseNumber');
const { parseDate } = require('../../shared/utils/date');

const ALLOWED_FIELDS = ['station_id', 'timestamp', 'temperature_c', 'humidity_pct'];

function rejectUnknownFields(body) {
  const unknownFields = Object.keys(body).filter((field) => !ALLOWED_FIELDS.includes(field));
  if (unknownFields.length > 0) {
    throw new ValidationError('O corpo da requisição contém campos não reconhecidos.', {
      unknownFields,
      allowedFields: ALLOWED_FIELDS
    });
  }
}

class CreateLeituraDTO {
  constructor({ stationId, timestamp, temperatureC, humidityPct }) {
    this.stationId = stationId;
    this.timestamp = timestamp;
    this.temperatureC = temperatureC;
    this.humidityPct = humidityPct;
    Object.freeze(this);
  }

  static fromBody(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ValidationError('O corpo da requisição deve ser um objeto JSON.');
    }

    rejectUnknownFields(body);

    const missingFields = ALLOWED_FIELDS.filter(
      (field) => body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missingFields.length > 0) {
      throw new ValidationError('Existem campos obrigatórios não informados.', { missingFields });
    }

    return new CreateLeituraDTO({
      stationId: String(body.station_id).trim(),
      timestamp: parseDate(body.timestamp, 'timestamp'),
      temperatureC: parseNumber(body.temperature_c),
      humidityPct: parseNumber(body.humidity_pct)
    });
  }

  static fromCsvRow(row) {
    return CreateLeituraDTO.fromBody({
      station_id: row.station_id,
      timestamp: row.timestamp,
      temperature_c: row.temperature_c,
      humidity_pct: row.humidity_pct
    });
  }

  toDomainData() {
    return {
      stationId: this.stationId,
      timestamp: this.timestamp,
      temperatureC: this.temperatureC,
      humidityPct: this.humidityPct
    };
  }
}

module.exports = CreateLeituraDTO;
