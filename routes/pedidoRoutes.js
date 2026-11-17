const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, pedidoController.criar);

module.exports = router;
