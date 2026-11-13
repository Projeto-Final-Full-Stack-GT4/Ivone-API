'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('itens_pedido', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      pedidoId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'pedidos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      produtoId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'produtos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      quantidade: { allowNull: false, type: Sequelize.INTEGER },
      precoUnitario: { allowNull: false, type: Sequelize.DECIMAL(10, 2) },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('itens_pedido');
  }
};
