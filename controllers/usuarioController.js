const { Usuario } = require('../models');
const usuarioResDto = require('../dtos/usuarioResDto');

async function listar(req, res) {
    const usuarios = await Usuario.findAll();

    const usuariosFormatados = usuarios.map (
        usuario => usuarioResDto.fromEntity(usuario)
        
    );

    return res.status(200).json(usuariosFormatados);
    
}
async function buscarPorId(req, res) {
    const usuario = await Usuario.findByPk(req.params.id)
    
    // usuário não encontrado
    if (!usuario) {
    return res.status(404).json({
        erro: 'Usuário não encontrado.'
    });
}
return res.status(200).json(usuarioResDto.fromEntity(usuario));


}
module.exports = { listar, buscarPorId };