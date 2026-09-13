import { describe, expect, it } from 'vitest';
import { imageForDisplay } from '../src/utils/imageDelivery';

describe('imagens de apresentação sem carregar originais gigantes', () => {
  it('troca o original Wikimedia por thumbnail e não duplica o caminho de thumbnails existentes', () => {
    const original = 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Foto%20grande.jpg';
    const card = imageForDisplay(original, 640);
    expect(card).toBe('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Foto%20grande.jpg/960px-Foto%20grande.jpg');
    expect(imageForDisplay(card, 1280)).toContain('/1280px-Foto%20grande.jpg');
    expect(imageForDisplay(original, 20000)).toContain('/1280px-');
  });
  it('limita as duas dimensões do Cloudinary e preserva o original usado pelo editor', () => {
    const original = 'https://res.cloudinary.com/portal/image/upload/v123/avatar.jpg';
    expect(imageForDisplay(original, 64)).toContain('/c_limit,w_64,h_64,q_auto,f_auto/v123/avatar.jpg');
    expect(imageForDisplay(original, 20000)).toContain('w_1280,h_1280');
    expect(original).toBe('https://res.cloudinary.com/portal/image/upload/v123/avatar.jpg');
  });
  it('remove a duplicação de densidade em imagens Pexels', () => {
    const result = new URL(imageForDisplay('https://images.pexels.com/photos/123/p.jpeg?w=940&h=650&dpr=2', 640));
    expect(result.searchParams.get('w')).toBe('640');
    expect(result.searchParams.get('dpr')).toBe('1');
    expect(result.searchParams.has('h')).toBe(false);
  });
  it.each([
    '/uploads/local.jpg', 'blob:https://portal.invalid/123',
    'https://res.cloudinary.com/portal/image/upload/s--signed--/v123/photo.jpg',
    'https://res.cloudinary.com/portal/image/upload/c_crop,w_100/v123/photo.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/ab/Animation.gif',
    'https://upload.wikimedia.org.attacker.invalid/wikipedia/commons/a/ab/photo.jpg',
    'https://other.invalid/photo.jpg?signature=private',
  ])('não altera endereços fora dos formatos públicos suportados: %s', source => {
    expect(imageForDisplay(source, 640)).toBe(source);
  });
});
