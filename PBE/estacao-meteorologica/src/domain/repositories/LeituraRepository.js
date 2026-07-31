// Contrato da camada de domínio.
// A aplicação depende desta abstração, não diretamente do Sequelize.
class LeituraRepository {
  async findAll() {
    throw new Error('Método findAll não implementado.');
  }

  async findById() {
    throw new Error('Método findById não implementado.');
  }

  async create() {
    throw new Error('Método create não implementado.');
  }

  async update() {
    throw new Error('Método update não implementado.');
  }

  async delete() {
    throw new Error('Método delete não implementado.');
  }

  async deleteAll() {
    throw new Error('Método deleteAll não implementado.');
  }

  async replaceAll() {
    throw new Error('Método replaceAll não implementado.');
  }

  async bulkCreate() {
    throw new Error('Método bulkCreate não implementado.');
  }
}

module.exports = LeituraRepository;
