import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import ArticleCard from './ArticleCard';

interface ArticleGridProps {
  articles: Article[];
  title?: string;
  viewAll?: string;
  columns?: 1 | 2 | 3 | 4;
  compact?: boolean;
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ 
  articles, 
  title, 
  viewAll, 
  columns = 3,
  compact = false 
}) => {
  if (!articles.length) return null;

  const getGridColsClass = () => {
    if (columns === 1) return 'grid-cols-1';
    if (columns === 2) return 'grid-cols-1 md:grid-cols-2';
    if (columns === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className="mb-12">
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">{title}</h2>
          {viewAll && (
            <Link 
              to={viewAll} 
              className="text-xs sm:text-sm font-semibold hover:underline flex items-center gap-1"
              style={{ color: 'rgb(var(--section-primary, 31 41 55))' }}
            >
              Ver tudo &rarr;
            </Link>
          )}
        </div>
      )}
      <div className={`grid ${getGridColsClass()} ${compact ? 'gap-3' : 'gap-6'}`}>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} compact={compact} />
        ))}
      </div>
    </div>
  );
};

export default ArticleGrid;

