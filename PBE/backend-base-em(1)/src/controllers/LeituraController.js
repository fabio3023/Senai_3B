const LeituraService = require('../services/LeituraService');
const LeituraRequestDTO = require('../dtos/LeituraRequestDTO');

class LeituraController {
  async listar(req, res, next) {
    try {
      const resultado = await LeituraService.listar(req.query);
      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      const data = await LeituraService.buscarPorId(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async criar(req, res, next) {
    try {
      const dto = new LeituraRequestDTO(req.body);
      const data = await LeituraService.criar(dto);
      return res.status(201).json({
        success: true,
        message: 'Leitura criada com sucesso.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const dto = new LeituraRequestDTO(req.body);
      const data = await LeituraService.atualizar(req.params.id, dto);
      return res.status(200).json({
        success: true,
        message: 'Leitura atualizada com sucesso.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async remover(req, res, next) {
    try {
      await LeituraService.remover(req.params.id);
      return res.status(200).json({
        success: true,
        message: `Leitura com ID ${req.params.id} excluída com sucesso.`
      });
    } catch (error) {
      next(error);
    }
  }

  async removerTodas(req, res, next) {
    try {
      await LeituraService.removerTodas();
      return res.status(200).json({
        success: true,
        message: 'Todas as leituras foram limpas da tabela.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeituraController();
