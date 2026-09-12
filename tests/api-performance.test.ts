import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAdminArticles, fetchArticles, fetchArticleBySlug, getAuthToken, setAuthToken } from '../src/api';

describe('requisições públicas e administrativas', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    localStorage.clear();
    setAuthToken('token-de-teste');
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

  it('pede resumos públicos sem headers que provocam preflight ou expõem sessão', async () => {
    fetchMock.mockResolvedValue(new Response('[]', { headers: { 'Content-Type': 'application/json' } }));
    await fetchArticles();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('summary=true');
    expect(options.headers.get('Authorization')).toBeNull();
    expect(options.headers.get('Content-Type')).toBeNull();
  });

  it('mantém JWT na lista administrativa e não trata resumos como detalhe', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(new Response('[]', { headers: { 'Content-Type': 'application/json' } })));
    await fetchAdminArticles();
    expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer token-de-teste');
    await fetchArticleBySlug('titulo com espaço');
    expect(fetchMock.mock.calls[1][0]).toContain('titulo%20com%20espa%C3%A7o');
    expect(fetchMock.mock.calls[1][0]).not.toContain('summary=true');
  });

  it('não encerra uma sessão válida por falta de permissão (403)', async () => {
    fetchMock.mockResolvedValue(new Response('Sem permissão', { status: 403 }));
    await expect(fetchAdminArticles()).rejects.toThrow('Sem permissão');
    expect(getAuthToken()).toBe('token-de-teste');
  });

  it('percorre todas as páginas administrativas respeitando o limite de 100', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ content: [{ id: 1 }], totalPages: 2 }), { headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: [{ id: 2 }], totalPages: 2 }), { headers: { 'Content-Type': 'application/json' } }));
    expect((await fetchAdminArticles()).map(article => article.id)).toEqual(['1', '2']);
    expect(fetchMock.mock.calls[1][0]).toContain('page=1&size=100');
    expect(fetchMock.mock.calls[1][1].cache).toBe('no-store');
  });

  it('encerra sessão expirada apenas em chamadas autenticadas', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(new Response('Expirado', { status: 401 })));
    await expect(fetchArticles()).rejects.toThrow();
    expect(getAuthToken()).toBe('token-de-teste');
    await expect(fetchAdminArticles()).rejects.toThrow();
    expect(getAuthToken()).toBe('');
  });
});
