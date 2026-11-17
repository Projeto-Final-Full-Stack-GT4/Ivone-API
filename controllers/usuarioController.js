
const { Usuario } = require('../models');
const usuarioResDto = require('../dtos/usuarioResDto');
const bcrypt = require('bcrypt');

async function listar(req, res) {
    const usuarios = await Usuario.findAll({
        where: { role: 'cliente' },
        attributes: ['id', 'nome', 'email', 'role'],
        order: [['id', 'ASC']]
    });

    const usuariosFormatados = usuarios.map(({ id, nome, email, role }) => ({
        id,
        nome,
        email,
        role
    }));

    return res.status(200).json(usuariosFormatados);
}

async function buscarPorId(req, res) {
    if (
        Number(req.usuario.id) !== Number(req.params.id) &&
        req.usuario.role !== 'admin'
    ) {
        return res.status(403).json({
            erro: 'Você não tem permissão para consultar este usuário.'
        });
    }

    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
        return res.status(404).json({
            erro: 'Usuário não encontrado.'
        });
    }

    const dadosUsuario = Number(req.usuario.id) === Number(req.params.id)
        ? usuarioResDto.fromEntity(usuario)
        : { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role };

    return res.status(200).json(dadosUsuario);
}

// Criar usuário
async function criarUsuario(req, res) {
    const { nome, email, cpf, senha, confirmarSenha } = req.body || {};

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
    const { nome, email, cpf, senha, confirmarSenha } = req.body || {};

    if (Number(req.usuario.id) !== Number(id)) {
        return res.status(403).json({
            erro: 'Você não tem permissão para atualizar este usuário.'
        });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
        return res.status(404).json({
            erro: 'Usuário não encontrado.'
        });
    }

    if (!nome && !email && !cpf && !senha) {
        return res.status(400).json({
            erro: 'Informe pelo menos um campo para atualizar.'
        });
    }

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

    const dadosAtualizados = {};

    if (nome) dadosAtualizados.nome = nome;
    if (email) dadosAtualizados.email = email;
    if (cpf) dadosAtualizados.cpf = cpf;

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

    await usuario.update(dadosAtualizados);

    return res.status(200).json(
        usuarioResDto.fromEntity(usuario)
    );
}

// Excluir usuário
async function excluirUsuario(req, res) {
    const { id } = req.params;

    // Verificar se o usuário pode realizar a exclusão
    if (Number(req.usuario.id) !== Number(id)) {
        return res.status(403).json({
            erro: 'Você não tem permissão para excluir este usuário.'
        });
    }

    // Buscar usuário no banco
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
        return res.status(404).json({
            erro: 'Usuário não encontrado.'
        });
    }

    // Excluir usuário
    await usuario.destroy();

    return res.status(200).json({
        mensagem: 'Usuário excluído com sucesso.'
    });
}

module.exports = {
    listar,
    buscarPorId,
    criarUsuario,
    atualizarUsuario,
    excluirUsuario
};
