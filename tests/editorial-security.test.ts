import { afterEach, describe, expect, it, vi } from 'vitest';
import { sanitizeArticleHtml } from '../src/utils/articleHtml';
import { getLoginDestination } from '../src/utils/navigation';
import { fetchArticlePreview, publishReviewedArticle } from '../src/api/editorial';
import { getAuthToken, setAuthToken } from '../src/api';

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

describe('HTML de matérias externas', () => {
  it('remove scripts, eventos e navegação javascript', () => {
    const clean = sanitizeArticleHtml('<script>alert(1)</script><img src="https://example.com/x.jpg" onerror="alert(2)"><a href="javascript:alert(3)">Link</a><svg onload="alert(4)"></svg>');
    expect(clean).not.toMatch(/<script|onerror|javascript:|<svg|onload/i);
    expect(clean).toContain('loading="lazy"');
    expect(clean).toContain('referrerpolicy="no-referrer"');
  });
  it('não permite que classes ou estilos cubram os controles privados', () => {
    const clean = sanitizeArticleHtml('<div class="fixed inset-0 z-50 text-center my-6" style="position:fixed;z-index:999;width:100%;text-align:center;background-image:url(https://example.com)">Texto</div>');
    expect(clean).not.toMatch(/fixed|inset-0|z-50|position|z-index|background-image/);
    expect(clean).toContain('text-center my-6');
    expect(clean).toContain('text-align: center');
  });
  it('preserva formatação editorial e dimensões reais das imagens', () => {
    const clean = sanitizeArticleHtml('<figure class="float-right md:w-1/2 my-6"><img src="https://example.com/photo.jpg" width="900" height="600"><figcaption>Crédito</figcaption></figure><blockquote>Citação</blockquote>');
    expect(clean).toContain('float-right md:w-1/2 my-6');
    expect(clean).toContain('width="900" height="600"');
    expect(clean).toContain('<blockquote>Citação</blockquote>');
  });
  it('aceita só embeds de YouTube conhecidos e descarta iframe arbitrário', () => {
    const clean = sanitizeArticleHtml('<iframe src="https://attacker.example/x" srcdoc="evil"></iframe><iframe src="https://www.youtube.com/embed/abcdefghijk?autoplay=1"></iframe>');
    expect(clean).not.toContain('attacker');
    expect(clean).not.toContain('autoplay');
    expect(clean).toContain('https://www.youtube-nocookie.com/embed/abcdefghijk');
    expect(clean).toContain('sandbox=');
  });
});

describe('retorno do login e API editorial', () => {
  it('volta à matéria e bloqueia destinos externos', () => {
    expect(getLoginDestination('/admin/articles/42/preview')).toBe('/admin/articles/42/preview');
    for (const value of ['https://evil.test', '//evil.test', '/admin\\evil.test', '/login', null, '/administrator']) expect(getLoginDestination(value)).toBe('/admin');
  });
  it('não busca conteúdo privado sem sessão', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(fetchArticlePreview('42')).rejects.toThrow('Entre');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('usa JWT em header, no-store e o endpoint privado', async () => {
    setAuthToken('fixture-token');
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 42, content: '<p>Rascunho</p>', isDraft: true })));
    vi.stubGlobal('fetch', fetch);
    expect((await fetchArticlePreview('42')).content).toBe('<p>Rascunho</p>');
    const [url, request] = fetch.mock.calls[0];
    expect(url).toContain('/articles/admin/42/preview');
    expect(url).not.toContain('fixture-token');
    expect(request.cache).toBe('no-store');
    expect(request.headers.Authorization).toBe('Bearer fixture-token');
  });
  it('publica só os campos da revisão, sem reenviar o corpo do artigo', async () => {
    setAuthToken('fixture-token');
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 42, isDraft: false })));
    vi.stubGlobal('fetch', fetch);
    const review = { sourceReferences: 'Fonte', reviewedBy: 'Editor', factChecked: true, rightsCleared: true, sensitiveContentReviewed: true };
    await publishReviewedArticle('42', review);
    expect(fetch.mock.calls[0][0]).toContain('/articles/42/publish');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(review);
  });
  it('encerra sessão em 401, preserva em 403 e informa falha', async () => {
    setAuthToken('fixture-token');
    const fetch = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 403 })).mockResolvedValueOnce(new Response('{}', { status: 401 }));
    vi.stubGlobal('fetch', fetch);
    await expect(fetchArticlePreview('42')).rejects.toThrow('permissão');
    expect(getAuthToken()).toBe('fixture-token');
    await expect(fetchArticlePreview('42')).rejects.toThrow('expirou');
    expect(getAuthToken()).toBe('');
  });
});
