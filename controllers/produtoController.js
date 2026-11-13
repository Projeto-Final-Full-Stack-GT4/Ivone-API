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

async function listar(req, res) {
  const where = { ativo: true };
  if (typeof req.query.categoria === 'string' && req.query.categoria.trim()) {
    where.categoria = req.query.categoria.trim();
  }
  if (typeof req.query.busca === 'string' && req.query.busca.trim()) {
    where[Op.or] = [
      { nome: { [Op.like]: `%${req.query.busca.trim()}%` } },
      { descricao: { [Op.like]: `%${req.query.busca.trim()}%` } }
    ];
  }
  const produtos = await Produto.findAll({ where, order: [['id', 'ASC']] });
  return res.status(200).json(produtos);
}

async function buscarPorId(req, res) {
  const produto = await Produto.findOne({ where: { id: parseId(req.params.id), ativo: true } });
  if (!produto) {
    throw new AppError('Produto não encontrado.', 404);
  }
  return res.status(200).json(produto);
}

async function criar(req, res) {
  const produto = await Produto.create(produtoReqDto.toEntity(req.body));
  return res.status(201).json(produto);
}

async function atualizar(req, res) {
  const produto = await Produto.findByPk(parseId(req.params.id));
  if (!produto) {
    throw new AppError('Produto não encontrado.', 404);
  }
  await produto.update(produtoReqDto.toEntity(req.body, true));
  return res.status(200).json(produto);
}

async function remover(req, res) {
  const produto = await Produto.findByPk(parseId(req.params.id));
  if (!produto) {
    throw new AppError('Produto não encontrado.', 404);
  }
  await produto.update({ ativo: false });
  return res.status(204).end();
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
