const axios = require('axios');

// SCRIPT DIDÁTICO COM AXIOS
// Este arquivo mostra como um cliente externo pode consumir a API REST.
// Antes de executar, ligue a API com: npm run dev
// Depois execute: npm run test:api

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000
});

async function testarApi() {
  try {
    const health = await api.get('/health');
    console.log('Health check:', health.data);

    const listagem = await api.get('/leituras', {
      params: {
        page: 1,
        limit: 5
      }
    });

    console.log('Primeiras leituras:');
    console.table(listagem.data.data);

    const novaLeitura = await api.post('/leituras', {
      station_id: 'EM-TESTE-AXIOS',
      timestamp: new Date().toISOString(),
      temperature_c: 26.5,
      humidity_pct: 71.2
    });

    console.log('Leitura criada com POST:', novaLeitura.data);

    const leituraBuscada = await api.get(`/leituras/${novaLeitura.data.id}`);
    console.log('Leitura buscada por ID:', leituraBuscada.data);
  } catch (error) {
    if (error.response) {
      console.error('Erro da API:', error.response.status, error.response.data);
    } else {
      console.error('Erro ao chamar a API:', error.message);
    }
  }
}

testarApi();
