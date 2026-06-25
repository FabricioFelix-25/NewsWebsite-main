import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <aside className="bg-neutral-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold">AlpesNews Admin</h1>
      </div>
      <nav className="flex-1 py-4">
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
    </aside>
  );
};

export default AdminSidebar;
