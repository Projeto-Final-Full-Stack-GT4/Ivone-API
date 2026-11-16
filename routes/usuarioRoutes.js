const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['admin']), usuarioController.listar);
router.get('/:id', usuarioController.buscarPorId);


module.exports = router;