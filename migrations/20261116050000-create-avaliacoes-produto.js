'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('avaliacoes_produto', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      produtoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'produtos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      usuario: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      nota: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      dataAvaliacao: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('avaliacoes_produto');
  }
};
