import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNews } from '../../contexts/NewsContext';
import ArticleForm from '../../components/admin/ArticleForm';
import { Article } from '../../types';
import { X } from 'lucide-react';
import { fetchArticlePreview } from '../../api/editorial';
import ArticleContent from '../../components/ArticleContent';

const ArticleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { createArticle, updateArticle } = useNews();
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(!!id);
  const [previewData, setPreviewData] = useState<Partial<Article> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    setArticle(undefined);
    setPreviewData(null);
    setIsLoading(Boolean(id));
    if (id) {
      fetchArticlePreview(id, controller.signal).then(data => {
        if (!controller.signal.aborted) setArticle(data);
      }).catch(() => {
        if (!controller.signal.aborted) navigate('/admin');
      }).finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    }
    return () => controller.abort();
  }, [id, navigate]);

  const handleSave = async (articleData: Partial<Article>, isDraft: boolean) => {
    try {
      if (id) {
        return await updateArticle(id, {...articleData, isDraft});
      } else {
        return await createArticle({...articleData, isDraft});
      }
    } catch (error) {
      console.error('Erro ao salvar artigo:', error);
      throw error;
    }
  };

  const handlePreview = (articleData: Partial<Article>) => {
    setPreviewData(articleData);
  };

  const closePreview = () => {
    setPreviewData(null);
  };

  if (isLoading || (id && article?.id !== id)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-800"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">
        {id ? 'Editar artigo' : 'Criar novo artigo'}
      </h1>
      
      <ArticleForm key={id || 'new'}
        article={article} 
        onSave={handleSave} 
        onPreview={handlePreview}
      />
      
      {/* Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex justify-between items-center bg-white p-4 border-b border-neutral-200 z-10">
              <h2 className="text-xl font-bold">Preview do artigo</h2>
              <button
                onClick={closePreview}
                className="p-2 rounded-full hover:bg-neutral-100"
                aria-label="Fechar preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm font-medium uppercase tracking-wider text-neutral-500 mb-2">
                  Modo de preview
                </div>
                <p className="text-neutral-600 mb-4">
                  Esta e a visualizacao de como o artigo aparecera para o leitor.
                </p>
              </div>
              <ArticleContent article={previewData} preview />

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;
