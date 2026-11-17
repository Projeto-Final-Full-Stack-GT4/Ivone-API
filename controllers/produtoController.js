
const { Op } = require('sequelize');
const { AvaliacaoProduto, Categoria, Produto, sequelize } = require('../models');
const produtoReqDto = require('../dtos/produtoReqDto');
const AppError = require('../utils/AppError');
const categorySlug = require('../utils/categorySlug');

function categoriasInclude(options = {}) {
  return {
    model: Categoria,
    as: 'categorias',
    attributes: ['id', 'nome', 'slug', 'descricao', 'use_in_menu'],
    through: { attributes: [] },
    ...options
  };
}

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

  const categoriaId = req.query.categoriaId === undefined
    ? undefined
    : Number(req.query.categoriaId);
  if (categoriaId !== undefined &&
      (!Number.isSafeInteger(categoriaId) || categoriaId < 1)) {
    throw new AppError('Identificador de categoria inválido.');
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
    include: [
      categoriasInclude(categoriaId
        ? { where: { id: categoriaId }, required: true }
        : {})
    ],
    distinct: true,
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

async function listarAdmin(req, res) {
  const produtos = await Produto.findAll({
    include: [categoriasInclude()],
    order: [['id', 'ASC']]
  });

  return res.status(200).json({ produtos });
}

// GET - Buscar produto por ID
async function buscarPorId(req, res) {
  const produto = await Produto.findOne({
    where: {
      id: parseId(req.params.id),
      ativo: true
    },
    include: [
      categoriasInclude(),
      {
        model: AvaliacaoProduto,
        as: 'reviews',
        attributes: ['id', 'user', 'rating', 'date', 'comment'],
        separate: true,
        order: [['date', 'DESC'], ['id', 'DESC']]
      }
    ]
  });

  if (!produto) {
    throw new AppError('Produto não encontrado.', 404);
  }

  return res.status(200).json(produto);
}

async function resolverCategoria(entity, transaction) {
  if (entity.categoriaId === undefined && entity.categoria === undefined) {
    return null;
  }

  const categoria = entity.categoriaId !== undefined
    ? await Categoria.findByPk(entity.categoriaId, { transaction })
    : await Categoria.findOne({
      where: {
        [Op.or]: [
          { slug: categorySlug(entity.categoria) },
          { nome: entity.categoria.trim() }
        ]
      },
      transaction
    });

  if (!categoria) {
    throw new AppError('Categoria não encontrada.', 404);
  }

  return categoria;
}

async function buscarProdutoComCategorias(id, transaction) {
  return Produto.findByPk(id, {
    include: [categoriasInclude()],
    transaction
  });
}

// POST - Cadastrar produto
async function criar(req, res) {
  const entity = produtoReqDto.toEntity(req.body);
  const produto = await sequelize.transaction(async (transaction) => {
    const categoria = await resolverCategoria(entity, transaction);
    const dadosProduto = { ...entity };
    delete dadosProduto.categoriaId;
    dadosProduto.categoria = categoria.slug;
    const novoProduto = await Produto.create({
      ...dadosProduto
    }, { transaction });

    await novoProduto.setCategorias([categoria], { transaction });
    return buscarProdutoComCategorias(novoProduto.id, transaction);
  });

  return res.status(201).json(produto);
}

// PATCH - Atualizar produto
async function atualizar(req, res) {
  const id = parseId(req.params.id);
  const entity = produtoReqDto.toEntity(req.body, true);
  const produtoAtualizado = await sequelize.transaction(async (transaction) => {
    const produto = await Produto.findByPk(id, { transaction });

    if (!produto) {
      throw new AppError('Produto não encontrado.', 404);
    }

    const categoria = await resolverCategoria(entity, transaction);
    const dadosProduto = { ...entity };
    delete dadosProduto.categoriaId;
    if (categoria) {
      dadosProduto.categoria = categoria.slug;
    }

    await produto.update(dadosProduto, { transaction });
    if (categoria) {
      await produto.setCategorias([categoria], { transaction });
    }

    return buscarProdutoComCategorias(produto.id, transaction);
  });

  return res.status(200).json(produtoAtualizado);
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
  listarAdmin,
  buscarPorId,
  criar,
  atualizar,
  remover
};
