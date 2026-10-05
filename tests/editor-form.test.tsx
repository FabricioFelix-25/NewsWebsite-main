import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import ArticleForm from '../src/components/admin/ArticleForm';
import { fetchAuthors, searchEditorialImages } from '../src/api';
import { Article, Author } from '../src/types';

vi.mock('../src/api', () => ({ fetchAuthors: vi.fn(), uploadImage: vi.fn(), searchEditorialImages: vi.fn() }));
vi.mock('../src/components/admin/RichTextEditor', () => ({ default: () => <div>Editor isolado</div> }));
afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

it('preserva a edição digitada enquanto a lista de autores ainda está carregando', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  let resolveAuthors!: (authors: Author[]) => void;
  vi.mocked(fetchAuthors).mockReturnValue(new Promise(resolve => { resolveAuthors = resolve; }));
  const article: Article = { id: '42', title: 'Título inicial', slug: 'titulo', content: '<p>Texto</p>', excerpt: 'Resumo', imageUrl: '', authorId: '1', category: 'tech', publishedAt: '', updatedAt: '', isDraft: true, featured: false };
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => { root.render(<MemoryRouter><ArticleForm article={article} onSave={vi.fn()} onPreview={vi.fn()} /></MemoryRouter>); });
    const input = container.querySelector<HTMLInputElement>('#title')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Texto que o editor acabou de digitar');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(input.value).toBe('Texto que o editor acabou de digitar');
    await act(async () => { resolveAuthors([{ id: '1', name: 'Editor', email: 'editor@example.test', avatarUrl: '' }]); });
    expect(input.value).toBe('Texto que o editor acabou de digitar');
    expect(container.querySelector<HTMLSelectElement>('#authorId')?.value).toBe('1');
  } finally { await act(async () => root.unmount()); container.remove(); }
});

it('prepara capa e SEO com créditos mantendo rascunho sem revisão automática', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.mocked(fetchAuthors).mockResolvedValue([]);
  vi.mocked(searchEditorialImages).mockResolvedValue({ subject: 'Produto', images: [{ url: 'https://thumb.wikimedia.org/photo.jpg', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Photo.jpg', title: 'Produto', description: 'Foto de arquivo', credit: 'Autora', license: 'CC BY 4.0', width: 1280, height: 900 }] });
  const article: Article = { id: '42', title: 'Título inicial', slug: 'titulo', content: '<p>Texto completo do editor.</p>', excerpt: 'Resumo manual', imageUrl: '', authorId: '1', category: 'tech', publishedAt: '', updatedAt: '', isDraft: true, featured: false };
  const onPreview = vi.fn();
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
  try {
    await act(async () => { root.render(<MemoryRouter><ArticleForm article={article} onSave={vi.fn()} onPreview={onPreview} /></MemoryRouter>); });
    await act(async () => { [...container.querySelectorAll('button')].find(button => button.textContent === 'Preparar matéria e fotos')!.click(); });
    await act(async () => { [...container.querySelectorAll('button')].find(button => button.textContent?.includes('Pre-visualizar'))!.click(); });
    const draft = onPreview.mock.calls[0][0];
    expect(draft.imageUrl).toContain('photo.jpg'); expect(draft.seoImage).toBe(draft.imageUrl);
    expect(draft.content).toContain('Texto completo do editor.'); expect(draft.content).toContain('Crédito: Autora');
    expect(draft.excerpt).toBe('Resumo manual'); expect(draft.rightsCleared).toBe(false);
  } finally { await act(async () => root.unmount()); container.remove(); }
});

it('resposta atrasada de fotos não sobrescreve edição feita durante a busca', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.mocked(fetchAuthors).mockResolvedValue([]);
  let resolveImages!: (value: Awaited<ReturnType<typeof searchEditorialImages>>) => void;
  vi.mocked(searchEditorialImages).mockReturnValue(new Promise(resolve => { resolveImages = resolve; }));
  const article: Article = { id: '42', title: 'Título inicial', slug: 'titulo', content: '<p>Texto</p>', excerpt: 'Resumo', imageUrl: '', authorId: '1', category: 'tech', publishedAt: '', updatedAt: '', isDraft: true, featured: false };
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
  try {
    await act(async () => { root.render(<MemoryRouter><ArticleForm article={article} onSave={vi.fn()} onPreview={vi.fn()} /></MemoryRouter>); });
    await act(async () => { [...container.querySelectorAll('button')].find(button => button.textContent === 'Preparar matéria e fotos')!.click(); });
    await act(async () => { const input = container.querySelector<HTMLInputElement>('#title')!; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Título editado'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    await act(async () => { resolveImages({ subject: 'Produto', images: [{ url: 'https://thumb.wikimedia.org/photo.jpg', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Photo.jpg', title: 'Produto', description: 'Foto', credit: 'Autora', license: 'CC BY 4.0', width: 1280, height: 900 }] }); });
    expect(container.querySelector<HTMLInputElement>('#title')?.value).toBe('Título editado');
    expect(container.querySelector<HTMLInputElement>('#imageUrl')?.value).toBe('');
  } finally { await act(async () => root.unmount()); container.remove(); }
});
