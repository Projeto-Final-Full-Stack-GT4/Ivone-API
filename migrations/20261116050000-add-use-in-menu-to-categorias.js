'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('categorias');
    if (!columns.use_in_menu) {
      await queryInterface.addColumn('categorias', 'use_in_menu', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('categorias');
    if (columns.use_in_menu) {
      await queryInterface.removeColumn('categorias', 'use_in_menu');
    }
  }
};
