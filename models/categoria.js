
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Categoria extends Model {
    static associate(models) {
      Categoria.belongsToMany(models.Produto, {
        through: models.ProdutoCategoria,
        foreignKey: 'categoriaId',
        otherKey: 'produtoId',
        as: 'produtos'
      });
    }
  }

  Categoria.init({
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    use_in_menu: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Categoria',
    tableName: 'categorias'
  });

  return Categoria;
};
