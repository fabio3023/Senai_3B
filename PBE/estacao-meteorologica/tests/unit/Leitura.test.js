const test = require('node:test');
const assert = require('node:assert/strict');
const Leitura = require('../../src/domain/entities/Leitura');

const validData = {
  stationId: 'EM-MIRANDOPOLIS-01',
  timestamp: new Date('2026-07-30T08:00:00-03:00'),
  temperatureC: 25.4,
  humidityPct: 70.2
};

test('Leitura cria uma entidade válida e imutável', () => {
  const leitura = Leitura.create(validData);
  assert.equal(leitura.stationId, validData.stationId);
  assert.equal(leitura.temperatureC, 25.4);
  assert.ok(Object.isFrozen(leitura));
});

test('Leitura rejeita umidade fora da faixa', () => {
  assert.throws(
    () => Leitura.create({ ...validData, humidityPct: 101 }),
    /umidade deve estar entre 0% e 100%/i
  );
});

test('Leitura gera nova entidade ao aplicar mudanças', () => {
  const original = Leitura.create(validData);
  const changed = original.withChanges({ temperatureC: 27.8 });
  assert.equal(original.temperatureC, 25.4);
  assert.equal(changed.temperatureC, 27.8);
});
