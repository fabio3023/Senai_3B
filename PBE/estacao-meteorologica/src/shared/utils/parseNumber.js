function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return Number.NaN;
  }

  if (typeof value === 'number') {
    return value;
  }

  return Number(String(value).trim().replace(',', '.'));
}

module.exports = parseNumber;
