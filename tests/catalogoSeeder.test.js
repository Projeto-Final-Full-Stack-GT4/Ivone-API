const catalogoSeeder = require('../seeders/20261116050000-seed-catalogo-demonstrativo');
const avaliacoesSeeder = require('../seeders/20261116051000-seed-avaliacoes-demonstrativas');
const imagensSeeder = require('../seeders/20261116052000-atualiza-imagens-produtos-demonstrativos');
const estoqueDemonstrativoMigration = require('../migrations/20261116060000-inicializa-estoque-catalogo-demonstrativo');

describe('catálogo demonstrativo', () => {
  test('insere produtos ausentes sem duplicar nem sobrescrever os existentes', async () => {
    const existentes = [
      { nome: 'Sérum Facial Revitalizante', descricao: 'Descrição já cadastrada.' }
    ];
    const inseridos = [];
    const queryInterface = {
      sequelize: {
        query: jest.fn(async (_sql, { replacements }) => (
          [...existentes, ...inseridos]
            .filter(({ nome }) => replacements.nomes.includes(nome))
            .map(({ nome }) => ({ nome }))
        ))
      },
      bulkInsert: jest.fn(async (_tabela, produtos) => {
        inseridos.push(...produtos);
      })
    };

    await catalogoSeeder.up(queryInterface);

    expect(inseridos).toHaveLength(19);
    expect(inseridos).not.toContainEqual(
      expect.objectContaining({ nome: 'Sérum Facial Revitalizante' })
    );
    expect(inseridos.find(({ nome }) => nome === 'Gel de Limpeza Facial').imagem)
      .toBe('product-images/Gel_de_Limpeza.png');
    expect(inseridos.find(({ nome }) => nome === 'Gel de Limpeza Facial').estoque).toBe(20);
    expect(existentes[0].descricao).toBe('Descrição já cadastrada.');

    await catalogoSeeder.up(queryInterface);

    expect(inseridos).toHaveLength(19);
    expect(queryInterface.bulkInsert).toHaveBeenCalledTimes(1);
  });

  test('atualiza somente imagens demonstrativas legadas nos produtos correspondentes', async () => {
    const queryInterface = {
      bulkUpdate: jest.fn().mockResolvedValue([1])
    };

    await imagensSeeder.up(queryInterface);

    expect(queryInterface.bulkUpdate).toHaveBeenCalledTimes(20);
    expect(queryInterface.bulkUpdate).toHaveBeenCalledWith(
      'produtos',
      expect.objectContaining({ imagem: 'product-images/serum_facial.png' }),
      { nome: 'Sérum Facial Revitalizante', imagem: 'local:serum-facial' }
    );

    await imagensSeeder.down(queryInterface);

    expect(queryInterface.bulkUpdate).toHaveBeenCalledTimes(40);
    expect(queryInterface.bulkUpdate).toHaveBeenCalledWith(
      'produtos',
      expect.objectContaining({ imagem: 'local:serum-facial' }),
      { nome: 'Sérum Facial Revitalizante', imagem: 'product-images/serum_facial.png' }
    );
  });

  test('inicializa apenas produtos demonstrativos que ainda não têm estoque', async () => {
    const queryInterface = {
      bulkUpdate: jest.fn().mockResolvedValue([20])
    };

    await estoqueDemonstrativoMigration.up(queryInterface);

    expect(queryInterface.bulkUpdate).toHaveBeenCalledWith(
      'produtos',
      { estoque: 20 },
      expect.objectContaining({ estoque: 0, nome: expect.arrayContaining(['Sérum Facial Revitalizante']) })
    );
  });

  test('associa e insere avaliações uma única vez para os produtos cadastrados', async () => {
    const inseridas = [];
    const queryInterface = {
      sequelize: {
        query: jest.fn(async (sql, { replacements }) => {
          if (sql.includes('SELECT id, nome FROM produtos')) {
            return replacements.nomes.map((nome, index) => ({ id: index + 1, nome }));
          }

          return inseridas.map(({ produtoId, comentario }) => ({ produtoId, comentario }));
        })
      },
      bulkInsert: jest.fn(async (_tabela, avaliacoes) => {
        inseridas.push(...avaliacoes);
      })
    };

    await avaliacoesSeeder.up(queryInterface);

    expect(inseridas).toHaveLength(20);
    expect(inseridas[0]).toEqual(expect.objectContaining({
      produtoId: 1,
      usuario: 'Mariana Silva',
      nota: 5,
      dataAvaliacao: '2026-11-12'
    }));

    await avaliacoesSeeder.up(queryInterface);

    expect(inseridas).toHaveLength(20);
    expect(queryInterface.bulkInsert).toHaveBeenCalledTimes(1);
  });
});
