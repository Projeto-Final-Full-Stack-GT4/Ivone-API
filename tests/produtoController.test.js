jest.mock('../models', () => ({
  AvaliacaoProduto: {},
  Produto: {
    findOne: jest.fn()
  }
}));

const { AvaliacaoProduto, Produto } = require('../models');
const produtoController = require('../controllers/produtoController');

describe('consulta de produto', () => {
  test('retorna avaliações associadas ao produto', async () => {
    const produto = {
      id: 1,
      reviews: [{ id: 10, user: 'Mariana Silva', rating: 5 }]
    };
    Produto.findOne.mockResolvedValue(produto);
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await produtoController.buscarPorId({ params: { id: '1' } }, response);

    expect(Produto.findOne).toHaveBeenCalledWith(expect.objectContaining({
      include: [expect.objectContaining({
        model: AvaliacaoProduto,
        as: 'reviews',
        separate: true
      })]
    }));
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(produto);
  });
});
