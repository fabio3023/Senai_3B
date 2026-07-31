// Converte texto para número aceitando vírgula ou ponto decimal.
// Isso ajuda quando o CSV vem com valores como "25,7" em vez de "25.7".
function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return NaN;
  }

  return Number(String(value).replace(',', '.'));
}

module.exports = parseNumber;
