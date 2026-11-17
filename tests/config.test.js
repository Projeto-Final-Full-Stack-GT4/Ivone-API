describe('database config', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  test('does not force SSL unless explicitly enabled', () => {
    delete process.env.DB_SSL;
    delete process.env.DB_SSL_REJECT_UNAUTHORIZED;
    delete process.env.NODE_ENV;

    const config = require('../config/config.js');
    expect(config.development.dialectOptions?.ssl).toBeUndefined();
  });
});
