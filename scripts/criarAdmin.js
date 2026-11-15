require('dotenv').config({ quiet: true });

const bcrypt = require('bcrypt');
const { Usuario, sequelize } = require('../models');

async function criarAdmin {
    const nome = process.env.ADMIN_NOME;
    const email = process.env.ADMIN_EMAIL;
    const cpf = process.env.ADMIN_CPF;
    const senha  = process.env.ADMIN_SENHA;

    if (!nome || !email || !cpf || !senha) {
        throw new Error('Todas os dados de Admin precisam ser preenchidos');
}
    

}