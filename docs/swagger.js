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
    '/categorias': {
      get: {
        summary: 'Lista categorias com paginação e filtros',
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer', minimum: 1 } },
          { in: 'query', name: 'limite', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          { in: 'query', name: 'nome', schema: { type: 'string' } },
          { in: 'query', name: 'descricao', schema: { type: 'string' } },
          { in: 'query', name: 'use_in_menu', schema: { type: 'boolean' } }
        ],
        responses: { 200: { description: 'Lista paginada de categorias' } }
      },
      post: {
        summary: 'Cadastra categoria',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome'],
                properties: {
                  nome: { type: 'string' },
                  descricao: { type: 'string', nullable: true },
                  use_in_menu: { type: 'boolean', default: true }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Categoria criada' },
          400: { description: 'Dados inválidos' },
          401: { description: 'Autenticação necessária' },
          403: { description: 'Acesso restrito a administradores' }
        }
      }
    },
    '/categorias/{id}': {
      get: {
        summary: 'Consulta categoria por identificador',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Categoria encontrada' },
          404: { description: 'Categoria não encontrada' }
        }
      },
      put: {
        summary: 'Atualiza categoria',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  descricao: { type: 'string', nullable: true },
                  use_in_menu: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Categoria atualizada' },
          400: { description: 'Dados inválidos' },
          401: { description: 'Autenticação necessária' },
          403: { description: 'Acesso restrito a administradores' },
          404: { description: 'Categoria não encontrada' }
        }
      },
      patch: {
        summary: 'Atualiza parcialmente uma categoria',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Categoria atualizada' },
          401: { description: 'Autenticação necessária' },
          403: { description: 'Acesso restrito a administradores' },
          404: { description: 'Categoria não encontrada' }
        }
      },
      delete: {
        summary: 'Exclui categoria sem produtos associados',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          204: { description: 'Categoria excluída' },
          401: { description: 'Autenticação necessária' },
          403: { description: 'Acesso restrito a administradores' },
          404: { description: 'Categoria não encontrada' },
          409: { description: 'Categoria possui produtos associados' }
        }
      }
    }
  }
};
