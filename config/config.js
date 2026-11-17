
require('dotenv').config({ quiet: true });

const fs = require('fs');

const isTiDBCloudHost = /tidbcloud\.com/i.test(process.env.DB_HOST || '');
const sslFlagValue = (process.env.DB_SSL || '').toLowerCase();
const sslEnabled = sslFlagValue === 'true' || sslFlagValue === '1'
  ? true
  : sslFlagValue === 'false' || sslFlagValue === '0'
    ? false
    : isTiDBCloudHost;
const ssl = sslEnabled
  ? {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      ...(process.env.DB_SSL_CA_FILE
        ? { ca: fs.readFileSync(process.env.DB_SSL_CA_FILE, 'utf8') }
        : {})
    }
  : undefined;

const common = {
  username: process.env.DB_USERNAME || process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  dialect: process.env.DB_DIALECT || 'mysql',
  ...(ssl ? { dialectOptions: { ssl } } : {})
};

if (process.env.NODE_ENV === 'production') {
  const required = ['DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST'];
  const missing = required.filter((key) => !process.env[key] && !(key === 'DB_USERNAME' && process.env.DB_USER));

  if (missing.length > 0) {
    throw new Error(`Variáveis de banco obrigatórias ausentes: ${missing.join(', ')}`);
  }
}

module.exports = {
  development: common,
  test: { ...common, database: process.env.DB_NAME || process.env.DB_DATABASE || 'ivone_beauty_test' },
  production: common
};
