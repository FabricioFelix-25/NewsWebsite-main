import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, Save, Upload, X, Sparkles } from 'lucide-react';
import { Article, Author } from '../../types';
import RichTextEditor from './RichTextEditor';
import { fetchAuthors, uploadImage } from '../../api';

interface ArticleFormProps {
  article?: Article;
  onSave: (articleData: Partial<Article>, isDraft: boolean) => Promise<void>;
  onPreview: (articleData: Partial<Article>) => void;
}

const initialState: Partial<Article> = {
  title: '',
  subtitle: '',
  content: '',
  excerpt: '',
  category: '',
  tags: [],
  imageUrl: '',
  seoTitle: '',
  seoDescription: '',
  seoImage: '',
  aiAssisted: false,
  sourceReferences: '',
  reviewedBy: '',
  factChecked: false,
  rightsCleared: false,
  sensitiveContentReviewed: false,
  authorId: '',
  isDraft: true,
  featured: false,
};

const categories = [
  'tech', 'ai', 'gadgets', 'internet',
  'geopolitics', 'global-market', 'conflicts', 'diplomacy',
  'programming', 'web', 'mobile', 'devops',
  'games', 'console', 'pc', 'mobile-gaming',
  'trending', 'world-news', 'entertainment', 'lifestyle',
];

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildExcerpt(title: string, content: string): string {
  const plain = stripHtml(content);
  if (!plain) {
    return title ? `${title} - analise completa no AlpesNews.` : '';
  }
  return plain.slice(0, 180).trimEnd() + (plain.length > 180 ? '...' : '');
}

