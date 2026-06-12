const LeituraRepository = require('../repositories/LeituraRepository');
const LeituraResponseDTO = require('../dtos/LeituraResponseDTO');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

class LeituraService {
  async listar(filters) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;

    const where = {};

    if (filters.station_id) {
      where.station_id = filters.station_id;
    }

    if (filters.data_inicio || filters.data_fim) {
      where.timestamp = {};
      if (filters.data_inicio) where.timestamp[Op.gte] = new Date(filters.data_inicio);
      if (filters.data_fim) where.timestamp[Op.lte] = new Date(filters.data_fim);
    }

    const { rows, count } = await LeituraRepository.findAndCountAll({
      where,
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });

    return {
      data: LeituraResponseDTO.formatMany(rows),
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async buscarPorId(id) {
    const leitura = await LeituraRepository.findByPk(id);
    if (!leitura) {
      throw new ApiError(404, `Leitura com ID ${id} não encontrada.`);
    }
    return LeituraResponseDTO.format(leitura);
  }

  async criar(dto) {
    dto.validate();
    const novaLeitura = await LeituraRepository.create(dto);
    return LeituraResponseDTO.format(novaLeitura);
  }

  async criarEmLote(dtosArray) {
    const dadosValidos = dtosArray.map(dto => {
      dto.validate();
      return {
        station_id: dto.station_id,
        timestamp: dto.timestamp,
        temperature_c: dto.temperature_c,
        humidity_pct: dto.humidity_pct
      };
    });
    return await LeituraRepository.bulkCreate(dadosValidos);
  }

  async atualizar(id, dto) {
    dto.validate();
    const atualizada = await LeituraRepository.update(id, dto);
    if (!atualizada) {
      throw new ApiError(404, `Leitura com ID ${id} não encontrada para atualização.`);
    }
    return LeituraResponseDTO.format(atualizada);
  }

  async remover(id) {
    const deletado = await LeituraRepository.destroy(id);
    if (!deletado) {
      throw new ApiError(404, `Leitura com ID ${id} não encontrada para exclusão.`);
    }
    return true;
  }

  async removerTodas() {
    await LeituraRepository.destroyAll();
    return true;
  }
}

module.exports = new LeituraService();
