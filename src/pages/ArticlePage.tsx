import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ArticleContent from '../components/ArticleContent';
import { useNews } from '../contexts/NewsContext';
import ArticleGrid from '../components/ArticleGrid';
import { Article } from '../types';
import { trackArticleView, fetchArticlesByAuthor } from '../api';
import { getSectionFromCategory } from '../utils/categoryColors';

const ArticlePage: React.FC = () => {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const { getArticleBySlug, getRelatedArticles } = useNews();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [authorArticles, setAuthorArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setArticle(null);
    setRelatedArticles([]);
    setAuthorArticles([]);
    window.scrollTo(0, 0);
    if (!articleSlug) { setIsLoading(false); return; }
    getArticleBySlug(articleSlug).then(fetched => {
      if (!active) return;
      setArticle(fetched);
      setIsLoading(false);
      if (!fetched) return;
      void trackArticleView(fetched.id);
      const authorId = fetched.authorId || fetched.author?.id;
      // Recommendations must not delay the article that the reader opened.
      void Promise.allSettled([
        getRelatedArticles(fetched.id, fetched.category),
        authorId ? fetchArticlesByAuthor(authorId) : Promise.resolve([]),
      ]).then(([related, author]) => {
        if (!active) return;
        if (related.status === 'fulfilled') setRelatedArticles(related.value);
        if (author.status === 'fulfilled') setAuthorArticles(author.value.filter(post => post.id !== fetched.id).slice(0, 3));
      });
    }).catch(() => {
      if (active) { setArticle(null); setIsLoading(false); }
    });
    return () => { active = false; };
  }, [articleSlug, getArticleBySlug, getRelatedArticles]);

  useEffect(() => {
    const previousDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    // Update metadata for SEO
    if (article) {
      document.title = article.seoTitle || article.title;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', article.seoDescription || article.excerpt);
    }
    
    return () => {
      // Reset title when unmounting
      document.title = 'AlpesNews';
      document.querySelector('meta[name="description"]')?.setAttribute('content', previousDescription);
    };
  }, [article]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="h-10 md:h-14 bg-neutral-200 rounded-lg w-full" />
        <div className="h-6 bg-neutral-200 rounded w-3/4" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-neutral-200" />
          <div className="h-4 w-32 bg-neutral-200 rounded" />
          <div className="h-4 w-24 bg-neutral-200 rounded" />
        </div>
        <div className="aspect-[16/9] w-full rounded-2xl bg-neutral-200" />
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-5/6" />
          <div className="h-4 bg-neutral-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-white rounded-2xl border border-neutral-200/80 p-8 text-center my-8">
        <h2 className="text-2xl font-bold mb-2 text-neutral-900">Artigo não encontrado</h2>
        <p className="text-neutral-600 mb-6 max-w-md">O conteúdo que você procurou não existe, está em rascunho ou foi removido.</p>
        <Link to="/" className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors">
          Voltar para início
        </Link>
      </div>
    );
  }

  const articleSection = getSectionFromCategory(article.category);

  return (
    <div className={`section-${articleSection}`}>
      <ArticleContent article={article} />

      {authorArticles.length > 0 && (
        <div className="mt-12">
          <ArticleGrid articles={authorArticles} title={`Mais de ${article.author?.name || 'este autor'}`} />
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div className="mt-12">
          <ArticleGrid articles={relatedArticles} title="Materias relacionadas" />
        </div>
      )}
    </div>
  );
};

export default ArticlePage;
