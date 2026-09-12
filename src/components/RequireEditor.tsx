import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireEditor() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <div role="status" className="min-h-[70vh] flex items-center justify-center">Verificando sua sessão…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (!['admin', 'editor'].includes(user.role)) return <div role="alert" className="max-w-xl mx-auto p-8">Sua conta não tem permissão para revisar matérias. Solicite acesso ao administrador.</div>;
  return <Outlet />;
}
