import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Article } from '../types';
import * as api from '../api';

interface NewsContextType {
  getCachedHomeData: () => { featured: Article[]; latest: Article[] } | null;
  getFeaturedArticles: (forceRefresh?: boolean) => Promise<Article[]>;
  getLatestArticles: (limit?: number, forceRefresh?: boolean) => Promise<Article[]>;
  getArticlesByCategory: (category: string, limit?: number) => Promise<Article[]>;
  getArticleById: (id: string) => Promise<Article>;
  getArticleBySlug: (slug: string) => Promise<Article>;
  getAllArticles: (forceRefresh?: boolean) => Promise<Article[]>;
  getRelatedArticles: (articleId: string, category: string, limit?: number) => Promise<Article[]>;
  createArticle: (article: Partial<Article>) => Promise<Article>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<Article>;
  deleteArticle: (id: string) => Promise<void>;
  searchArticles: (query: string, tag?: string) => Promise<Article[]>;
  getCategories: () => Promise<string[]>;
  getAuthors: () => Promise<string[]>;
  clearCache: () => void;
  getStats: () => Promise<{
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    categories: number;
    recentViews: number;
  }>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

interface NewsProviderProps {
  children: ReactNode;
}

const byNewestDate = (a: Article, b: Article) => {
  const dateA = new Date(a.updatedAt || a.publishedAt).getTime();
  const dateB = new Date(b.updatedAt || b.publishedAt).getTime();
  return dateB - dateA;
};

const CACHE_TTL_MS = 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

// A mesma promessa atende componentes concorrentes e o segundo effect do StrictMode.
// Os detalhes têm chaves próprias: resumos das listas nunca substituem o corpo da matéria.
function createNewsService(): NewsContextType {
  const cache = new Map<string, { data: unknown; timestamp: number }>();
  const pending = new Map<string, Promise<unknown>>();
  let generation = 0;

  const peek = <T,>(key: string): T | null => {
    const entry = cache.get(key);
    return entry && Date.now() - entry.timestamp < CACHE_TTL_MS ? entry.data as T : null;
  };

  const read = <T,>(key: string, fetcher: () => Promise<T>, forceRefresh = false): Promise<T> => {
    const cached = peek<T>(key);
    if (!forceRefresh && cached !== null) return Promise.resolve(cached);
    const existing = pending.get(key);
    if (existing) return existing as Promise<T>;

    const requestGeneration = generation;
    const request = fetcher().then((data) => {
      if (generation === requestGeneration) {
        cache.delete(key);
        cache.set(key, { data, timestamp: Date.now() });
        if (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value!);
      }
      return data;
    }).finally(() => {
      if (pending.get(key) === request) pending.delete(key);
    });
    pending.set(key, request);
    return request;
  };

  const clearCache = () => {
    generation += 1;
    cache.clear();
    pending.clear();
  };

  const getFeaturedArticles = async (forceRefresh = false): Promise<Article[]> => {
    return read('featured', async () => (await api.fetchFeaturedArticles()).filter(article => !article.isDraft), forceRefresh);
  };

  const getAllPublished = async (forceRefresh = false): Promise<Article[]> => {
    return read('published', async () => (await api.fetchArticles()).filter(article => !article.isDraft).sort(byNewestDate), forceRefresh);
  };

  const getLatestArticles = async (limit = 10, forceRefresh = false): Promise<Article[]> => {
    const published = await getAllPublished(forceRefresh);
    return published.slice(0, limit);
  };

  const getArticlesByCategory = async (category: string, limit = 100): Promise<Article[]> => {
    const articles = await read(`category:${category}`, async () =>
      (await api.fetchArticlesByCategory(category)).filter(article => !article.isDraft).sort(byNewestDate));
    return articles.slice(0, limit);
  };

  const getArticleById = async (id: string): Promise<Article> => {
    return api.fetchArticleById(id);
  };

  const getArticleBySlug = async (slug: string): Promise<Article> => {
    return read(`detail:${slug}`, () => api.fetchArticleBySlug(slug));
  };

  const getAllArticles = async (): Promise<Article[]> => {
    // Dados administrativos nunca entram no cache público nem silenciam falhas de autorização.
    return (await api.fetchAdminArticles()).sort(byNewestDate);
  };

  const getRelatedArticles = async (articleId: string, category: string, limit = 3): Promise<Article[]> => {
    const articles = await getArticlesByCategory(category);
    return articles.filter(article => article.id !== articleId).slice(0, limit);
  };

  const createArticle = async (article: Partial<Article>): Promise<Article> => {
    const result = await api.createArticle(article);
    clearCache();
    return result;
  };

  const updateArticle = async (id: string, article: Partial<Article>): Promise<Article> => {
    const result = await api.updateArticle(id, article);
    clearCache();
    return result;
  };

  const deleteArticle = async (id: string): Promise<void> => {
    await api.deleteArticle(id);
    clearCache();
  };

  const searchArticles = async (query: string, tag?: string): Promise<Article[]> => {
    return read(`search:${JSON.stringify([query, tag || ''])}`, async () =>
      (await api.searchArticles(query, tag)).filter(article => !article.isDraft));
  };

  const getCategories = async (): Promise<string[]> => {
    return read('categories', api.fetchCategories);
  };

  const getAuthors = async (): Promise<string[]> => {
    return read('authors', async () => (await api.fetchAuthors()).map(author => author.name));
  };

  const getStats = async () => {
    try {
      return await api.fetchStats();
    } catch {
      const articles = await getAllArticles();
      return {
        totalArticles: articles.length,
        publishedArticles: articles.filter((article) => !article.isDraft).length,
        draftArticles: articles.filter((article) => article.isDraft).length,
        categories: new Set(articles.map((article) => article.category)).size,
        recentViews: articles.reduce((sum, article) => sum + (article.viewCount || article.views || 0), 0),
      };
    }
  };

  return {
    getCachedHomeData: () => {
      const latest = peek<Article[]>('published');
      const featured = peek<Article[]>('featured');
      return latest ? { latest, featured: featured || latest.slice(0, 3) } : null;
    },
    getFeaturedArticles,
    getLatestArticles,
    getArticlesByCategory,
    getArticleById,
    getArticleBySlug,
    getAllArticles,
    getRelatedArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    searchArticles,
    getCategories,
    getAuthors,
    clearCache,
    getStats,
  };
}

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const service = useMemo(createNewsService, []);
  return <NewsContext.Provider value={service}>{children}</NewsContext.Provider>;
};
