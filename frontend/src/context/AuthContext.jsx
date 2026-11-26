import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On load, use the saved token to fetch the current user
  useEffect(() => {
    if (!localStorage.getItem('token')) return setLoading(false);
    api.get('/api/auth/me')
      .then((res) => setUser(res.data.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };
  const login = async (email, password) => saveSession((await api.post('/api/auth/login', { email, password })).data.data);
  const register = async (name, email, password) => saveSession((await api.post('/api/auth/register', { name, email, password })).data.data);
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export { AuthProvider, useAuth };
