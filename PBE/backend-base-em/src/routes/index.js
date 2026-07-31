const express = require('express');
const leituraRoutes = require('./leituraRoutes');

const router = express.Router();

// Rota inicial do prefixo /api.
// Ao acessar http://localhost:3000/api, o usuário recebe um resumo das rotas disponíveis.
router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Bem-vindo à API de leituras.',
    description: 'Use as rotas abaixo para testar a aplicação.',
    routes: {
      health: 'GET /api/health',
      listarLeituras: 'GET /api/leituras',
      buscarLeituraPorId: 'GET /api/leituras/:id',
      criarLeitura: 'POST /api/leituras',
      atualizarLeitura: 'PUT /api/leituras/:id',
      removerLeitura: 'DELETE /api/leituras/:id',
      removerTodasAsLeituras: 'DELETE /api/leituras'
    },
    popularTabela: {
      importarSemLimpar: 'npm run import:csv',
      limparEImportarDoZero: 'npm run import:csv:clear'
    }
  });
});

// Rota simples para verificar se a API está ligada.
router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'API de leituras em execução.'
  });
});

// Todas as rotas da entidade leitura ficam agrupadas aqui.
router.use('/leituras', leituraRoutes);

module.exports = router;
