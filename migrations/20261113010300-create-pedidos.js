'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pedidos', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      usuarioId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      enderecoId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'enderecos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        allowNull: false,
        defaultValue: 'pendente',
        type: Sequelize.ENUM('pendente', 'pago', 'enviado', 'entregue', 'cancelado')
      },
      total: { allowNull: false, defaultValue: 0, type: Sequelize.DECIMAL(10, 2) },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('pedidos');
  }
};
