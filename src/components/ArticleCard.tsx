import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Article } from '../types';
import { getCategoryLabel, getTopicColorTokens } from '../utils/categoryColors';

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, compact = false }) => {
  const [imageError, setImageError] = useState(false);
  const colorTokens = getTopicColorTokens(article.category);
  const cardStyle = {
    '--section-primary': `var(${colorTokens.primary})`,
    '--section-secondary': `var(${colorTokens.secondary})`,
    '--section-accent': `var(${colorTokens.accent})`,
  } as React.CSSProperties;

  const fallbackImage = 'https://placehold.co/800x450/1e293b/ffffff?text=AlpesNews';
  const displayImage = imageError || !article.imageUrl ? fallbackImage : article.imageUrl;

  if (compact) {
    return (
      <article className="article-card topic-colored group p-3 flex flex-row gap-3 items-center rounded-xl bg-white transition-all duration-200 hover:shadow-md" style={cardStyle}>
        <Link to={`/article/${article.slug}`} className="block flex-shrink-0 w-24 h-20 sm:w-28 sm:h-24 overflow-hidden rounded-lg bg-neutral-100">
          <img
            src={displayImage}
            alt={article.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center text-xs mb-1">
            <Link
              to={`/category/${article.category}`}
              className="font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded text-[11px]"
              style={{
                color: 'rgb(var(--section-primary))',
                backgroundColor: 'rgb(var(--section-primary) / 0.1)',
              }}
            >
              {getCategoryLabel(article.category)}
            </Link>
          </div>
          <h4 className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug group-hover:underline">
            <Link to={`/article/${article.slug}`}>{article.title}</Link>
          </h4>
          <span className="text-[11px] text-neutral-500 mt-1 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="article-card topic-colored group flex flex-col h-full rounded-xl bg-white overflow-hidden transition-all duration-300" style={cardStyle}>
      <Link to={`/article/${article.slug}`} className="block overflow-hidden relative bg-neutral-100 aspect-video">
        <img
          src={displayImage}
          alt={article.title}
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </Link>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center text-xs mb-2.5">
          <Link
            to={`/category/${article.category}`}
            className="font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full text-[11px]"
            style={{
              color: 'rgb(var(--section-primary))',
              backgroundColor: 'rgb(var(--section-primary) / 0.12)',
            }}
          >
            {getCategoryLabel(article.category)}
          </Link>
          <span className="mx-2 text-neutral-300">•</span>
          <span className="flex items-center text-neutral-500 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
        
        <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2 leading-tight text-neutral-900">
          <Link to={`/article/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        
        <p className="text-neutral-600 text-sm line-clamp-2 sm:line-clamp-3 mb-4 flex-1 leading-relaxed">
          {article.excerpt}
        </p>

        <div className="flex items-center pt-3 border-t border-neutral-100 mt-auto">
          <div className="h-7 w-7 rounded-full overflow-hidden mr-2.5 bg-neutral-200 flex-shrink-0">
            <img
              src={article.author?.avatarUrl || 'https://placehold.co/80x80/64748b/ffffff?text=A'}
              alt={article.author?.name || 'Autor'}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xs font-medium text-neutral-700 truncate">
            {article.author?.name || 'Redação AlpesNews'}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;

