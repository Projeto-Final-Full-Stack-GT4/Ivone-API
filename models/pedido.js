'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pedido extends Model {
    static associate(models) {
      Pedido.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      Pedido.belongsTo(models.Endereco, { foreignKey: 'enderecoId', as: 'endereco' });
      Pedido.hasMany(models.ItemPedido, { foreignKey: 'pedidoId', as: 'itens' });
    }
  }

  Pedido.init({
    usuarioId: { type: DataTypes.INTEGER, allowNull: false },
    enderecoId: { type: DataTypes.INTEGER, allowNull: true },
    status: {
      type: DataTypes.ENUM('pendente', 'pago', 'enviado', 'entregue', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendente'
    },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'Pedido',
    tableName: 'pedidos'
  });

  return Pedido;
};
