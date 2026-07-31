const sequelize = require('../infrastructure/database/sequelize');
const { status } = require('../infrastructure/database/migrationRunner');

async function main() {
  try {
    await sequelize.authenticate();
    console.table(await status(sequelize));
  } catch (error) {
    console.error('Falha ao consultar migrações:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

main();
