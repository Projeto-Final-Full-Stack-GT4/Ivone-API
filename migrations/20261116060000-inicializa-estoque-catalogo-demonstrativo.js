'use strict';

const nomesProdutosDemonstrativos = [
  'Sérum Facial Revitalizante',
  'Gel de Limpeza Facial',
  'Pó Compacto Matte',
  'Batom Hidratante',
  'Sérum Facial Vitamina C',
  'Gel de Limpeza Suave',
  'Sérum Facial Noturno',
  'Gel de Limpeza Purificante',
  'Pó Compacto Natural',
  'Batom Nude Cremoso',
  'Batom Rosa Intenso',
  'Pó Compacto Translúcido',
  'Batom Vermelho Clássico',
  'Sérum Facial Hidratante',
  'Gel de Limpeza Diário',
  'Kit Rotina Facial',
  'Kit Maquiagem Essencial',
  'Kit Presente Beleza',
  'Kit Skincare Básico',
  'Kit Autocuidado'
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkUpdate(
      'produtos',
      { estoque: 20 },
      { nome: nomesProdutosDemonstrativos, estoque: 0 }
    );
  },

  async down() {
    // Preserva as quantidades de estoque, que podem ter sido alteradas após a migração.
  }
};
