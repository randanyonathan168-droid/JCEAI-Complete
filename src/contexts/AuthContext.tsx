import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, AuthState, AuthResponse } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, confirmPassword: string, displayName: string, jenjang: string, kelas: string) => Promise<AuthResponse>;
  loginWithGoogle: (googleId: string, email: string, displayName: string, avatar?: string) => Promise<AuthResponse>;
  linkGoogle: (googleId: string, googleEmail: string, googleDisplayName: string, googleAvatar?: string) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        setError(data.error || data.message);
        return data;
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
      }

      if (data.user) {
        setUser(data.user);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat login';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: 'NETWORK_ERROR',
      };
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  const register = useCallback(async (
    email: string,
    password: string,
    confirmPassword: string,
    displayName: string,
    jenjang: string,
    kelas: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          displayName,
          jenjang,
          kelas,
        }),
        credentials: 'include',
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        setError(data.error || data.message);
        return data;
      }

      if (data.user) {
        setUser(data.user);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat registrasi';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: 'NETWORK_ERROR',
      };
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  const loginWithGoogle = useCallback(async (
    googleId: string,
    email: string,
    displayName: string,
    avatar?: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId,
          email,
          displayName,
          avatar,
        }),
        credentials: 'include',
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        setError(data.error || data.message);
        return data;
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
      }

      if (data.user) {
        setUser(data.user);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat login Google';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: 'NETWORK_ERROR',
      };
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  const linkGoogle = useCallback(async (
    googleId: string,
    googleEmail: string,
    googleDisplayName: string,
    googleAvatar?: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/link-google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          googleId,
          googleEmail,
          googleDisplayName,
          googleAvatar,
        }),
        credentials: 'include',
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        setError(data.error || data.message);
        return data;
      }

      if (data.user) {
        setUser({ ...user, ...data.user } as User);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat link Google';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: 'NETWORK_ERROR',
      };
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, token, user]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    loginWithGoogle,
    linkGoogle,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
