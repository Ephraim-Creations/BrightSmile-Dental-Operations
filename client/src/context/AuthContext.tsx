import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, setStoredToken } from '../lib/api';

export interface AdminUser {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: AdminUser }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  requestVerification: (email: string) => Promise<{ success: boolean; message: string; debugOtp?: string; previewUrl?: string }>;
  verifyCode: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/auth/me');
      if (res.authenticated && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
        setStoredToken(null);
      }
    } catch {
      setUser(null);
      setStoredToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginWithPassword = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.token) {
      setStoredToken(res.token);
    }
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await api.put('/api/auth/change-password', { currentPassword, newPassword });
    return res;
  };

  const requestVerification = async (email: string) => {
    const res = await api.post('/api/auth/request-verification', { email });
    return res;
  };

  const verifyCode = async (email: string, otp: string) => {
    const res = await api.post('/api/auth/verify', { email, otp });
    if (res.token) {
      setStoredToken(res.token);
    }
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Continue cleanup on failure
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithPassword,
        changePassword,
        requestVerification,
        verifyCode,
        logout,
        checkAuth,
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
