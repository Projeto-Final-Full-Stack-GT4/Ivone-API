
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OpcaoProduto extends Model {
    static associate(models) {
      OpcaoProduto.belongsTo(models.Produto, {
        foreignKey: 'produtoId',
        as: 'produto'
      });
    }
  }

  OpcaoProduto.init({
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    valor: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'OpcaoProduto',
    tableName: 'opcoes_produto'
  });

  return OpcaoProduto;
};
