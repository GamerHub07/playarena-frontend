"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface User {
  _id: string;
  username: string;
  email: string;
  points: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (creds: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      loadUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (authToken: string) => {
    try {
      const { data } = await authApi.getProfile();
      setUser(data);
    } catch (error) {
      console.error('Failed to load user', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (creds: any) => {
    const { data } = await authApi.login(creds);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);

    // Reconnect socket with new token
    const socket = getSocket();
    socket.auth = { token: data.token };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  };

  const register = async (userData: any) => {
    const { data } = await authApi.register(userData);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);

    // Reconnect socket with new token
    const socket = getSocket();
    socket.auth = { token: data.token };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);

    // Reconnect socket as guest (no token)
    const socket = getSocket();
    socket.auth = { token: null };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
