import React, { createContext, useContext, ReactNode, useRef } from 'react';
import { Article } from '../types';
import * as api from '../api';

interface NewsContextType {
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

const CACHE_TTL_MS = 60 * 1000; // 1 minuto de cache em memória

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const articlesCacheRef = useRef<{ data: Article[]; timestamp: number } | null>(null);
  const featuredCacheRef = useRef<{ data: Article[]; timestamp: number } | null>(null);
  const articleSlugCacheRef = useRef<Map<string, { data: Article; timestamp: number }>>(new Map());

  const clearCache = () => {
    articlesCacheRef.current = null;
    featuredCacheRef.current = null;
    articleSlugCacheRef.current.clear();
  };

  const getFeaturedArticles = async (forceRefresh = false): Promise<Article[]> => {
    const now = Date.now();
    if (!forceRefresh && featuredCacheRef.current && now - featuredCacheRef.current.timestamp < CACHE_TTL_MS) {
      return featuredCacheRef.current.data;
    }

    try {
      const articles = await api.fetchFeaturedArticles();
      featuredCacheRef.current = { data: articles, timestamp: now };
      return articles;
    } catch (err) {
      if (featuredCacheRef.current) return featuredCacheRef.current.data;
      throw err;
    }
  };

  const getAllPublished = async (forceRefresh = false): Promise<Article[]> => {
    const now = Date.now();
    if (!forceRefresh && articlesCacheRef.current && now - articlesCacheRef.current.timestamp < CACHE_TTL_MS) {
      return articlesCacheRef.current.data;
    }

    try {
      const articles = await api.fetchArticles();
      const published = articles.filter((article) => !article.isDraft).sort(byNewestDate);
      articlesCacheRef.current = { data: published, timestamp: now };
      return published;
    } catch (err) {
      if (articlesCacheRef.current) return articlesCacheRef.current.data;
      throw err;
    }
  };

  const getLatestArticles = async (limit = 10, forceRefresh = false): Promise<Article[]> => {
    const published = await getAllPublished(forceRefresh);
    return published.slice(0, limit);
  };

  const getArticlesByCategory = async (category: string, limit = 100): Promise<Article[]> => {
    // Se temos os artigos em cache, filtramos em memória instantaneamente (0ms)
    if (articlesCacheRef.current && Date.now() - articlesCacheRef.current.timestamp < CACHE_TTL_MS) {
      return articlesCacheRef.current.data
        .filter((article) => article.category === category)
        .slice(0, limit);
    }

    const articles = await api.fetchArticlesByCategory(category);
    return articles
      .filter((article) => !article.isDraft)
      .slice(0, limit);
  };

  const getArticleById = async (id: string): Promise<Article> => {
    return api.fetchArticleById(id);
  };

  const getArticleBySlug = async (slug: string): Promise<Article> => {
    const now = Date.now();
    const cached = articleSlugCacheRef.current.get(slug);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const article = await api.fetchArticleBySlug(slug);
    articleSlugCacheRef.current.set(slug, { data: article, timestamp: now });
    return article;
  };

  const getAllArticles = async (forceRefresh = false): Promise<Article[]> => {
    try {
      const articles = await api.fetchAdminArticles();
      return articles.sort(byNewestDate);
    } catch {
      return getAllPublished(forceRefresh);
    }
  };

  const getRelatedArticles = async (articleId: string, category: string, limit = 3): Promise<Article[]> => {
    // Tenta primeiro em memória
    if (articlesCacheRef.current) {
      return articlesCacheRef.current.data
        .filter((article) => article.category === category && article.id !== articleId)
        .slice(0, limit);
    }

    const articles = await api.fetchArticlesByCategory(category);
    return articles
      .filter((article) => article.id !== articleId && !article.isDraft)
      .slice(0, limit);
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
    return api.searchArticles(query, tag);
  };

  const getCategories = async (): Promise<string[]> => {
    return api.fetchCategories();
  };

  const getAuthors = async (): Promise<string[]> => {
    const authors = await api.fetchAuthors();
    return authors.map((author) => author.name);
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

  return (
    <NewsContext.Provider
      value={{
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
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};