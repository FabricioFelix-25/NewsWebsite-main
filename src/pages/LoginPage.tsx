import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Mail, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, forgotPassword, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('As senhas nao coincidem');
      return;
    }
    
    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        role: 'admin'
      });
      setSuccess('Conta criada com sucesso! Voce pode fazer login agora.');
      setMode('login');
      setName('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setSuccess('Token de recuperacao enviado! Use-o para redefinir sua senha.');
      setMode('reset');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar token de recuperacao');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('As senhas nao coincidem');
      return;
    }
    
    setIsLoading(true);
    try {
      await resetPassword(resetToken, password);
      setSuccess('Senha redefinida com sucesso! Voce pode fazer login agora.');
      setMode('login');
      setResetToken('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">
            {mode === 'login' && 'Login AlpesNews'}
            {mode === 'register' && 'Criar Conta'}
            {mode === 'forgot' && 'Recuperar Senha'}
            {mode === 'reset' && 'Redefinir Senha'}
          </h1>
          <p className="text-neutral-600 mb-6">
            {mode === 'login' && 'Entre para acessar o painel do AlpesNews'}
            {mode === 'register' && 'Crie uma nova conta de administrador'}
            {mode === 'forgot' && 'Digite seu email para recuperar a senha'}
            {mode === 'reset' && 'Digite o token e sua nova senha'}
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 mb-6">
            <p>{success}</p>
          </div>
        )}
        
        {mode === 'login' && (
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 input-field"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 input-field"
                  placeholder="********"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setMode('register'); resetForm(); }}
                className="text-sm font-medium hover:underline"
                style={{ color: 'rgb(var(--color-tech-primary))' }}
              >
                Criar conta
              </button>
              
              <button
                type="button"
                onClick={() => { setMode('forgot'); resetForm(); }}
                className="text-sm font-medium hover:underline"
                style={{ color: 'rgb(var(--color-tech-primary))' }}
              >
                Esqueceu a senha?
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'rgb(var(--color-tech-primary))' }}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 input-field"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 input-field"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 input-field"
                  placeholder="********"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 input-field"
                  placeholder="********"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => { setMode('login'); resetForm(); }}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'rgb(var(--color-tech-primary))' }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isLoading ? 'Criando...' : 'Criar Conta'}
              </button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form className="space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 input-field"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => { setMode('login'); resetForm(); }}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'rgb(var(--color-tech-primary))' }}
              >
                {isLoading ? 'Enviando...' : 'Enviar Token'}
              </button>
            </div>
          </form>
        )}

        {mode === 'reset' && (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="resetToken" className="block text-sm font-medium text-neutral-700 mb-1">
                Token de Recuperacao
              </label>
              <input
                id="resetToken"
                name="resetToken"
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="input-field"
                placeholder="Cole o token aqui"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 input-field"
                  placeholder="********"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 input-field"
                  placeholder="********"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => { setMode('login'); resetForm(); }}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'rgb(var(--color-tech-primary))' }}
              >
                {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

