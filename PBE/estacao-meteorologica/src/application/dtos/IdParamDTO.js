const ValidationError = require('../../domain/errors/ValidationError');

class IdParamDTO {
  static parse(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) {
      throw new ValidationError('O parâmetro id deve ser um número inteiro positivo.');
    }
    return id;
  }
}

module.exports = IdParamDTO;
