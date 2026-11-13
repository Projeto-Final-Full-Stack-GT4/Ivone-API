'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('produtos', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nome: { allowNull: false, type: Sequelize.STRING(160) },
      categoria: { allowNull: false, type: Sequelize.STRING(60) },
      descricao: { allowNull: false, type: Sequelize.TEXT },
      tamanho: { allowNull: false, type: Sequelize.STRING(60) },
      preco: { allowNull: false, type: Sequelize.DECIMAL(10, 2) },
      tag: { allowNull: true, type: Sequelize.STRING(60) },
      imagem: { allowNull: true, type: Sequelize.STRING(500) },
      estoque: { allowNull: false, defaultValue: 0, type: Sequelize.INTEGER },
      ativo: { allowNull: false, defaultValue: true, type: Sequelize.BOOLEAN },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('produtos');
  }
};
