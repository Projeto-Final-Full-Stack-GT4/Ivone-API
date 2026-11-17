module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Ivone Beauty API',
    version: '1.0.0',
    description: 'API REST para catálogo e contas da loja Ivone Beauty.'
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Cria uma conta de cliente',
        responses: { 201: { description: 'Conta criada' }, 400: { description: 'Dados inválidos' } }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Autentica uma conta',
        responses: { 200: { description: 'Token JWT e dados da conta' }, 401: { description: 'Credenciais inválidas' } }
      }
    },
    '/produtos': {
      get: {
        summary: 'Lista produtos ativos',
        parameters: [
          { in: 'query', name: 'categoria', schema: { type: 'string' } },
          { in: 'query', name: 'busca', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Lista de produtos' } }
      }
    },
    '/produtos/{id}': {
      get: {
        summary: 'Consulta produto por identificador',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Produto encontrado' }, 404: { description: 'Produto não encontrado' } }
      }
    },
    '/pedidos': {
      post: {
        summary: 'Cria um pedido pendente e reserva o estoque',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['itens'],
                properties: {
                  itens: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['produtoId', 'quantidade'],
                      properties: {
                        produtoId: { type: 'integer', minimum: 1 },
                        quantidade: { type: 'integer', minimum: 1 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Pedido criado' },
          401: { description: 'Autenticação necessária' },
          404: { description: 'Produto indisponível' },
          409: { description: 'Estoque insuficiente' }
        }
      }
    }
  }
};
