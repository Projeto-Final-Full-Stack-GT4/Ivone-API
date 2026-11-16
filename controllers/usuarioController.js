
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

    if (!usuario) {
        return res.status(404).json({
            erro: 'Usuário não encontrado.'
        });
    }

    return res.status(200).json(
        usuarioResDto.fromEntity(usuario)
    );
}

// Criar usuário
async function criarUsuario(req, res) {
    const { nome, email, cpf, senha, confirmarSenha } = req.body;

    if (!nome || !email || !cpf || !senha || !confirmarSenha) {
        return res.status(400).json({
            erro: 'Todos os campos são obrigatórios.'
        });
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
        return res.status(400).json({
            erro: 'E-mail inválido.'
        });
    }

    const usuarioExistente = await Usuario.findOne({
        where: { email }
    });

    if (usuarioExistente) {
        return res.status(409).json({
            erro: 'E-mail já cadastrado.'
        });
    }

    const cpfExistente = await Usuario.findOne({
        where: { cpf }
    });

    if (cpfExistente) {
        return res.status(409).json({
            erro: 'CPF já cadastrado.'
        });
    }

    if (senha !== confirmarSenha) {
        return res.status(400).json({
            erro: 'As senhas não coincidem.'
        });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await Usuario.create({
        nome,
        email,
        cpf,
        senha: senhaCriptografada
    });

    return res.status(201).json(
        usuarioResDto.fromEntity(usuario)
    );
}

// Atualizar usuário
async function atualizarUsuario(req, res) {
    const { id } = req.params;
    const { nome, email, cpf, senha, confirmarSenha } = req.body;

    // Verificar se o usuário pode realizar a atualização
    if (
        Number(req.usuario.id) !== Number(id) &&
        req.usuario.role !== 'admin'
    ) {
        return res.status(403).json({
            erro: 'Você não tem permissão para atualizar este usuário.'
        });
    }

    // Buscar usuário no banco
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
        return res.status(404).json({
            erro: 'Usuário não encontrado.'
        });
    }

    // Verificar se existe algum campo para atualizar
    if (!nome && !email && !cpf && !senha) {
        return res.status(400).json({
            erro: 'Informe pelo menos um campo para atualizar.'
        });
    }

    // Validar e-mail
    if (email) {
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!emailValido) {
            return res.status(400).json({
                erro: 'E-mail inválido.'
            });
        }

        const emailExistente = await Usuario.findOne({
            where: { email }
        });

        if (emailExistente && emailExistente.id !== usuario.id) {
            return res.status(409).json({
                erro: 'E-mail já cadastrado.'
            });
        }
    }

    // Verificar CPF duplicado
    if (cpf) {
        const cpfExistente = await Usuario.findOne({
            where: { cpf }
        });

        if (cpfExistente && cpfExistente.id !== usuario.id) {
            return res.status(409).json({
                erro: 'CPF já cadastrado.'
            });
        }
    }

    // Preparar dados para atualização
    const dadosAtualizados = {};

    if (nome) dadosAtualizados.nome = nome;
    if (email) dadosAtualizados.email = email;
    if (cpf) dadosAtualizados.cpf = cpf;

    // Atualizar senha, se informada
    if (senha) {
        if (!confirmarSenha) {
            return res.status(400).json({
                erro: 'Confirme a nova senha.'
            });
        }

        if (senha !== confirmarSenha) {
            return res.status(400).json({
                erro: 'As senhas não coincidem.'
            });
        }

        dadosAtualizados.senha = await bcrypt.hash(senha, 10);
    }

    // Salvar alterações
    await usuario.update(dadosAtualizados);

    return res.status(200).json(
        usuarioResDto.fromEntity(usuario)
    );
}

module.exports = {
    listar,
    buscarPorId,
    criarUsuario,
    atualizarUsuario
};
