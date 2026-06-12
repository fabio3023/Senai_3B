class LeituraResponseDTO {
  static format(leitura) {
    if (!leitura) return null;
    return {
      id: leitura.id,
      station_id: leitura.station_id,
      timestamp: leitura.timestamp,
      temperature_c: parseFloat(leitura.temperature_c),
      humidity_pct: parseFloat(leitura.humidity_pct)
    };
  }

  static formatMany(leituras) {
    return leituras.map(leitura => this.format(leitura));
  }
}

module.exports = LeituraResponseDTO;
