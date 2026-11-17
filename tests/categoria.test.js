const http = require('http');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

jest.mock('../models', () => ({
  Categoria: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

const { Categoria } = require('../models');
const { app } = require('../app');

process.env.JWT_SECRET = 'test-secret';

function requestJson(server, method, route, { token, body } = {}) {
  const { port } = server.address();
  const payload = body === undefined ? undefined : JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: '127.0.0.1',
      port,
      path: route,
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Type': 'application/json' } : {})
      }
    }, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { responseBody += chunk; });
      response.on('end', () => resolve({
        status: response.statusCode,
        body: responseBody ? JSON.parse(responseBody) : undefined
      }));
    });

    request.on('error', reject);
    if (payload) {
      request.write(payload);
    }
    request.end();
  });
}

function tokenFor(role) {
  return jwt.sign({ id: 1, role }, process.env.JWT_SECRET);
}

describe('category endpoints', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('lists categories with pagination and field filters', async () => {
    Categoria.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [{ id: 1, nome: 'Rosto' }]
    });

    const response = await requestJson(
      server,
      'GET',
      '/api/v1/categorias?pagina=2&limite=5&nome=ros&descricao=hidra&use_in_menu=false'
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      pagina: 2,
      limite: 5,
      total: 1,
      categorias: [{ id: 1, nome: 'Rosto' }]
    });

    const options = Categoria.findAndCountAll.mock.calls[0][0];
    expect(options.where.nome[Op.like]).toBe('%ros%');
    expect(options.where.descricao[Op.like]).toBe('%hidra%');
    expect(options.where.use_in_menu).toBe(false);
    expect(options.offset).toBe(5);
  });

  test('rejects invalid use_in_menu filters', async () => {
    const response = await requestJson(
      server,
      'GET',
      '/api/v1/categorias?use_in_menu=sim'
    );

    expect(response.status).toBe(400);
    expect(Categoria.findAndCountAll).not.toHaveBeenCalled();
  });

  test('finds a category by ID', async () => {
    Categoria.findByPk.mockResolvedValue({ id: 7, nome: 'Cabelo' });

    const response = await requestJson(server, 'GET', '/api/v1/categorias/7');

    expect(response).toEqual({
      status: 200,
      body: { id: 7, nome: 'Cabelo' }
    });
  });

  test('creates categories only for admins and defaults use_in_menu to true', async () => {
    const body = { nome: 'Unhas' };
    Categoria.create.mockResolvedValue({
      id: 8,
      nome: 'Unhas',
      use_in_menu: true
    });

    const unauthorized = await requestJson(
      server,
      'POST',
      '/api/v1/categorias',
      { body }
    );
    expect(unauthorized.status).toBe(401);

    const response = await requestJson(server, 'POST', '/api/v1/categorias', {
      token: tokenFor('admin'),
      body
    });

    expect(response.status).toBe(201);
    expect(Categoria.create).toHaveBeenCalledWith({
      nome: 'Unhas',
      descricao: null,
      use_in_menu: true
    });
  });

  test('requires a category name when creating', async () => {
    const response = await requestJson(server, 'POST', '/api/v1/categorias', {
      token: tokenFor('admin'),
      body: { descricao: 'Sem nome' }
    });

    expect(response.status).toBe(400);
    expect(Categoria.create).not.toHaveBeenCalled();
  });

  test('updates categories through PUT', async () => {
    const categoria = {
      id: 9,
      update: jest.fn(async function update(values) {
        Object.assign(this, values);
      })
    };
    Categoria.findByPk.mockResolvedValue(categoria);

    const response = await requestJson(server, 'PUT', '/api/v1/categorias/9', {
      token: tokenFor('admin'),
      body: { use_in_menu: false }
    });

    expect(response.status).toBe(200);
    expect(categoria.update).toHaveBeenCalledWith({ use_in_menu: false });
  });

  test('deletes categories and returns 204', async () => {
    const categoria = {
      countProdutos: jest.fn().mockResolvedValue(0),
      destroy: jest.fn().mockResolvedValue()
    };
    Categoria.findByPk.mockResolvedValue(categoria);

    const response = await requestJson(server, 'DELETE', '/api/v1/categorias/10', {
      token: tokenFor('admin')
    });

    expect(response.status).toBe(204);
    expect(categoria.destroy).toHaveBeenCalled();
  });
});
