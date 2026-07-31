const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// CORS permite que um front-end em outro endereço acesse esta API.
// Exemplo: front em http://localhost:5173 acessando API em http://localhost:3000.
app.use(cors());

// Permite que a API receba JSON no corpo das requisições.
app.use(express.json());

// ROTA RAIZ DA APLICAÇÃO
// Essa rota evita que http://localhost:3000 retorne "Rota não encontrada".
// Ela também serve como uma tela simples de orientação para alunos e testes rápidos.
app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'API Backend EM em execução.',
    description: 'API REST didática em Node.js, Express, PostgreSQL e Sequelize.',
    database: process.env.DB_NAME || 'db_em',
    mainRoutes: {
      api: '/api',
      health: '/api/health',
      leituras: '/api/leituras'
    },
    examples: {
      listarLeituras: 'GET /api/leituras?page=1&limit=10',
      criarLeitura: 'POST /api/leituras',
      importarCsv: 'npm run import:csv:clear'
    }
  });
});

// Prefixo principal da API.
// Todas as rotas da API ficarão abaixo de /api.
app.use('/api', routes);

// Tratamento para rotas inexistentes.
app.use(notFoundHandler);

// Tratamento centralizado de erros.
app.use(errorHandler);

module.exports = app;
