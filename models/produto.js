'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Produto extends Model {}

  Produto.init({
    nome: { type: DataTypes.STRING(160), allowNull: false },
    categoria: { type: DataTypes.STRING(60), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: false },
    tamanho: { type: DataTypes.STRING(60), allowNull: false },
    preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
    tag: { type: DataTypes.STRING(60), allowNull: true },
    imagem: { type: DataTypes.STRING(500), allowNull: true },
    estoque: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Produto',
    tableName: 'produtos'
  });

  return Produto;
};
