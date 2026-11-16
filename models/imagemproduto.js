
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ImagemProduto extends Model {
    static associate(models) {
      ImagemProduto.belongsTo(models.Produto, {
        foreignKey: 'produtoId',
        as: 'produto'
      });
    }
  }

  ImagemProduto.init({
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    principal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'ImagemProduto',
    tableName: 'imagens_produto'
  });

  return ImagemProduto;
};
