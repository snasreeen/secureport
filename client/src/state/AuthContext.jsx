import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/apiClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCsrfToken = async () => {
    try {
      const res = await api.get('/csrf-token');
      if (res.data?.csrfToken) {
        sessionStorage.setItem('csrfToken', res.data.csrfToken);
      }
    } catch (e) {
      // Ignore for now; backend may be down
    }
  };

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCsrfToken();
      await fetchMe();
    })();
  }, []);

  const login = async (email, password) => {
    await fetchCsrfToken();
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    navigate('/dashboard');
  };

  const register = async (email, password) => {
    await fetchCsrfToken();
    const res = await api.post('/auth/register', { email, password });
    setUser(res.data.user);
    navigate('/dashboard');
  };

  const logout = async () => {
    await fetchCsrfToken();
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

