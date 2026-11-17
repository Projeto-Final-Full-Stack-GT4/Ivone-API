jest.mock('../models', () => ({
  Categoria: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn()
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

  test('lista categorias com paginação e filtros válidos', async () => {
    Categoria.findAndCountAll.mockResolvedValue({
      count: 2,
      rows: [
        { id: 1, nome: 'Cuidados com a Pele' },
        { id: 2, nome: 'Maquiagem' }
      ]
    });
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await categoriaController.listar({
      query: {
        pagina: '2',
        limite: '20',
        nome: 'pele',
        use_in_menu: 'true'
      }
    }, response);

    expect(Categoria.findAndCountAll).toHaveBeenCalledWith({
      where: {
        nome: { [require('sequelize').Op.like]: '%pele%' },
        use_in_menu: true
      },
      order: [['id', 'ASC']],
      limit: 20,
      offset: 20
    });
    expect(response.json).toHaveBeenCalledWith({
      pagina: 2,
      limite: 20,
      total: 2,
      totalPaginas: 1,
      categorias: [
        { id: 1, nome: 'Cuidados com a Pele' },
        { id: 2, nome: 'Maquiagem' }
      ]
    });
  });

  test('busca categoria por id e rejeita identificador inválido', async () => {
    const categoria = { id: 7, nome: 'Kits' };
    Categoria.findByPk.mockResolvedValue(categoria);
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await categoriaController.buscarPorId({ params: { id: '7' } }, response);

    expect(Categoria.findByPk).toHaveBeenCalledWith(7);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(categoria);

    await expect(categoriaController.buscarPorId({ params: { id: '0' } }, response))
      .rejects.toMatchObject({ statusCode: 400, message: 'Identificador de categoria inválido.' });
  });

  test('atualiza dados de categoria e impede atualização vazia', async () => {
    const categoria = {
      id: 3,
      nome: 'Pele',
      descricao: 'Antigo',
      use_in_menu: true,
      update: jest.fn().mockResolvedValue(true)
    };
    Categoria.findByPk.mockResolvedValue(categoria);
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await categoriaController.atualizar({
      params: { id: '3' },
      body: { nome: ' Pele ', descricao: ' Nova descrição ', use_in_menu: false }
    }, response);

    expect(categoria.update).toHaveBeenCalledWith({
      nome: 'Pele',
      descricao: 'Nova descrição',
      use_in_menu: false
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(categoria);

    await expect(categoriaController.atualizar({
      params: { id: '3' },
      body: {}
    }, response)).rejects.toMatchObject({
      statusCode: 400,
      message: 'Informe pelo menos um campo para atualizar.'
    });
  });

  test('não permite excluir categoria com produtos vinculados', async () => {
    const categoria = {
      id: 8,
      countProdutos: jest.fn().mockResolvedValue(2),
      destroy: jest.fn()
    };
    Categoria.findByPk.mockResolvedValue(categoria);

    await expect(categoriaController.remover({ params: { id: '8' } }, {}))
      .rejects.toMatchObject({ statusCode: 409 });

    expect(categoria.destroy).not.toHaveBeenCalled();

    categoria.countProdutos.mockResolvedValue(0);
    const response = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn()
    };

    await categoriaController.remover({ params: { id: '8' } }, response);

    expect(categoria.destroy).toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.end).toHaveBeenCalled();
  });
});
