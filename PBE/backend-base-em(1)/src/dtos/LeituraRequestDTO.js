const parseNumber = require('../utils/parseNumber');
const ApiError = require('../utils/ApiError');

class LeituraRequestDTO {
  constructor(data) {
    this.station_id = data.station_id;
    this.timestamp = data.timestamp;
    this.temperature_c = parseNumber(data.temperature_c);
    this.humidity_pct = parseNumber(data.humidity_pct);
  }

  validate() {
    if (!this.station_id || String(this.station_id).trim() === '') {
      throw new ApiError(400, 'station_id é obrigatório.');
    }
    if (!this.timestamp || isNaN(Date.parse(this.timestamp))) {
      throw new ApiError(400, 'timestamp é obrigatório e deve ser uma data válida.');
    }
    if (this.temperature_c === undefined || this.temperature_c === null || typeof this.temperature_c !== 'number') {
      throw new ApiError(400, 'temperature_c é obrigatório e deve ser numérico.');
    }
    if (this.humidity_pct === undefined || this.humidity_pct === null || typeof this.humidity_pct !== 'number') {
      throw new ApiError(400, 'humidity_pct é obrigatório e deve ser numérico.');
    }
    if (this.humidity_pct < 0 || this.humidity_pct > 100) {
      throw new ApiError(400, 'humidity_pct deve estar entre 0 e 100.');
    }
  }
}

module.exports = LeituraRequestDTO;
