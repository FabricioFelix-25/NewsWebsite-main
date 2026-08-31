import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onClose?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      if (onClose) onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400 dark:text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Buscar materias..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field pl-10 bg-white dark:bg-slate-800 border-neutral-300 dark:border-slate-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-slate-500"
          autoFocus
        />
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 p-2 rounded-full text-neutral-600 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Fechar busca"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <button
        type="submit"
        className="ml-2 btn btn-primary"
      >
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;
