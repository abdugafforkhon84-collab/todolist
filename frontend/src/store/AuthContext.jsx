import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('crm_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('crm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem('crm_token'));
      const saved = localStorage.getItem('crm_user');
      setUser(saved ? JSON.parse(saved) : null);
    };

    window.addEventListener('auth_change', handleAuthChange);
    return () => window.removeEventListener('auth_change', handleAuthChange);
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          localStorage.setItem('crm_user', JSON.stringify(userData));
        } catch (err) {
          console.warn('Токен недействителен, выход:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('crm_token', res.access_token);
    localStorage.setItem('crm_user', JSON.stringify(res.user));
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
