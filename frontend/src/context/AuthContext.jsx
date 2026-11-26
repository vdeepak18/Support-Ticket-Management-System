import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('support-token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    api.get('/auth/me')
      .then((response) => setUser(response.data.data.user))
      .catch(() => { localStorage.removeItem('support-token'); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  async function saveSession(path, details) {
    const response = await api.post(path, details);
    const nextToken = response.data.data.token;
    localStorage.setItem('support-token', nextToken);
    setToken(nextToken);
    setUser(response.data.data.user);
    return response.data.data.user;
  }

  function logout() {
    localStorage.removeItem('support-token');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ user, token, loading, logout, login: (details) => saveSession('/auth/login', details), register: (details) => saveSession('/auth/register', details) }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
