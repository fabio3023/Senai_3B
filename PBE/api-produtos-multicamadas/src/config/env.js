require('dotenv').config();

function readInteger(name, fallback) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === '') {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(parsedValue)) {
    throw new Error(`A variável ${name} deve ser um número inteiro.`);
  }

  return parsedValue;
}

function readBoolean(name, fallback = false) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === '') {
    return fallback;
  }

  return rawValue.toLowerCase() === 'true';
}

function readRequired(name, fallback) {
  const value = process.env[name] ?? fallback;

  if (value === undefined || value === '') {
    throw new Error(`A variável de ambiente ${name} é obrigatória.`);
  }

  return value;
}

const env = Object.freeze({
  app: {
    port: readInteger('APP_PORT', 3000),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    host: readRequired('DB_HOST', '127.0.0.1'),
    port: readInteger('DB_PORT', 5432),
    name: readRequired('DB_NAME', 'db_products'),
    user: readRequired('DB_USER', 'postgres'),
    password: readRequired('DB_PASSWORD', 'postgres'),
    maintenanceName: readRequired('DB_MAINTENANCE_NAME', 'postgres'),
    logging: readBoolean('DB_LOGGING', false),
  },
});

module.exports = env;
