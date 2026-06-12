const app = require('./app');
const ensureDatabase = require('./config/ensureDatabase');
const sequelize = require('./config/database');
require('./models/Leitura');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await ensureDatabase();
    await sequelize.authenticate();
    console.log('Conexão com PostgreSQL realizada com sucesso.');

    await sequelize.sync();
    console.log('Modelos sincronizados com o banco.');

    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar o servidor:', error.message);
    process.exit(1);
  }
}

bootstrap();
