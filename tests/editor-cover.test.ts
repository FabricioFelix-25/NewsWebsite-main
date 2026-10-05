import { expect, it } from 'vitest';
import { applyEditorialCover, EditorialImage } from '../src/utils/editorImages';
const image: EditorialImage = { url: 'https://thumb.wikimedia.org/new.jpg', sourceUrl: 'https://commons.wikimedia.org/wiki/File:New.jpg', title: 'Foto', description: 'Nome <produto>', credit: 'Autor & cia', license: 'CC BY 4.0', width: 1280, height: 900 };
it('troca os créditos automáticos sem duplicar nem alterar o texto e a revisão de fatos', () => {
  const initial = { content: '<p>Texto do editor.</p>', imageUrl: 'https://old.jpg', seoImage: 'https://old.jpg', sourceReferences: 'Fonte principal\nImagem pendente: escolher foto', factChecked: true, rightsCleared: true };
  const result = applyEditorialCover(applyEditorialCover(initial, image), { ...image, credit: 'Outra autora' });
  expect(result.content?.match(/Imagem de capa/g)).toHaveLength(1);
  expect(result.content).toContain('<p>Texto do editor.</p>');
  expect(result.content).toContain('Nome &lt;produto&gt;');
  expect(result.sourceReferences).toContain('Fonte principal');
  expect(result.sourceReferences).not.toContain('Imagem pendente');
  expect(result.rightsCleared).toBe(false); expect(result.factChecked).toBe(true);
  expect(result.seoImage).toBe(image.url);
});
it('preserva imagem SEO personalizada', () => {
  expect(applyEditorialCover({ seoImage: 'https://custom.jpg' }, image).seoImage).toBe('https://custom.jpg');
});
