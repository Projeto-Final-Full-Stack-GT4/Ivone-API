'use strict';

const imagens = [
  ['Sérum Facial Revitalizante', 'local:serum-facial', 'product-images/serum_facial.png'],
  ['Gel de Limpeza Facial', 'local:gel-limpeza', 'product-images/Gel_de_Limpeza.png'],
  ['Pó Compacto Matte', 'local:po-compacto', 'product-images/po_compacto.jpeg'],
  ['Batom Hidratante', 'local:batom', 'product-images/batom.jpeg'],
  ['Sérum Facial Vitamina C', 'local:serum-facial', 'product-images/serum_facial.png'],
  ['Gel de Limpeza Suave', 'local:gel-limpeza', 'product-images/Gel_de_Limpeza.png'],
  ['Sérum Facial Noturno', 'local:serum-facial', 'product-images/serum_facial.png'],
  ['Gel de Limpeza Purificante', 'local:gel-limpeza', 'product-images/Gel_de_Limpeza.png'],
  ['Pó Compacto Natural', 'local:po-compacto', 'product-images/po_compacto.jpeg'],
  ['Batom Nude Cremoso', 'local:batom', 'product-images/batom.jpeg'],
  ['Batom Rosa Intenso', 'local:batom', 'product-images/batom.jpeg'],
  ['Pó Compacto Translúcido', 'local:po-compacto', 'product-images/po_compacto.jpeg'],
  ['Batom Vermelho Clássico', 'local:batom', 'product-images/batom.jpeg'],
  ['Sérum Facial Hidratante', 'local:serum-facial', 'product-images/serum_facial.png'],
  ['Gel de Limpeza Diário', 'local:gel-limpeza', 'product-images/Gel_de_Limpeza.png'],
  ['Kit Rotina Facial', 'local:serum-facial', 'product-images/serum_facial.png'],
  ['Kit Maquiagem Essencial', 'local:po-compacto', 'product-images/po_compacto.jpeg'],
  ['Kit Presente Beleza', 'local:batom', 'product-images/batom.jpeg'],
  ['Kit Skincare Básico', 'local:gel-limpeza', 'product-images/Gel_de_Limpeza.png'],
  ['Kit Autocuidado', 'local:serum-facial', 'product-images/serum_facial.png']
];

module.exports = {
  async up(queryInterface) {
    const updatedAt = new Date();

    for (const [nome, imagemAntiga, imagemNova] of imagens) {
      await queryInterface.bulkUpdate(
        'produtos',
        { imagem: imagemNova, updatedAt },
        { nome, imagem: imagemAntiga }
      );
    }
  },

  async down(queryInterface) {
    const updatedAt = new Date();

    for (const [nome, imagemAntiga, imagemNova] of imagens) {
      await queryInterface.bulkUpdate(
        'produtos',
        { imagem: imagemAntiga, updatedAt },
        { nome, imagem: imagemNova }
      );
    }
  }
};
