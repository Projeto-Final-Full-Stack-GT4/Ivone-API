'use strict';

const categorySlug = require('../utils/categorySlug');

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('categorias');

    if (!columns.slug) {
      await queryInterface.addColumn('categorias', 'slug', {
        type: Sequelize.STRING(120),
        allowNull: true
      });
    }

    const [categories] = await queryInterface.sequelize.query(
      'SELECT id, nome, slug FROM categorias ORDER BY id ASC'
    );
    const usedSlugs = new Set();

    for (const category of categories) {
      const base = categorySlug(category.nome);
      let slug = category.slug || base;
      let suffix = 2;

      while (usedSlugs.has(slug)) {
        slug = `${base}-${category.id}-${suffix}`;
        suffix += 1;
      }

      usedSlugs.add(slug);
      await queryInterface.bulkUpdate('categorias', { slug }, { id: category.id });
    }

    await queryInterface.changeColumn('categorias', 'slug', {
      type: Sequelize.STRING(120),
      allowNull: false
    });

    const indexes = await queryInterface.showIndex('categorias');
    if (!indexes.some(({ name }) => name === 'categorias_slug_unico')) {
      await queryInterface.addIndex('categorias', ['slug'], {
        unique: true,
        name: 'categorias_slug_unico'
      });
    }
  },

  async down(queryInterface) {
    const indexes = await queryInterface.showIndex('categorias');
    if (indexes.some(({ name }) => name === 'categorias_slug_unico')) {
      await queryInterface.removeIndex('categorias', 'categorias_slug_unico');
    }

    const columns = await queryInterface.describeTable('categorias');
    if (columns.slug) {
      await queryInterface.removeColumn('categorias', 'slug');
    }
  }
};
