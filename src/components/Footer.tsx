import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-200 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-medium mb-4">AlpesNews</h3>
            <p className="text-neutral-400">
              Seu portal de noticias sobre tecnologia, geopolitica, programacao e games.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-white transition-colors duration-200" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Categorias</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/category/tech" className="hover:text-white transition-colors duration-200">
                  Tecnologia
                </Link>
              </li>
              <li>
                <Link to="/category/geopolitics" className="hover:text-white transition-colors duration-200">
                  Geopolitica
                </Link>
              </li>
              <li>
                <Link to="/category/programming" className="hover:text-white transition-colors duration-200">
                  Programacao
                </Link>
              </li>
              <li>
                <Link to="/category/games" className="hover:text-white transition-colors duration-200">
                  Games
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Links rapidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-white transition-colors duration-200">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors duration-200">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors duration-200">
                  Politica de privacidade
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors duration-200">
                  Politica de cookies
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors duration-200">
                  Termos de uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Newsletter</h4>
            <p className="text-neutral-400 mb-4">Receba um resumo semanal com os principais destaques.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Seu email"
                className="px-4 py-2 rounded-l-md w-full bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-500"
              />
              <button
                type="submit"
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-r-md transition-colors duration-200"
              >
                Assinar
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; {new Date().getFullYear()} AlpesNews. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
