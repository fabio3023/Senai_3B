class LeituraResponseDTO {
  static fromEntity(entity) {
    if (!entity) return null;

    return {
      id: entity.id,
      station_id: entity.stationId,
      timestamp: entity.timestamp.toISOString(),
      temperature_c: entity.temperatureC,
      humidity_pct: entity.humidityPct,
      created_at: entity.createdAt ? entity.createdAt.toISOString() : null,
      updated_at: entity.updatedAt ? entity.updatedAt.toISOString() : null
    };
  }

  static fromEntityList(entities) {
    return entities.map((entity) => LeituraResponseDTO.fromEntity(entity));
  }
}

module.exports = LeituraResponseDTO;
