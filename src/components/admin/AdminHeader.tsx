import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-200 py-4 px-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-neutral-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <img
                src={user?.avatarUrl || "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"}
                alt={user?.name || "Admin user"}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-medium text-sm hidden md:block">
              {user?.name || "Admin"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;