'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AvaliacaoProduto extends Model {
    static associate(models) {
      AvaliacaoProduto.belongsTo(models.Produto, {
        foreignKey: 'produtoId',
        as: 'produto'
      });
    }
  }

  AvaliacaoProduto.init({
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user: {
      type: DataTypes.STRING(120),
      allowNull: false,
      field: 'usuario'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
      field: 'nota'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'dataAvaliacao'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'comentario'
    }
  }, {
    sequelize,
    modelName: 'AvaliacaoProduto',
    tableName: 'avaliacoes_produto'
  });

  return AvaliacaoProduto;
};
