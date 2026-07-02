import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, ArrowUp, ArrowDown, Send } from 'lucide-react';
import { Article } from '../../types';
import { getCategoryLabel } from '../../utils/categoryColors';

interface ArticleListProps {
  articles: Article[];
  onDelete: (id: string) => void;
  onPublish?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
}

type SortField = 'title' | 'category' | 'publishedAt' | 'status' | 'views';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'published' | 'draft';

const ArticleList: React.FC<ArticleListProps> = ({ articles, onDelete, onPublish, onBulkDelete }) => {
  const [sortField, setSortField] = useState<SortField>('publishedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedArticles = useMemo(() => {
    return [...articles]
      .filter((article) => {
        const query = searchQuery.toLowerCase();
        const matchesText =
          article.title.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query) ||
          (article.tags || []).some((tag) => tag.toLowerCase().includes(query));

        if (!matchesText) {
          return false;
        }

        if (statusFilter === 'published') {
          return !article.isDraft;
        }

        if (statusFilter === 'draft') {
          return article.isDraft;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;

        if (sortField === 'title') {
          comparison = a.title.localeCompare(b.title);
        } else if (sortField === 'category') {
          comparison = a.category.localeCompare(b.category);
        } else if (sortField === 'publishedAt') {
          comparison = new Date(a.publishedAt || a.updatedAt).getTime() - new Date(b.publishedAt || b.updatedAt).getTime();
        } else if (sortField === 'status') {
          comparison = (a.isDraft ? 1 : 0) - (b.isDraft ? 1 : 0);
        } else if (sortField === 'views') {
          comparison = (a.viewCount || a.views || 0) - (b.viewCount || b.views || 0);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [articles, searchQuery, sortField, sortDirection, statusFilter]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedArticles.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Tem certeza que deseja apagar os ${selectedIds.length} artigos selecionados? Esta acao nao pode ser desfeita.`)) {
      if (onBulkDelete) {
        onBulkDelete(selectedIds);
        setSelectedIds([]);
      } else {
        selectedIds.forEach(id => onDelete(id));
        setSelectedIds([]);
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por titulo, categoria ou tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full md:w-96"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="input-field md:w-56"
        >
          <option value="all">Todos os status</option>
          <option value="published">Somente publicados</option>
          <option value="draft">Somente rascunhos</option>
        </select>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ml-auto"
          >
            <Trash2 className="h-5 w-5" />
            <span>Apagar Selecionados ({selectedIds.length})</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  checked={sortedArticles.length > 0 && selectedIds.length === sortedArticles.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">Titulo {renderSortIcon('title')}</div>
              </th>

              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">Categoria {renderSortIcon('category')}</div>
              </th>

              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('publishedAt')}
              >
                <div className="flex items-center">Data {renderSortIcon('publishedAt')}</div>
              </th>

              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('views')}
              >
                <div className="flex items-center">Visualizacoes {renderSortIcon('views')}</div>
              </th>

              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">Status {renderSortIcon('status')}</div>
              </th>

              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Acoes
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-neutral-200">
            {sortedArticles.length > 0 ? (
              sortedArticles.map((article) => (
                <tr key={article.id} className={`hover:bg-neutral-50 ${selectedIds.includes(article.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      checked={selectedIds.includes(article.id)}
                      onChange={() => handleSelectOne(article.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900 max-w-[300px] truncate">{article.title}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-500">{getCategoryLabel(article.category)}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-500">
                      {new Date(article.publishedAt || article.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-neutral-700">{article.viewCount || article.views || 0}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.isDraft ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {article.isDraft ? 'Rascunho' : 'Publicado'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/article/${article.slug}`} className="text-neutral-400 hover:text-neutral-900" target="_blank" title="Ver">
                        <Eye className="h-5 w-5" />
                      </Link>

                      <Link to={`/admin/article/edit/${article.id}`} className="text-blue-500 hover:text-blue-700" title="Editar">
                        <Edit className="h-5 w-5" />
                      </Link>

                      {article.isDraft && onPublish && (
                        <button
                          onClick={() => onPublish(article.id)}
                          className="text-emerald-600 hover:text-emerald-800"
                          title="Publicar rascunho"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      )}

                      <button onClick={() => onDelete(article.id)} className="text-red-500 hover:text-red-700" title="Excluir">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-neutral-500">
                  Nenhum artigo encontrado para os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticleList;
