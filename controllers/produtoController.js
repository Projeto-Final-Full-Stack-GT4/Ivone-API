
const { Op } = require('sequelize');
const { Produto } = require('../models');
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
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const offset = (page - 1) * limit;

  // Filtro por categoria
  if (typeof req.query.categoria === 'string' && req.query.categoria.trim()) {
    where.categoria = req.query.categoria.trim();
  }

  // Filtro por nome
  if (typeof req.query.nome === 'string' && req.query.nome.trim()) {
    where.nome = { [Op.like]: `%${req.query.nome.trim()}%` };
  }

  // Filtro por tamanho
  if (typeof req.query.tamanho === 'string' && req.query.tamanho.trim()) {
    where.tamanho = req.query.tamanho.trim();
  }

  // Filtro por tag
  if (typeof req.query.tag === 'string' && req.query.tag.trim()) {
    where.tag = req.query.tag.trim();
  }

  // Filtro por estoque
  if (req.query.estoque !== undefined) {
    const estoque = Number(req.query.estoque);

    if (!Number.isInteger(estoque) || estoque < 0) {
      throw new AppError('Estoque inválido.');
    }

    where.estoque = estoque;
  }

  // Filtro por faixa de preço
  if (req.query.precoMin !== undefined) {
    const precoMin = Number(req.query.precoMin);

    if (!Number.isFinite(precoMin) || precoMin < 0) {
      throw new AppError('Preço mínimo inválido.');
    }

    where.preco = {
      ...where.preco,
      [Op.gte]: precoMin
    };
  }

  if (req.query.precoMax !== undefined) {
    const precoMax = Number(req.query.precoMax);

    if (!Number.isFinite(precoMax) || precoMax < 0) {
      throw new AppError('Preço máximo inválido.');
    }

    where.preco = {
      ...where.preco,
      [Op.lte]: precoMax
    };
  }

  if (
    where.preco?.[Op.gte] !== undefined &&
    where.preco?.[Op.lte] !== undefined &&
    where.preco[Op.gte] > where.preco[Op.lte]
  ) {
    throw new AppError('O preço mínimo não pode ser maior que o preço máximo.');
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
    }
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
