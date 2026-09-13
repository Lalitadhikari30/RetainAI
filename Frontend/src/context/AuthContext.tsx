import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, setAuthToken } from '../api/service';

export type UserRole = 'HR Admin' | 'People Manager';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser;
  login: (email?: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const defaultUser: AuthUser = {
  name: 'Elena Vance',
  email: 'elena.vance@company.com',
  role: 'HR Admin',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check for stored user session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem('retainai_token') || localStorage.getItem('retainai_token'));
  });

  const [user, setUser] = useState<AuthUser>(() => {
    const saved = sessionStorage.getItem('retainai_user') || localStorage.getItem('retainai_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignore parse error
      }
    }
    return defaultUser;
  });

  // Listen for auto-logout event (401 from API)
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('retainai:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('retainai:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email?: string, password?: string, role: UserRole = 'HR Admin') => {
    const effectiveEmail = email || (role === 'HR Admin' ? 'elena.vance@company.com' : 'alex.chen@company.com');
    const effectivePassword = password || 'password123';

    try {
      const data = await loginApi(effectiveEmail, effectivePassword);
      const mappedRole: UserRole = data.role === 'HR_ADMIN' ? 'HR Admin' : 'People Manager';

      const authenticatedUser: AuthUser = {
        name: data.name || (mappedRole === 'HR Admin' ? 'Elena Vance' : 'Alex Chen'),
        email: effectiveEmail,
        role: mappedRole,
        avatar: defaultUser.avatar,
      };

      setIsAuthenticated(true);
      setUser(authenticatedUser);
      sessionStorage.setItem('retainai_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('retainai_user', JSON.stringify(authenticatedUser));
    } catch (err) {
      // Fallback for demo mode if backend is unreachable
      console.warn('Backend login error, falling back to local session:', err);
      const fallbackUser: AuthUser = {
        name: role === 'HR Admin' ? 'Elena Vance' : 'Alex Chen',
        email: effectiveEmail,
        role,
        avatar: defaultUser.avatar,
      };
      setIsAuthenticated(true);
      setUser(fallbackUser);
      sessionStorage.setItem('retainai_user', JSON.stringify(fallbackUser));
      localStorage.setItem('retainai_user', JSON.stringify(fallbackUser));
      throw err;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    sessionStorage.removeItem('retainai_user');
    localStorage.removeItem('retainai_user');
  };

  const switchRole = (role: UserRole) => {
    const updated: AuthUser = {
      ...user,
      role,
      name: role === 'HR Admin' ? 'Elena Vance' : 'Alex Chen',
      email: role === 'HR Admin' ? 'elena.vance@company.com' : 'alex.chen@company.com',
    };
    setUser(updated);
    sessionStorage.setItem('retainai_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
