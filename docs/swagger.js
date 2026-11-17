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
          { in: 'query', name: 'categoriaId', schema: { type: 'integer', minimum: 1 } },
          { in: 'query', name: 'busca', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Lista de produtos' } }
      },
      post: {
        summary: 'Cadastra um produto',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'categoriaId', 'descricao', 'tamanho', 'preco'],
                properties: {
                  nome: { type: 'string' },
                  categoriaId: { type: 'integer', minimum: 1 },
                  descricao: { type: 'string' },
                  tamanho: { type: 'string' },
                  preco: { type: 'number', minimum: 0 },
                  estoque: { type: 'integer', minimum: 0 },
                  imagem: { type: 'string', nullable: true },
                  tag: { type: 'string', nullable: true }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Produto criado' },
          403: { description: 'Apenas administradores' }
        }
      }
    },
    '/produtos/admin': {
      get: {
        summary: 'Lista todos os produtos para administração',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de produtos ativos e inativos' },
          403: { description: 'Apenas administradores' }
        }
      }
    },
    '/produtos/{id}': {
      get: {
        summary: 'Consulta produto por identificador',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Produto encontrado' }, 404: { description: 'Produto não encontrado' } }
      },
      patch: {
        summary: 'Atualiza dados ou estoque de um produto',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  categoriaId: { type: 'integer', minimum: 1 },
                  nome: { type: 'string' },
                  descricao: { type: 'string' },
                  tamanho: { type: 'string' },
                  preco: { type: 'number', minimum: 0 },
                  estoque: { type: 'integer', minimum: 0 },
                  ativo: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Produto atualizado' },
          403: { description: 'Apenas administradores' }
        }
      },
      delete: {
        summary: 'Desativa um produto',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          204: { description: 'Produto desativado' },
          403: { description: 'Apenas administradores' }
        }
      }
    },
    '/pedidos': {
      get: {
        summary: 'Lista pedidos para administração',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Pedidos com cliente e itens' },
          403: { description: 'Apenas administradores' }
        }
      },
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
    },
    '/pedidos/{id}/status': {
      patch: {
        summary: 'Atualiza o status do pedido',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['pago', 'enviado', 'entregue', 'cancelado'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Status atualizado' },
          403: { description: 'Apenas administradores' },
          409: { description: 'Transição de status não permitida' }
        }
      }
    },
    '/usuarios': {
      get: {
        summary: 'Lista dados mínimos dos clientes',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de clientes' },
          403: { description: 'Apenas administradores' }
        }
      },
      post: {
        summary: 'Cadastra uma conta de cliente',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Cliente criado' },
          403: { description: 'Apenas administradores' }
        }
      }
    },
    '/usuarios/{id}': {
      get: {
        summary: 'Consulta a própria conta ou dados mínimos de outro cliente',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Dados da conta' },
          403: { description: 'Sem permissão para consultar esta conta' }
        }
      },
      put: {
        summary: 'Atualiza a própria conta',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Conta atualizada' },
          403: { description: 'Apenas o próprio usuário' }
        }
      },
      delete: {
        summary: 'Exclui a própria conta',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Conta excluída' },
          403: { description: 'Apenas o próprio usuário' }
        }
      }
    },
    '/categorias': {
      get: {
        summary: 'Lista categorias com identificador, slug, paginação e filtros',
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer', minimum: 1 } },
          { in: 'query', name: 'limite', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          { in: 'query', name: 'nome', schema: { type: 'string' } },
          { in: 'query', name: 'descricao', schema: { type: 'string' } },
          { in: 'query', name: 'use_in_menu', schema: { type: 'boolean' } }
        ],
        responses: {
          200: {
            description: 'Lista paginada de categorias com slug estável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    categorias: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          nome: { type: 'string' },
                          slug: { type: 'string' },
                          descricao: { type: 'string', nullable: true },
                          use_in_menu: { type: 'boolean' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
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
        summary: 'Atualiza nome e descrição sem alterar o slug estável',
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
