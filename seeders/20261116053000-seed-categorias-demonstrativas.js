'use strict';

const { QueryTypes } = require('sequelize');
const categorySlug = require('../utils/categorySlug');

const categoriasPadrao = [
  { nome: 'Skincare', slug: 'skincare', descricao: 'Cuidados diários para a pele.' },
  { nome: 'Maquiagem', slug: 'maquiagem', descricao: 'Produtos para realçar a beleza.' },
  { nome: 'Cabelos', slug: 'cabelos', descricao: 'Cuidados e produtos para os cabelos.' },
  { nome: 'Kits', slug: 'kits', descricao: 'Combinações especiais de produtos.' }
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const existentes = await queryInterface.sequelize.query(
      'SELECT id, nome, slug FROM categorias',
      { type: QueryTypes.SELECT }
    );
    const slugsExistentes = new Set(existentes.map(({ slug }) => slug));
    const novasCategorias = categoriasPadrao
      .filter(({ slug }) => !slugsExistentes.has(slug))
      .map((categoria) => ({
        ...categoria,
        use_in_menu: true,
        createdAt: now,
        updatedAt: now
      }));

    if (novasCategorias.length > 0) {
      await queryInterface.bulkInsert('categorias', novasCategorias);
    }

    const produtos = await queryInterface.sequelize.query(
      'SELECT id, categoria FROM produtos',
      { type: QueryTypes.SELECT }
    );
    const categoriasPorSlug = new Map(
      (await queryInterface.sequelize.query(
        'SELECT id, nome, slug FROM categorias',
        { type: QueryTypes.SELECT }
      )).map((categoria) => [categoria.slug, categoria])
    );

    for (const valorCategoria of new Set(produtos.map(({ categoria }) => categoria).filter(Boolean))) {
      const slug = categorySlug(valorCategoria);
      if (categoriasPorSlug.has(slug)) continue;

      const categoria = {
        nome: valorCategoria.trim(),
        slug,
        descricao: null,
        use_in_menu: true,
        createdAt: now,
        updatedAt: now
      };
      await queryInterface.bulkInsert('categorias', [categoria]);
      const [inserida] = await queryInterface.sequelize.query(
        'SELECT id, nome, slug FROM categorias WHERE slug = :slug',
        {
          replacements: { slug },
          type: QueryTypes.SELECT
        }
      );
      categoriasPorSlug.set(slug, inserida);
    }

    const vinculacoesExistentes = await queryInterface.sequelize.query(
      'SELECT produtoId, categoriaId FROM produto_categorias',
      { type: QueryTypes.SELECT }
    );
    const chavesExistentes = new Set(
      vinculacoesExistentes.map(({ produtoId, categoriaId }) => `${produtoId}:${categoriaId}`)
    );
    const vinculacoes = produtos
      .map((produto) => {
        const categoria = categoriasPorSlug.get(categorySlug(produto.categoria || ''));
        if (!categoria || chavesExistentes.has(`${produto.id}:${categoria.id}`)) return null;
        return {
          produtoId: produto.id,
          categoriaId: categoria.id,
          createdAt: now,
          updatedAt: now
        };
      })
      .filter(Boolean);

    if (vinculacoes.length > 0) {
      await queryInterface.bulkInsert('produto_categorias', vinculacoes);
    }
  },

  async down() {
    // Preserva categorias e vínculos que podem ter sido usados após a carga demonstrativa.
  }
};
