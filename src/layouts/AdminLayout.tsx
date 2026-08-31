import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const canAccessAdmin = Boolean(user && ['admin', 'editor', 'author'].includes(user.role));
  
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !canAccessAdmin)) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, canAccessAdmin, navigate]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="admin-scope min-h-screen bg-neutral-100 dark:bg-[#070b12] text-neutral-900 dark:text-slate-100 flex transition-colors">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-[#070b12] p-6 transition-colors">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
