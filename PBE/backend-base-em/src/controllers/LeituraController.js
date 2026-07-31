const leituraService = require('../services/LeituraService');

// CONTROLLER / CAMADA HTTP
// O Controller recebe requisições HTTP e devolve respostas HTTP.
// Ele não deve conter regra de banco de dados.
class LeituraController {
  async listar(req, res, next) {
    try {
      const resultado = await leituraService.listar(req.query);
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      const resultado = await leituraService.buscarPorId(req.params.id);
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async criar(req, res, next) {
    try {
      const resultado = await leituraService.criar(req.body);
      return res.status(201).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const resultado = await leituraService.atualizar(req.params.id, req.body);
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async remover(req, res, next) {
    try {
      const resultado = await leituraService.remover(req.params.id);
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async removerTodas(req, res, next) {
    try {
      const resultado = await leituraService.removerTodas();
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new LeituraController();
