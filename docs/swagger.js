module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Ivone Beauty API',
    version: '1.0.0',
    description: [
      'API REST da loja Ivone Beauty.',
      'Inclui fluxos públicos, de cliente e operações restritas a administradores.'
    ].join(' ')
  },
  servers: [{ url: '/api/v1', description: 'API versionada' }],
  tags: [
    { name: 'Autenticação', description: 'Cadastro, login e sessão do usuário.' },
    { name: 'Produtos', description: 'Consulta do catálogo público.' },
    { name: 'Categorias', description: 'Consulta de categorias do catálogo.' },
    { name: 'Pedidos', description: 'Criação de pedido pelo cliente autenticado.' },
    { name: 'Conta', description: 'Consulta, atualização e exclusão da própria conta.' },
    { name: 'Administração', description: 'Operações que exigem token JWT de um administrador.' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Informe o token retornado pelo login.'
      }
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          erro: { type: 'string', example: 'Dados inválidos.' }
        },
        required: ['erro']
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 12 },
          nome: { type: 'string', example: 'Ana Silva' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          cpf: { type: 'string', pattern: '^[0-9]{11}$', example: '12345678901' },
          role: { type: 'string', enum: ['cliente', 'admin'], example: 'cliente' }
        },
        required: ['id', 'nome', 'email', 'cpf', 'role']
      },
      UsuarioEnvelope: {
        type: 'object',
        properties: {
          usuario: { $ref: '#/components/schemas/Usuario' }
        },
        required: ['usuario']
      },
      Categoria: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 3 },
          nome: { type: 'string', example: 'Skincare' },
          slug: { type: 'string', example: 'skincare' },
          descricao: { type: 'string', nullable: true, example: 'Cuidados para a pele.' },
          use_in_menu: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'nome', 'slug', 'use_in_menu']
      },
      AvaliacaoProduto: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          user: { type: 'string', example: 'Ana' },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          date: { type: 'string', format: 'date', example: '2026-01-20' },
          comment: { type: 'string', example: 'Gostei muito do produto.' }
        },
        required: ['id', 'user', 'rating', 'date', 'comment']
      },
      Produto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 7 },
          nome: { type: 'string', example: 'Sérum facial' },
          categoria: { type: 'string', example: 'skincare' },
          descricao: { type: 'string', example: 'Sérum para cuidados faciais.' },
          tamanho: { type: 'string', example: '30 ml' },
          preco: { type: 'string', example: '49.90', description: 'Preço decimal retornado pelo Sequelize.' },
          tag: { type: 'string', nullable: true, example: 'Destaque' },
          imagem: { type: 'string', nullable: true, example: 'product-images/serum_facial.png' },
          estoque: { type: 'integer', minimum: 0, example: 15 },
          ativo: { type: 'boolean', example: true },
          categorias: {
            type: 'array',
            items: { $ref: '#/components/schemas/Categoria' }
          },
          reviews: {
            type: 'array',
            description: 'Incluído na consulta por ID.',
            items: { $ref: '#/components/schemas/AvaliacaoProduto' }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'nome', 'categoria', 'descricao', 'tamanho', 'preco', 'estoque', 'ativo']
      },
      ProdutoPaginado: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 25 },
          pagina: { type: 'integer', example: 1 },
          limite: { type: 'integer', example: 10 },
          totalPaginas: { type: 'integer', example: 3 },
          produtos: {
            type: 'array',
            items: { $ref: '#/components/schemas/Produto' }
          }
        },
        required: ['total', 'pagina', 'limite', 'totalPaginas', 'produtos']
      },
      CategoriaPaginada: {
        type: 'object',
        properties: {
          pagina: { type: 'integer', example: 1 },
          limite: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 4 },
          totalPaginas: { type: 'integer', example: 1 },
          categorias: {
            type: 'array',
            items: { $ref: '#/components/schemas/Categoria' }
          }
        },
        required: ['pagina', 'limite', 'total', 'totalPaginas', 'categorias']
      },
      CadastroRequest: {
        type: 'object',
        required: ['nome', 'email', 'cpf', 'senha'],
        properties: {
          nome: { type: 'string', minLength: 1, example: 'Ana Silva' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          cpf: {
            type: 'string',
            example: '123.456.789-01',
            description: 'A API remove caracteres não numéricos e exige 11 dígitos.'
          },
          senha: { type: 'string', minLength: 8, format: 'password', example: 'Senha123' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          senha: { type: 'string', format: 'password', example: 'Senha123' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT; validade padrão de uma hora.' },
          usuario: { $ref: '#/components/schemas/Usuario' }
        },
        required: ['token', 'usuario']
      },
      AtualizacaoContaRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          nome: { type: 'string', example: 'Ana Silva' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          cpf: { type: 'string', pattern: '^[0-9]{11}$', example: '12345678901' },
          senha: { type: 'string', format: 'password', description: 'Se informada, também é necessário informar confirmarSenha.' },
          confirmarSenha: { type: 'string', format: 'password' }
        }
      },
      ItemPedidoRequest: {
        type: 'object',
        required: ['produtoId', 'quantidade'],
        properties: {
          produtoId: { type: 'integer', minimum: 1, example: 7 },
          quantidade: { type: 'integer', minimum: 1, example: 2 }
        }
      },
      CriarPedidoRequest: {
        type: 'object',
        required: ['itens'],
        properties: {
          itens: {
            type: 'array',
            minItems: 1,
            items: { $ref: '#/components/schemas/ItemPedidoRequest' }
          }
        }
      },
      ItemPedidoCriado: {
        type: 'object',
        properties: {
          produtoId: { type: 'integer', example: 7 },
          quantidade: { type: 'integer', example: 2 },
          precoUnitario: { type: 'string', example: '49.90' }
        },
        required: ['produtoId', 'quantidade', 'precoUnitario']
      },
      PedidoCriado: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 42 },
          status: { type: 'string', enum: ['pendente'], example: 'pendente' },
          total: { type: 'string', example: '99.80' },
          itens: {
            type: 'array',
            items: { $ref: '#/components/schemas/ItemPedidoCriado' }
          }
        },
        required: ['id', 'status', 'total', 'itens']
      },
      PedidoEnvelope: {
        type: 'object',
        properties: {
          pedido: { $ref: '#/components/schemas/PedidoCriado' }
        },
        required: ['pedido']
      },
      ClienteResumo: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 12 },
          nome: { type: 'string', example: 'Ana Silva' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          role: { type: 'string', enum: ['cliente', 'admin'], example: 'cliente' }
        },
        required: ['id', 'nome', 'email', 'role']
      },
      CriarClienteAdminRequest: {
        type: 'object',
        required: ['nome', 'email', 'cpf', 'senha', 'confirmarSenha'],
        properties: {
          nome: { type: 'string', example: 'Ana Silva' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          cpf: { type: 'string', pattern: '^[0-9]{11}$', example: '12345678901' },
          senha: { type: 'string', format: 'password', example: 'Senha123' },
          confirmarSenha: { type: 'string', format: 'password', example: 'Senha123' }
        }
      },
      ProdutoAdminLista: {
        type: 'object',
        properties: {
          produtos: {
            type: 'array',
            description: 'Inclui produtos ativos e inativos.',
            items: { $ref: '#/components/schemas/Produto' }
          }
        },
        required: ['produtos']
      },
      CriarProdutoAdminRequest: {
        type: 'object',
        required: ['nome', 'descricao', 'tamanho', 'preco'],
        properties: {
          nome: { type: 'string', example: 'Sérum facial' },
          categoriaId: { type: 'integer', minimum: 1, example: 3 },
          categoria: { type: 'string', example: 'skincare', description: 'Campo legado; prefira categoriaId.' },
          descricao: { type: 'string' },
          tamanho: { type: 'string', example: '30 ml' },
          preco: { type: 'number', minimum: 0, example: 49.9 },
          tag: { type: 'string', nullable: true },
          imagem: { type: 'string', nullable: true },
          estoque: { type: 'integer', minimum: 0, default: 0 }
        },
        allOf: [
          {
            anyOf: [
              { required: ['categoriaId'] },
              { required: ['categoria'] }
            ]
          }
        ]
      },
      AtualizarProdutoAdminRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          nome: { type: 'string' },
          categoriaId: { type: 'integer', minimum: 1 },
          categoria: { type: 'string', description: 'Campo legado; prefira categoriaId.' },
          descricao: { type: 'string' },
          tamanho: { type: 'string' },
          preco: { type: 'number', minimum: 0 },
          tag: { type: 'string', nullable: true },
          imagem: { type: 'string', nullable: true },
          estoque: { type: 'integer', minimum: 0 },
          ativo: { type: 'boolean' }
        }
      },
      CriarCategoriaAdminRequest: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: { type: 'string', minLength: 1, example: 'Skincare' },
          descricao: { type: 'string', nullable: true },
          use_in_menu: { type: 'boolean', default: true }
        }
      },
      AtualizarCategoriaAdminRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          nome: { type: 'string', minLength: 1 },
          descricao: { type: 'string', nullable: true },
          use_in_menu: { type: 'boolean' }
        }
      },
      ItemPedidoAdmin: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          pedidoId: { type: 'integer' },
          produtoId: { type: 'integer' },
          quantidade: { type: 'integer', minimum: 1 },
          precoUnitario: { type: 'string', example: '49.90' },
          produto: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              nome: { type: 'string' }
            }
          }
        }
      },
      UsuarioPedido: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nome: { type: 'string' },
          email: { type: 'string', format: 'email' }
        },
        required: ['id', 'nome', 'email']
      },
      PedidoAdmin: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 42 },
          usuarioId: { type: 'integer' },
          enderecoId: { type: 'integer', nullable: true },
          status: { type: 'string', enum: ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'] },
          total: { type: 'string', example: '99.80' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          usuario: { $ref: '#/components/schemas/UsuarioPedido' },
          itens: {
            type: 'array',
            items: { $ref: '#/components/schemas/ItemPedidoAdmin' }
          }
        }
      },
      PedidoAdminLista: {
        type: 'object',
        properties: {
          pedidos: {
            type: 'array',
            items: { $ref: '#/components/schemas/PedidoAdmin' }
          }
        },
        required: ['pedidos']
      },
      AtualizarStatusPedidoRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'],
            example: 'pago',
            description: 'Transições aceitas: pendente para pago/cancelado; pago para enviado/cancelado; enviado para entregue.'
          }
        }
      },
      PedidoStatusEnvelope: {
        type: 'object',
        properties: {
          pedido: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 42 },
              status: { type: 'string', enum: ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'] }
            },
            required: ['id', 'status']
          }
        },
        required: ['pedido']
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cria uma conta de cliente',
        description: 'Cria a conta com papel cliente. A senha é armazenada como hash. O cadastro não inicia uma sessão nem retorna token.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CadastroRequest' } }
          }
        },
        responses: {
          201: {
            description: 'Conta criada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UsuarioEnvelope' } } }
          },
          400: {
            description: 'Campos inválidos ou senha menor que 8 caracteres.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          409: {
            description: 'E-mail ou CPF já cadastrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autentica uma conta',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } }
          }
        },
        responses: {
          200: {
            description: 'Token JWT e dados da conta.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } }
          },
          400: {
            description: 'E-mail e senha não informados.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Credenciais inválidas.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Autenticação'],
        summary: 'Retorna os dados da conta autenticada',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dados do usuário autenticado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UsuarioEnvelope' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Usuário do token não encontrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/produtos': {
      get: {
        tags: ['Produtos'],
        summary: 'Lista produtos ativos',
        description: 'A busca textual procura por nome ou descrição. categoriaId filtra pela relação com a categoria; categoria aceita o valor textual legado. O limite máximo é 100.',
        parameters: [
          { in: 'query', name: 'page', description: 'Página (padrão 1).', schema: { type: 'integer', minimum: 1, default: 1 } },
          { in: 'query', name: 'limit', description: 'Itens por página (padrão 10, máximo 100).', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { in: 'query', name: 'categoria', description: 'Filtro textual legado de categoria.', schema: { type: 'string' } },
          { in: 'query', name: 'categoriaId', description: 'Identificador da categoria.', schema: { type: 'integer', minimum: 1 } },
          { in: 'query', name: 'busca', description: 'Busca por nome ou descrição.', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Página de produtos ativos.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ProdutoPaginado' } } }
          },
          400: {
            description: 'Identificador de categoria inválido.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      post: {
        tags: ['Administração'],
        summary: 'Cadastra um produto',
        description: 'Exige token de administrador. Informe categoriaId (preferido) ou categoria (campo legado); o produto é associado à categoria.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CriarProdutoAdminRequest' } }
          }
        },
        responses: {
          201: {
            description: 'Produto criado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Produto' } } }
          },
          400: {
            description: 'Campos, preço, estoque ou categoria inválidos.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Categoria não encontrada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/produtos/admin': {
      get: {
        tags: ['Administração'],
        summary: 'Lista produtos ativos e inativos',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Produtos para gerenciamento.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ProdutoAdminLista' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/produtos/{id}': {
      get: {
        tags: ['Produtos'],
        summary: 'Consulta produto ativo por identificador',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        responses: {
          200: {
            description: 'Produto, categorias e avaliações.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Produto' } } }
          },
          400: {
            description: 'Identificador inválido.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Produto não encontrado ou inativo.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      patch: {
        tags: ['Administração'],
        summary: 'Atualiza dados, estoque ou situação de um produto',
        description: 'Exige token de administrador. Para reativar um produto, envie ativo: true.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AtualizarProdutoAdminRequest' } }
          }
        },
        responses: {
          200: {
            description: 'Produto atualizado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Produto' } } }
          },
          400: {
            description: 'Dados inválidos ou nenhum campo reconhecido informado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Produto ou categoria não encontrada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      delete: {
        tags: ['Administração'],
        summary: 'Desativa um produto',
        description: 'Exige token de administrador. A exclusão é lógica: o registro permanece no banco com ativo: false.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        responses: {
          204: { description: 'Produto desativado; sem corpo de resposta.' },
          400: {
            description: 'Identificador inválido.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Produto não encontrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/categorias': {
      get: {
        tags: ['Categorias'],
        summary: 'Lista categorias',
        parameters: [
          { in: 'query', name: 'pagina', schema: { type: 'integer', minimum: 1, default: 1 } },
          { in: 'query', name: 'limite', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { in: 'query', name: 'nome', description: 'Filtro parcial por nome.', schema: { type: 'string' } },
          { in: 'query', name: 'descricao', description: 'Filtro parcial por descrição.', schema: { type: 'string' } },
          { in: 'query', name: 'use_in_menu', description: 'Filtra pela visibilidade no menu.', schema: { type: 'boolean' } }
        ],
        responses: {
          200: {
            description: 'Lista paginada de categorias.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoriaPaginada' } } }
          },
          400: {
            description: 'Filtro inválido.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      post: {
        tags: ['Administração'],
        summary: 'Cria uma categoria',
        description: 'Exige token de administrador. O slug é gerado pela API a partir do nome.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CriarCategoriaAdminRequest' } }
          }
        },
        responses: {
          201: {
            description: 'Categoria criada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Categoria' } } }
          },
          400: {
            description: 'Nome ou outros campos inválidos.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          409: {
            description: 'Já existe categoria com o mesmo nome ou slug.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/categorias/{id}': {
      get: {
        tags: ['Categorias'],
        summary: 'Consulta categoria por identificador',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        responses: {
          200: {
            description: 'Categoria encontrada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Categoria' } } }
          },
          400: {
            description: 'Identificador inválido.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Categoria não encontrada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      put: {
        tags: ['Administração'],
        summary: 'Atualiza uma categoria',
        description: 'Exige token de administrador. Mesmo usando PUT, a API atualiza somente os campos informados; o slug existente não é alterado.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AtualizarCategoriaAdminRequest' } }
          }
        },
        responses: {
          200: {
            description: 'Categoria atualizada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Categoria' } } }
          },
          400: {
            description: 'Identificador ou campos inválidos, ou nenhum campo informado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Categoria não encontrada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          409: {
            description: 'Nome ou slug já cadastrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      patch: {
        tags: ['Administração'],
        summary: 'Atualiza parcialmente uma categoria',
        description: 'Exige token de administrador. Aceita nome, descrição e/ou use_in_menu.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AtualizarCategoriaAdminRequest' } }
          }
        },
        responses: {
          200: {
            description: 'Categoria atualizada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Categoria' } } }
          },
          400: {
            description: 'Identificador ou campos inválidos, ou nenhum campo informado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Categoria não encontrada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          409: {
            description: 'Nome ou slug já cadastrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      delete: {
        tags: ['Administração'],
        summary: 'Exclui uma categoria',
        description: 'Exige token de administrador. Categorias associadas a produtos não podem ser excluídas.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        responses: {
          204: { description: 'Categoria excluída; sem corpo de resposta.' },
          400: {
            description: 'Identificador inválido.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Categoria não encontrada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          409: {
            description: 'Categoria possui produtos associados.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/pedidos': {
      get: {
        tags: ['Administração'],
        summary: 'Lista todos os pedidos',
        description: 'Exige token de administrador. Retorna pedidos do mais recente ao mais antigo, com cliente e itens.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Pedidos com dados básicos do cliente e dos produtos.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PedidoAdminLista' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      post: {
        tags: ['Pedidos'],
        summary: 'Cria um pedido pendente',
        description: 'Exige autenticação. O total e os preços unitários são calculados pela API usando os preços atuais do catálogo. A criação do pedido, dos itens e a baixa do estoque ocorrem em uma transação. Itens repetidos do mesmo produto são somados.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CriarPedidoRequest' } }
          }
        },
        responses: {
          201: {
            description: 'Pedido criado com status pendente.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PedidoEnvelope' } } }
          },
          400: {
            description: 'Lista de itens ou quantidade inválida.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Um ou mais produtos não estão disponíveis.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          409: {
            description: 'Estoque insuficiente ou total acima do limite.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/pedidos/{id}/status': {
      patch: {
        tags: ['Administração'],
        summary: 'Atualiza o status de um pedido',
        description: 'Exige token de administrador. Ao cancelar um pedido, a API restaura o estoque dos itens em uma transação. Reenviar o status atual não altera o pedido.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AtualizarStatusPedidoRequest' } }
          }
        },
        responses: {
          200: {
            description: 'Status atualizado ou mantido se já era o status informado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PedidoStatusEnvelope' } } }
          },
          400: {
            description: 'Identificador ou status inválido.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Pedido não encontrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          409: {
            description: 'Transição de status não permitida.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/usuarios': {
      get: {
        tags: ['Administração'],
        summary: 'Lista os clientes',
        description: 'Exige token de administrador. Retorna clientes com ID, nome, e-mail e papel; CPF e senha não são incluídos.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de clientes.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ClienteResumo' }
                }
              }
            }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      post: {
        tags: ['Administração'],
        summary: 'Cadastra um cliente',
        description: 'Exige token de administrador. A senha e sua confirmação devem coincidir; o novo usuário recebe o papel cliente.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CriarClienteAdminRequest' } }
          }
        },
        responses: {
          201: {
            description: 'Cliente criado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } }
          },
          400: {
            description: 'Campos obrigatórios ausentes, e-mail inválido ou senhas diferentes.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Acesso restrito a administradores.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          409: {
            description: 'E-mail ou CPF já cadastrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/usuarios/{id}': {
      get: {
        tags: ['Conta', 'Administração'],
        summary: 'Consulta uma conta',
        description: 'Usuários autenticados podem consultar a própria conta (incluindo CPF). Administradores também podem consultar outras contas, caso em que a resposta não inclui CPF.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        responses: {
          200: {
            description: 'Dados da conta; dados pessoais completos para o próprio usuário e dados mínimos para consulta administrativa de outro usuário.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/Usuario' },
                    { $ref: '#/components/schemas/ClienteResumo' }
                  ]
                }
              }
            }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'Usuário sem papel de administrador tentando consultar outra conta.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Usuário não encontrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      put: {
        tags: ['Conta'],
        summary: 'Atualiza a própria conta',
        description: 'Aceita um ou mais campos. Se senha for enviada, confirmarSenha também é obrigatório e deve corresponder.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AtualizacaoContaRequest' } }
          }
        },
        responses: {
          200: {
            description: 'Conta atualizada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } }
          },
          400: {
            description: 'Nenhum campo válido, e-mail ou CPF inválido, ou senhas não correspondentes.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'O ID não corresponde à conta autenticada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Usuário não encontrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          409: {
            description: 'E-mail ou CPF já cadastrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      },
      delete: {
        tags: ['Conta'],
        summary: 'Exclui a própria conta',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }
        ],
        responses: {
          200: {
            description: 'Conta excluída.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { mensagem: { type: 'string', example: 'Usuário excluído com sucesso.' } },
                  required: ['mensagem']
                }
              }
            }
          },
          401: {
            description: 'Token ausente, inválido ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          403: {
            description: 'O ID não corresponde à conta autenticada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          404: {
            description: 'Usuário não encontrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    }
  }
};
