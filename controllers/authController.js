const bcrypt = require('bcrypt');
const { Usuario } = require('../models');
const usuarioResDto = require('../dtos/usuarioResDto');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/tokenService');

async function register(req, res) {
  const { nome, email, cpf, senha } = req.body || {};
  const cpfNormalizado = typeof cpf === 'string' ? cpf.replace(/\D/g, '') : '';

  if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' ||
      typeof senha !== 'string' || senha.length < 8 || !/^[0-9]{11}$/.test(cpfNormalizado)) {
    throw new AppError('Informe nome, e-mail válido, CPF com 11 dígitos e senha com pelo menos 8 caracteres.');
  }

  const usuario = await Usuario.create({
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    cpf: cpfNormalizado,
    senha: await bcrypt.hash(senha, 12)
  });

  return res.status(201).json({ usuario: usuarioResDto.fromEntity(usuario) });
}

async function login(req, res) {
  const { email, senha } = req.body || {};
  if (typeof email !== 'string' || typeof senha !== 'string') {
    throw new AppError('Informe e-mail e senha.');
  }

  const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  return res.status(200).json({
    token: generateToken(usuario),
    usuario: usuarioResDto.fromEntity(usuario)
  });
}

async function me(req, res) {
  const usuario = await Usuario.findByPk(req.usuario.id);
  if (!usuario) {
    throw new AppError('Usuário não encontrado.', 404);
  }
  return res.status(200).json({ usuario: usuarioResDto.fromEntity(usuario) });
}

module.exports = { register, login, me };
