import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bot, Clock, Tag } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import ArticleGrid from '../components/ArticleGrid';
import { Article } from '../types';
import { trackArticleView, fetchArticlesByAuthor } from '../api';
import { getCategoryLabel, getSectionFromCategory } from '../utils/categoryColors';

const ArticlePage: React.FC = () => {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const { getArticleBySlug, getRelatedArticles } = useNews();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [authorArticles, setAuthorArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      window.scrollTo(0, 0);
      
      try {
        if (articleSlug) {
          const fetchedArticle = await getArticleBySlug(articleSlug);
          setArticle(fetchedArticle);
          
          if (fetchedArticle) {
            // Track view silenciosamente para estatísticas internas
            trackArticleView(fetchedArticle.id);
            
            // Fetch related articles by category
            const related = await getRelatedArticles(fetchedArticle.id, fetchedArticle.category);
            setRelatedArticles(related);

            // Fetch more articles by the same author
            const authorId = fetchedArticle.authorId || fetchedArticle.author?.id;
            const authorPosts = authorId ? await fetchArticlesByAuthor(authorId) : [];
            setAuthorArticles(authorPosts.filter(post => post.id !== fetchedArticle.id).slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar artigo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleSlug]);

  useEffect(() => {
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
      const defaultTitle = document.querySelector('title[data-default]');
      if (defaultTitle) {
        document.title = defaultTitle.textContent || '';
      }
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
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="mb-4">
            <Link 
              to={`/category/${article?.category}`}
              className="text-sm font-medium hover:underline"
              style={{ color: 'rgb(var(--section-primary))' }}
            >
              {getCategoryLabel(article.category)}
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{article?.title}</h1>
          {article?.subtitle && (
            <p className="text-xl md:text-2xl text-neutral-600 mb-6">{article.subtitle}</p>
          )}
          <div className="flex flex-wrap items-center text-neutral-600 text-sm mb-6">
            <div className="flex items-center mr-6 mb-2">
              <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                <img
                  src={article?.author?.avatarUrl || 'https://placehold.co/80x80?text=A'}
                  alt={article?.author?.name || 'Autor'}
                  className="h-full w-full object-cover"
                />
              </div>
              <span>{article?.author?.name || 'Autor nao identificado'}</span>
            </div>
            <div className="flex items-center mr-6 mb-2">
              <Clock className="h-4 w-4 mr-1" />
              <span>{article?.publishedAt && new Date(article.publishedAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div className="aspect-[16/9] overflow-hidden rounded-lg">
            <img
              src={article?.imageUrl}
              alt={article?.title}
              className="w-full h-full object-cover"
            />
          </div>
        </header>

        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />

        {article.aiAssisted && (
          <div className="flex items-start gap-3 border border-neutral-200 bg-neutral-50 p-4 rounded-lg mb-8 text-sm text-neutral-700">
            <Bot className="h-5 w-5 mt-0.5 text-neutral-500" />
            <p>
              Esta materia teve apoio de inteligencia artificial na pesquisa, organizacao ou redacao inicial e passou por revisao humana antes da publicacao.
            </p>
          </div>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center border-t border-b border-neutral-200 py-4 mb-8">
            <Tag className="h-4 w-4 mr-2" />
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?tag=${tag}`}
                  className="px-3 py-1 bg-neutral-100 rounded-full text-sm hover:bg-neutral-200 transition-colors duration-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-neutral-200 pt-6 mb-12">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
              <img
                src={article.author?.avatarUrl || 'https://placehold.co/80x80?text=A'}
                alt={article.author?.name || 'Autor'}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{article.author?.name || 'Autor nao identificado'}</p>
              <p className="text-sm text-neutral-600">{article.author?.bio || 'Redacao AlpesNews'}</p>
            </div>
          </div>
        </div>
      </article>

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
