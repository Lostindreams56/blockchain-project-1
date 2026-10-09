import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../services/authService';
import { setOnSessionExpired } from '../lib/axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on initial application load
  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await authService.refresh();
      setUser(data.user);
    } catch {
      // Unauthenticated visitor or expired session; clean state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Listen for session expiration events from Axios response interceptor
    setOnSessionExpired(() => {
      setUser(null);
    });

    void restoreSession();
  }, [restoreSession]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const data = await authService.login(credentials);
    setUser(data.user);
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    const data = await authService.register(credentials);
    setUser(data.user);
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
