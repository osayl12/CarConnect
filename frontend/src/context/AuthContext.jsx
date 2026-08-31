import { createContext, useState, useCallback } from 'react';
import api from '../services/api';

// eslint-disable-next-line react-refresh/only-export-components -- context object, consumed via hooks/useAuth
export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

  const persist = (nextUser, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const extractMessage = (err, fallback) => err.response?.data?.message || fallback;

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      persist(data.user, data.token);
      return data.user;
    } catch (err) {
      throw new Error(extractMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', payload);
      persist(data.user, data.token);
      return data.user;
    } catch (err) {
      throw new Error(extractMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
