import { Article } from '../types';

export interface EditorialImage {
  url: string;
  sourceUrl: string;
  description: string;
  title: string;
  credit: string;
  license: string;
  width: number;
  height: number;
}

function escape(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}

export function applyEditorialCover(article: Partial<Article>, image: EditorialImage): Partial<Article> {
  const credit = `<p class="alpes-cover-credit">Imagem de capa de arquivo/ilustrativa: ${escape(image.description)}. Crédito: ${escape(image.credit)}. <a href="${escape(image.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escape(image.license)}</a>.</p>`;
  const content = (article.content || '').replace(/<p[^>]*>Imagem de capa de arquivo\/ilustrativa:[\s\S]*?<\/p>/gi, '').trim() + credit;
  const sourceReferences = (article.sourceReferences || '').split('\n')
    .filter(line => !/^(Capa:|Capa de arquivo:|Imagem pendente:)/.test(line)).join('\n').trim();
  return {
    ...article, imageUrl: image.url, content, rightsCleared: false,
    seoImage: !article.seoImage || article.seoImage === article.imageUrl ? image.url : article.seoImage,
    sourceReferences: `${sourceReferences}${sourceReferences ? '\n' : ''}Capa: ${image.description} | ${image.credit} | ${image.license} | ${image.sourceUrl}`,
  };
}
