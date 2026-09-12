import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, Users, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setIsOpen(false); }, [pathname]);

  return (
    <aside className="bg-neutral-900 text-white w-full md:w-64 md:min-h-screen flex flex-col shrink-0">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between gap-3">
        <p className="text-lg md:text-xl font-bold mb-0">AlpesNews Admin</p>
        <button type="button" onClick={() => setIsOpen(value => !value)} aria-expanded={isOpen} aria-controls="admin-navigation" aria-label={isOpen ? 'Fechar menu do painel' : 'Abrir menu do painel'} className="md:hidden p-2 rounded-md hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div id="admin-navigation" className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
      <nav aria-label="Navegação do painel" className="flex-1 py-4">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center py-3 px-4 ${
                  isActive ? 'bg-neutral-800' : 'hover:bg-neutral-800'
                } transition-colors duration-200`
              }
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/article/new"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 ${
                  isActive ? 'bg-neutral-800' : 'hover:bg-neutral-800'
                } transition-colors duration-200`
              }
            >
              <FileText className="h-5 w-5 mr-3" />
              Novo artigo
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 ${
                  isActive ? 'bg-neutral-800' : 'hover:bg-neutral-800'
                } transition-colors duration-200`
              }
            >
              <Users className="h-5 w-5 mr-3" />
              Cadastros
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={logout}
          className="flex items-center py-2 px-4 w-full text-left hover:bg-neutral-800 rounded-md transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </button>
      </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
