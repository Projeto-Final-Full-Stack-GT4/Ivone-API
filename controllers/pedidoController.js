const { ItemPedido, Pedido, Produto, Usuario, sequelize } = require('../models');
const AppError = require('../utils/AppError');

const statusTransitions = {
  pendente: ['pago', 'cancelado'],
  pago: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: []
};

function parseItems(body) {
  if (!body || !Array.isArray(body.itens) || body.itens.length === 0) {
    throw new AppError('Informe ao menos um item para o pedido.');
  }

  const items = new Map();
  for (const item of body.itens) {
    if (!item || !Number.isSafeInteger(item.produtoId) || item.produtoId < 1 ||
        !Number.isSafeInteger(item.quantidade) || item.quantidade < 1) {
      throw new AppError('Cada item deve informar um produto e uma quantidade inteira maior que zero.');
    }

    const quantity = (items.get(item.produtoId) || 0) + item.quantidade;
    if (!Number.isSafeInteger(quantity)) {
      throw new AppError('A quantidade solicitada é inválida.');
    }
    items.set(item.produtoId, quantity);
  }

  return items;
}

async function criar(req, res) {
  const items = parseItems(req.body);
  const pedido = await sequelize.transaction(async (transaction) => {
    const products = await Produto.findAll({
      where: { id: [...items.keys()], ativo: true },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (products.length !== items.size) {
      throw new AppError('Um ou mais produtos não estão disponíveis.', 404);
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    let totalCentavos = 0;
    const orderItems = [];

    for (const [produtoId, quantidade] of items) {
      const product = productsById.get(produtoId);
      const stock = Number(product.estoque);
      if (quantidade > stock) {
        throw new AppError(`Estoque insuficiente para ${product.nome}.`, 409);
      }

      const precoCentavos = Math.round(Number(product.preco) * 100);
      totalCentavos += precoCentavos * quantidade;
      if (!Number.isSafeInteger(totalCentavos) || totalCentavos > 9999999999) {
        throw new AppError('O total do pedido excede o limite permitido.');
      }

      orderItems.push({
        produtoId,
        quantidade,
        precoUnitario: (precoCentavos / 100).toFixed(2)
      });
    }

    const createdOrder = await Pedido.create({
      usuarioId: req.usuario.id,
      status: 'pendente',
      total: (totalCentavos / 100).toFixed(2)
    }, { transaction });

    await ItemPedido.bulkCreate(
      orderItems.map((item) => ({ ...item, pedidoId: createdOrder.id })),
      { transaction }
    );

    for (const [produtoId, quantidade] of items) {
      const product = productsById.get(produtoId);
      await product.update({ estoque: Number(product.estoque) - quantidade }, { transaction });
    }

    return {
      id: createdOrder.id,
      status: createdOrder.status,
      total: (totalCentavos / 100).toFixed(2),
      itens: orderItems
    };
  });

  return res.status(201).json({ pedido });
}

async function listar(req, res) {
  const pedidos = await Pedido.findAll({
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
      {
        model: ItemPedido,
        as: 'itens',
        include: [{
          model: Produto,
          as: 'produto',
          attributes: ['id', 'nome']
        }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  return res.status(200).json({ pedidos });
}

async function atualizarStatus(req, res) {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError('Identificador de pedido inválido.');
  }
  if (!Object.prototype.hasOwnProperty.call(statusTransitions, status)) {
    throw new AppError('Status de pedido inválido.');
  }

  const pedido = await sequelize.transaction(async (transaction) => {
    const order = await Pedido.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (!order) {
      throw new AppError('Pedido não encontrado.', 404);
    }
    if (order.status === status) {
      return { id: order.id, status: order.status };
    }
    if (!statusTransitions[order.status].includes(status)) {
      throw new AppError('Transição de status não permitida.', 409);
    }

    if (status === 'cancelado') {
      const items = await ItemPedido.findAll({
        where: { pedidoId: order.id },
        transaction
      });
      const productIds = [...new Set(items.map((item) => item.produtoId))];
      const products = await Produto.findAll({
        where: { id: productIds },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      const productsById = new Map(products.map((product) => [product.id, product]));

      for (const item of items) {
        const product = productsById.get(item.produtoId);
        if (!product) {
          throw new AppError('Não foi possível restaurar o estoque de um item do pedido.', 409);
        }
        await product.update(
          { estoque: Number(product.estoque) + Number(item.quantidade) },
          { transaction }
        );
      }
    }

    await order.update({ status }, { transaction });
    return { id: order.id, status: order.status };
  });

  return res.status(200).json({ pedido });
}

module.exports = { criar, listar, atualizarStatus };
