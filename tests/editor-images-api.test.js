// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ generate: vi.fn(), collect: vi.fn() }));
vi.mock('@google/genai', () => ({ GoogleGenAI: function () { return { models: { generateContent: mocks.generate } }; } }));
vi.mock('../server/lib/images.js', () => ({ collectArticleImages: mocks.collect }));
import handler from '../api/editor-images.js';

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
function response() { return { code: 0, body: null, setHeader: vi.fn(), status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
const request = (body = {}) => ({ method: 'POST', headers: { authorization: 'Bearer offline' }, body: { title: 'Produto novo', content: '<p>Texto revisado</p>', ...body } });

describe('busca editorial protegida', () => {
  it('trata indisponibilidade da autenticação sem acusar sessão expirada e limita tags', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('', { status: 502 }))
      .mockResolvedValueOnce(Response.json({ id: 15, role: 'EDITOR' })));
    const unavailable = response(); await handler(request(), unavailable); expect(unavailable.code).toBe(503);
    const invalid = response(); await handler(request({ tags: ['x'.repeat(101)] }), invalid); expect(invalid.code).toBe(400);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('recusa visitante antes de qualquer busca ou uso de IA', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const res = response(); await handler({ method: 'POST', headers: {} }, res);
    expect(res.code).toBe(401); expect(fetch).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('recusa token expirado e autores', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('', { status: 401 })).mockResolvedValueOnce(Response.json({ id: 1, role: 'AUTHOR' })));
    const expired = response(); await handler(request(), expired); expect(expired.code).toBe(401);
    const author = response(); await handler(request(), author); expect(author.code).toBe(403);
    expect(mocks.collect).not.toHaveBeenCalled();
  });
  it('extrai entidade para editor e retorna fotos verificadas, sem salvar artigo', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ id: 10, role: 'EDITOR' })); vi.stubGlobal('fetch', fetch);
    mocks.generate.mockResolvedValue({ text: JSON.stringify({ subject: 'Surface Pro 11', query: 'Surface Pro 11', allowStock: false }) });
    mocks.collect.mockResolvedValue([{ url: 'https://thumb.wikimedia.org/photo.jpg', credit: 'Autora', license: 'CC BY 4.0' }]);
    const res = response(); await handler(request(), res);
    expect(res.code).toBe(200); expect(res.body.images).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(1); expect(fetch.mock.calls[0][0]).toMatch(/\/auth\/me$/);
    expect(mocks.collect).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Surface Pro 11' }), expect.objectContaining({ count: 4, article: expect.objectContaining({ title: 'Produto novo' }), ai: expect.any(Object) }));
  });
  it('busca manual dispensa IA e limita requisições repetidas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => Response.json({ id: 11, role: 'ADMIN' })));
    mocks.collect.mockResolvedValue([]);
    const first = response(); await handler(request({ query: 'Alexandre de Moraes' }), first); expect(first.code).toBe(200);
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.collect).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Alexandre de Moraes' }), expect.objectContaining({ article: expect.objectContaining({ title: 'Produto novo' }), ai: expect.any(Object) }));
    const second = response(); await handler(request({ query: 'Alexandre de Moraes' }), second); expect(second.code).toBe(429);
  });
  it('limita corpo inválido e não revela detalhes de falhas externas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(Response.json({ id: 12, role: 'ADMIN' })).mockRejectedValueOnce(new Error('secret-token')));
    const invalid = response(); await handler(request({ query: 'x'.repeat(181) }), invalid); expect(invalid.code).toBe(400);
    const failed = response(); await handler(request(), failed); expect(failed.code).toBe(503); expect(JSON.stringify(failed.body)).not.toContain('secret-token');
  });
});
