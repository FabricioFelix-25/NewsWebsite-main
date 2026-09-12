import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsProvider, useNews } from '../src/contexts/NewsContext';
import * as api from '../src/api';
import { Article } from '../src/types';

vi.mock('../src/api', () => ({
  fetchArticles: vi.fn(), fetchFeaturedArticles: vi.fn(), fetchArticlesByCategory: vi.fn(),
  fetchArticleBySlug: vi.fn(), fetchAdminArticles: vi.fn(), updateArticle: vi.fn(),
}));

const article = (id: string, fields: Partial<Article> = {}): Article => ({
  id, slug: `noticia-${id}`, title: `Notícia ${id}`, excerpt: 'Resumo', content: '',
  category: 'tech', imageUrl: '', authorId: '1', publishedAt: '2026-09-11T12:00:00Z',
  updatedAt: '2026-09-11T12:00:00Z', featured: false, isDraft: false, ...fields,
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

describe('cache público de notícias', () => {
  let root: Root;
  let service: ReturnType<typeof useNews>;
  function Probe() { service = useNews(); return null; }
  const render = () => act(async () => { root.render(<NewsProvider><Probe /></NewsProvider>); });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    root = createRoot(document.createElement('div'));
    await render();
  });
  afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });

  it('compartilha requisições concorrentes e exclui rascunhos do snapshot da home', async () => {
    const response = deferred<Article[]>();
    vi.mocked(api.fetchArticles).mockReturnValue(response.promise);
    const first = service.getLatestArticles();
    const second = service.getLatestArticles();
    expect(api.fetchArticles).toHaveBeenCalledTimes(1);
    response.resolve([article('publica'), article('privada', { isDraft: true })]);
    expect(await first).toEqual([article('publica')]);
    expect(await second).toEqual([article('publica')]);
    expect(service.getCachedHomeData()?.latest).toEqual([article('publica')]);
    await service.getLatestArticles();
    expect(api.fetchArticles).toHaveBeenCalledTimes(1);
  });

  it('busca o corpo completo mesmo quando já existe um resumo na home', async () => {
    vi.mocked(api.fetchArticles).mockResolvedValue([article('1')]);
    vi.mocked(api.fetchArticleBySlug).mockResolvedValue(article('1', { content: '<p>Texto completo</p>' }));
    await service.getLatestArticles();
    expect((await service.getArticleBySlug('noticia-1')).content).toBe('<p>Texto completo</p>');
    await service.getArticleBySlug('noticia-1');
    expect(api.fetchArticleBySlug).toHaveBeenCalledTimes(1);
  });

  it('não confunde a primeira página geral com todos os artigos de uma categoria', async () => {
    vi.mocked(api.fetchArticles).mockResolvedValue([article('recente')]);
    vi.mocked(api.fetchArticlesByCategory).mockResolvedValue([article('recente'), article('antiga')]);
    await service.getLatestArticles();
    expect((await service.getArticlesByCategory('tech')).map(item => item.id)).toEqual(['recente', 'antiga']);
    await service.getArticlesByCategory('tech');
    expect(api.fetchArticlesByCategory).toHaveBeenCalledTimes(1);
  });

  it('impede que resposta anterior a uma publicação repovoe o cache invalidado', async () => {
    const oldResponse = deferred<Article[]>();
    const newResponse = deferred<Article[]>();
    vi.mocked(api.fetchArticles).mockReturnValueOnce(oldResponse.promise).mockReturnValueOnce(newResponse.promise);
    const oldRead = service.getLatestArticles();
    service.clearCache();
    const newRead = service.getLatestArticles();
    newResponse.resolve([article('nova')]);
    await newRead;
    oldResponse.resolve([article('antiga')]);
    await oldRead;
    expect((await service.getLatestArticles()).map(item => item.id)).toEqual(['nova']);
    expect(api.fetchArticles).toHaveBeenCalledTimes(2);
  });

  it('permite nova tentativa depois de uma falha de rede', async () => {
    vi.mocked(api.fetchArticles).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce([article('1')]);
    await expect(service.getLatestArticles()).rejects.toThrow('Offline');
    expect(await service.getLatestArticles()).toEqual([article('1')]);
    expect(api.fetchArticles).toHaveBeenCalledTimes(2);
  });

  it('preserva funções entre renders e mantém erros administrativos visíveis', async () => {
    const initialService = service;
    await render();
    expect(service).toBe(initialService);
    vi.mocked(api.fetchAdminArticles).mockRejectedValue(new Error('Sem permissão'));
    await expect(service.getAllArticles()).rejects.toThrow('Sem permissão');
    expect(api.fetchArticles).not.toHaveBeenCalled();
  });
});
