jest.mock('../models', () => ({
  AvaliacaoProduto: {},
  Categoria: {
    findByPk: jest.fn(),
    findOne: jest.fn()
  },
  Produto: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  },
  sequelize: {
    transaction: jest.fn((callback) => callback({}))
  }
}));

const { AvaliacaoProduto, Categoria, Produto } = require('../models');
const produtoController = require('../controllers/produtoController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('consulta de produto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('retorna categorias e avaliações associadas ao produto', async () => {
    const produto = {
      id: 1,
      reviews: [{ id: 10, user: 'Mariana Silva', rating: 5 }]
    };
    Produto.findOne.mockResolvedValue(produto);
    const response = createResponse();

    await produtoController.buscarPorId({ params: { id: '1' } }, response);

    expect(Produto.findOne).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.arrayContaining([
        expect.objectContaining({ model: Categoria, as: 'categorias' }),
        expect.objectContaining({
          model: AvaliacaoProduto,
          as: 'reviews',
          separate: true
        })
      ])
    }));
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(produto);
  });

  test('filtra produtos pela relação usando o identificador da categoria', async () => {
    Produto.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
    const response = createResponse();

    await produtoController.listar({ query: { categoriaId: '4' } }, response);

    expect(Produto.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      include: [
        expect.objectContaining({
          model: Categoria,
          as: 'categorias',
          where: { id: 4 },
          required: true
        })
      ],
      distinct: true
    }));
  });

  test('cria o produto com o slug compatível e associa a categoria selecionada', async () => {
    const categoria = { id: 4, slug: 'kits' };
    const createdProduct = { id: 20, setCategorias: jest.fn() };
    const savedProduct = { id: 20, categorias: [categoria] };
    Categoria.findByPk.mockResolvedValue(categoria);
    Produto.create.mockResolvedValue(createdProduct);
    Produto.findByPk.mockResolvedValue(savedProduct);
    const response = createResponse();

    await produtoController.criar({
      body: {
        nome: 'Kit teste',
        categoriaId: 4,
        descricao: 'Descrição do kit',
        tamanho: '2 itens',
        preco: 10
      }
    }, response);

    expect(Produto.create).toHaveBeenCalledWith(expect.objectContaining({
      nome: 'Kit teste',
      categoria: 'kits'
    }), { transaction: expect.any(Object) });
    expect(createdProduct.setCategorias).toHaveBeenCalledWith(
      [categoria],
      { transaction: expect.any(Object) }
    );
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(savedProduct);
  });
});
