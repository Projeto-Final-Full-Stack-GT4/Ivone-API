'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Endereco extends Model {
    static associate(models) {
      Endereco.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      Endereco.hasMany(models.Pedido, { foreignKey: 'enderecoId', as: 'pedidos' });
    }
  }

  Endereco.init({
    usuarioId: { type: DataTypes.INTEGER, allowNull: false },
    rua: { type: DataTypes.STRING(160), allowNull: false },
    numero: { type: DataTypes.STRING(30), allowNull: false },
    complemento: { type: DataTypes.STRING(120), allowNull: true },
    bairro: { type: DataTypes.STRING(100), allowNull: false },
    cidade: { type: DataTypes.STRING(100), allowNull: false },
    estado: { type: DataTypes.STRING(2), allowNull: false },
    cep: { type: DataTypes.STRING(8), allowNull: false }
  }, {
    sequelize,
    modelName: 'Endereco',
    tableName: 'enderecos'
  });

  return Endereco;
};
