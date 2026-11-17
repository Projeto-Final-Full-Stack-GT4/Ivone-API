# Ivone Beauty API

API REST da loja Ivone Beauty, construída com Express, Sequelize e MySQL.

## Requisitos

- Node.js
- MySQL

## Configuração

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` e ajuste as credenciais do MySQL e o segredo JWT.
3. Crie o banco configurado em `DB_NAME` (ou execute `npx sequelize-cli db:create`).
4. Execute as migrations e carregue o catálogo demonstrativo com `npm run db:migrate`.
5. Inicie em desenvolvimento com `npm run dev`, ou em produção com `npm start`.

TLS para o MySQL fica desativado por padrão. Para um banco que exige TLS, configure `DB_SSL=true`; a validação do certificado permanece ativada. Se o provedor usar uma CA privada ou autoassinada, informe o caminho do certificado da CA em `DB_SSL_CA_FILE`. `DB_SSL_REJECT_UNAUTHORIZED=false` desativa a validação do certificado e deve ser usado apenas temporariamente e em ambientes confiáveis.

A API inicia em `http://localhost:3000` por padrão. O endpoint `GET /health` verifica a aplicação; a documentação fica em `/api-docs`.

## Endpoints iniciais

| Método | Endpoint | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Público | Cadastra uma conta |
| `POST` | `/api/v1/auth/login` | Público | Autentica e retorna um token JWT |
| `GET` | `/api/v1/auth/me` | Autenticado | Retorna os dados da conta autenticada |
| `GET` | `/api/v1/produtos` | Público | Lista produtos ativos; aceita `categoria` e `busca` |
| `GET` | `/api/v1/produtos/:id` | Público | Consulta um produto ativo |
| `POST` | `/api/v1/produtos` | Administrador | Cadastra um produto |
| `PATCH` | `/api/v1/produtos/:id` | Administrador | Atualiza um produto |
| `DELETE` | `/api/v1/produtos/:id` | Administrador | Desativa um produto |

Use `Authorization: Bearer <token>` nos endpoints autenticados. Novas contas recebem o perfil `cliente`; para promover uma conta a administradora, atualize seu campo `role` diretamente no banco.

## Modelos

- `Usuario`: nome, e-mail, CPF, senha com hash e perfil.
- `Produto`: nome, categoria, descrição, tamanho, preço, imagem, estoque e estado de publicação.
- `AvaliacaoProduto`: avaliações vinculadas a produtos, com autor, nota, data e comentário.
- `Endereco`: endereço vinculado a uma conta.
- `Pedido` e `ItemPedido`: estrutura inicial para pedidos e seus itens.

As tabelas são criadas por migrations; a aplicação não sincroniza nem apaga automaticamente o esquema do banco. O comando `npm run db:migrate` também carrega os produtos e as avaliações demonstrativas que ainda não existirem, sem sobrescrever registros já cadastrados.

## Testes

Execute `npm test`.