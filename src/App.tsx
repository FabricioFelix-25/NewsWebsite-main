import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NewsProvider } from './contexts/NewsContext';
import { TermsProvider } from './contexts/TermsContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import RequireEditor from './components/RequireEditor';
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
import SearchPage from './pages/SearchPage';
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminArticleEditor = lazy(() => import('./pages/admin/ArticleEditor'));
const ArticlePreview = lazy(() => import('./pages/admin/ArticlePreview'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
import NotFoundPage from './pages/NotFoundPage';
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <NewsProvider>
          <TermsProvider>
            <Suspense fallback={<div role="status" className="min-h-screen flex items-center justify-center">Carregando…</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="category/:categorySlug" element={<CategoryPage />} />
                <Route path="article/:articleSlug" element={<ArticlePage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="cookies" element={<CookiePolicyPage />} />
                <Route path="terms" element={<TermsPage />} />
              </Route>

              <Route element={<RequireEditor />}>
                <Route element={<MainLayout />}>
                  <Route path="/admin/articles/:id/preview" element={<ArticlePreview />} />
                </Route>
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Admin Routes */}
              <Route element={<RequireEditor />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="article/new" element={<AdminArticleEditor />} />
                <Route path="article/edit/:id" element={<AdminArticleEditor />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </Suspense>
          </TermsProvider>
        </NewsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
