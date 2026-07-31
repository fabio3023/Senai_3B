const fs = require('fs/promises');
const path = require('path');
const { QueryTypes } = require('sequelize');
const logger = require('../../shared/logger');

const migrationsDirectory = path.resolve(__dirname, 'migrations');

async function ensureMigrationsTable(sequelize) {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      filename varchar(255) PRIMARY KEY,
      executed_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function listMigrationFiles() {
  const entries = await fs.readdir(migrationsDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort();
}

async function getExecutedMigrations(sequelize) {
  const rows = await sequelize.query(
    'SELECT filename FROM public.schema_migrations ORDER BY filename',
    { type: QueryTypes.SELECT }
  );
  return new Set(rows.map((row) => row.filename));
}

async function migrate(sequelize) {
  await ensureMigrationsTable(sequelize);

  const migrationFiles = await listMigrationFiles();
  const executedMigrations = await getExecutedMigrations(sequelize);
  const pendingMigrations = migrationFiles.filter((file) => !executedMigrations.has(file));

  for (const filename of pendingMigrations) {
    const sql = await fs.readFile(path.join(migrationsDirectory, filename), 'utf8');

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(sql, { transaction });
      await sequelize.query(
        'INSERT INTO public.schema_migrations (filename) VALUES (:filename)',
        { replacements: { filename }, transaction }
      );
    });

    logger.info('Migração aplicada.', { filename });
  }

  if (pendingMigrations.length === 0) {
    logger.info('Banco de dados já está atualizado.');
  }

  return {
    total: migrationFiles.length,
    appliedNow: pendingMigrations.length,
    pending: 0
  };
}

async function status(sequelize) {
  await ensureMigrationsTable(sequelize);
  const migrationFiles = await listMigrationFiles();
  const executedMigrations = await getExecutedMigrations(sequelize);

  return migrationFiles.map((filename) => ({
    filename,
    status: executedMigrations.has(filename) ? 'aplicada' : 'pendente'
  }));
}

module.exports = { migrate, status };
