// DTO DE SAÍDA
// Este DTO controla como a resposta será devolvida ao cliente.
// Assim, não precisamos expor diretamente o objeto completo do Sequelize.
class LeituraResponseDTO {
  constructor({ id, station_id, timestamp, temperature_c, humidity_pct }) {
    this.id = id;
    this.station_id = station_id;
    this.timestamp = timestamp;
    this.temperature_c = temperature_c;
    this.humidity_pct = humidity_pct;
  }

  static fromModel(model) {
    if (!model) {
      return null;
    }

    return new LeituraResponseDTO({
      id: model.id,
      station_id: model.station_id,
      timestamp: model.timestamp,
      temperature_c: model.temperature_c,
      humidity_pct: model.humidity_pct
    });
  }

  static fromModelList(models) {
    return models.map((model) => LeituraResponseDTO.fromModel(model));
  }
}

module.exports = LeituraResponseDTO;
