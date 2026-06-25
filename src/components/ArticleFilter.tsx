import React, { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { getCategoryLabel } from '../utils/categoryColors';

interface ArticleFilterProps {
  categories: string[];
  authors: string[];
  onFilter: (filters: { category?: string; author?: string; date?: string; }) => void;
}

const ArticleFilter: React.FC<ArticleFilterProps> = ({ categories, authors, onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      category: selectedCategory || undefined,
      author: selectedAuthor || undefined,
      date: selectedDate || undefined,
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedAuthor('');
    setSelectedDate('');
    onFilter({});
    setIsOpen(false);
  };

  return (
    <div className="relative mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors duration-200"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filtrar
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-md shadow-lg z-10 border border-neutral-200">
          <form onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryLabel(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Autor</label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos os autores</option>
                  {authors.map((author) => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Periodo</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todo o periodo</option>
                  <option value="today">Hoje</option>
                  <option value="week">Ultima semana</option>
                  <option value="month">Ultimo mes</option>
                  <option value="year">Ultimo ano</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline"
              >
                Limpar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Aplicar filtros
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ArticleFilter;
