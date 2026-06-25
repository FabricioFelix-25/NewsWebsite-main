import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { buildApiUrl, clearAuthToken, getAuthToken, setAuthToken } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

async function parseAuthResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === 'string') {
      return record.message;
    }

    const firstValue = Object.values(record)[0];
    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return fallback;
}

async function authFetch(path: string, body: Record<string, unknown>): Promise<unknown> {
  try {
    const token = getAuthToken();
    const response = await fetch(buildApiUrl(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const payload = await parseAuthResponse(response);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearAuthToken();
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
      }
      throw new Error(getErrorMessage(payload, 'Falha na autenticacao'));
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Nao foi possivel conectar ao backend. Verifique se o Spring esta rodando.');
    }

    throw error;
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setUser(null);
          return;
        }

        const response = await fetch(buildApiUrl('/auth/me'), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          clearAuthToken();
          localStorage.removeItem('user');
          setUser(null);
          return;
        }

        const data = (await response.json()) as Record<string, unknown>;
        const userData: User = {
          id: String(data.id ?? ''),
          name: String(data.name ?? ''),
          email: String(data.email ?? ''),
          role: String(data.role || 'EDITOR').toLowerCase() as User['role'],
          avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          password: '',
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = (await authFetch('/auth/login', { email, password })) as Record<string, unknown>;
      const token = typeof data.token === 'string' ? data.token : '';
      if (!token) {
        throw new Error('Token de autenticacao invalido');
      }
      setAuthToken(token);

      const userData: User = {
        id: String(data.id ?? ''),
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        role: String(data.role || 'EDITOR').toLowerCase() as User['role'],
        avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        password: '',
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      await authFetch('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: (userData.role || 'editor').toUpperCase(),
        avatarUrl: userData.avatarUrl,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await authFetch('/auth/forgot-password', { email });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await authFetch('/auth/reset-password', { token, newPassword });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    clearAuthToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
