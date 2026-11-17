jest.mock('../models', () => ({
  Usuario: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
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

describe('cadastro e gestão do usuário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('cria um usuário com dados válidos e senha criptografada', async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Usuario.findOne.mockResolvedValue(null);
    Usuario.create.mockResolvedValue({
      id: 4,
      nome: 'Bruna',
      email: 'bruna@example.com',
      cpf: '12345678909',
      role: 'cliente'
    });

    await usuarioController.criarUsuario({
      body: {
        nome: 'Bruna',
        email: 'bruna@example.com',
        cpf: '12345678909',
        senha: 'Senha@123',
        confirmarSenha: 'Senha@123'
      }
    }, response);

    expect(Usuario.findOne).toHaveBeenCalledWith({ where: { email: 'bruna@example.com' } });
    expect(Usuario.create).toHaveBeenCalledWith(expect.objectContaining({
      nome: 'Bruna',
      email: 'bruna@example.com',
      cpf: '12345678909',
      senha: expect.any(String)
    }));
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      id: 4,
      nome: 'Bruna',
      email: 'bruna@example.com',
      cpf: '12345678909',
      role: 'cliente'
    });
  });

  test('impede cadastro com e-mail duplicado', async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Usuario.findOne.mockResolvedValue({ id: 3, email: 'joao@example.com' });

    await usuarioController.criarUsuario({
      body: {
        nome: 'João',
        email: 'joao@example.com',
        cpf: '12345678912',
        senha: 'Senha@123',
        confirmarSenha: 'Senha@123'
      }
    }, response);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({ erro: 'E-mail já cadastrado.' });
    expect(Usuario.create).not.toHaveBeenCalled();
  });

  test('atualiza nome e senha quando o usuário é o próprio dono', async () => {
    const usuario = {
      id: 7,
      nome: 'Maria',
      email: 'maria@example.com',
      cpf: '11144477735',
      role: 'cliente',
      update: jest.fn().mockResolvedValue(true)
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Usuario.findByPk.mockResolvedValue(usuario);
    Usuario.findOne.mockResolvedValue(null);

    await usuarioController.atualizarUsuario({
      params: { id: '7' },
      usuario: { id: 7 },
      body: {
        nome: 'Maria Souza',
        senha: 'NovaSenha@123',
        confirmarSenha: 'NovaSenha@123'
      }
    }, response);

    expect(usuario.update).toHaveBeenCalledWith(expect.objectContaining({
      nome: 'Maria Souza',
      senha: expect.any(String)
    }));
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      id: 7,
      nome: 'Maria',
      email: 'maria@example.com',
      cpf: '11144477735',
      role: 'cliente'
    });
  });

  test('exclui o usuário apenas quando ele é o dono da conta', async () => {
    const usuario = {
      id: 9,
      destroy: jest.fn().mockResolvedValue(true)
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Usuario.findByPk.mockResolvedValue(usuario);

    await usuarioController.excluirUsuario({
      params: { id: '9' },
      usuario: { id: 9 }
    }, response);

    expect(usuario.destroy).toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ mensagem: 'Usuário excluído com sucesso.' });
  });
});
