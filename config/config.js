require('dotenv').config({ quiet: true });

const common = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ivone_beauty',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: false
};

if (process.env.NODE_ENV === 'production') {
  const required = ['DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Variáveis de banco obrigatórias ausentes: ${missing.join(', ')}`);
  }
}

module.exports = {
  development: common,
  test: { ...common, database: process.env.DB_NAME || 'ivone_beauty_test' },
  production: common
};
