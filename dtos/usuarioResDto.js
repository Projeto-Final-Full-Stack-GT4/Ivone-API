function fromEntity(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf,
    role: usuario.role
  };
}

module.exports = { fromEntity };
