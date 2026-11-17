jest.mock('../models', () => ({
  ItemPedido: {
    bulkCreate: jest.fn()
  },
  Pedido: {
    create: jest.fn()
  },
  Produto: {
    findAll: jest.fn()
  },
  sequelize: {
    transaction: jest.fn()
  }
}));

const { ItemPedido, Pedido, Produto, sequelize } = require('../models');
const pedidoController = require('../controllers/pedidoController');

describe('criação de pedido', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sequelize.transaction.mockImplementation((callback) => callback({
      LOCK: { UPDATE: 'UPDATE' }
    }));
  });

  test('calcula o total pelo preço da API, cria os itens e baixa o estoque', async () => {
    const product = {
      id: 1,
      nome: 'Sérum',
      preco: '10.10',
      estoque: 5,
      update: jest.fn()
    };
    Produto.findAll.mockResolvedValue([product]);
    Pedido.create.mockResolvedValue({ id: 42, status: 'pendente' });
    ItemPedido.bulkCreate.mockResolvedValue([]);
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await pedidoController.criar({
      usuario: { id: 7 },
      body: { itens: [{ produtoId: 1, quantidade: 2, precoUnitario: 0.01 }] }
    }, response);

    expect(Pedido.create).toHaveBeenCalledWith(
      { usuarioId: 7, status: 'pendente', total: '20.20' },
      { transaction: expect.any(Object) }
    );
    expect(ItemPedido.bulkCreate).toHaveBeenCalledWith([
      { produtoId: 1, quantidade: 2, precoUnitario: '10.10', pedidoId: 42 }
    ], { transaction: expect.any(Object) });
    expect(product.update).toHaveBeenCalledWith(
      { estoque: 3 },
      { transaction: expect.any(Object) }
    );
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      pedido: {
        id: 42,
        status: 'pendente',
        total: '20.20',
        itens: [{ produtoId: 1, quantidade: 2, precoUnitario: '10.10' }]
      }
    });
  });

  test('recusa quantidade acima do estoque sem criar pedido', async () => {
    Produto.findAll.mockResolvedValue([{
      id: 1,
      nome: 'Sérum',
      preco: '10.10',
      estoque: 1,
      update: jest.fn()
    }]);

    await expect(pedidoController.criar({
      usuario: { id: 7 },
      body: { itens: [{ produtoId: 1, quantidade: 2 }] }
    }, {})).rejects.toMatchObject({
      statusCode: 409,
      message: 'Estoque insuficiente para Sérum.'
    });

    expect(Pedido.create).not.toHaveBeenCalled();
    expect(ItemPedido.bulkCreate).not.toHaveBeenCalled();
  });

  test('valida o formato dos itens antes de iniciar uma transação', async () => {
    await expect(pedidoController.criar({
      usuario: { id: 7 },
      body: { itens: [{ produtoId: 1, quantidade: 0 }] }
    }, {})).rejects.toMatchObject({ statusCode: 400 });

    expect(sequelize.transaction).not.toHaveBeenCalled();
  });
});
