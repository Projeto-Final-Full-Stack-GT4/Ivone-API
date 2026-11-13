const http = require('http');
const { app } = require('../app');

function requestJson(server, method, route) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const request = http.request({ hostname: '127.0.0.1', port, path: route, method }, (response) => {
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
});
