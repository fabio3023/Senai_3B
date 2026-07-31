'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const ensureDatabaseExists = require('../infrastructure/database/ensureDatabaseExists');
const { migrate } = require('../infrastructure/database/migrationRunner');
const createContainer = require('../bootstrap/createContainer');
const logger = require('../shared/logger');

const csvPath = path.resolve(process.cwd(), 'data/em.csv');
const clearBeforeImport = process.argv.includes('--clear');

const aliases = {
  station_id: ['station_id', 'stationid', 'estacao', 'station'],
  timestamp: ['timestamp', 'data_hora', 'datahora', 'datetime'],
  temperature_c: [
    'temperature_c',
    'temperaturec',
    'temperatura',
    'temperature',
    'temp_c'
  ],
  humidity_pct: [
    'humidity_pct',
    'humiditypct',
    'umidade',
    'humidity',
    'umid_pct'
  ]
};

function normalizeHeader(header) {
  return String(header ?? '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase();
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeNumber(value) {
  const normalized = normalizeText(value).replace(',', '.');

  if (normalized === '') {
    return Number.NaN;
  }

  return Number(normalized);
}

function findValue(row, fieldName) {
  for (const alias of aliases[fieldName]) {
    if (Object.prototype.hasOwnProperty.call(row, alias)) {
      return row[alias];
    }
  }

  return undefined;
}

function normalizeRow(row, csvLine) {
  return {
    station_id: normalizeText(findValue(row, 'station_id')),
    timestamp: normalizeText(findValue(row, 'timestamp')),
    temperature_c: normalizeNumber(findValue(row, 'temperature_c')),
    humidity_pct: normalizeNumber(findValue(row, 'humidity_pct')),
    __csvLine: csvLine
  };
}

function detectSeparator(filePath) {
  const firstLine = fs
    .readFileSync(filePath, 'utf8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/, 1)[0];

  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;

  return semicolons > commas ? ';' : ',';
}

function validateHeaders(headers) {
  const normalizedHeaders = headers.map(normalizeHeader);

  const missingFields = Object.entries(aliases)
    .filter(([, fieldAliases]) =>
      !fieldAliases.some((alias) => normalizedHeaders.includes(alias))
    )
    .map(([fieldName]) => fieldName);

  if (missingFields.length > 0) {
    throw new Error(
      `Cabeçalho inválido no CSV. Campos ausentes: ${missingFields.join(', ')}. ` +
      `Cabeçalhos encontrados: ${normalizedHeaders.join(', ')}`
    );
  }
}

function readCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    let lineNumber = 1;
    const separator = detectSeparator(filePath);
    let settled = false;

    const fail = (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };

    fs.createReadStream(filePath)
      .on('error', fail)
      .pipe(
        csv({
          separator,
          strict: true,
          mapHeaders: ({ header }) => normalizeHeader(header),
          mapValues: ({ value }) => normalizeText(value)
        })
      )
      .on('headers', (headers) => {
        try {
          validateHeaders(headers);
        } catch (error) {
          fail(error);
        }
      })
      .on('data', (row) => {
        if (settled) {
          return;
        }

        lineNumber += 1;
        rows.push(normalizeRow(row, lineNumber));
      })
      .on('end', () => {
        if (!settled) {
          settled = true;
          resolve({ rows, separator });
        }
      })
      .on('error', fail);
  });
}

function validateRows(rows) {
  const errors = [];

  rows.forEach((row, index) => {
    const line = row.__csvLine ?? index + 2;
    const parsedTimestamp = new Date(row.timestamp);

    if (!row.station_id) {
      errors.push(`Linha ${line}: station_id não foi informado.`);
    }

    if (!row.timestamp || Number.isNaN(parsedTimestamp.getTime())) {
      errors.push(
        `Linha ${line}: timestamp inválido: "${row.timestamp}".`
      );
    }

    if (!Number.isFinite(row.temperature_c)) {
      errors.push(
        `Linha ${line}: temperature_c inválido.`
      );
    }

    if (!Number.isFinite(row.humidity_pct)) {
      errors.push(
        `Linha ${line}: humidity_pct inválido.`
      );
    } else if (row.humidity_pct < 0 || row.humidity_pct > 100) {
      errors.push(
        `Linha ${line}: humidity_pct fora da faixa de 0 a 100: ${row.humidity_pct}.`
      );
    }
  });

  if (errors.length > 0) {
    const preview = errors.slice(0, 30);
    const remaining = errors.length - preview.length;

    throw new Error(
      `Foram encontrados ${errors.length} erro(s) no CSV antes da importação:\n` +
      preview.join('\n') +
      (remaining > 0
        ? `\n... e mais ${remaining} erro(s) não exibidos.`
        : '')
    );
  }
}

