import React, { useEffect, useMemo, useState } from 'react';
import { useNews } from '../contexts/NewsContext';
import FeaturedSlider from '../components/FeaturedSlider';
import ArticleGrid from '../components/ArticleGrid';
import { Article } from '../types';
import { CATEGORY_GROUPS } from '../utils/categoryColors';

const interests = [
  { label: 'Tudo', value: 'all' },
  { label: 'Tecnologia', value: 'tech' },
  { label: 'Geopolitica', value: 'geopolitics' },
  { label: 'Programacao', value: 'programming' },
  { label: 'IA', value: 'ai' },
  { label: 'Games', value: 'games' },
];

const HomePage: React.FC = () => {
  const { getFeaturedArticles, getLatestArticles, getArticlesByCategory } = useNews();
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [techArticles, setTechArticles] = useState<Article[]>([]);
  const [geopoliticsArticles, setGeopoliticsArticles] = useState<Article[]>([]);
  const [programmingArticles, setProgrammingArticles] = useState<Article[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadCategoryGroup = async (groupKey: 'tech' | 'geopolitics' | 'programming', limit = 6) => {
    const slugs = CATEGORY_GROUPS[groupKey];
    const grouped = await Promise.all(slugs.map((slug) => getArticlesByCategory(slug)));
    const merged = new Map<string, Article>();

    grouped.flat().forEach((article) => {
      merged.set(article.id, article);
    });

    return [...merged.values()]
      .sort((a, b) => new Date(b.updatedAt || b.publishedAt).getTime() - new Date(a.updatedAt || a.publishedAt).getTime())
      .slice(0, limit);
  };

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const featured = await getFeaturedArticles();
        const latest = await getLatestArticles(18);
        const tech = await loadCategoryGroup('tech', 6);
        const geo = await loadCategoryGroup('geopolitics', 6);
        const prog = await loadCategoryGroup('programming', 6);

        setFeaturedArticles(featured);
        setLatestArticles(latest);
        setTechArticles(tech);
        setGeopoliticsArticles(geo);
        setProgrammingArticles(prog);
      } catch (error) {
        console.error('Erro ao buscar artigos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const interestArticles = useMemo(() => {
    if (selectedInterest === 'all') {
      return latestArticles.slice(0, 9);
    }

    if (selectedInterest === 'tech') {
      return techArticles;
    }

    if (selectedInterest === 'geopolitics') {
      return geopoliticsArticles;
    }

    if (selectedInterest === 'programming') {
      return programmingArticles;
    }

    return latestArticles.filter((article) => article.category === selectedInterest).slice(0, 9);
  }, [selectedInterest, latestArticles, techArticles, geopoliticsArticles, programmingArticles]);

  const mostReadArticles = useMemo(() => {
    return [...latestArticles]
      .sort((a, b) => (b.viewCount || b.views || 0) - (a.viewCount || a.views || 0))
      .slice(0, 4);
  }, [latestArticles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-800"></div>
      </div>
    );
  }

  return (
    <div>
      <section className="mb-8 bg-white dark:bg-slate-900 rounded-xl border border-neutral-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-slate-950/50 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">AlpesNews</h1>
            <p className="text-neutral-600 dark:text-slate-400 mt-1">
              Descubra conteudos por interesse e acompanhe os temas que importam para voce.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <button
                key={interest.value}
                type="button"
                onClick={() => setSelectedInterest(interest.value)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedInterest === interest.value
                    ? 'bg-neutral-900 dark:bg-sky-600 text-white border-neutral-900 dark:border-sky-600 shadow-md shadow-sky-600/20'
                    : 'bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300 border-neutral-200 dark:border-slate-700 hover:bg-neutral-100 dark:hover:bg-slate-700'
                }`}
              >
                {interest.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {featuredArticles.length > 0 && <FeaturedSlider articles={featuredArticles} />}

      <ArticleGrid
        articles={interestArticles}
        title={`Para voce: ${interests.find((item) => item.value === selectedInterest)?.label || 'Tudo'}`}
        viewAll={selectedInterest === 'all' ? '/category/trending' : `/category/${selectedInterest}`}
      />

      <ArticleGrid
        articles={mostReadArticles}
        title="Mais lidas agora"
        viewAll="/category/trending"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="section-tech">
          <ArticleGrid articles={techArticles.slice(0, 3)} title="Tecnologia" viewAll="/category/tech" />
        </div>

        <div className="section-geo">
          <ArticleGrid articles={geopoliticsArticles.slice(0, 3)} title="Geopolitica" viewAll="/category/geopolitics" />
        </div>

        <div className="section-prog">
          <ArticleGrid articles={programmingArticles.slice(0, 3)} title="Programacao" viewAll="/category/programming" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
