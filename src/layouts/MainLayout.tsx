import React, { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getSectionFromPath } from '../utils/categoryColors';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const currentSection = useMemo(() => getSectionFromPath(location.pathname), [location.pathname]);

  return (
    <div className={`min-h-screen flex flex-col section-${currentSection}`}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
