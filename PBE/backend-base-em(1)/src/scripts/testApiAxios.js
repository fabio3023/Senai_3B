const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const api = axios.create({ baseURL: `http://localhost:${PORT}/api` });

async function runTests() {
  console.log('--- INICIANDO TESTES AUTOMATIZADOS COM AXIOS ---');
  try {
    console.log('\n[TESTE] GET /health');
    const health = await api.get('/health');
    console.log('Resposta:', health.data);

    console.log('\n[TESTE] GET /leituras (Primeira página)');
    const list = await api.get('/leituras?page=1&limit=2');
    console.log('Meta retornado:', list.data.meta);

    console.log('\n[TESTE] POST /leituras (Criar amostragem)');
    const novoPost = await api.post('/leituras', {
      station_id: "EM-AXIOS-LAB-01",
      timestamp: new Date().toISOString(),
      temperature_c: "23,4",
      humidity_pct: 55.6
    });
    console.log('Criado com Sucesso! ID:', novoPost.data.data.id);
    const novoId = novoPost.data.data.id;

    console.log(`\n[TESTE] GET /leituras/${novoId}`);
    const buscaId = await api.get(`/leituras/${novoId}`);
    console.log('Dados do registro recuperado:', buscaId.data.data);

    console.log('\n--- TODOS OS TESTES PASSARAM COM SUCESSO ---');
  } catch (error) {
    console.error('Falha detectada nos testes da API:', error.response?.data || error.message);
  }
}

runTests();
