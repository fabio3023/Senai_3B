const axios = require('axios');

const api = axios.create({
  baseURL: process.env.API_TEST_URL || 'http://localhost:3000/api/v1',
  timeout: 5000,
  validateStatus: () => true
});

async function printResponse(title, requestPromise) {
  const response = await requestPromise;
  console.log(`\n${title} — HTTP ${response.status}`);
  console.dir(response.data, { depth: null });
  return response;
}

async function main() {
  try {
    await printResponse('Readiness', api.get('/health/ready'));
    await printResponse('Listagem', api.get('/leituras', { params: { page: 1, limit: 5 } }));

    const uniqueTimestamp = new Date().toISOString();
    const created = await printResponse(
      'Criação',
      api.post('/leituras', {
        station_id: 'EM-TESTE-AXIOS',
        timestamp: uniqueTimestamp,
        temperature_c: 26.5,
        humidity_pct: 71.2
      })
    );

    const id = created.data?.data?.id;
    if (!id) throw new Error('A API não retornou o ID criado.');

    await printResponse('Busca por ID', api.get(`/leituras/${id}`));
    await printResponse('Atualização parcial', api.patch(`/leituras/${id}`, { humidity_pct: 69.8 }));
    await printResponse('Exclusão', api.delete(`/leituras/${id}`));
  } catch (error) {
    console.error('Falha no teste da API:', error.message);
    process.exitCode = 1;
  }
}

main();
