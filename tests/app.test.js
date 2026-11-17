const http = require('http');
const jwt = require('jsonwebtoken');
const { app } = require('../app');

function requestJson(server, method, route, headers = {}) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const request = http.request({ hostname: '127.0.0.1', port, path: route, method, headers }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(body) }));
    });
    request.on('error', reject);
    request.end();
  });
}

describe('health endpoint', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test('returns the API status', async () => {
    await expect(requestJson(server, 'GET', '/health')).resolves.toEqual({
      status: 200,
      body: { status: 'ok' }
    });
  });

  test('protects product management routes', async () => {
    await expect(requestJson(server, 'POST', '/api/v1/produtos')).resolves.toEqual({
      status: 401,
      body: { erro: 'Token de autenticação não fornecido.' }
    });
  });

  test('protects order creation with authentication', async () => {
    await expect(requestJson(server, 'POST', '/api/v1/pedidos')).resolves.toEqual({
      status: 401,
      body: { erro: 'Token de autenticação não fornecido.' }
    });
  });

  test('denies admin routes to authenticated customers', async () => {
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-only-secret';
    const token = jwt.sign({ id: 1, role: 'cliente' }, process.env.JWT_SECRET);
    const authorization = { Authorization: `Bearer ${token}` };

    try {
      await expect(requestJson(server, 'GET', '/api/v1/produtos/admin', authorization)).resolves.toMatchObject({
        status: 403,
        body: { erro: 'Você não tem permissão para acessar esse recurso.' }
      });
      await expect(requestJson(server, 'GET', '/api/v1/pedidos', authorization)).resolves.toMatchObject({
        status: 403
      });
      await expect(requestJson(server, 'POST', '/api/v1/usuarios', authorization)).resolves.toMatchObject({
        status: 403
      });
      await expect(requestJson(server, 'GET', '/api/v1/usuarios', authorization)).resolves.toMatchObject({
        status: 403
      });
      await expect(requestJson(server, 'GET', '/api/v1/usuarios/2', authorization)).resolves.toMatchObject({
        status: 403,
        body: { erro: 'Você não tem permissão para consultar este usuário.' }
      });
      await expect(requestJson(server, 'PUT', '/api/v1/usuarios/2', authorization)).resolves.toMatchObject({
        status: 403
      });
      await expect(requestJson(server, 'DELETE', '/api/v1/usuarios/2', authorization)).resolves.toMatchObject({
        status: 403
      });
    } finally {
      if (previousSecret === undefined) {
        delete process.env.JWT_SECRET;
      } else {
        process.env.JWT_SECRET = previousSecret;
      }
    }
  });

  test('serves product images from the API', async () => {
    const { port } = server.address();
    const response = await new Promise((resolve, reject) => {
      const request = http.get({
        hostname: '127.0.0.1',
        port,
        path: '/api/v1/product-images/serum_facial.png'
      }, (result) => {
        result.resume();
        result.on('end', () => resolve({
          status: result.statusCode,
          contentType: result.headers['content-type']
        }));
      });
      request.on('error', reject);
    });

    expect(response).toEqual({
      status: 200,
      contentType: 'image/png'
    });
  });
});
