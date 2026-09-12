import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout: React.FC = () => {
  
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-neutral-100 p-4 md:p-6">
          <div className="container mx-auto min-w-0">
            <Suspense fallback={<div role="status" className="min-h-[70vh]">Carregando painel…</div>}><Outlet /></Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
