'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ItemPedido extends Model {
    static associate(models) {
      ItemPedido.belongsTo(models.Pedido, { foreignKey: 'pedidoId', as: 'pedido' });
      ItemPedido.belongsTo(models.Produto, { foreignKey: 'produtoId', as: 'produto' });
    }
  }

  ItemPedido.init({
    pedidoId: { type: DataTypes.INTEGER, allowNull: false },
    produtoId: { type: DataTypes.INTEGER, allowNull: false },
    quantidade: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    precoUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, {
    sequelize,
    modelName: 'ItemPedido',
    tableName: 'itens_pedido'
  });

  return ItemPedido;
};
