const express = require('express');
const { Op } = require('sequelize');

const Leitura = require('../models/Leitura');

const router = express.Router();

/*
  ROTA 1
  Buscar todas as leituras
  Exemplo:
  GET http://localhost:3000/leituras
*/
router.get('/leituras', async (req, res) => {
  try {
    const leituras = await Leitura.findAll({
      order: [['id', 'ASC']],
    });

    return res.status(200).json(leituras);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao buscar leituras no banco.',
      erro: error.message,
    });
  }
});

/*
  ROTA 2
  Buscar leituras de uma data específica

  Formato esperado da data:
  YYYY-MM-DD

  Exemplo:
  GET http://localhost:3000/leituras/data/2026-05-11
*/
router.get('/leituras/data/:data', async (req, res) => {
  try {
    const { data } = req.params;

    const formatoValido = /^\d{4}-\d{2}-\d{2}$/.test(data);

    if (!formatoValido) {
      return res.status(400).json({
        mensagem: 'Formato de data inválido. Use o formato YYYY-MM-DD.',
        exemplo: '2026-05-11',
      });
    }

    const inicioDoDia = new Date(`${data}T00:00:00`);
    const fimDoDia = new Date(inicioDoDia);

    fimDoDia.setDate(fimDoDia.getDate() + 1);

    const leituras = await Leitura.findAll({
      where: {
        timestamp: {
          [Op.gte]: inicioDoDia,
          [Op.lt]: fimDoDia,
        },
      },
      order: [['timestamp', 'ASC']],
    });

    return res.status(200).json({
      dataPesquisada: data,
      total: leituras.length,
      leituras,
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao buscar leituras pela data.',
      erro: error.message,
    });
  }
});

module.exports = router;