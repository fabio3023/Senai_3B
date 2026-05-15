const Leitura = require('../models/Leitura');

async function seedLeiturasIfEmpty() {
  const total = await Leitura.count();

  if (total > 0) {
    console.log('Tabela leituras já possui dados.');
    return;
  }

  await Leitura.bulkCreate([
    {
      station_id: 'EM-ARACATUBA-01',
      timestamp: new Date('2026-04-01T08:00:00'),
      temperature_c: 24.5,
      humidity_pct: 72.1,
    },
    {
      station_id: 'EM-ARACATUBA-01',
      timestamp: new Date('2026-04-01T09:00:00'),
      temperature_c: 25.8,
      humidity_pct: 69.4,
    },
    {
      station_id: 'EM-ARACATUBA-01',
      timestamp: new Date('2026-04-01T10:00:00'),
      temperature_c: 27.2,
      humidity_pct: 65.8,
    },
    {
      station_id: 'EM-ARACATUBA-01',
      timestamp: new Date('2026-04-02T08:00:00'),
      temperature_c: 23.9,
      humidity_pct: 74.3,
    },
    {
      station_id: 'EM-ARACATUBA-01',
      timestamp: new Date('2026-04-02T09:00:00'),
      temperature_c: 25.1,
      humidity_pct: 70.6,
    },
    {
      station_id: 'EM-ARACATUBA-01',
      timestamp: new Date('2026-04-02T10:00:00'),
      temperature_c: 26.7,
      humidity_pct: 67.2,
    }
  ]);

  console.log('Dados iniciais inseridos na tabela leituras.');
}

module.exports = seedLeiturasIfEmpty;