function removeInternalFields(rows) {
  return rows.map(({ __csvLine, ...row }) => row);
}

function serializeAggregateErrors(error) {
  if (!Array.isArray(error?.errors)) {
    return [];
  }

  return error.errors.map((item, index) => {
    const internalError = item?.error ?? item;
    const record =
      item?.record?.dataValues ??
      item?.record ??
      internalError?.instance?.dataValues ??
      internalError?.instance ??
      null;

    return {
      index: index + 1,
      name: internalError?.name ?? item?.name,
      message: internalError?.message ?? item?.message,
      field: internalError?.path,
      value: internalError?.value,
      record,
      nestedErrors: Array.isArray(internalError?.errors)
        ? internalError.errors.map((nestedError) => ({
            message: nestedError.message,
            field: nestedError.path,
            value: nestedError.value,
            validatorKey: nestedError.validatorKey
          }))
        : []
    };
  });
}

function buildErrorDetails(error) {
  const original = error?.original ?? error?.parent;

  return {
    name: error?.name,
    message: error?.message || 'Erro sem mensagem.',
    code: error?.code ?? original?.code,
    detail: error?.detail ?? original?.detail,
    constraint: error?.constraint ?? original?.constraint,
    table: original?.table,
    column: original?.column,
    validationErrors: serializeAggregateErrors(error)
  };
}

async function main() {
  let container;

  try {
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Arquivo CSV não encontrado: ${csvPath}`);
    }

    container = createContainer();

    await ensureDatabaseExists();
    await container.sequelize.authenticate();
    await migrate(container.sequelize);

    const { rows: rowsWithMetadata, separator } = await readCsvFile(csvPath);

    if (rowsWithMetadata.length === 0) {
      throw new Error(`O arquivo CSV está vazio: ${csvPath}`);
    }

    validateRows(rowsWithMetadata);

    const rows = removeInternalFields(rowsWithMetadata);

    logger.info('CSV validado. Iniciando gravação.', {
      arquivo: csvPath,
      separador: separator === ';' ? 'ponto e vírgula' : 'vírgula',
      totalLinhas: rows.length,
      colunas: Object.keys(rows[0] || {})
    });

    const result = await container.leituraService.importarLinhas(rows, {
      clearBeforeImport
    });

    logger.info(result.message || 'Importação concluída com sucesso.', {
      totalImportado:
        result.total_importado ??
        result.totalImportado ??
        rows.length,
      clearBeforeImport
    });
  } catch (error) {
    const details = buildErrorDetails(error);

    logger.error('Falha ao importar CSV.', {
      ...details,
      csvPath,
      clearBeforeImport,
      stack: error.stack
    });

    if (details.validationErrors.length > 0) {
      console.error('\nDETALHES DOS REGISTROS REJEITADOS');

      details.validationErrors.slice(0, 30).forEach((item) => {
        console.error(`\nErro ${item.index}: ${item.message || item.name}`);

        if (item.field) {
          console.error(`Campo: ${item.field}`);
        }

        if (item.value !== undefined) {
          console.error('Valor:', item.value);
        }

        if (item.record) {
          console.error('Registro:', item.record);
        }

        item.nestedErrors.forEach((nestedError) => {
          console.error(
            `- Campo: ${nestedError.field || 'não informado'} | ` +
            `Valor: ${JSON.stringify(nestedError.value)} | ` +
            `Erro: ${nestedError.message}`
          );
        });
      });
    }

    process.exitCode = 1;
  } finally {
    if (container?.sequelize) {
      try {
        await container.sequelize.close();
      } catch (closeError) {
        logger.error('Falha ao fechar a conexão com o PostgreSQL.', {
          message: closeError.message,
          stack: closeError.stack
        });
      }
    }
  }
}

main();
