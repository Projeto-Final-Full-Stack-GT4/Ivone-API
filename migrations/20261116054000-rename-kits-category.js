'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkUpdate(
      'categorias',
      { nome: 'Kits', updatedAt: new Date() },
      { slug: 'kits', nome: 'Kits especiais' }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate(
      'categorias',
      { nome: 'Kits especiais', updatedAt: new Date() },
      { slug: 'kits', nome: 'Kits' }
    );
  }
};