function buildTagSuggestions(title: string, content: string): string[] {
  const words = `${title} ${stripHtml(content)}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 4);

  const stopWords = new Set([
    'para', 'como', 'mais', 'pela', 'sobre', 'entre', 'news', 'alpes', 'with', 'from', 'that', 'this', 'esta', 'isso', 'aqui'
  ]);

  const ranked = new Map<string, number>();
  words.forEach((word) => {
    if (!stopWords.has(word)) {
      ranked.set(word, (ranked.get(word) || 0) + 1);
    }
  });

  return [...ranked.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSave, onPreview }) => {
  const [formData, setFormData] = useState<Partial<Article>>(initialState);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const authorsList = await fetchAuthors();
        setAuthors(authorsList);
      } catch (error) {
        console.error('Erro ao carregar autores:', error);
      }
    };
    loadAuthors();
  }, []);

  useEffect(() => {
    if (article) {
      setFormData({
        ...article,
        authorId: article.authorId || article.author?.id || authors[0]?.id,
      });
      setImagePreview(article.imageUrl || null);
      return;
    }

    const draftRaw = localStorage.getItem('alpes-news-editor-draft');
    if (draftRaw) {
      try {
        const parsed = JSON.parse(draftRaw) as Partial<Article>;
        setFormData((prev) => ({ ...prev, ...parsed, authorId: parsed.authorId || authors[0]?.id }));
        setImagePreview(parsed.imageUrl || null);
      } catch {
        setFormData((prev) => ({ ...prev, authorId: authors[0]?.id }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, authorId: authors[0]?.id }));
  }, [article, authors]);

  useEffect(() => {
    if (article) {
      return;
    }

    const hasRelevantContent = [formData.title, formData.content, formData.excerpt, formData.category]
      .some((value) => Boolean(value && String(value).trim()));

    if (!hasRelevantContent) {
      return;
    }

    localStorage.setItem('alpes-news-editor-draft', JSON.stringify(formData));
  }, [formData, article]);

  const plainText = useMemo(() => stripHtml(formData.content || ''), [formData.content]);
  const wordCount = useMemo(() => (plainText ? plainText.split(/\s+/).length : 0), [plainText]);
  const readingMinutes = useMemo(() => Math.max(1, Math.ceil(wordCount / 220)), [wordCount]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormError('');
    setFormSuccess('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingImage(true);
    setFormError('');
    try {
      const imageUrl = await uploadImage(file);
      setImagePreview(imageUrl);
      setFormData((prev) => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      setFormError(error instanceof Error ? error.message : 'Falha ao enviar imagem.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddTag = () => {
    const normalized = tagInput.trim().toLowerCase();
    if (normalized && !formData.tags?.includes(normalized)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), normalized],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((item) => item !== tag),
    }));
  };

  const handleGenerateExcerpt = () => {
    const excerpt = buildExcerpt(formData.title || '', formData.content || '');
    setFormData((prev) => ({ ...prev, excerpt }));
  };

  const handleSuggestTags = () => {
    const suggested = buildTagSuggestions(formData.title || '', formData.content || '');
    const current = formData.tags || [];
    const merged = [...new Set([...current, ...suggested])].slice(0, 12);
    setFormData((prev) => ({ ...prev, tags: merged }));
  };

  const handleFillSeo = () => {
    setFormData((prev) => ({
      ...prev,
      seoTitle: prev.seoTitle?.trim() ? prev.seoTitle : prev.title,
      seoDescription: prev.seoDescription?.trim() ? prev.seoDescription : prev.excerpt || buildExcerpt(prev.title || '', prev.content || ''),
      seoImage: prev.seoImage?.trim() ? prev.seoImage : prev.imageUrl,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.title?.trim()) return 'Informe o titulo do artigo.';
    if (!formData.content?.trim()) return 'Informe o conteudo do artigo.';
    if (!formData.excerpt?.trim()) return 'Informe ou gere o resumo (excerpt).';
    if (!formData.category?.trim()) return 'Selecione a categoria.';
    if (!formData.authorId) return 'Selecione um autor cadastrado.';
    return null;
  };

  const validatePublication = (): string | null => {
    if (!formData.sourceReferences?.trim()) return 'Informe as fontes consultadas antes de publicar.';
    if (!formData.reviewedBy?.trim()) return 'Informe quem revisou a materia antes de publicar.';
    if (!formData.factChecked) return 'Confirme a checagem de fatos antes de publicar.';
    if (!formData.rightsCleared) return 'Confirme direitos de imagens/fontes antes de publicar.';
    if (!formData.sensitiveContentReviewed) return 'Confirme a revisao de conteudo sensivel antes de publicar.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');
    setFormSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      setIsSaving(false);
      return;
    }

    if (!isDraft) {
      const publicationError = validatePublication();
      if (publicationError) {
        setFormError(publicationError);
        setIsSaving(false);
        return;
      }
    }

    try {
      const articleData: Partial<Article> = {
        ...formData,
        isDraft,
        excerpt: formData.excerpt || buildExcerpt(formData.title || '', formData.content || ''),
        seoTitle: formData.seoTitle || formData.title,
        seoDescription: formData.seoDescription || formData.excerpt,
        seoImage: formData.seoImage || formData.imageUrl,
        aiAssisted: Boolean(formData.aiAssisted),
        sourceReferences: formData.sourceReferences || '',
        reviewedBy: formData.reviewedBy || '',
        factChecked: Boolean(formData.factChecked),
        rightsCleared: Boolean(formData.rightsCleared),
        sensitiveContentReviewed: Boolean(formData.sensitiveContentReviewed),
      };

      await onSave(articleData, isDraft);

      if (!article) {
        localStorage.removeItem('alpes-news-editor-draft');
      }

      setFormSuccess(isDraft ? 'Rascunho salvo com sucesso.' : 'Artigo publicado com sucesso.');
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao salvar artigo:', error);
      setFormError(error instanceof Error ? error.message : 'Falha ao salvar artigo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    onPreview(formData);
  };

  const publicationChecklist = [
    { key: 'factChecked', label: 'Fatos, numeros, datas e nomes foram checados' },
    { key: 'rightsCleared', label: 'Imagens, citacoes e fontes podem ser usadas' },
    { key: 'sensitiveContentReviewed', label: 'Tema sensivel foi revisado com cuidado editorial' },
  ] as const;

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-medium text-blue-900">Assistente editorial</p>
                <p className="text-xs text-blue-700">Acelere cadastro de artigos com resumo, tags e SEO automaticos.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={handleGenerateExcerpt} className="px-3 py-2 rounded-md bg-white border border-blue-300 text-blue-800 text-sm">
                  Gerar resumo
                </button>
                <button type="button" onClick={handleSuggestTags} className="px-3 py-2 rounded-md bg-white border border-blue-300 text-blue-800 text-sm">
                  Sugerir tags
                </button>
                <button type="button" onClick={handleFillSeo} className="px-3 py-2 rounded-md bg-white border border-blue-300 text-blue-800 text-sm">
                  Preencher SEO
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Titulo *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium mb-1">Subtitulo</label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium mb-1">Resumo (excerpt) *</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="input-field"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Conteudo *</label>
              <span className="text-xs text-neutral-500">{wordCount} palavras | ~{readingMinutes} min de leitura</span>
            </div>
            <RichTextEditor initialValue={formData.content || ''} onChange={handleContentChange} />
          </div>

          <div className="border border-neutral-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Checklist editorial
                </h3>
                <p className="text-sm text-neutral-500">Obrigatorio para publicar; rascunhos podem ser salvos antes da revisao.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label htmlFor="aiAssisted" className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  id="aiAssisted"
                  checked={Boolean(formData.aiAssisted)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, aiAssisted: e.target.checked }))}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                Conteudo teve apoio de IA na pesquisa, organizacao ou redacao
              </label>

              <div>
                <label htmlFor="sourceReferences" className="block text-sm font-medium mb-1">Fontes consultadas *</label>
                <textarea
                  id="sourceReferences"
                  name="sourceReferences"
                  value={formData.sourceReferences || ''}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="Cole links, nomes de documentos, entrevistas ou observacoes internas."
                />
              </div>

              <div>
                <label htmlFor="reviewedBy" className="block text-sm font-medium mb-1">Revisado por *</label>
                <input
                  id="reviewedBy"
                  name="reviewedBy"
                  value={formData.reviewedBy || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Nome de quem revisou"
                />
              </div>

              <div className="grid gap-3">
                {publicationChecklist.map((item) => (
                  <label key={item.key} className="flex items-start gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={Boolean(formData[item.key])}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                      className="mt-1 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="authorId" className="block text-sm font-medium mb-1">Autor *</label>
            <select
              id="authorId"
              name="authorId"
              value={formData.authorId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Selecione um autor</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>{author.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Categoria *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category.replace('-', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="input-field flex-grow"
                placeholder="Adicionar tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button type="button" onClick={handleAddTag} className="ml-2 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-md transition-colors duration-200">
                Adicionar
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <div key={tag} className="flex items-center bg-neutral-100 px-3 py-1 rounded-full">
                    <span className="text-sm">{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 p-1 rounded-full hover:bg-neutral-200">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Imagem de capa *</label>
            <div className="border border-neutral-300 rounded-md p-4">
              {imagePreview ? (
                <div className="mb-4">
                  <img src={imagePreview} alt="Preview" className="w-full aspect-video object-cover rounded-md" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 bg-neutral-100 rounded-md mb-4">
                  <p className="text-neutral-400">Nenhuma imagem selecionada</p>
                </div>
              )}

              <label className="flex items-center justify-center px-4 py-2 bg-white border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-50 transition-colors duration-200">
                <Upload className="h-4 w-4 mr-2" />
                <span>Upload de imagem</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              <div className="mt-3">
                <label htmlFor="imageUrl" className="block text-xs text-neutral-500 mb-1">Ou cole uma URL de imagem</label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={(e) => {
                    handleChange(e);
                    setImagePreview(e.target.value || null);
                  }}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              {isUploadingImage && <p className="text-sm text-neutral-500 mt-2">Enviando imagem...</p>}
            </div>
          </div>

          <div>
            <label htmlFor="featured" className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Artigo em destaque</span>
            </label>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4" /> SEO</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-medium mb-1">Titulo SEO</label>
                <input
                  type="text"
                  id="seoTitle"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Se vazio, usa o titulo"
                />
              </div>

              <div>
                <label htmlFor="seoDescription" className="block text-sm font-medium mb-1">Descricao SEO</label>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  rows={3}
                  className="input-field"
                  placeholder="Se vazio, usa o resumo"
                />
              </div>

              <div>
                <label htmlFor="seoImage" className="block text-sm font-medium mb-1">URL da imagem SEO</label>
                <input
                  id="seoImage"
                  name="seoImage"
                  value={formData.seoImage || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Se vazio, usa a imagem de capa"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {formError && (
        <div className="p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{formError}</div>
      )}
      {formSuccess && (
        <div className="p-3 rounded-md border border-green-200 bg-green-50 text-green-700 text-sm">{formSuccess}</div>
      )}

      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-neutral-200">
        <button type="button" onClick={handlePreview} className="btn btn-outline flex items-center">
          <Eye className="h-4 w-4 mr-2" />
          Pre-visualizar
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          className="btn btn-outline flex items-center"
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar rascunho
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          className="btn btn-primary flex items-center"
          disabled={isSaving}
        >
          Publicar
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;
