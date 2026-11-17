'use strict';

const { QueryTypes } = require('sequelize');

const produtos = [
  {
    nome: 'Sérum Facial Revitalizante',
    categoria: 'skincare',
    descricao: 'Sérum leve que hidrata, renova e ilumina a pele. Use pela manhã e à noite, depois de limpar o rosto.',
    tamanho: '30ml',
    preco: '89.90',
    tag: 'Mais Vendido',
    imagem: 'local:serum-facial'
  },
  {
    nome: 'Gel de Limpeza Facial',
    categoria: 'skincare',
    descricao: 'Gel de limpeza com extratos naturais e aloe vera. Remove a oleosidade e as impurezas sem ressecar a pele.',
    tamanho: '120ml',
    preco: '49.90',
    tag: 'Vegano',
    imagem: 'local:gel-limpeza'
  },
  {
    nome: 'Pó Compacto Matte',
    categoria: 'maquiagem',
    descricao: 'Pó compacto de acabamento matte que controla o brilho e ajuda a uniformizar o tom da pele.',
    tamanho: '10g',
    preco: '69.90',
    tag: 'Lançamento',
    imagem: 'local:po-compacto'
  },
  {
    nome: 'Batom Hidratante',
    categoria: 'maquiagem',
    descricao: 'Batom de cor intensa com textura confortável, que hidrata enquanto colore os lábios.',
    tamanho: '4g',
    preco: '59.90',
    tag: 'Mais Vendido',
    imagem: 'local:batom'
  },
  {
    nome: 'Sérum Facial Vitamina C',
    categoria: 'skincare',
    descricao: 'Sérum facial para complementar a rotina de cuidados e deixar a pele com aparência iluminada.',
    tamanho: '30ml',
    preco: '79.90',
    tag: 'Destaque',
    imagem: 'local:serum-facial'
  },
  {
    nome: 'Gel de Limpeza Suave',
    categoria: 'skincare',
    descricao: 'Limpeza diária com textura leve para remover resíduos e impurezas da pele.',
    tamanho: '150ml',
    preco: '44.90',
    tag: 'Uso Diário',
    imagem: 'local:gel-limpeza'
  },
  {
    nome: 'Sérum Facial Noturno',
    categoria: 'skincare',
    descricao: 'Sérum para integrar a rotina noturna de hidratação e cuidado facial.',
    tamanho: '30ml',
    preco: '94.90',
    tag: 'Novidade',
    imagem: 'local:serum-facial'
  },
  {
    nome: 'Gel de Limpeza Purificante',
    categoria: 'skincare',
    descricao: 'Gel de limpeza para remover a oleosidade e deixar a pele com sensação de frescor.',
    tamanho: '100ml',
    preco: '39.90',
    tag: 'Favorito',
    imagem: 'local:gel-limpeza'
  },
  {
    nome: 'Pó Compacto Natural',
    categoria: 'maquiagem',
    descricao: 'Pó compacto para finalizar a maquiagem com um acabamento natural.',
    tamanho: '10g',
    preco: '64.90',
    tag: 'Essencial',
    imagem: 'local:po-compacto'
  },
  {
    nome: 'Batom Nude Cremoso',
    categoria: 'maquiagem',
    descricao: 'Batom em tom nude com acabamento cremoso para compor maquiagens delicadas.',
    tamanho: '4g',
    preco: '54.90',
    tag: 'Clássico',
    imagem: 'local:batom'
  },
  {
    nome: 'Batom Rosa Intenso',
    categoria: 'maquiagem',
    descricao: 'Batom em tom rosa para destacar os lábios e completar a maquiagem.',
    tamanho: '4g',
    preco: '57.90',
    tag: 'Destaque',
    imagem: 'local:batom'
  },
  {
    nome: 'Pó Compacto Translúcido',
    categoria: 'maquiagem',
    descricao: 'Pó compacto para ajudar a finalizar a maquiagem com aparência uniforme.',
    tamanho: '8g',
    preco: '72.90',
    tag: 'Novidade',
    imagem: 'local:po-compacto'
  },
  {
    nome: 'Batom Vermelho Clássico',
    categoria: 'maquiagem',
    descricao: 'Batom vermelho para criar uma maquiagem marcante em diferentes ocasiões.',
    tamanho: '4g',
    preco: '59.90',
    tag: 'Clássico',
    imagem: 'local:batom'
  },
  {
    nome: 'Sérum Facial Hidratante',
    categoria: 'skincare',
    descricao: 'Sérum de textura leve para complementar os cuidados diários de hidratação.',
    tamanho: '30ml',
    preco: '74.90',
    tag: 'Hidratação',
    imagem: 'local:serum-facial'
  },
  {
    nome: 'Gel de Limpeza Diário',
    categoria: 'skincare',
    descricao: 'Gel para a limpeza cotidiana do rosto, ideal para incluir na rotina de cuidados.',
    tamanho: '120ml',
    preco: '47.90',
    tag: 'Essencial',
    imagem: 'local:gel-limpeza'
  },
  {
    nome: 'Kit Rotina Facial',
    categoria: 'kits',
    descricao: 'Kit demonstrativo com produtos de limpeza e sérum para uma rotina facial completa.',
    tamanho: '2 produtos',
    preco: '119.90',
    tag: 'Kit Especial',
    imagem: 'local:serum-facial'
  },
  {
    nome: 'Kit Maquiagem Essencial',
    categoria: 'kits',
    descricao: 'Kit demonstrativo com pó compacto e batom para completar a nécessaire.',
    tamanho: '2 produtos',
    preco: '109.90',
    tag: 'Kit Especial',
    imagem: 'local:po-compacto'
  },
  {
    nome: 'Kit Presente Beleza',
    categoria: 'kits',
    descricao: 'Sugestão de presente com itens de maquiagem e cuidados faciais.',
    tamanho: '3 itens',
    preco: '149.90',
    tag: 'Presente',
    imagem: 'local:batom'
  },
  {
    nome: 'Kit Skincare Básico',
    categoria: 'kits',
    descricao: 'Kit demonstrativo para apresentar uma rotina simples de limpeza e cuidado facial.',
    tamanho: '2 produtos',
    preco: '99.90',
    tag: 'Mais Vendido',
    imagem: 'local:gel-limpeza'
  },
  {
    nome: 'Kit Autocuidado',
    categoria: 'kits',
    descricao: 'Seleção demonstrativa de produtos para montar um momento especial de autocuidado.',
    tamanho: '3 produtos',
    preco: '139.90',
    tag: 'Especial',
    imagem: 'local:serum-facial'
  }
];

module.exports = {
  async up(queryInterface) {
    const nomes = produtos.map(({ nome }) => nome);
    const existentes = await queryInterface.sequelize.query(
      'SELECT nome FROM produtos WHERE nome IN (:nomes)',
      {
        replacements: { nomes },
        type: QueryTypes.SELECT
      }
    );
    const nomesExistentes = new Set(existentes.map(({ nome }) => nome));
    const novosProdutos = produtos.filter(({ nome }) => !nomesExistentes.has(nome));

    if (novosProdutos.length === 0) {
      return;
    }

    const now = new Date();
    await queryInterface.bulkInsert(
      'produtos',
      novosProdutos.map((produto) => ({
        ...produto,
        estoque: 0,
        ativo: true,
        createdAt: now,
        updatedAt: now
      }))
    );
  },

  async down() {
    // Evita apagar produtos existentes que coincidam com os nomes demonstrativos.
  }
};
