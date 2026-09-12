import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import ArticleForm from '../src/components/admin/ArticleForm';
import { fetchAuthors } from '../src/api';
import { Article, Author } from '../src/types';

vi.mock('../src/api', () => ({ fetchAuthors: vi.fn(), uploadImage: vi.fn() }));
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
