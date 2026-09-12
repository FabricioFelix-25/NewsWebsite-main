import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNews } from '../contexts/NewsContext';
import ArticleGrid from '../components/ArticleGrid';
import ArticleFilter from '../components/ArticleFilter';
import { ArticleGridSkeleton } from '../components/SkeletonLoader';
import { Article } from '../types';
import { Search as SearchIcon } from 'lucide-react';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const { searchArticles } = useNews();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const tag = params.get('tag') || '';
    
    setSearchQuery(query || tag);
    
    const fetchArticles = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        let searchResults: Article[];
        if (query) {
          searchResults = await searchArticles(query);
        } else if (tag) {
          searchResults = await searchArticles('', tag);
        } else {
          searchResults = [];
        }
        
        if (!active) return;
        const categoriesList = [...new Set(searchResults.map(article => article.category))];
        const authorsList = [...new Set(searchResults.map(article => article.author?.name).filter((name): name is string => Boolean(name)))];
        
        setAllArticles(searchResults);
        setArticles(searchResults);
        setCategories(categoriesList);
        setAuthors(authorsList);
      } catch (error) {
        console.error('Erro ao buscar artigos:', error);
        if (active) { setArticles([]); setAllArticles([]); setLoadError(true); }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchArticles();
    return () => { active = false; };
  }, [location.search, searchArticles, retry]);

  const handleFilter = (filters: { category?: string; author?: string; date?: string }) => {
      let filteredArticles = [...allArticles];
      
      if (filters.category) {
        filteredArticles = filteredArticles.filter(article => 
          article.category === filters.category
        );
      }
      
      if (filters.author) {
        filteredArticles = filteredArticles.filter(article => 
          article.author?.name === filters.author
        );
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
        
        filteredArticles = filteredArticles.filter(article => 
          new Date(article.publishedAt) >= fromDate
        );
      }
      
      setArticles(filteredArticles);
  };

  return (
    <div aria-busy={isLoading}>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center text-neutral-900">
          <SearchIcon className="h-8 w-8 mr-3 text-neutral-700" />
          Resultados da busca
        </h1>
        {searchQuery && (
          <p className="text-neutral-600 mt-2">
            Exibindo resultados para "{searchQuery}"
          </p>
        )}
      </header>

      <ArticleFilter 
        key={location.search}
        categories={categories} 
        authors={authors} 
        onFilter={handleFilter} 
      />
      
      {isLoading ? (
        <ArticleGridSkeleton count={6} columns={3} showTitle={false} />
      ) : loadError ? (
        <div role="alert" className="py-12 text-center bg-white rounded-2xl border border-neutral-200/80 my-6">
          <p>Não foi possível carregar os resultados da busca.</p>
          <button type="button" className="btn btn-outline" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button>
        </div>
      ) : articles.length > 0 ? (
        <ArticleGrid articles={articles} priorityImages={3} />
      ) : (
        <div className="py-12 text-center bg-white rounded-2xl border border-neutral-200/80 my-6">
          <p className="text-xl font-medium mb-2 text-neutral-900">Nenhum resultado encontrado</p>
          <p className="text-neutral-600 text-sm">
            Tente outros termos ou navegue pelas categorias.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
