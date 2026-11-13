const jwt = require('jsonwebtoken');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('A variável JWT_SECRET não foi configurada.');
  }
  return secret;
}

function generateToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role },
    getSecret(),
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '1h' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

module.exports = { generateToken, verifyToken };
