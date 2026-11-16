require('dotenv').config({ quiet: true });
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { Usuario, sequelize } = require('../models');

async function criarAdmin () {
    const nome = process.env.ADMIN_NOME;
    const email = process.env.ADMIN_EMAIL;
    const cpf = process.env.ADMIN_CPF;
    const senha  = process.env.ADMIN_SENHA;

    if (!nome || !email || !cpf || !senha) {
        throw new Error('Todos os dados de Admin precisam ser preenchidos');
}
const cpfNormalizado = cpf.replace(/\D/g, '')  // Retira os caracteres

    if (cpfNormalizado.length !== 11) {
        throw new Error('O CPF deve conter 11 números');
    }
    if (senha.length < 8) {
    throw new Error('A senha deve conter pelo menos 8 caracteres');
}
// Verifica se já existe um usuário
const usuarioExistente = await Usuario.findOne({
  where: {
    [Op.or]: [
      { email: email.trim().toLowerCase() },
      { cpf: cpfNormalizado }
    ]
  }
  
});
if (usuarioExistente) {
  throw new Error('Já existe um usuário com esse e-mail ou CPF.');
}
const senhaHash = await bcrypt.hash(senha, 12);

await Usuario.create({
    nome,
    email: email.trim().toLowerCase(),
    cpf: cpfNormalizado,
    senha: senhaHash,
    role: 'admin'
});

}
criarAdmin()
    .then(() => {
        console.log('Administrador criado com sucesso!');
    })
    .catch((error) => {
        console.error('Erro ao criar administrador:', error.message);
    })
    .finally(async () => {
        await sequelize.close();
    });