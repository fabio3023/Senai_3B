const env = require('../../config/env');

function collectCodes(error) {
  const codes = new Set();
  const pending = [error];

  while (pending.length > 0) {
    const current = pending.shift();
    if (!current || typeof current !== 'object') continue;

    if (current.code) codes.add(String(current.code));
    if (current.original) pending.push(current.original);
    if (current.parent) pending.push(current.parent);
    if (current.cause) pending.push(current.cause);
    if (Array.isArray(current.errors)) pending.push(...current.errors);
  }

  return [...codes];
}

function buildHint(codes) {
  if (codes.includes('ECONNREFUSED')) {
    return 'Confirme se o serviço PostgreSQL está iniciado e ouvindo na porta configurada.';
  }

  if (codes.includes('ENOTFOUND') || codes.includes('EAI_AGAIN')) {
    return 'Confira o valor de DB_HOST no arquivo .env.';
  }

  if (codes.includes('28P01')) {
    return 'Confira DB_USER e DB_PASSWORD no arquivo .env.';
  }

  if (codes.includes('3D000')) {
    return 'O banco configurado não existe. Ative DB_AUTO_CREATE ou crie o banco manualmente.';
  }

  if (codes.includes('42501')) {
    return 'O usuário do PostgreSQL não possui a permissão necessária para esta operação.';
  }

  return 'Confira o serviço PostgreSQL e as variáveis DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD.';
}

function createDatabaseConnectionError(error, operation = 'conectar ao PostgreSQL') {
  const codes = collectCodes(error);
  const location = `${env.database.host}:${env.database.port}`;
  const message = `Não foi possível ${operation} em ${location}. ${buildHint(codes)}`;
  const wrapped = new Error(message, { cause: error });
  wrapped.name = 'DatabaseConnectionError';
  wrapped.code = codes[0] || 'DATABASE_CONNECTION_ERROR';
  wrapped.details = {
    host: env.database.host,
    port: env.database.port,
    database: env.database.name,
    user: env.database.user,
    originalCodes: codes
  };
  return wrapped;
}

module.exports = createDatabaseConnectionError;
