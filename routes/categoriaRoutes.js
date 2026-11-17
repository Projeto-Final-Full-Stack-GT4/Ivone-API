
const express = require('express');
const categoriaController = require('../controllers/categoriaController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Listar todas as categorias
router.get('/', categoriaController.listar);

// Buscar categoria pelo ID
router.get('/:id', categoriaController.buscarPorId);

// Cadastrar categoria
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['admin']),
    categoriaController.criar
);

// Atualizar categoria
router.patch(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    categoriaController.atualizar
);

// Atualizar categoria
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    categoriaController.atualizar
);

// Excluir categoria
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    categoriaController.remover
);

module.exports = router;
