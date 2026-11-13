require('dotenv').config({ quiet: true });

const cors = require('cors');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');
const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const { sequelize } = require('./models');
const AppError = require('./utils/AppError');

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : '*';

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/', (req, res) => res.status(200).json({ status: 'ok', name: 'ivone-api' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/produtos', produtoRoutes);

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ erro: error.message });
  }
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ erro: 'Já existe um registro com esses dados.' });
  }
  if (error.name === 'SequelizeValidationError' || error.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: error.message });
  }
  console.error(error);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

async function startServer() {
  await sequelize.authenticate();
  return app.listen(port, () => {
    console.log(`Ivone API executando em http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Não foi possível iniciar a API:', error);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
