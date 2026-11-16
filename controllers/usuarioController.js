
const { Usuario } = require('../models');
const usuarioResDto = require('../dtos/usuarioResDto');
const bcrypt = require('bcrypt');

async function listar(req, res) {
    const usuarios = await Usuario.findAll();

    const usuariosFormatados = usuarios.map(
        usuario => usuarioResDto.fromEntity(usuario)
    );

    return res.status(200).json(usuariosFormatados);
}

async function buscarPorId(req, res) {
    const usuario = await Usuario.findByPk(req.params.id);

    // Usuário não encontrado
    if (!usuario) {
        return res.status(404).json({
            erro: 'Usuário não encontrado.'
        });
    }

    return res.status(200).json(usuarioResDto.fromEntity(usuario));
}

// Criar usuário
async function criarUsuario(req, res) {
    const { nome, email, cpf, senha, confirmarSenha } = req.body;

    // Validar campos obrigatórios
    if (!nome || !email || !cpf || !senha || !confirmarSenha) {
        return res.status(400).json({
            erro: 'Todos os campos são obrigatórios.'
        });
    }

    // Validar formato do e-mail
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
        return res.status(400).json({
            erro: 'E-mail inválido.'
        });
    }

    // Verificar se o e-mail já existe
    const usuarioExistente = await Usuario.findOne({
        where: { email }
    });

    if (usuarioExistente) {
        return res.status(409).json({
            erro: 'E-mail já cadastrado.'
        });
    }

    // Verificar se o CPF já existe
    const cpfExistente = await Usuario.findOne({
        where: { cpf }
    });

    if (cpfExistente) {
        return res.status(409).json({
            erro: 'CPF já cadastrado.'
        });
    }

    // Confirmar se as senhas são iguais
    if (senha !== confirmarSenha) {
        return res.status(400).json({
            erro: 'As senhas não coincidem.'
        });
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await Usuario.create({
        nome,
        email,
        cpf,
        senha: senhaCriptografada
    });

    // Retornar usuário sem expor a senha
    return res.status(201).json(
        usuarioResDto.fromEntity(usuario)
    );
}

module.exports = {
    listar,
    buscarPorId,
    criarUsuario
};
