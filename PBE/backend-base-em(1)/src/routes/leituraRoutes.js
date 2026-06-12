const express = require('express');
const router = express.Router();
const LeituraController = require('../controllers/LeituraController');

router.get('/', LeituraController.listar);
router.get('/:id', LeituraController.buscarPorId);
router.post('/', LeituraController.criar);
router.put('/:id', LeituraController.atualizar);
router.delete('/:id', LeituraController.remover);
router.delete('/', LeituraController.removerTodas);

module.exports = router;
