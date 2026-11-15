const { Usuario } = require('../models');
const usuarioResDto = require('../dtos/usuarioResDto');

async function listar(req, res) {
    const usuarios = await Usuario.findAll();

    const usuariosFormatados = usuarios.map (
        usuario => usuarioResDto.fromEntity(usuario)
        
    );

    return res.status(200).json(usuariosFormatados);
    
}

module.exports = { listar };