const Leitura = require('../models/Leitura');

async function seedLeiturasIfEmpty() {
  const total = await Leitura.count();

  if (total > 0) {
    console.log('Tabela leituras já possui dados. Seed inicial não será executado.');
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
  ]);

  console.log('Seed inicial inserido na tabela leituras.');
}

module.exports = seedLeiturasIfEmpty;
