# Ivone Beauty API

API REST da loja Ivone Beauty, construída com Express, Sequelize e MySQL.

## Requisitos

- Node.js
- MySQL

## Configuração

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` e ajuste as credenciais do MySQL. O segredo JWT de exemplo serve apenas para a demonstração local.
3. Crie o banco configurado em `DB_NAME` (ou execute `npx sequelize-cli db:create`).
4. Execute as migrations e carregue o catálogo demonstrativo com `npm run db:migrate`.
5. Inicie em desenvolvimento com `npm run dev`, ou em produção com `npm start`.

Para a demonstração local, mantenha a API na porta `3000` e o frontend Vite na porta `5173`, conforme o `CORS_ORIGIN` do arquivo de exemplo. Se o Vite escolher outra porta, atualize `CORS_ORIGIN` e reinicie a API.

TLS para o MySQL fica desativado por padrão. Para um banco que exige TLS, configure `DB_SSL=true`; a validação do certificado permanece ativada. Se o provedor usar uma CA privada ou autoassinada, informe o caminho do certificado da CA em `DB_SSL_CA_FILE`. `DB_SSL_REJECT_UNAUTHORIZED=false` desativa a validação do certificado e deve ser usado apenas temporariamente e em ambientes confiáveis.

A API inicia em `http://localhost:3000` por padrão. O endpoint `GET /health` verifica a aplicação; a documentação fica em `/api-docs`.

## Endpoints iniciais

| Método | Endpoint | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Público | Cadastra uma conta |
| `POST` | `/api/v1/auth/login` | Público | Autentica e retorna um token JWT |
| `GET` | `/api/v1/auth/me` | Autenticado | Retorna os dados da conta autenticada |
| `GET` | `/api/v1/produtos` | Público | Lista produtos ativos; aceita `categoria`, `busca`, `page` e `limit`; retorna paginação e `produtos` |
| `GET` | `/api/v1/produtos/admin` | Administrador | Lista todos os produtos, inclusive inativos |
| `GET` | `/api/v1/produtos/:id` | Público | Consulta um produto ativo |
| `GET` | `/api/v1/product-images/:arquivo` | Público | Serve as imagens do catálogo |
| `POST` | `/api/v1/pedidos` | Autenticado | Cria um pedido pendente; recebe `{ "itens": [{ "produtoId": 1, "quantidade": 2 }] }`, valida estoque e calcula o total pela API |
| `GET` | `/api/v1/pedidos` | Administrador | Lista pedidos com cliente e itens |
| `PATCH` | `/api/v1/pedidos/:id/status` | Administrador | Avança o status do pedido; cancelar devolve os itens ao estoque |
| `GET` | `/api/v1/usuarios` | Administrador | Lista somente ID, nome, e-mail e perfil dos clientes |
| `GET` | `/api/v1/usuarios/:id` | Próprio usuário ou administrador | Consulta dados da conta; administradores recebem apenas dados de contato |
| `POST` | `/api/v1/produtos` | Administrador | Cadastra um produto |
| `PATCH` | `/api/v1/produtos/:id` | Administrador | Atualiza um produto |
| `DELETE` | `/api/v1/produtos/:id` | Administrador | Desativa um produto |

Use `Authorization: Bearer <token>` nos endpoints autenticados. Novas contas recebem o perfil `cliente`; para promover uma conta a administradora, atualize seu campo `role` diretamente no banco.

Administradores também podem cadastrar usuários por `POST /api/v1/usuarios`; esse endpoint cria contas de cliente e não aceita alteração de perfil. A edição e exclusão de usuários por `PUT` e `DELETE /api/v1/usuarios/:id` são restritas ao próprio usuário.

O catálogo demonstrativo começa com 20 unidades por produto. A criação do pedido reserva o estoque e registra o preço unitário vigente; o pedido permanece pendente e não inclui pagamento nem frete.

## Modelos

- `Usuario`: nome, e-mail, CPF, senha com hash e perfil.
- `Produto`: nome, categoria, descrição, tamanho, preço, imagem, estoque e estado de publicação.
- `AvaliacaoProduto`: avaliações vinculadas a produtos, com autor, nota, data e comentário.
- `Endereco`: endereço vinculado a uma conta.
- `Pedido` e `ItemPedido`: estrutura inicial para pedidos e seus itens.

As tabelas são criadas por migrations; a aplicação não sincroniza nem apaga automaticamente o esquema do banco. O comando `npm run db:migrate` também carrega os produtos e as avaliações demonstrativas que ainda não existirem, sem sobrescrever registros já cadastrados. As imagens do catálogo ficam em `public/product-images`; um seeder atualiza apenas os caminhos demonstrativos legados dos produtos correspondentes.

## Testes

Execute `npm test`.