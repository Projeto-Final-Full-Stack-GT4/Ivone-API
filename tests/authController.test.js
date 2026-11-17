jest.mock('../models', () => ({
  Usuario: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  }
}));

const bcrypt = require('bcrypt');
const { Usuario } = require('../models');
const authController = require('../controllers/authController');

describe('autenticação da API', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  test('registra um novo usuário com CPF normalizado e senha criptografada', async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Usuario.create.mockResolvedValue({
      id: 12,
      nome: 'Teste',
      email: 'teste@email.com',
      cpf: '12345678901',
      role: 'cliente'
    });

    await authController.register({
      body: {
        nome: ' Teste ',
        email: 'TESTE@EMAIL.com',
        cpf: '123.456.789-01',
        senha: 'Senha@123'
      }
    }, response);

    expect(Usuario.create).toHaveBeenCalledWith(expect.objectContaining({
      nome: 'Teste',
      email: 'teste@email.com',
      cpf: '12345678901',
      senha: expect.any(String)
    }));
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      usuario: {
        id: 12,
        nome: 'Teste',
        email: 'teste@email.com',
        cpf: '12345678901',
        role: 'cliente'
      }
    });
  });

  test('faz login e retorna token ao validar credenciais', async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const senhaHash = await bcrypt.hash('Senha@123', 12);
    Usuario.findOne.mockResolvedValue({
      id: 5,
      nome: 'Marina',
      email: 'marina@email.com',
      cpf: '11144477735',
      role: 'cliente',
      senha: senhaHash
    });

    await authController.login({
      body: {
        email: 'MARINA@EMAIL.com',
        senha: 'Senha@123'
      }
    }, response);

    expect(Usuario.findOne).toHaveBeenCalledWith({
      where: { email: 'marina@email.com' }
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      usuario: {
        id: 5,
        nome: 'Marina',
        email: 'marina@email.com',
        cpf: '11144477735',
        role: 'cliente'
      }
    }));
    expect(typeof response.json.mock.calls[0][0].token).toBe('string');
  });

  test('retorna o perfil do usuário autenticado', async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Usuario.findByPk.mockResolvedValue({
      id: 9,
      nome: 'Rosa',
      email: 'rosa@email.com',
      cpf: '98765432100',
      role: 'cliente'
    });

    await authController.me({ usuario: { id: 9 } }, response);

    expect(Usuario.findByPk).toHaveBeenCalledWith(9);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      usuario: {
        id: 9,
        nome: 'Rosa',
        email: 'rosa@email.com',
        cpf: '98765432100',
        role: 'cliente'
      }
    });
  });
});
