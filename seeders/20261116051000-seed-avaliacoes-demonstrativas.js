'use strict';

const { QueryTypes } = require('sequelize');

const avaliacoes = [
  {
    produto: 'Sérum Facial Revitalizante',
    usuario: 'Mariana Silva',
    nota: 5,
    data: '12/11/2026',
    comentario: 'Deixou minha pele iluminada e hidratada sem pesar. Uso todos os dias pela manhã!'
  },
  {
    produto: 'Gel de Limpeza Facial',
    usuario: 'Carlos Mendes',
    nota: 4,
    data: '05/10/2026',
    comentario: 'Gel de limpeza eficaz, mas pode ser um pouco seco para peles muito sensíveis.'
  },
  {
    produto: 'Pó Compacto Matte',
    usuario: 'Ana Paula',
    nota: 5,
    data: '20/11/2026',
    comentario: 'Adorei o acabamento matte e a longevidade do pó compacto!'
  },
  {
    produto: 'Batom Hidratante',
    usuario: 'Juliana Costa',
    nota: 4,
    data: '15/12/2026',
    comentario: 'Batom hidratante e de fácil aplicação. Recomendo!'
  },
  {
    produto: 'Sérum Facial Vitamina C',
    usuario: 'Roberta Santos',
    nota: 5,
    data: '10/11/2026',
    comentario: 'Sérum facial com vitamina C é incrível! Deixou minha pele mais clara e radiante.'
  },
  {
    produto: 'Gel de Limpeza Suave',
    usuario: 'Fernanda Lima',
    nota: 4,
    data: '22/11/2026',
    comentario: 'Gel de limpeza suave, ideal para o uso diário. Minha pele ficou limpa e fresca.'
  },
  {
    produto: 'Sérum Facial Noturno',
    usuario: 'Patrícia Oliveira',
    nota: 5,
    data: '30/11/2026',
    comentario: 'Sérum facial noturno é excelente! Deixou minha pele hidratada e renovada.'
  },
  {
    produto: 'Gel de Limpeza Purificante',
    usuario: 'Marcos Almeida',
    nota: 4,
    data: '18/12/2026',
    comentario: 'Gel de limpeza purificante, ideal para peles oleosas. Deixou minha pele limpa e com sensação de frescor.'
  },
  {
    produto: 'Pó Compacto Natural',
    usuario: 'Camila Rodrigues',
    nota: 5,
    data: '25/12/2026',
    comentario: 'Pó compacto natural é ótimo! Deixou minha pele com um acabamento perfeito.'
  },
  {
    produto: 'Batom Nude Cremoso',
    usuario: 'Juliana Souza',
    nota: 4,
    data: '02/01/2027',
    comentario: 'Batom nude cremoso é ótimo para um look natural e elegante.'
  },
  {
    produto: 'Batom Rosa Intenso',
    usuario: 'Letícia Moreira',
    nota: 5,
    data: '08/01/2027',
    comentario: 'Cor intensa, confortável de usar e muito bonita no rosto!'
  },
  {
    produto: 'Pó Compacto Translúcido',
    usuario: 'Renata Alves',
    nota: 5,
    data: '11/01/2027',
    comentario: 'Acabamento muito bonito e leve, ideal para o dia a dia.'
  },
  {
    produto: 'Batom Vermelho Clássico',
    usuario: 'Isabela Ramos',
    nota: 5,
    data: '14/01/2027',
    comentario: 'Tom sofisticado e excelente pigmentação. Adorei!'
  },
  {
    produto: 'Sérum Facial Hidratante',
    usuario: 'Nina Martins',
    nota: 4,
    data: '18/01/2027',
    comentario: 'Hidrata bem sem deixar a pele oleosa. Ótimo para rotina diária.'
  },
  {
    produto: 'Gel de Limpeza Diário',
    usuario: 'Larissa Costa',
    nota: 4,
    data: '21/01/2027',
    comentario: 'Limpeza suave e agradável, sem sensação de ressecamento.'
  },
  {
    produto: 'Kit Rotina Facial',
    usuario: 'Talita Mendonça',
    nota: 5,
    data: '24/01/2027',
    comentario: 'Perfeito para quem quer uma rotina facial completa e prática.'
  },
  {
    produto: 'Kit Maquiagem Essencial',
    usuario: 'Beatriz Nunes',
    nota: 5,
    data: '27/01/2027',
    comentario: 'Muito útil para montar uma maquiagem rápida e bonita.'
  },
  {
    produto: 'Kit Presente Beleza',
    usuario: 'Amanda Freitas',
    nota: 5,
    data: '29/01/2027',
    comentario: 'Ideia incrível de presente, muito bonito e funcional.'
  },
  {
    produto: 'Kit Skincare Básico',
    usuario: 'Gabriela Reis',
    nota: 5,
    data: '02/02/2027',
    comentario: 'Ótimo para quem está começando a cuidar da pele.'
  },
  {
    produto: 'Kit Autocuidado',
    usuario: 'Carolina Dias',
    nota: 4,
    data: '05/02/2027',
    comentario: 'Uma boa seleção para momentos de autocuidado e relaxamento.'
  }
];

function toDatabaseDate(date) {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
}

function reviewKey(produtoId, comentario) {
  return `${produtoId}\u0000${comentario}`;
}

module.exports = {
  async up(queryInterface) {
    const nomes = [...new Set(avaliacoes.map(({ produto }) => produto))];
    const produtos = await queryInterface.sequelize.query(
      'SELECT id, nome FROM produtos WHERE nome IN (:nomes)',
      {
        replacements: { nomes },
        type: QueryTypes.SELECT
      }
    );
    const produtoIds = new Map(produtos.map(({ id, nome }) => [nome, id]));
    const produtosAusentes = nomes.filter((nome) => !produtoIds.has(nome));

    if (produtosAusentes.length > 0) {
      throw new Error(`Não foi possível encontrar produtos para as avaliações: ${produtosAusentes.join(', ')}.`);
    }

    const existentes = await queryInterface.sequelize.query(
      'SELECT produtoId, comentario FROM avaliacoes_produto WHERE produtoId IN (:produtoIds)',
      {
        replacements: { produtoIds: [...produtoIds.values()] },
        type: QueryTypes.SELECT
      }
    );
    const chavesExistentes = new Set(
      existentes.map(({ produtoId, comentario }) => reviewKey(produtoId, comentario))
    );
    const novasAvaliacoes = avaliacoes
      .map((avaliacao) => ({
        produtoId: produtoIds.get(avaliacao.produto),
        usuario: avaliacao.usuario,
        nota: avaliacao.nota,
        dataAvaliacao: toDatabaseDate(avaliacao.data),
        comentario: avaliacao.comentario
      }))
      .filter(({ produtoId, comentario }) => !chavesExistentes.has(reviewKey(produtoId, comentario)));

    if (novasAvaliacoes.length === 0) {
      return;
    }

    const now = new Date();
    await queryInterface.bulkInsert(
      'avaliacoes_produto',
      novasAvaliacoes.map((avaliacao) => ({
        ...avaliacao,
        createdAt: now,
        updatedAt: now
      }))
    );
  },

  async down() {
    // Preserva avaliações existentes, que não podem ser distinguidas das demonstrativas.
  }
};
