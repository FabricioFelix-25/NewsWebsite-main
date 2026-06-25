import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-9xl font-bold text-neutral-200">404</div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Pagina nao encontrada</h1>
      <p className="text-neutral-600 mb-8 max-w-md">
        A pagina que voce procura pode ter sido removida, renomeada ou esta indisponivel no momento.
      </p>
      <Link
        to="/"
        className="flex items-center px-6 py-3 rounded-md font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors duration-200"
      >
        <Home className="h-5 w-5 mr-2" />
        Voltar para inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
