import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Article } from '../types';
import { imageForDisplay } from '../utils/imageDelivery';
import { getCategoryLabel, getTopicColorTokens } from '../utils/categoryColors';

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
  priorityImage?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, compact = false, priorityImage = false }) => {
  const [failedImage, setFailedImage] = useState('');
  const colorTokens = getTopicColorTokens(article.category);
  const cardStyle = {
    '--section-primary': `var(${colorTokens.primary})`,
    '--section-secondary': `var(${colorTokens.secondary})`,
    '--section-accent': `var(${colorTokens.accent})`,
  } as React.CSSProperties;

  const hasImage = Boolean(article.imageUrl && failedImage !== article.imageUrl);
  const image = hasImage ? (
    <img
      src={imageForDisplay(article.imageUrl, compact ? 240 : 640)}
      alt={article.title}
      width={800}
      height={450}
      loading={priorityImage ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailedImage(article.imageUrl)}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-500 text-xs font-semibold" aria-label="Matéria sem imagem">AlpesNews</span>
  );

  if (compact) {
    return (
      <article className="article-card topic-colored group p-3 flex flex-row gap-3 items-center rounded-xl bg-white transition-colors duration-150 hover:shadow-md" style={cardStyle}>
        <Link to={`/article/${article.slug}`} className="block flex-shrink-0 w-24 h-20 sm:w-28 sm:h-24 overflow-hidden rounded-lg bg-neutral-100">
          {image}
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
    <article className="article-card topic-colored group flex flex-col h-full rounded-xl bg-white overflow-hidden transition-colors duration-150" style={cardStyle}>
      <Link to={`/article/${article.slug}`} className="block shrink-0 overflow-hidden relative bg-neutral-100 aspect-video">
        {image}
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
        
        <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2 leading-tight min-h-[2.5em] text-neutral-900">
          <Link to={`/article/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        
        <p className="text-neutral-600 text-sm line-clamp-2 sm:line-clamp-3 mb-4 flex-1 leading-relaxed min-h-[3.25em] sm:min-h-[4.875em]">
          {article.excerpt}
        </p>

        <div className="flex items-center pt-3 border-t border-neutral-100 mt-auto">
          <div className="h-7 w-7 rounded-full overflow-hidden mr-2.5 bg-neutral-200 flex-shrink-0 flex items-center justify-center text-xs" aria-hidden="true">
            {article.author?.avatarUrl ? (
              <img
                src={imageForDisplay(article.author.avatarUrl, 64)}
                alt=""
                width={28}
                height={28}
                loading="lazy"
                decoding="async"
                onError={(event) => { event.currentTarget.hidden = true; }}
                className="h-full w-full object-cover"
              />
            ) : (article.author?.name || 'Redação').charAt(0)}
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

