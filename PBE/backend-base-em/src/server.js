require('dotenv').config();
const app = require('./app');
const ensureDatabaseExists = require('./config/ensureDatabase');
const sequelize = require('./config/database');
require('./models/Leitura');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Antes de conectar no banco da aplicação, garantimos que ele exista.
    // Se o banco db_em ainda não existir, ele será criado automaticamente.
    await ensureDatabaseExists();

    // Testa a conexão com o PostgreSQL já usando o banco da aplicação.
    await sequelize.authenticate();
    console.log('Conexão com PostgreSQL realizada com sucesso.');

    // Cria ou ajusta a tabela de acordo com o Model, se necessário.
    // Em produção, o ideal é usar migrations. Para aula inicial, sync é mais simples.
    await sequelize.sync();
    console.log('Modelos sincronizados com o banco.');

    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
      console.log(`Rota raiz: http://localhost:${PORT}`);
      console.log(`Resumo da API: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Leituras: http://localhost:${PORT}/api/leituras`);
    });
  } catch (error) {
    console.error('Erro ao iniciar a aplicação:', error.message);
    process.exit(1);
  }
}

startServer();
