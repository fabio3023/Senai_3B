const path = require('path');
const dotenv = require('dotenv');

// Carrega o .env uma única vez e centraliza toda a configuração da aplicação.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function parseInteger(name, defaultValue, { min, max } = {}) {
  const rawValue = process.env[name];
  const value = rawValue === undefined ? defaultValue : Number(rawValue);

  if (!Number.isInteger(value)) {
    throw new Error(`A variável ${name} deve ser um número inteiro.`);
  }

  if (min !== undefined && value < min) {
    throw new Error(`A variável ${name} deve ser maior ou igual a ${min}.`);
  }

  if (max !== undefined && value > max) {
    throw new Error(`A variável ${name} deve ser menor ou igual a ${max}.`);
  }

  return value;
}

function parseBoolean(name, defaultValue) {
  const rawValue = process.env[name];
  if (rawValue === undefined) return defaultValue;

  const normalized = String(rawValue).trim().toLowerCase();
  if (['true', '1', 'yes', 'sim'].includes(normalized)) return true;
  if (['false', '0', 'no', 'nao', 'não'].includes(normalized)) return false;

  throw new Error(`A variável ${name} deve ser true ou false.`);
}

function requiredText(name, defaultValue) {
  const value = process.env[name] ?? defaultValue;
  if (value === undefined || String(value).trim() === '') {
    throw new Error(`A variável ${name} é obrigatória.`);
  }
  return String(value).trim();
}

function parseOrigins(rawValue) {
  const value = String(rawValue || '*').trim();
  if (value === '*') return ['*'];

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const nodeEnv = requiredText('NODE_ENV', 'development');
const validEnvironments = ['development', 'test', 'production'];
if (!validEnvironments.includes(nodeEnv)) {
  throw new Error(`NODE_ENV deve ser um destes valores: ${validEnvironments.join(', ')}.`);
}

const apiPrefix = requiredText('API_PREFIX', '/api/v1');
if (!apiPrefix.startsWith('/')) {
  throw new Error('API_PREFIX deve começar com /.');
}

const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: parseInteger('PORT', 3000, { min: 1, max: 65535 }),
  apiPrefix,
  requestBodyLimit: requiredText('REQUEST_BODY_LIMIT', '100kb'),
  logLevel: requiredText('LOG_LEVEL', 'info'),
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  database: Object.freeze({
    host: requiredText('DB_HOST', '127.0.0.1'),
    port: parseInteger('DB_PORT', 5432, { min: 1, max: 65535 }),
    name: requiredText('DB_NAME', 'db_em'),
    maintenanceName: requiredText('DB_MAINTENANCE_NAME', 'postgres'),
    user: requiredText('DB_USER', 'postgres'),
    password: String(process.env.DB_PASSWORD ?? 'postgres'),
    timezone: requiredText('DB_TIMEZONE', '-03:00'),
    connectionTimeout: parseInteger('DB_CONNECTION_TIMEOUT_MS', 5000, { min: 1000 }),
    logging: parseBoolean('DB_LOGGING', false),
    autoCreate: parseBoolean('DB_AUTO_CREATE', true),
    runMigrations: parseBoolean('DB_RUN_MIGRATIONS', true),
    pool: Object.freeze({
      max: parseInteger('DB_POOL_MAX', 10, { min: 1 }),
      min: parseInteger('DB_POOL_MIN', 0, { min: 0 }),
      acquire: parseInteger('DB_POOL_ACQUIRE_MS', 30000, { min: 1000 }),
      idle: parseInteger('DB_POOL_IDLE_MS', 10000, { min: 1000 })
    })
  })
});

module.exports = env;
