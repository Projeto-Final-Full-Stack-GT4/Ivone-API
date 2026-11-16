
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProdutoCategoria extends Model {}

  ProdutoCategoria.init({
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ProdutoCategoria',
    tableName: 'produto_categorias'
  });

  return ProdutoCategoria;
};
