import React, { useEffect, useMemo, useState } from 'react';
import { useNews } from '../contexts/NewsContext';
import FeaturedSlider from '../components/FeaturedSlider';
import ArticleGrid from '../components/ArticleGrid';
import { SliderSkeleton, ArticleGridSkeleton } from '../components/SkeletonLoader';
import { Article } from '../types';
import { CATEGORY_GROUPS } from '../utils/categoryColors';

const interests = [
  { label: 'Tudo', value: 'all' },
  { label: 'Tecnologia', value: 'tech' },
  { label: 'Geopolítica', value: 'geopolitics' },
  { label: 'Programação', value: 'programming' },
  { label: 'IA', value: 'ai' },
  { label: 'Games', value: 'games' },
];

const HomePage: React.FC = () => {
  const { getFeaturedArticles, getLatestArticles } = useNews();
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        // Busca paralela rápida (apenas 2 requisições em paralelo em vez de 14 em cascata)
        const [featured, latest] = await Promise.all([
          getFeaturedArticles(),
          getLatestArticles(50),
        ]);

        if (isMounted) {
          setFeaturedArticles(featured.length > 0 ? featured : latest.slice(0, 3));
          setAllArticles(latest);
        }
      } catch (error) {
        console.error('Erro ao carregar matérias:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, [getFeaturedArticles, getLatestArticles]);

  // Derivação instantânea em memória (0ms de latência)
  const techArticles = useMemo(() => {
    const techSlugs = CATEGORY_GROUPS.tech || ['tech', 'ai', 'gadgets', 'internet'];
    return allArticles.filter((article) => techSlugs.includes(article.category));
  }, [allArticles]);

  const geopoliticsArticles = useMemo(() => {
    const geoSlugs = CATEGORY_GROUPS.geopolitics || ['geopolitics', 'global-market', 'conflicts', 'diplomacy'];
    return allArticles.filter((article) => geoSlugs.includes(article.category));
  }, [allArticles]);

  const programmingArticles = useMemo(() => {
    const progSlugs = CATEGORY_GROUPS.programming || ['programming', 'web', 'mobile', 'devops'];
    return allArticles.filter((article) => progSlugs.includes(article.category));
  }, [allArticles]);

  const gamesArticles = useMemo(() => {
    const gamesSlugs = CATEGORY_GROUPS.games || ['games', 'console', 'pc', 'mobile-gaming'];
    return allArticles.filter((article) => gamesSlugs.includes(article.category));
  }, [allArticles]);

  const interestArticles = useMemo(() => {
    if (selectedInterest === 'all') {
      return allArticles.slice(0, 9);
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
    if (selectedInterest === 'games') {
      return gamesArticles;
    }
    return allArticles.filter((article) => article.category === selectedInterest).slice(0, 9);
  }, [selectedInterest, allArticles, techArticles, geopoliticsArticles, programmingArticles, gamesArticles]);

  const mostReadArticles = useMemo(() => {
    return [...allArticles]
      .sort((a, b) => (b.viewCount || b.views || 0) - (a.viewCount || a.views || 0))
      .slice(0, 4);
  }, [allArticles]);

  return (
    <div className="space-y-6">
      {/* Barra de Filtro de Interesses */}
      <section className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">AlpesNews</h1>
            <p className="text-neutral-600 text-sm mt-0.5">
              Jornalismo automatizado com inteligência artificial, curadoria editorial e agilidade.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => {
              const isSelected = selectedInterest === interest.value;
              return (
                <button
                  key={interest.value}
                  type="button"
                  onClick={() => setSelectedInterest(interest.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isSelected
                      ? 'bg-neutral-900 text-white shadow-sm scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80'
                  }`}
                >
                  {interest.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destaque Principal (Hero Slider) */}
      {isLoading ? (
        <SliderSkeleton />
      ) : (
        featuredArticles.length > 0 && <FeaturedSlider articles={featuredArticles} />
      )}

      {/* Grid Principal - Baseado no Interesse */}
      {isLoading ? (
        <ArticleGridSkeleton count={6} columns={3} />
      ) : (
        <ArticleGrid
          articles={interestArticles}
          title={`Para você: ${interests.find((item) => item.value === selectedInterest)?.label || 'Tudo'}`}
          viewAll={selectedInterest === 'all' ? '/category/trending' : `/category/${selectedInterest}`}
          columns={3}
        />
      )}

      {/* Seção Mais Lidas */}
      {!isLoading && mostReadArticles.length > 0 && (
        <ArticleGrid
          articles={mostReadArticles}
          title="Mais lidas agora"
          viewAll="/category/trending"
          columns={4}
        />
      )}

      {/* Seções Temáticas em Colunas Verticais Elegantes */}
      {!isLoading && (techArticles.length > 0 || geopoliticsArticles.length > 0 || programmingArticles.length > 0) && (
        <div className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techArticles.length > 0 && (
              <div className="section-tech bg-neutral-50/50 p-4 rounded-2xl border border-neutral-200/60">
                <ArticleGrid 
                  articles={techArticles.slice(0, 3)} 
                  title="Tecnologia" 
                  viewAll="/category/tech" 
                  columns={1}
                />
              </div>
            )}

            {geopoliticsArticles.length > 0 && (
              <div className="section-geo bg-neutral-50/50 p-4 rounded-2xl border border-neutral-200/60">
                <ArticleGrid 
                  articles={geopoliticsArticles.slice(0, 3)} 
                  title="Geopolítica" 
                  viewAll="/category/geopolitics" 
                  columns={1}
                />
              </div>
            )}

            {programmingArticles.length > 0 && (
              <div className="section-prog bg-neutral-50/50 p-4 rounded-2xl border border-neutral-200/60">
                <ArticleGrid 
                  articles={programmingArticles.slice(0, 3)} 
                  title="Programação" 
                  viewAll="/category/programming" 
                  columns={1}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

