import { Article, Author } from '../types';

const DEFAULT_API_BASE_URL = 'http://localhost:9090/api';
const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function getAuthToken(): string {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '';
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function resolveAssetUrl(url?: string): string {
  if (!url) {
    return '';
  }

  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_ORIGIN}${normalizedPath}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function getErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as Record<string, unknown>;

    if (typeof objectPayload.message === 'string') {
      return objectPayload.message;
    }

    const firstValue = Object.values(objectPayload)[0];
    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return `Erro HTTP ${status}`;
}

async function handleFetch(path: string, options?: RequestInit): Promise<unknown> {
  try {
    const hasFormData = options?.body instanceof FormData;
    const token = getAuthToken();
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(buildApiUrl(path), {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(hasFormData ? {} : { 'Content-Type': 'application/json' }),
        ...authHeader,
        ...options?.headers,
      },
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearAuthToken();
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
      }
      throw new Error(getErrorMessage(payload, response.status));
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Nao foi possivel conectar ao backend em ${API_BASE_URL}. Verifique se o Spring esta rodando.`
      );
    }

    throw error;
  }
}

function normalizeAuthor(raw: unknown): Author {
  const author = (raw || {}) as Record<string, unknown>;
  return {
    id: String(author.id ?? ''),
    name: String(author.name ?? ''),
    email: String(author.email ?? ''),
    bio: typeof author.bio === 'string' ? author.bio : '',
    avatarUrl: resolveAssetUrl(typeof author.avatarUrl === 'string' ? author.avatarUrl : ''),
  };
}

function normalizeArticle(raw: unknown): Article {
  const article = (raw || {}) as Record<string, unknown>;
  const author = article.author ? normalizeAuthor(article.author) : undefined;

  const tagValues = Array.isArray(article.tags)
    ? article.tags.map((tag) => String(tag)).filter(Boolean)
    : [];

  const publishedAtRaw =
    typeof article.publishedAt === 'string'
      ? article.publishedAt
      : typeof article.updatedAt === 'string'
        ? article.updatedAt
        : new Date().toISOString();

  const updatedAtRaw =
    typeof article.updatedAt === 'string' ? article.updatedAt : publishedAtRaw;

  const viewCount =
    typeof article.viewCount === 'number'
      ? article.viewCount
      : typeof article.views === 'number'
        ? article.views
        : 0;

  return {
    id: String(article.id ?? ''),
    slug: String(article.slug ?? ''),
    title: String(article.title ?? ''),
    subtitle: typeof article.subtitle === 'string' ? article.subtitle : '',
    content: String(article.content ?? ''),
    excerpt: String(article.excerpt ?? ''),
    imageUrl: resolveAssetUrl(typeof article.imageUrl === 'string' ? article.imageUrl : ''),
    category: String(article.category ?? ''),
    tags: tagValues,
    authorId: String(article.authorId ?? author?.id ?? ''),
    author,
    publishedAt: publishedAtRaw,
    updatedAt: updatedAtRaw,
    featured: Boolean(article.featured),
    isDraft: Boolean(article.isDraft),
    seoTitle: typeof article.seoTitle === 'string' ? article.seoTitle : '',
    seoDescription: typeof article.seoDescription === 'string' ? article.seoDescription : '',
    seoImage: resolveAssetUrl(typeof article.seoImage === 'string' ? article.seoImage : ''),
    aiAssisted: Boolean(article.aiAssisted),
    sourceReferences: typeof article.sourceReferences === 'string' ? article.sourceReferences : '',
    reviewedBy: typeof article.reviewedBy === 'string' ? article.reviewedBy : '',
    factChecked: Boolean(article.factChecked),
    rightsCleared: Boolean(article.rightsCleared),
    sensitiveContentReviewed: Boolean(article.sensitiveContentReviewed),
    views: viewCount,
    viewCount,
  };
}

function toArticleRequest(article: Partial<Article>): Record<string, unknown> {
  const authorIdValue = Number(article.authorId ?? article.author?.id ?? 0);

  return {
    title: article.title?.trim() || '',
    subtitle: article.subtitle?.trim() || '',
    content: article.content || '',
    excerpt: article.excerpt?.trim() || '',
    imageUrl: article.imageUrl || '',
    category: article.category || 'tech',
    tags: article.tags || [],
    authorId: Number.isFinite(authorIdValue) ? authorIdValue : 0,
    featured: Boolean(article.featured),
    isDraft: article.isDraft ?? true,
    seoTitle: article.seoTitle?.trim() || '',
    seoDescription: article.seoDescription?.trim() || '',
    seoImage: article.seoImage?.trim() || '',
    aiAssisted: Boolean(article.aiAssisted),
    sourceReferences: article.sourceReferences?.trim() || '',
    reviewedBy: article.reviewedBy?.trim() || '',
    factChecked: Boolean(article.factChecked),
    rightsCleared: Boolean(article.rightsCleared),
    sensitiveContentReviewed: Boolean(article.sensitiveContentReviewed),
  };
}

function normalizeArticlePageResponse(payload: unknown): Article[] {
  if (payload && typeof payload === 'object' && Array.isArray((payload as { content?: unknown[] }).content)) {
    return ((payload as { content: unknown[] }).content || []).map(normalizeArticle);
  }

  if (Array.isArray(payload)) {
    return payload.map(normalizeArticle);
  }

  return [];
}

export async function trackArticleView(articleId: string): Promise<void> {
  try {
    await handleFetch(`/articles/${articleId}/view`, { method: 'POST' });
  } catch (error) {
    console.error('Error tracking view:', error);
  }
}

export async function getArticleViews(articleId: string): Promise<number> {
  try {
    const article = await fetchArticleById(articleId);
    return article.viewCount || article.views || 0;
  } catch (error) {
    console.error('Error getting views:', error);
    return 0;
  }
}

export async function fetchArticles(): Promise<Article[]> {
  const response = await handleFetch('/articles?page=0&size=100');
  return normalizeArticlePageResponse(response);
}

export async function fetchAdminArticles(): Promise<Article[]> {
  const response = await handleFetch('/articles/admin?page=0&size=300');
  return normalizeArticlePageResponse(response);
}

export async function fetchArticleById(id: string): Promise<Article> {
  const article = await handleFetch(`/articles/${id}`);
  return normalizeArticle(article);
}

export async function fetchArticleBySlug(slug: string): Promise<Article> {
  const article = await handleFetch(`/articles/slug/${slug}`);
  return normalizeArticle(article);
}

export async function fetchFeaturedArticles(): Promise<Article[]> {
  const response = await handleFetch('/articles/featured');
  return Array.isArray(response) ? response.map(normalizeArticle) : [];
}

export async function fetchArticlesByCategory(category: string): Promise<Article[]> {
  const response = await handleFetch(`/articles/category/${category}?page=0&size=100`);
  return normalizeArticlePageResponse(response);
}

export async function fetchArticlesByAuthor(authorId: string): Promise<Article[]> {
  const response = await handleFetch(`/articles/author/${authorId}?page=0&size=100`);
  return normalizeArticlePageResponse(response);
}

export async function searchArticles(query: string, tag?: string): Promise<Article[]> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (tag) params.append('tag', tag);

  const response = await handleFetch(`/articles/search?${params.toString()}`);
  return normalizeArticlePageResponse(response);
}

export async function createArticle(article: Partial<Article>): Promise<Article> {
  const created = await handleFetch('/articles', {
    method: 'POST',
    body: JSON.stringify(toArticleRequest(article)),
  });

  return normalizeArticle(created);
}

export async function updateArticle(id: string, article: Partial<Article>): Promise<Article> {
  const updated = await handleFetch(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toArticleRequest(article)),
  });

  return normalizeArticle(updated);
}

export async function deleteArticle(id: string): Promise<void> {
  await handleFetch(`/articles/${id}`, { method: 'DELETE' });
}

export async function fetchAuthors(): Promise<Author[]> {
  const authors = await handleFetch('/authors');
  return Array.isArray(authors) ? authors.map(normalizeAuthor) : [];
}

export async function createAuthor(author: Partial<Author>): Promise<Author> {
  const created = await handleFetch('/authors', {
    method: 'POST',
    body: JSON.stringify({
      name: author.name || '',
      email: author.email || '',
      bio: author.bio || '',
      avatarUrl: author.avatarUrl || '',
    }),
  });

  return normalizeAuthor(created);
}

export async function updateAuthor(id: string, author: Partial<Author>): Promise<Author> {
  const updated = await handleFetch(`/authors/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: author.name || '',
      email: author.email || '',
      bio: author.bio || '',
      avatarUrl: author.avatarUrl || '',
    }),
  });

  return normalizeAuthor(updated);
}

export async function deleteAuthor(id: string): Promise<void> {
  await handleFetch(`/authors/${id}`, { method: 'DELETE' });
}

export async function fetchCategories(): Promise<string[]> {
  const categories = await handleFetch('/articles/categories');
  return Array.isArray(categories) ? categories.map((category) => String(category)) : [];
}

export async function fetchStats(): Promise<{
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  categories: number;
  recentViews: number;
}> {
  const stats = (await handleFetch('/articles/stats')) as Record<string, unknown>;

  return {
    totalArticles: Number(stats.totalArticles ?? 0),
    publishedArticles: Number(stats.publishedArticles ?? 0),
    draftArticles: Number(stats.draftArticles ?? 0),
    categories: Number(stats.categories ?? 0),
    recentViews: Number(stats.recentViews ?? 0),
  };
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await handleFetch('/upload', {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  const data = (response || {}) as Record<string, unknown>;
  const url = typeof data.url === 'string' ? data.url : '';

  return resolveAssetUrl(url);
}
