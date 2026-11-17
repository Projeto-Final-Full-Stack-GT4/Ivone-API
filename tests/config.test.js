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
    expect(config.development.dialectOptions.ssl).toBeUndefined();
  });

  test('enables SSL with certificate verification by default', () => {
    process.env.DB_SSL = 'true';
    delete process.env.DB_SSL_REJECT_UNAUTHORIZED;

    const config = require('../config/config.js');
    expect(config.development.dialectOptions.ssl).toEqual({
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    });
  });

  test('allows opting out of certificate verification explicitly', () => {
    process.env.DB_SSL = 'true';
    process.env.DB_SSL_REJECT_UNAUTHORIZED = 'false';

    const config = require('../config/config.js');
    expect(config.development.dialectOptions.ssl.rejectUnauthorized).toBe(false);
  });
});
