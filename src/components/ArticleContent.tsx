import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Clock } from 'lucide-react';
import { Article } from '../types';
import { getCategoryLabel, getSectionFromCategory } from '../utils/categoryColors';
import { sanitizeArticleHtml } from '../utils/articleHtml';

export default function ArticleContent({ article, preview = false }: { article: Partial<Article>; preview?: boolean }) {
  const html = useMemo(() => sanitizeArticleHtml(article.content || ''), [article.content]);
  const [failedImage, setFailedImage] = useState('');
  return (
    <article className={`section-${getSectionFromCategory(article.category || 'tech')} max-w-4xl mx-auto`}>
      <header className="mb-8">
        <Link to={`/category/${article.category}`} className="inline-block mb-4 text-sm font-medium hover:underline" style={{ color: 'rgb(var(--section-primary))' }}>
          {getCategoryLabel(article.category || 'tech')}
        </Link>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 break-words">{article.title}</h1>
        {article.subtitle && <p className="text-xl md:text-2xl text-neutral-600 mb-6">{article.subtitle}</p>}
        <div className="flex flex-wrap items-center gap-4 text-neutral-600 text-sm mb-6">
          <span>{article.author?.name || 'Redação AlpesNews'}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{preview && article.isDraft ? 'Rascunho — ainda não publicado' : article.publishedAt && new Date(article.publishedAt).toLocaleDateString('pt-BR')}</span>
        </div>
        {article.imageUrl && failedImage !== article.imageUrl ? (
          <div className="aspect-video overflow-hidden rounded-lg bg-neutral-100">
            <img src={article.imageUrl} onError={() => setFailedImage(article.imageUrl || '')} alt={article.title || 'Capa da matéria'} width="1600" height="900" fetchPriority="high" decoding="async" referrerPolicy={preview ? 'no-referrer' : undefined} className="w-full h-full object-cover" />
          </div>
        ) : (preview || article.imageUrl) && <div className="aspect-video rounded-lg bg-neutral-100 flex items-center justify-center p-6 text-center text-neutral-600">{preview ? 'Capa pendente ou indisponível. Você pode adicionar uma imagem pertinente no editor.' : 'Imagem indisponível'}</div>}
      </header>
      <div className="article-body prose prose-lg max-w-none mb-12 flow-root" dangerouslySetInnerHTML={{ __html: html }} />
      {article.aiAssisted && <div className="flex items-start gap-3 border border-neutral-200 bg-neutral-50 p-4 rounded-lg mb-8 text-sm text-neutral-700">
        <Bot className="h-5 w-5 shrink-0 mt-0.5" />
        <p>{preview && article.isDraft ? 'Matéria produzida com apoio de inteligência artificial. A apuração, as imagens e os créditos ainda precisam de revisão humana.' : 'Esta matéria teve apoio de inteligência artificial na pesquisa, organização ou redação inicial.'}</p>
      </div>}
      {!!article.tags?.length && <div className="flex flex-wrap gap-2 border-y border-neutral-200 py-4 mb-8">{article.tags.map(tag => <Link key={tag} to={`/search?tag=${encodeURIComponent(tag)}`} className="px-3 py-1 bg-neutral-100 rounded-full text-sm hover:bg-neutral-200">{tag}</Link>)}</div>}
      <div className="border-t border-neutral-200 pt-6 mb-12"><p className="font-medium">{article.author?.name || 'Redação AlpesNews'}</p><p className="text-sm text-neutral-600">{article.author?.bio}</p></div>
    </article>
  );
}
