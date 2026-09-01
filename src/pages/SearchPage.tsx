import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNews } from '../contexts/NewsContext';
import ArticleGrid from '../components/ArticleGrid';
import ArticleFilter from '../components/ArticleFilter';
import { Article } from '../types';
import { Search as SearchIcon } from 'lucide-react';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const { searchArticles, getCategories, getAuthors } = useNews();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const tag = params.get('tag') || '';
    
    setSearchQuery(query || tag);
    
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        let searchResults;
        if (query) {
          searchResults = await searchArticles(query);
        } else if (tag) {
          searchResults = await searchArticles('', tag);
        } else {
          searchResults = [];
        }
        
        const categoriesList = await getCategories();
        const authorsList = await getAuthors();
        
        setArticles(searchResults);
        setCategories(categoriesList);
        setAuthors(authorsList);
      } catch (error) {
        console.error('Erro ao buscar artigos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [location.search]);

  const handleFilter = async (filters: { category?: string; author?: string; date?: string }) => {
    setIsLoading(true);
    try {
      let filteredArticles = await searchArticles(searchQuery);
      
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
        let fromDate = new Date();
        
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
    } catch (error) {
      console.error('Erro ao filtrar artigos:', error);
    } finally {
      setIsLoading(false);
    }
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
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center">
          <SearchIcon className="h-8 w-8 mr-3" />
          Resultados da busca
        </h1>
        {searchQuery && (
          <p className="text-neutral-600 mt-2">
            Exibindo resultados para "{searchQuery}"
          </p>
        )}
      </header>
      
      <ArticleFilter 
        categories={categories} 
        authors={authors} 
        onFilter={handleFilter} 
      />
      
      {articles.length > 0 ? (
        <ArticleGrid articles={articles} />
      ) : (
        <div className="py-12 text-center">
          <p className="text-xl font-medium mb-2">Nenhum resultado encontrado</p>
          <p className="text-neutral-600">
            Tente outros termos ou navegue pelas categorias.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
