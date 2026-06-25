import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Cpu,
  Globe2,
  Code,
  Gamepad2,
  Flame,
  BarChart3,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import ArticleGrid from '../components/ArticleGrid';
import ArticleFilter from '../components/ArticleFilter';
import { Article } from '../types';
import {
  CATEGORY_GROUPS,
  getCategoryLabel,
  getGroupForCategory,
  getSectionFromCategory,
} from '../utils/categoryColors';

const byNewestDate = (a: Article, b: Article) => {
  const dateA = new Date(a.updatedAt || a.publishedAt).getTime();
  const dateB = new Date(b.updatedAt || b.publishedAt).getTime();
  return dateB - dateA;
};

const groupDescriptions: Record<string, string> = {
  tech: 'Inovacao, IA e novos produtos para entender para onde a tecnologia esta indo.',
  geopolitics: 'Analises sobre economia global, conflitos e os movimentos que moldam o mundo.',
  programming: 'Tendencias de desenvolvimento, arquitetura, linguagens e boas praticas para devs.',
  games: 'Cobertura completa de consoles, PC e games mobile.',
  trending: 'Assuntos quentes do momento para voce nao perder o que esta em alta.',
};

const groupHighlights: Record<string, string[]> = {
  tech: ['IA aplicada', 'Gadgets', 'Internet'],
  geopolitics: ['Mercado global', 'Conflitos', 'Diplomacia'],
  programming: ['Web', 'Mobile', 'DevOps'],
  games: ['Consoles', 'PC', 'Games mobile'],
  trending: ['Noticias do mundo', 'Entretenimento', 'Estilo de vida'],
};

const sectionToIcon: Record<string, LucideIcon> = {
  tech: Cpu,
  geo: Globe2,
  prog: Code,
  games: Gamepad2,
  default: Flame,
};

function dedupeArticles(articles: Article[]): Article[] {
  const unique = new Map<string, Article>();
  articles.forEach((article) => {
    unique.set(article.id, article);
  });
  return [...unique.values()].sort(byNewestDate);
}

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { getArticlesByCategory, getAuthors } = useNews();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const resolvedGroup = useMemo(
    () => (categorySlug ? getGroupForCategory(categorySlug) : null),
    [categorySlug]
  );

  const isGroupPage = useMemo(
    () => Boolean(categorySlug && resolvedGroup && resolvedGroup === categorySlug),
    [categorySlug, resolvedGroup]
  );

  const pageTitle = useMemo(
    () => (categorySlug ? getCategoryLabel(categorySlug) : ''),
    [categorySlug]
  );

  const pageDescription = useMemo(() => {
    if (resolvedGroup && groupDescriptions[resolvedGroup]) {
      return groupDescriptions[resolvedGroup];
    }
    if (categorySlug) {
      return `Ultimas publicacoes em ${getCategoryLabel(categorySlug).toLowerCase()}.`;
    }
    return '';
  }, [categorySlug, resolvedGroup]);

  const sectionKey = useMemo(() => {
    const referenceCategory = resolvedGroup || categorySlug || '';
    return getSectionFromCategory(referenceCategory);
  }, [categorySlug, resolvedGroup]);

  const HeaderIcon = sectionToIcon[sectionKey] || sectionToIcon.default;

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categorySlug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const categoriesToLoad =
          isGroupPage && resolvedGroup ? CATEGORY_GROUPS[resolvedGroup] : [categorySlug];

        const fetchedGroups = await Promise.all(
          categoriesToLoad.map((category) => getArticlesByCategory(category))
        );

        const mergedArticles = dedupeArticles(fetchedGroups.flat());
        const authorsList = await getAuthors();

        setAllArticles(mergedArticles);
        setArticles(mergedArticles);
        setAuthors(authorsList);
        setFilterCategories(categoriesToLoad);
      } catch (error) {
        console.error('Erro ao buscar artigos da categoria:', error);
        setAllArticles([]);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug, getArticlesByCategory, getAuthors, isGroupPage, resolvedGroup]);

  const handleFilter = (filters: { category?: string; author?: string; date?: string }) => {
    let filtered = [...allArticles];

    if (filters.category) {
      filtered = filtered.filter((article) => article.category === filters.category);
    }

    if (filters.author) {
      filtered = filtered.filter((article) => article.author?.name === filters.author);
    }

    if (filters.date) {
      const now = new Date();
      const fromDate = new Date();

      if (filters.date === 'today') {
        fromDate.setHours(0, 0, 0, 0);
      } else if (filters.date === 'week') {
        fromDate.setDate(now.getDate() - 7);
      } else if (filters.date === 'month') {
        fromDate.setMonth(now.getMonth() - 1);
      } else if (filters.date === 'year') {
        fromDate.setFullYear(now.getFullYear() - 1);
      }

      filtered = filtered.filter((article) => new Date(article.publishedAt) >= fromDate);
    }

    setArticles(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-800"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 text-center">
        <div className="flex justify-center items-center gap-3 mb-3">
          <HeaderIcon className="h-9 w-9" style={{ color: 'rgb(var(--section-primary))' }} />
          <h1 className="text-4xl md:text-5xl font-bold">{pageTitle}</h1>
          <Sparkles className="h-9 w-9" style={{ color: 'rgb(var(--section-primary))' }} />
        </div>
        <p className="text-neutral-600 text-lg max-w-3xl mx-auto">{pageDescription}</p>
        {resolvedGroup && groupHighlights[resolvedGroup] && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {groupHighlights[resolvedGroup].map((item) => (
              <span
                key={item}
                className="px-3 py-1 text-sm rounded-full border"
                style={{
                  borderColor: 'rgb(var(--section-primary) / 0.35)',
                  color: 'rgb(var(--section-primary))',
                  backgroundColor: 'rgb(var(--section-primary) / 0.08)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </header>

      <ArticleFilter categories={filterCategories} authors={authors} onFilter={handleFilter} />

      {articles.length > 0 ? (
        <ArticleGrid articles={articles} />
      ) : (
        <div className="py-12 text-center">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 text-neutral-400" />
          <p className="text-neutral-600">Nenhum artigo encontrado para este filtro.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
