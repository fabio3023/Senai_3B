const Leitura = require('../../domain/entities/Leitura');
const NotFoundError = require('../../domain/errors/NotFoundError');
const CreateLeituraDTO = require('../dtos/CreateLeituraDTO');
const UpdateLeituraDTO = require('../dtos/UpdateLeituraDTO');
const ListLeiturasQueryDTO = require('../dtos/ListLeiturasQueryDTO');
const IdParamDTO = require('../dtos/IdParamDTO');
const LeituraResponseDTO = require('../dtos/LeituraResponseDTO');

class LeituraService {
  constructor({ leituraRepository }) {
    this.leituraRepository = leituraRepository;
  }

  async listar(query) {
    const dto = ListLeiturasQueryDTO.fromQuery(query);
    const result = await this.leituraRepository.findAll(dto.toRepositoryFilters());

    return {
      data: LeituraResponseDTO.fromEntityList(result.items),
      meta: {
        total: result.total,
        page: dto.page,
        limit: dto.limit,
        total_pages: result.total === 0 ? 0 : Math.ceil(result.total / dto.limit)
      }
    };
  }

  async buscarPorId(rawId) {
    const id = IdParamDTO.parse(rawId);
    const leitura = await this.leituraRepository.findById(id);

    if (!leitura) {
      throw new NotFoundError('Leitura não encontrada.');
    }

    return LeituraResponseDTO.fromEntity(leitura);
  }

  async criar(body) {
    const dto = CreateLeituraDTO.fromBody(body);
    const leitura = Leitura.create(dto.toDomainData());
    const created = await this.leituraRepository.create(leitura);
    return LeituraResponseDTO.fromEntity(created);
  }

  async substituir(rawId, body) {
    return this.#update(rawId, body, true);
  }

  async atualizarParcialmente(rawId, body) {
    return this.#update(rawId, body, false);
  }

  async #update(rawId, body, requireAllFields) {
    const id = IdParamDTO.parse(rawId);
    const current = await this.leituraRepository.findById(id);

    if (!current) {
      throw new NotFoundError('Leitura não encontrada para atualização.');
    }

    const dto = UpdateLeituraDTO.fromBody(body, { requireAllFields });
    const updatedEntity = current.withChanges(dto.changes);
    const updated = await this.leituraRepository.update(id, updatedEntity);
    return LeituraResponseDTO.fromEntity(updated);
  }

  async remover(rawId) {
    const id = IdParamDTO.parse(rawId);
    const removed = await this.leituraRepository.delete(id);

    if (!removed) {
      throw new NotFoundError('Leitura não encontrada para exclusão.');
    }
  }

  async removerTodas() {
    const totalRemoved = await this.leituraRepository.deleteAll();
    return { total_removido: totalRemoved };
  }

  async importarLinhas(rows, { clearBeforeImport = false } = {}) {
    const entities = rows.map((row, index) => {
      try {
        const dto = CreateLeituraDTO.fromCsvRow(row);
        return Leitura.create(dto.toDomainData());
      } catch (error) {
        error.details = {
          ...(error.details || {}),
          csvLine: index + 2
        };
        throw error;
      }
    });

    const imported = clearBeforeImport
      ? await this.leituraRepository.replaceAll(entities)
      : await this.leituraRepository.bulkCreate(entities);

    return {
      message: 'Importação concluída com sucesso.',
      total_importado: imported.length
    };
  }
}

module.exports = LeituraService;
