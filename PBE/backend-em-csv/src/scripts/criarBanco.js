require('dotenv').config();

const ensureDatabaseExists = require('../config/ensureDatabase');

async function main() {
  try {
    await ensureDatabaseExists();
    console.log('Verificação/criação do banco concluída.');
  } catch (error) {
    console.error('Erro ao criar/verificar banco de dados:');
    console.error(error.message);
    process.exit(1);
  }
}

main();
