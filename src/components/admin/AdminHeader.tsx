import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ThemeToggle';

const AdminHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-[#0b0f19] border-b border-neutral-200 dark:border-slate-800 py-3.5 px-6 transition-colors">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar artigos..."
              className="pl-10 pr-4 py-2 w-full bg-neutral-50 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 text-neutral-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3 md:space-x-4">
          <ThemeToggle />
          <button className="relative p-2 rounded-xl text-neutral-600 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors" aria-label="Notificações">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <div className="flex items-center space-x-3 pl-2 border-l border-neutral-200 dark:border-slate-800">
            <div className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-neutral-300 dark:ring-slate-700">
              <img
                src={user?.avatarUrl || "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"}
                alt={user?.name || "Admin user"}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-medium text-sm hidden md:block text-neutral-800 dark:text-slate-200">
              {user?.name || "Admin"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;