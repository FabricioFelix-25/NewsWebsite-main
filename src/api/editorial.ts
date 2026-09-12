import { buildApiUrl, clearAuthToken, getAuthToken, normalizeArticle } from './index';
import { Article } from '../types';

export type PublicationReview = Pick<Article, 'sourceReferences' | 'reviewedBy' | 'factChecked' | 'rightsCleared' | 'sensitiveContentReviewed'>;

async function editorialRequest(path: string, options: RequestInit = {}): Promise<Article> {
  const token = getAuthToken();
  if (!token) throw new Error('Entre na sua conta para revisar esta matéria.');
  const response = await fetch(buildApiUrl(path), {
    ...options,
    cache: 'no-store',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
  });
  if (response.status === 401) {
    clearAuthToken();
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:logout'));
    throw new Error('Sua sessão expirou. Entre novamente.');
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || (response.status === 404 ? 'Matéria não encontrada ou removida.' : response.status === 403 ? 'Você não tem permissão para revisar esta matéria.' : 'Não foi possível carregar ou salvar a matéria. Tente novamente.'));
  }
  return normalizeArticle(payload);
}

export function fetchArticlePreview(id: string, signal?: AbortSignal) {
  return editorialRequest(`/articles/admin/${encodeURIComponent(id)}/preview`, { signal });
}

export function publishReviewedArticle(id: string, review: PublicationReview) {
  return editorialRequest(`/articles/${encodeURIComponent(id)}/publish`, { method: 'POST', body: JSON.stringify(review) });
}
