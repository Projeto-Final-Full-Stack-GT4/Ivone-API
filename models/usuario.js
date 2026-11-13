'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.hasMany(models.Endereco, { foreignKey: 'usuarioId', as: 'enderecos' });
      Usuario.hasMany(models.Pedido, { foreignKey: 'usuarioId', as: 'pedidos' });
    }
  }

  Usuario.init({
    nome: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
    cpf: { type: DataTypes.STRING(11), allowNull: false, unique: true, validate: { len: [11, 11], isNumeric: true } },
    senha: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('cliente', 'admin'), allowNull: false, defaultValue: 'cliente' }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios'
  });

  return Usuario;
};
