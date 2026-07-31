const env = require('../config/env');

const levels = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
});

const configuredLevel = levels[env.logLevel] || levels.info;

function write(level, message, context = {}) {
  if (levels[level] < configuredLevel) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  };

  const output = JSON.stringify(entry);
  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

module.exports = Object.freeze({
  debug: (message, context) => write('debug', message, context),
  info: (message, context) => write('info', message, context),
  warn: (message, context) => write('warn', message, context),
  error: (message, context) => write('error', message, context)
});
