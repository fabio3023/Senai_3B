const express = require('express');
const leituraController = require('../controllers/LeituraController');

const router = express.Router();

// ROTAS REST DA ENTIDADE LEITURA
// GET    /api/leituras       -> listar leituras
// GET    /api/leituras/:id   -> buscar leitura específica
// POST   /api/leituras       -> criar nova leitura
// PUT    /api/leituras/:id   -> atualizar uma leitura existente
// DELETE /api/leituras/:id   -> remover uma leitura específica
// DELETE /api/leituras       -> remover todas as leituras, útil em aula/laboratório
router.get('/', leituraController.listar);
router.get('/:id', leituraController.buscarPorId);
router.post('/', leituraController.criar);
router.put('/:id', leituraController.atualizar);
router.delete('/:id', leituraController.remover);
router.delete('/', leituraController.removerTodas);

module.exports = router;
