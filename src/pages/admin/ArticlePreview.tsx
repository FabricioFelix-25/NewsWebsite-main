import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Edit, Lock, Send } from 'lucide-react';
import ArticleContent from '../../components/ArticleContent';
import { fetchArticlePreview, publishReviewedArticle } from '../../api/editorial';
import { useAuth } from '../../contexts/AuthContext';
import { useNews } from '../../contexts/NewsContext';
import { Article } from '../../types';

export default function ArticlePreview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { clearCache } = useNews();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [sources, setSources] = useState('');
  const [checks, setChecks] = useState({ factChecked: false, rightsCleared: false, sensitiveContentReviewed: false });

  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots'; robots.content = 'noindex, nofollow, noarchive';
    const referrer = document.createElement('meta');
    referrer.name = 'referrer'; referrer.content = 'no-referrer';
    document.head.append(robots, referrer);
    const title = document.title;
    document.title = 'Revisão privada | AlpesNews';
    return () => { robots.remove(); referrer.remove(); document.title = title; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    window.scrollTo({ top: 0, behavior: 'auto' });
    setLoading(true); setError(''); setArticle(null);
    setChecks({ factChecked: false, rightsCleared: false, sensitiveContentReviewed: false });
    if (!id) { setLoading(false); return; }
    fetchArticlePreview(id, controller.signal).then(data => {
      setArticle(data); setSources(data.sourceReferences || '');
    }).catch(err => {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Falha ao carregar a matéria.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, retry]);

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!article || saving) return;
    setSaving(true); setError('');
    try {
      const saved = await publishReviewedArticle(article.id, { ...checks, sourceReferences: sources.trim(), reviewedBy: user?.name || user?.email || '' });
      setArticle(saved); clearCache();
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível publicar.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div role="status" className="max-w-4xl mx-auto min-h-[70vh] py-12"><p className="mb-6">Carregando prévia privada…</p><div className="aspect-video bg-neutral-200 rounded-lg animate-pulse" /></div>;
  if (!article) return <div className="max-w-xl mx-auto p-8"><p role="alert">{error || 'Matéria não encontrada.'}</p><button onClick={() => setRetry(value => value + 1)} className="btn btn-outline mt-4">Tentar novamente</button> <Link to="/admin" className="underline">Voltar ao painel</Link></div>;

  return <div>
    <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-8 flex flex-wrap gap-3 items-center justify-between">
      <div><p className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4" />Revisão privada</p><p className="text-sm text-neutral-600">{article.isDraft ? 'Visível apenas para administradores e editores autenticados.' : 'Esta matéria já está publicada.'}</p></div>
      <div className="flex flex-wrap gap-3"><Link className="btn btn-outline" to="/admin">Painel</Link><Link className="btn btn-outline inline-flex items-center gap-2" to={`/admin/article/edit/${article.id}`}><Edit className="h-4 w-4" />Editar matéria</Link>{article.isDraft && <a className="btn btn-primary" href="#publicar">Revisar e publicar</a>}</div>
    </div>
    {!article.isDraft && <div role="status" className="max-w-4xl mx-auto p-4 mb-6 rounded-lg bg-green-50 text-green-800 flex gap-2"><CheckCircle2 className="h-5 w-5" /><span>Matéria publicada. <Link className="underline" to={`/article/${article.slug}`}>Abrir no site</Link></span></div>}
    <ArticleContent article={article} preview />
    {article.isDraft && <form id="publicar" onSubmit={publish} className="scroll-mt-32 max-w-4xl mx-auto bg-white border border-neutral-200 rounded-xl p-6 mb-12 space-y-4">
      <h2 className="text-xl font-bold">Concluir revisão</h2>
      <p className="text-sm text-neutral-600">Confira a matéria e suas imagens acima. A publicação registra sua revisão como {user?.name || user?.email}.</p>
      <label className="block text-sm font-medium">Fontes e créditos consultados<textarea required value={sources} onChange={event => setSources(event.target.value)} rows={5} className="input-field mt-1" /></label>
      {([
        ['factChecked', 'Conferi os fatos, as fontes e as datas. Para conteúdo de IA, o fato principal ocorreu nos últimos 7 dias.'],
        ['rightsCleared', 'Conferi se as imagens correspondem à matéria e se os créditos e direitos de uso estão corretos.'],
        ['sensitiveContentReviewed', 'Revisei o conteúdo sensível, a privacidade e a linguagem da matéria.'],
      ] as const).map(([key, label]) => <label key={key} className="flex gap-3 items-start text-sm"><input required type="checkbox" checked={checks[key]} onChange={event => setChecks(previous => ({ ...previous, [key]: event.target.checked }))} className="mt-1" /><span>{label}</span></label>)}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <button type="submit" disabled={saving || !sources.trim() || !Object.values(checks).every(Boolean)} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Send className="h-4 w-4" />{saving ? 'Publicando…' : 'Publicar matéria'}</button>
    </form>}
  </div>;
}
