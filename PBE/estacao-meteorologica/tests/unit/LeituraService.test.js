const test = require('node:test');
const assert = require('node:assert/strict');
const LeituraService = require('../../src/application/services/LeituraService');
const InMemoryLeituraRepository = require('../helpers/InMemoryLeituraRepository');

function createService() {
  const repository = new InMemoryLeituraRepository();
  return { service: new LeituraService({ leituraRepository: repository }), repository };
}

const body = {
  station_id: 'EM-TESTE-01',
  timestamp: '2026-07-30T08:00:00-03:00',
  temperature_c: 24.8,
  humidity_pct: 65.5
};

test('Service cria, busca e lista uma leitura', async () => {
  const { service } = createService();
  const created = await service.criar(body);
  assert.equal(created.id, 1);

  const found = await service.buscarPorId(1);
  assert.equal(found.station_id, 'EM-TESTE-01');

  const result = await service.listar({ page: '1', limit: '10' });
  assert.equal(result.meta.total, 1);
  assert.equal(result.data.length, 1);
});

test('PATCH altera somente os campos informados', async () => {
  const { service } = createService();
  await service.criar(body);
  const updated = await service.atualizarParcialmente(1, { humidity_pct: 80 });
  assert.equal(updated.humidity_pct, 80);
  assert.equal(updated.temperature_c, 24.8);
});

test('Service rejeita paginação inválida', async () => {
  const { service } = createService();
  await assert.rejects(() => service.listar({ page: 'abc' }), /parâmetro page/i);
});

test('Service retorna erro ao buscar ID inexistente', async () => {
  const { service } = createService();
  await assert.rejects(() => service.buscarPorId(999), /não encontrada/i);
});
