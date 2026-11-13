'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nome: { allowNull: false, type: Sequelize.STRING(120) },
      email: { allowNull: false, unique: true, type: Sequelize.STRING(160) },
      cpf: { allowNull: false, unique: true, type: Sequelize.STRING(11) },
      senha: { allowNull: false, type: Sequelize.STRING },
      role: { allowNull: false, defaultValue: 'cliente', type: Sequelize.ENUM('cliente', 'admin') },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  }
};
