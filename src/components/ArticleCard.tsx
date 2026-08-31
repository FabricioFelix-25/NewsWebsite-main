import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Article } from '../types';
import { getCategoryLabel, getTopicColorTokens } from '../utils/categoryColors';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const colorTokens = getTopicColorTokens(article.category);
  const cardStyle = {
    '--section-primary': `var(${colorTokens.primary})`,
    '--section-secondary': `var(${colorTokens.secondary})`,
    '--section-accent': `var(${colorTokens.accent})`,
  } as React.CSSProperties;

  return (
    <article className="article-card topic-colored group" style={cardStyle}>
      <Link to={`/article/${article.slug}`} className="block">
        <div className="aspect-video overflow-hidden">
          <img
            src={article.imageUrl || 'https://placehold.co/800x450?text=Noticia'}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center text-sm mb-2">
          <Link
            to={`/category/${article.category}`}
            className="font-medium px-2 py-1 rounded-full"
            style={{
              color: 'rgb(var(--section-primary))',
              backgroundColor: 'rgb(var(--section-primary) / 0.12)',
            }}
          >
            {getCategoryLabel(article.category)}
          </Link>
          <span className="mx-2 text-neutral-400 dark:text-slate-600">-</span>
          <span className="flex items-center text-neutral-500 dark:text-slate-400">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-neutral-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          <Link to={`/article/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="text-neutral-600 dark:text-slate-400 line-clamp-3 mb-4 text-sm leading-relaxed">{article.excerpt}</p>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full overflow-hidden mr-3 ring-1 ring-neutral-200 dark:ring-slate-700">
            <img
              src={article.author?.avatarUrl || 'https://placehold.co/80x80?text=A'}
              alt={article.author?.name || 'Autor'}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-slate-300">
            {article.author?.name || 'Autor nao identificado'}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
