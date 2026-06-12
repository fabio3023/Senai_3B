function parseNumber(value) {
  if (value === undefined || value === null) return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(',', '.').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? value : parsed;
  }
  return value;
}

module.exports = parseNumber;
