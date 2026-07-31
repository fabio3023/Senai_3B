const test = require('node:test');
const assert = require('node:assert/strict');
const { parseStartDate, parseEndDate } = require('../../src/shared/utils/date');

test('filtro de data simples respeita o fuso configurado e inclui o dia inteiro', () => {
  assert.equal(parseStartDate('2026-01-03').toISOString(), '2026-01-03T03:00:00.000Z');
  assert.equal(parseEndDate('2026-01-03').toISOString(), '2026-01-04T02:59:59.999Z');
});
