const AppError = require('../utils/AppError');

const fields = ['nome', 'categoria', 'descricao', 'tamanho', 'preco', 'tag', 'imagem', 'estoque', 'ativo'];

function toEntity(data, partial = false) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AppError('O corpo da requisição deve ser um objeto JSON.');
  }

  const entity = Object.fromEntries(
    fields.filter((field) => Object.prototype.hasOwnProperty.call(data, field))
      .map((field) => [field, data[field]])
  );

  if (!partial) {
    const required = ['nome', 'categoria', 'descricao', 'tamanho', 'preco'];
    const missing = required.filter((field) => entity[field] === undefined || entity[field] === '');
    if (missing.length > 0) {
      throw new AppError(`Campos obrigatórios: ${missing.join(', ')}.`);
    }
  }

  if (Object.keys(entity).length === 0) {
    throw new AppError('Informe ao menos um campo válido para atualizar.');
  }
  if (entity.preco !== undefined && (!Number.isFinite(Number(entity.preco)) || Number(entity.preco) < 0)) {
    throw new AppError('O preço deve ser um número igual ou maior que zero.');
  }
  if (entity.estoque !== undefined && (!Number.isInteger(Number(entity.estoque)) || Number(entity.estoque) < 0)) {
    throw new AppError('O estoque deve ser um número inteiro igual ou maior que zero.');
  }
  if (entity.ativo !== undefined && typeof entity.ativo !== 'boolean') {
    throw new AppError('O campo ativo deve ser booleano.');
  }

  return entity;
}

module.exports = { toEntity };
