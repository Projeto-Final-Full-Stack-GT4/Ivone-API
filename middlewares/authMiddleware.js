const { verifyToken } = require('../utils/tokenService');

function authMiddleware(req, res, next) {
  const authorization = req.get('authorization');
  const parts = authorization ? authorization.split(' ') : [];
  const [scheme, token] = parts;

  if (parts.length !== 2 || scheme !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  try {
    req.usuario = verifyToken(token);
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
    return next(error);
  }
}

function roleMiddleware(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ erro: 'Você não tem permissão para acessar esse recurso.' });
    }
    return next();
  };
}

module.exports = { authMiddleware, roleMiddleware };
