import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNews } from '../../contexts/NewsContext';
import ArticleForm from '../../components/admin/ArticleForm';
import { Article } from '../../types';
import { X } from 'lucide-react';

const ArticleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getArticleById, createArticle, updateArticle } = useNews();
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(!!id);
  const [previewData, setPreviewData] = useState<Partial<Article> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const fetchedArticle = await getArticleById(id);
          setArticle(fetchedArticle);
        } catch (error) {
          console.error('Erro ao buscar artigo:', error);
          navigate('/admin');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchArticle();
  }, [id]);

  const handleSave = async (articleData: Partial<Article>, isDraft: boolean) => {
    try {
      if (id) {
        await updateArticle(id, {...articleData, isDraft});
      } else {
        await createArticle({...articleData, isDraft});
      }
      return true;
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

  if (isLoading) {
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
      
      <ArticleForm 
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
              <article>
                <h1 className="text-3xl font-bold mb-4">{previewData.title}</h1>
                {previewData.subtitle && (
                  <p className="text-xl text-neutral-600 mb-6">{previewData.subtitle}</p>
                )}
                {previewData.imageUrl && (
                  <div className="aspect-[16/9] overflow-hidden rounded-lg mb-6">
                    <img 
                      src={previewData.imageUrl} 
                      alt={previewData.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewData.content || '' }}
                />
              </article>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;
