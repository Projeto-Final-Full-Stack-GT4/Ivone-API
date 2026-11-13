const express = require('express');
const produtoController = require('../controllers/produtoController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscarPorId);
router.post('/', authMiddleware, roleMiddleware(['admin']), produtoController.criar);
router.patch('/:id', authMiddleware, roleMiddleware(['admin']), produtoController.atualizar);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), produtoController.remover);

module.exports = router;
