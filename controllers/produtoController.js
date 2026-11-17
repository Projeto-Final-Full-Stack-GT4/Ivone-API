
const { Op } = require('sequelize');
const { AvaliacaoProduto, Produto } = require('../models');
const produtoReqDto = require('../dtos/produtoReqDto');
const AppError = require('../utils/AppError');

function parseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Identificador de produto inválido.');
  }

  return id;
}

// GET - Listar produtos com paginação e filtros
async function listar(req, res) {
  const where = { ativo: true };

  // Paginação
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(req.query.limit) || 10, 1),
    100
  );

  const offset = (page - 1) * limit;

  // Filtro por categoria
  if (typeof req.query.categoria === 'string' && req.query.categoria.trim()) {
    where.categoria = req.query.categoria.trim();
  }

  // Busca por nome ou descrição
  if (typeof req.query.busca === 'string' && req.query.busca.trim()) {
    where[Op.or] = [
      { nome: { [Op.like]: `%${req.query.busca.trim()}%` } },
      { descricao: { [Op.like]: `%${req.query.busca.trim()}%` } }
    ];
  }

  // Consulta com paginação
  const { count, rows } = await Produto.findAndCountAll({
    where,
    limit,
    offset,
    order: [['id', 'ASC']]
  });

  return res.status(200).json({
    total: count,
    pagina: page,
    limite: limit,
    totalPaginas: Math.ceil(count / limit),
    produtos: rows
  });
}

// GET - Buscar produto por ID
async function buscarPorId(req, res) {
  const produto = await Produto.findOne({
    where: {
      id: parseId(req.params.id),
      ativo: true
    },
    include: [{
      model: AvaliacaoProduto,
      as: 'reviews',
      attributes: ['id', 'user', 'rating', 'date', 'comment'],
      separate: true,
      order: [['date', 'DESC'], ['id', 'DESC']]
    }]
  });

  if (!produto) {
    throw new AppError('Produto não encontrado.', 404);
  }

  return res.status(200).json(produto);
}

// POST - Cadastrar produto
async function criar(req, res) {
  const produto = await Produto.create(
    produtoReqDto.toEntity(req.body)
  );

  return res.status(201).json(produto);
}

// PUT - Atualizar produto
async function atualizar(req, res) {
  const produto = await Produto.findByPk(parseId(req.params.id));

  if (!produto) {
    throw new AppError('Produto não encontrado.', 404);
  }

  await produto.update(
    produtoReqDto.toEntity(req.body, true)
  );

  return res.status(200).json(produto);
}

// DELETE - Excluir produto (exclusão lógica)
async function remover(req, res) {
  const produto = await Produto.findByPk(parseId(req.params.id));

  if (!produto) {
    throw new AppError('Produto não encontrado.', 404);
  }

  await produto.update({ ativo: false });

  return res.status(204).end();
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};
