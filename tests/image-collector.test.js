import { describe, it, expect } from 'vitest';
import { commonsCandidates, selectRelevantImages } from '../server/lib/images.js';

describe('imagens do bot Telegram', () => {
  it('mantém retrato do domínio atual do Wikimedia em vez de produzir capa vazia', () => {
    const image = { title: 'File:Alexandre de Moraes.jpg', imageinfo: [{
      thumburl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Moraes.jpg/960px-Moraes.jpg',
      descriptionurl: 'https://commons.wikimedia.org/wiki/File:Moraes.jpg',
      mime: 'image/jpeg', thumbwidth: 960, thumbheight: 1280,
      extmetadata: { Artist: { value: 'Fotógrafo' }, LicenseShortName: { value: 'CC BY 2.0' } }
    }] };
    expect(selectRelevantImages(commonsCandidates({ query: { pages: { image } } }), { subject: 'Alexandre de Moraes' })).toHaveLength(1);
    image.imageinfo[0].thumburl = 'https://thumb.wikimedia.org.attacker.invalid/foto.jpg';
    expect(commonsCandidates({ query: { pages: { image } } })).toHaveLength(0);
  });
});
