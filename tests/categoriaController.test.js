jest.mock('../models', () => ({
  Categoria: {
    create: jest.fn()
  }
}));

const { Categoria } = require('../models');
const categoriaController = require('../controllers/categoriaController');

describe('criação de categoria', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('gera um slug estável a partir do nome da categoria', async () => {
    const categoria = { id: 1, nome: 'Cuidados com a Pele', slug: 'cuidados-com-a-pele' };
    Categoria.create.mockResolvedValue(categoria);
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await categoriaController.criar({
      body: { nome: ' Cuidados com a Pele ', descricao: 'Rotina facial' }
    }, response);

    expect(Categoria.create).toHaveBeenCalledWith({
      nome: 'Cuidados com a Pele',
      slug: 'cuidados-com-a-pele',
      descricao: 'Rotina facial',
      use_in_menu: true
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(categoria);
  });
});
