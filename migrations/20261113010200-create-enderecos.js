'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('enderecos', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      usuarioId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rua: { allowNull: false, type: Sequelize.STRING(160) },
      numero: { allowNull: false, type: Sequelize.STRING(30) },
      complemento: { allowNull: true, type: Sequelize.STRING(120) },
      bairro: { allowNull: false, type: Sequelize.STRING(100) },
      cidade: { allowNull: false, type: Sequelize.STRING(100) },
      estado: { allowNull: false, type: Sequelize.STRING(2) },
      cep: { allowNull: false, type: Sequelize.STRING(8) },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('enderecos');
  }
};
