jest.mock('../models', () => ({
  Usuario: {
    findAll: jest.fn(),
    findByPk: jest.fn()
  }
}));

const { Usuario } = require('../models');
const usuarioController = require('../controllers/usuarioController');

describe('acesso administrativo a clientes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('lista somente dados de identificação e contato', async () => {
    Usuario.findAll.mockResolvedValue([
      { id: 2, nome: 'Cliente', email: 'cliente@example.com', role: 'cliente' }
    ]);
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await usuarioController.listar({}, response);

    expect(Usuario.findAll).toHaveBeenCalledWith({
      where: { role: 'cliente' },
      attributes: ['id', 'nome', 'email', 'role'],
      order: [['id', 'ASC']]
    });
    expect(response.json).toHaveBeenCalledWith([
      { id: 2, nome: 'Cliente', email: 'cliente@example.com', role: 'cliente' }
    ]);
  });

  test('permite ao administrador consultar contato sem expor CPF', async () => {
    Usuario.findByPk.mockResolvedValue({
      id: 2,
      nome: 'Cliente',
      email: 'cliente@example.com',
      cpf: '12345678901',
      role: 'cliente'
    });
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await usuarioController.buscarPorId({
      params: { id: '2' },
      usuario: { id: 1, role: 'admin' }
    }, response);

    expect(response.json).toHaveBeenCalledWith({
      id: 2,
      nome: 'Cliente',
      email: 'cliente@example.com',
      role: 'cliente'
    });
  });

  test('impede cliente de consultar o perfil de outra pessoa', async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await usuarioController.buscarPorId({
      params: { id: '2' },
      usuario: { id: 1, role: 'cliente' }
    }, response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(Usuario.findByPk).not.toHaveBeenCalled();
  });
});
