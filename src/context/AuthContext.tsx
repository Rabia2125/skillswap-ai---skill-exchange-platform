import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; location: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  authModalOpen: boolean;
  authModalReason: string;
  authModalTab: 'login' | 'register';
  openAuthModal: (reason?: string, tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  demoLogin: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          setToken(storedToken);
          setStoredAuth(storedToken, res.user);
        } catch {
          // Token invalid or expired
          clearStoredAuth();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setStoredAuth(res.token, res.user);
    setUser(res.user);
    setToken(res.token);
    setAuthModalOpen(false);
  };

  const demoLogin = async (email: string) => {
    await login(email, 'password123');
  };

  const register = async (data: { name: string; email: string; password: string; location: string }) => {
    const res = await api.register(data);
    setStoredAuth(res.token, res.user);
    setUser(res.user);
    setToken(res.token);
    setAuthModalOpen(false);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    const currentToken = getStoredToken();
    if (currentToken) {
      setStoredAuth(currentToken, updatedUser);
    }
  };

  const openAuthModal = (reason = 'Please log in to continue', tab: 'login' | 'register' = 'login') => {
    setAuthModalReason(reason);
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        authModalOpen,
        authModalReason,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        demoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
