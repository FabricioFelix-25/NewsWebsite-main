import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl transition-all duration-300 group overflow-hidden border ${
        isDark
          ? 'bg-slate-800/80 border-slate-700/80 text-amber-400 hover:bg-slate-750 hover:border-amber-500/40 shadow-lg shadow-black/30'
          : 'bg-neutral-100/90 border-neutral-200 text-neutral-700 hover:bg-neutral-200/80 hover:text-indigo-600 shadow-sm'
      } ${className}`}
      aria-label={isDark ? 'Mudar para o Modo Claro' : 'Mudar para o Modo Noturno'}
      title={isDark ? 'Mudar para o Modo Claro' : 'Mudar para o Modo Noturno'}
    >
      {/* Halo de luz ambiente no hover */}
      <span
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none ${
          isDark ? 'bg-amber-400/10' : 'bg-indigo-500/10'
        }`}
      />

      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="h-5 w-5 transform transition-transform duration-500 rotate-0 scale-100 group-hover:rotate-45 text-amber-400" />
        ) : (
          <Moon className="h-5 w-5 transform transition-transform duration-500 rotate-0 scale-100 group-hover:-rotate-12 text-slate-700" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
