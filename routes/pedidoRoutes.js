const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['admin']), pedidoController.listar);
router.post('/', authMiddleware, pedidoController.criar);
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin']), pedidoController.atualizarStatus);

module.exports = router;
