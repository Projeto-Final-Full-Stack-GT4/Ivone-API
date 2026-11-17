
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Produto extends Model {
    static associate(models) {
      // Um produto pode ter várias imagens
      Produto.hasMany(models.ImagemProduto, {
        foreignKey: 'produtoId',
        as: 'imagens'
      });

      // Um produto pode ter várias opções
      Produto.hasMany(models.OpcaoProduto, {
        foreignKey: 'produtoId',
        as: 'opcoes'
      });

      Produto.hasMany(models.AvaliacaoProduto, {
        foreignKey: 'produtoId',
        as: 'reviews'
      });

      Produto.belongsToMany(models.Categoria, {
        through: models.ProdutoCategoria,
        foreignKey: 'produtoId',
        otherKey: 'categoriaId',
        as: 'categorias'
      });
    }
  }

  Produto.init({
    nome: { type: DataTypes.STRING(160), allowNull: false },
    categoria: { type: DataTypes.STRING(60), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: false },
    tamanho: { type: DataTypes.STRING(60), allowNull: false },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    tag: { type: DataTypes.STRING(60), allowNull: true },
    imagem: { type: DataTypes.STRING(500), allowNull: true },
    estoque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 }
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Produto',
    tableName: 'produtos'
  });

  return Produto;
};
