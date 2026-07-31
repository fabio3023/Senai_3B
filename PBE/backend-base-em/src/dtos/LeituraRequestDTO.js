const ApiError = require('../utils/ApiError');
const parseNumber = require('../utils/parseNumber');

// DTO DE ENTRADA
// DTO significa Data Transfer Object.
// Ele controla os dados que entram na aplicação, separando a requisição HTTP
// do restante do sistema.
class LeituraRequestDTO {
  constructor({ station_id, timestamp, temperature_c, humidity_pct }) {
    this.station_id = station_id;
    this.timestamp = timestamp;
    this.temperature_c = temperature_c;
    this.humidity_pct = humidity_pct;
  }

  // Cria o DTO a partir do corpo JSON de uma requisição POST ou PUT.
  static fromBody(body) {
    return new LeituraRequestDTO({
      station_id: body.station_id,
      timestamp: body.timestamp,
      temperature_c: body.temperature_c,
      humidity_pct: body.humidity_pct
    });
  }

  // Cria o DTO a partir de uma linha do CSV.
  static fromCsvRow(row) {
    return new LeituraRequestDTO({
      station_id: row.station_id,
      timestamp: row.timestamp,
      temperature_c: row.temperature_c,
      humidity_pct: row.humidity_pct
    });
  }

  // Validação didática dos campos obrigatórios.
  // Em projetos maiores, poderíamos usar bibliotecas como Joi, Zod ou Yup.
  validate() {
    if (!this.station_id || String(this.station_id).trim() === '') {
      throw new ApiError(400, 'O campo station_id é obrigatório.');
    }

    if (!this.timestamp || Number.isNaN(new Date(this.timestamp).getTime())) {
      throw new ApiError(400, 'O campo timestamp é obrigatório e deve ser uma data válida.');
    }

    const temperature = parseNumber(this.temperature_c);
    if (Number.isNaN(temperature)) {
      throw new ApiError(400, 'O campo temperature_c é obrigatório e deve ser numérico.');
    }

    const humidity = parseNumber(this.humidity_pct);
    if (Number.isNaN(humidity)) {
      throw new ApiError(400, 'O campo humidity_pct é obrigatório e deve ser numérico.');
    }

    if (humidity < 0 || humidity > 100) {
      throw new ApiError(400, 'O campo humidity_pct deve estar entre 0 e 100.');
    }
  }

  // Converte o DTO para o formato que o Repository/ORM irá gravar no banco.
  toEntity() {
    this.validate();

    return {
      station_id: String(this.station_id).trim(),
      timestamp: new Date(this.timestamp),
      temperature_c: parseNumber(this.temperature_c),
      humidity_pct: parseNumber(this.humidity_pct)
    };
  }
}

module.exports = LeituraRequestDTO;
