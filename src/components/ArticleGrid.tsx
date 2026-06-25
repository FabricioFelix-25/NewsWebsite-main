import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import ArticleCard from './ArticleCard';

interface ArticleGridProps {
  articles: Article[];
  title?: string;
  viewAll?: string;
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ articles, title, viewAll }) => {
  if (!articles.length) return null;

  return (
    <div className="mb-12">
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          {viewAll && (
            <Link 
              to={viewAll} 
              className="text-sm font-medium hover:underline"
              style={{ color: 'rgb(var(--section-primary))' }}
            >
              Ver tudo
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default ArticleGrid;
