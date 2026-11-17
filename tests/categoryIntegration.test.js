const categoryMigration = require('../migrations/20261116044000-add-category-slug-and-menu-visibility');
const menuVisibilityMigration = require('../migrations/20261116050000-add-use-in-menu-to-categorias');
const categorySeeder = require('../seeders/20261116053000-seed-categorias-demonstrativas');

describe('integração relacional de categorias', () => {
  test('migra slugs únicos em esquemas existentes', async () => {
    const updates = [];
    const queryInterface = {
      describeTable: jest.fn().mockResolvedValue({ id: {}, nome: {} }),
      addColumn: jest.fn().mockResolvedValue(),
      sequelize: {
        query: jest.fn().mockResolvedValue([[
          { id: 1, nome: 'Maquiagem', slug: null },
          { id: 2, nome: 'Maquiagem!', slug: null }
        ]])
      },
      bulkUpdate: jest.fn(async (_table, values, where) => updates.push({ values, where })),
      changeColumn: jest.fn().mockResolvedValue(),
      showIndex: jest.fn().mockResolvedValue([]),
      addIndex: jest.fn().mockResolvedValue()
    };

    await categoryMigration.up(queryInterface, {
      STRING: jest.fn((length) => ({ length })),
      BOOLEAN: 'BOOLEAN'
    });

    expect(queryInterface.addColumn).toHaveBeenCalledTimes(1);
    expect(queryInterface.addColumn).toHaveBeenCalledWith('categorias', 'slug', expect.any(Object));
    expect(updates).toEqual([
      { values: { slug: 'maquiagem' }, where: { id: 1 } },
      { values: { slug: 'maquiagem-2-2' }, where: { id: 2 } }
    ]);
    expect(queryInterface.addIndex).toHaveBeenCalledWith(
      'categorias',
      ['slug'],
      expect.objectContaining({ unique: true })
    );
  });

  test('adiciona a visibilidade do menu apenas quando a coluna não existe', async () => {
    const queryInterface = {
      describeTable: jest.fn().mockResolvedValue({ id: {}, nome: {} }),
      addColumn: jest.fn().mockResolvedValue()
    };

    await menuVisibilityMigration.up(queryInterface, { BOOLEAN: 'BOOLEAN' });

    expect(queryInterface.addColumn).toHaveBeenCalledWith(
      'categorias',
      'use_in_menu',
      expect.objectContaining({ allowNull: false, defaultValue: true })
    );

    queryInterface.describeTable.mockResolvedValue({
      id: {},
      nome: {},
      use_in_menu: {}
    });
    queryInterface.addColumn.mockClear();

    await menuVisibilityMigration.up(queryInterface, { BOOLEAN: 'BOOLEAN' });

    expect(queryInterface.addColumn).not.toHaveBeenCalled();
  });

  test('semeia categorias e associa produtos sem duplicar os vínculos', async () => {
    const categories = [];
    const products = [
      { id: 1, categoria: 'skincare' },
      { id: 2, categoria: 'maquiagem' },
      { id: 3, categoria: 'kits' }
    ];
    const productCategories = [];
    const queryInterface = {
      sequelize: {
        query: jest.fn(async (sql, options = {}) => {
          if (sql.includes('SELECT id, categoria FROM produtos')) return products;
          if (sql.includes('SELECT produtoId, categoriaId FROM produto_categorias')) {
            return productCategories;
          }
          if (sql.includes('WHERE slug = :slug')) {
            return categories.filter(({ slug }) => slug === options.replacements.slug);
          }
          return categories;
        })
      },
      bulkInsert: jest.fn(async (table, rows) => {
        if (table === 'categorias') {
          categories.push(...rows.map((row, index) => ({
            ...row,
            id: categories.length + index + 1
          })));
        } else {
          productCategories.push(...rows);
        }
      })
    };

    await categorySeeder.up(queryInterface);
    await categorySeeder.up(queryInterface);

    expect(categories.map(({ slug }) => slug)).toEqual([
      'skincare',
      'maquiagem',
      'cabelos',
      'kits'
    ]);
    expect(productCategories).toHaveLength(3);
    expect(new Set(productCategories.map(({ produtoId, categoriaId }) => `${produtoId}:${categoriaId}`)).size)
      .toBe(3);
  });
});
