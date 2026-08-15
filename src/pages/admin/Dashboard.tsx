import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Layers3, TrendingUp, Calendar, BarChart3, Gauge, Rocket } from 'lucide-react';
import { useNews } from '../../contexts/NewsContext';
import ArticleList from '../../components/admin/ArticleList';
import { Article } from '../../types';
import { getCategoryLabel } from '../../utils/categoryColors';

const Dashboard: React.FC = () => {
  const { getAllArticles, deleteArticle, getStats, updateArticle } = useNews();
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    categories: 0,
    recentViews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedArticles = await getAllArticles();
      const fetchedStats = await getStats();
      setArticles(fetchedArticles);
      setStats(fetchedStats);
    } catch (error) {
      console.error('Erro ao buscar dados do painel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const publicationRate = useMemo(() => {
    if (!stats.totalArticles) {
      return 0;
    }
    return Math.round((stats.publishedArticles / stats.totalArticles) * 100);
  }, [stats]);

  const avgViewsPerArticle = useMemo(() => {
    if (!stats.publishedArticles) {
      return 0;
    }
    return Math.round(stats.recentViews / stats.publishedArticles);
  }, [stats]);

  const topViewedArticles = useMemo(() => {
    return [...articles]
      .filter((article) => !article.isDraft)
      .sort((a, b) => (b.viewCount || b.views || 0) - (a.viewCount || a.views || 0))
      .slice(0, 5);
  }, [articles]);

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este artigo?')) {
      return;
    }

    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((article) => article.id !== id));
    } catch (error) {
      console.error('Erro ao excluir artigo:', error);
    }
  };

  const handleBulkDeleteArticles = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await deleteArticle(id);
      }
      setArticles((prev) => prev.filter((article) => !ids.includes(article.id)));
    } catch (error) {
      console.error('Erro ao excluir artigos:', error);
    }
  };

  const handlePublishArticle = async (id: string) => {
    const target = articles.find((article) => article.id === id);
    if (!target) {
      return;
    }

    try {
      await updateArticle(id, {
        ...target,
        authorId: target.authorId || target.author?.id,
        isDraft: false,
      });
      await loadData();
    } catch (error) {
      console.error('Erro ao publicar artigo:', error);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Painel AlpesNews</h1>
          <p className="text-sm text-neutral-500 mt-1">Operacao editorial, producao e trafego em um so lugar.</p>
        </div>
        <Link
          to="/admin/article/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Novo artigo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total de artigos</p>
              <p className="text-2xl font-bold">{stats.totalArticles}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-green-600">{stats.publishedArticles} publicados</span>
            <span className="text-yellow-600">{stats.draftArticles} rascunhos</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Layers3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Categorias ativas</p>
              <p className="text-2xl font-bold">{stats.categories}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-neutral-500">Distribuicao editorial</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Views (7 dias)</p>
              <p className="text-2xl font-bold">{stats.recentViews}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-neutral-500">Media {avgViewsPerArticle}/artigo publicado</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 mr-4">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Ultimo artigo</p>
              <p className="text-lg font-medium truncate">
                {articles.length > 0
                  ? new Date(articles[0].publishedAt || articles[0].updatedAt).toLocaleDateString()
                  : 'Sem artigos'}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-neutral-500 truncate">
            {articles.length > 0 ? articles[0].title : 'Crie seu primeiro artigo'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Saude editorial</h2>
          </div>
          <p className="text-3xl font-bold text-blue-700">{publicationRate}%</p>
          <p className="text-sm text-neutral-600 mt-2">Taxa de publicacao (publicados / total).</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">Ritmo de tracao</h2>
          </div>
          <p className="text-3xl font-bold text-green-700">{stats.recentViews}</p>
          <p className="text-sm text-neutral-600 mt-2">Volume de views da semana para decisao de pauta.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Efetividade</h2>
          </div>
          <p className="text-3xl font-bold text-purple-700">{avgViewsPerArticle}</p>
          <p className="text-sm text-neutral-600 mt-2">Media de views por artigo publicado nos ultimos 7 dias.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Top artigos por views</h2>
        {topViewedArticles.length === 0 ? (
          <p className="text-sm text-neutral-500">Ainda sem dados de visualizacao suficientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200">
                  <th className="py-2 pr-4">Titulo</th>
                  <th className="py-2 pr-4">Categoria</th>
                  <th className="py-2 pr-4">Views</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {topViewedArticles.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-4">{item.title}</td>
                    <td className="py-2 pr-4">{getCategoryLabel(item.category)}</td>
                    <td className="py-2 pr-4 font-semibold">{item.viewCount || item.views || 0}</td>
                    <td className="py-2">{item.isDraft ? 'Rascunho' : 'Publicado'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Gestao de artigos</h2>
        <ArticleList 
          articles={articles} 
          onDelete={handleDeleteArticle} 
          onPublish={handlePublishArticle} 
          onBulkDelete={handleBulkDeleteArticles} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
