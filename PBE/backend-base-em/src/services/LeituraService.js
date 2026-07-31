const leituraRepository = require('../repositories/LeituraRepository');
const LeituraRequestDTO = require('../dtos/LeituraRequestDTO');
const LeituraResponseDTO = require('../dtos/LeituraResponseDTO');
const ApiError = require('../utils/ApiError');

// SERVICE / CAMADA DE REGRA DE NEGÓCIO
// O Service organiza as regras da aplicação.
// Ele recebe dados do Controller, usa DTOs, chama o Repository e devolve respostas.
class LeituraService {
  async listar(filtros) {
    const page = Math.max(Number(filtros.page || 1), 1);
    const limit = Math.min(Math.max(Number(filtros.limit || 20), 1), 100);

    const resultado = await leituraRepository.findAll({
      page,
      limit,
      station_id: filtros.station_id,
      data_inicio: filtros.data_inicio,
      data_fim: filtros.data_fim
    });

    return {
      data: LeituraResponseDTO.fromModelList(resultado.rows),
      meta: {
        total: resultado.count,
        page,
        limit,
        totalPages: Math.ceil(resultado.count / limit)
      }
    };
  }

  async buscarPorId(id) {
    const leitura = await leituraRepository.findById(id);

    if (!leitura) {
      throw new ApiError(404, 'Leitura não encontrada.');
    }

    return LeituraResponseDTO.fromModel(leitura);
  }

  async criar(body) {
    const dto = LeituraRequestDTO.fromBody(body);
    const entity = dto.toEntity();

    const leituraCriada = await leituraRepository.create(entity);
    return LeituraResponseDTO.fromModel(leituraCriada);
  }

  async atualizar(id, body) {
    const dto = LeituraRequestDTO.fromBody(body);
    const entity = dto.toEntity();

    const leituraAtualizada = await leituraRepository.update(id, entity);

    if (!leituraAtualizada) {
      throw new ApiError(404, 'Leitura não encontrada para atualização.');
    }

    return LeituraResponseDTO.fromModel(leituraAtualizada);
  }

  async remover(id) {
    const removido = await leituraRepository.delete(id);

    if (!removido) {
      throw new ApiError(404, 'Leitura não encontrada para exclusão.');
    }

    return { message: 'Leitura removida com sucesso.' };
  }

  async removerTodas() {
    await leituraRepository.deleteAll();
    return { message: 'Todas as leituras foram removidas com sucesso.' };
  }

  async importarLista(dtoList) {
    const entities = dtoList.map((dto) => dto.toEntity());
    const registrosCriados = await leituraRepository.bulkCreate(entities);

    return {
      message: 'Importação concluída com sucesso.',
      totalImportado: registrosCriados.length
    };
  }
}

module.exports = new LeituraService();
