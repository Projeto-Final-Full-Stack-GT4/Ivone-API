
const { Op } = require('sequelize');
const { Categoria } = require('../models');
const AppError = require('../utils/AppError');
const categorySlug = require('../utils/categorySlug');

// Validar o ID recebido pela URL
function parseId(value) {
    const id = Number(value);

    if (!Number.isInteger(id) || id < 1) {
        throw new AppError('Identificador de categoria inválido.');
    }

    return id;
}

// Listar todas as categorias

// Listar categorias com paginação
async function listar(req, res) {
    const pagina = Math.max(
        1,
        Number.parseInt(req.query.pagina, 10) || 1
    );

    const limite = Math.min(
        100,
        Math.max(1, Number.parseInt(req.query.limite, 10) || 10)
    );

    const offset = (pagina - 1) * limite;
    const where = {};

    for (const campo of ['nome', 'descricao']) {
        const valor = req.query[campo];
        if (valor !== undefined) {
            if (typeof valor !== 'string') {
                throw new AppError(`O filtro ${campo} deve ser um texto.`);
            }

            if (valor.trim()) {
                where[campo] = { [Op.like]: `%${valor.trim()}%` };
            }
        }
    }

    if (req.query.use_in_menu !== undefined) {
        if (!['true', 'false'].includes(req.query.use_in_menu)) {
            throw new AppError('O filtro use_in_menu deve ser true ou false.');
        }

        where.use_in_menu = req.query.use_in_menu === 'true';
    }

    const { count, rows } = await Categoria.findAndCountAll({
        where,
        order: [['id', 'ASC']],
        limit: limite,
        offset
    });

    return res.status(200).json({
        pagina,
        limite,
        total: count,
        totalPaginas: Math.ceil(count / limite),
        categorias: rows
    });
}


// Buscar categoria pelo ID
async function buscarPorId(req, res) {
    const categoria = await Categoria.findByPk(
        parseId(req.params.id)
    );

    if (!categoria) {
        throw new AppError('Categoria não encontrada.', 404);
    }

    return res.status(200).json(categoria);
}

// Cadastrar categoria
async function criar(req, res) {
    const { nome, descricao, use_in_menu } = req.body || {};

    if (typeof nome !== 'string' || !nome.trim()) {
        throw new AppError('O nome da categoria é obrigatório.');
    }

    if (
        descricao !== undefined &&
        descricao !== null &&
        typeof descricao !== 'string'
    ) {
        throw new AppError('A descrição deve ser um texto.');
    }

    if (use_in_menu !== undefined && typeof use_in_menu !== 'boolean') {
        throw new AppError('use_in_menu deve ser true ou false.');
    }

    const categoria = await Categoria.create({
        nome: nome.trim(),
        slug: categorySlug(nome),
        descricao: descricao?.trim() || null,
        use_in_menu: use_in_menu === undefined ? true : use_in_menu
    });

    return res.status(201).json(categoria);
}

// Atualizar categoria
async function atualizar(req, res) {
    const categoria = await Categoria.findByPk(
        parseId(req.params.id)
    );

    if (!categoria) {
        throw new AppError('Categoria não encontrada.', 404);
    }

    const { nome, descricao, use_in_menu } = req.body || {};
    const dadosAtualizados = {};

    if (nome !== undefined) {
        if (typeof nome !== 'string' || !nome.trim()) {
            throw new AppError('O nome da categoria é inválido.');
        }

        dadosAtualizados.nome = nome.trim();
    }

    if (descricao !== undefined) {
        if (descricao !== null && typeof descricao !== 'string') {
            throw new AppError('A descrição deve ser um texto.');
        }

        dadosAtualizados.descricao =
            typeof descricao === 'string' ? descricao.trim() : null;
    }

    if (use_in_menu !== undefined) {
        if (typeof use_in_menu !== 'boolean') {
            throw new AppError('use_in_menu deve ser true ou false.');
        }

        dadosAtualizados.use_in_menu = use_in_menu;
    }

    if (Object.keys(dadosAtualizados).length === 0) {
        throw new AppError('Informe pelo menos um campo para atualizar.');
    }

    await categoria.update(dadosAtualizados);

    return res.status(200).json(categoria);
}

// Excluir categoria
async function remover(req, res) {
    const categoria = await Categoria.findByPk(
        parseId(req.params.id)
    );

    if (!categoria) {
        throw new AppError('Categoria não encontrada.', 404);
    }

    // Verificar se existem produtos associados
    const quantidadeProdutos = await categoria.countProdutos();

    if (quantidadeProdutos > 0) {
        throw new AppError(
            'Não é possível excluir uma categoria que possui produtos associados.',
            409
        );
    }

    await categoria.destroy();

    return res.status(204).end();
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover
};
