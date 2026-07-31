const ValidationError = require('../errors/ValidationError');

class Leitura {
  constructor({
    id = null,
    stationId,
    timestamp,
    temperatureC,
    humidityPct,
    createdAt = null,
    updatedAt = null
  }) {
    this.id = id;
    this.stationId = stationId;
    this.timestamp = timestamp;
    this.temperatureC = temperatureC;
    this.humidityPct = humidityPct;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    Object.freeze(this);
  }

  static create(data) {
    const stationId = String(data.stationId || '').trim();
    if (!stationId) {
      throw new ValidationError('A identificação da estação é obrigatória.');
    }

    if (stationId.length > 100) {
      throw new ValidationError('A identificação da estação deve ter no máximo 100 caracteres.');
    }

    const timestamp = data.timestamp instanceof Date
      ? new Date(data.timestamp.getTime())
      : new Date(data.timestamp);

    if (Number.isNaN(timestamp.getTime())) {
      throw new ValidationError('A data e hora da leitura são inválidas.');
    }

    const temperatureC = Number(data.temperatureC);
    if (!Number.isFinite(temperatureC)) {
      throw new ValidationError('A temperatura deve ser numérica.');
    }

    // Faixa ampla para detectar erros de sensores sem limitar situações reais extremas.
    if (temperatureC < -100 || temperatureC > 100) {
      throw new ValidationError('A temperatura deve estar entre -100 °C e 100 °C.');
    }

    const humidityPct = Number(data.humidityPct);
    if (!Number.isFinite(humidityPct)) {
      throw new ValidationError('A umidade deve ser numérica.');
    }

    if (humidityPct < 0 || humidityPct > 100) {
      throw new ValidationError('A umidade deve estar entre 0% e 100%.');
    }

    return new Leitura({
      id: data.id ?? null,
      stationId,
      timestamp,
      temperatureC,
      humidityPct,
      createdAt: data.createdAt ? new Date(data.createdAt) : null,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : null
    });
  }

  withChanges(changes) {
    return Leitura.create({
      ...this,
      ...changes
    });
  }
}

module.exports = Leitura;
