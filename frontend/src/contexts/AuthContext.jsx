// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // Logout only on real 401
  // Inside AuthProvider
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Only logout if we were previously authenticated
      if (isAuthenticated) {
        console.warn('[401] Unauthorized → logging out');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        toast.error('Session expired. Please log in again.', { duration: 4000 });
      }
      // Do NOT log out on initial load (401 is normal when not logged in)
    }
    return Promise.reject(err);
  }
);

  const normalizeUser = (rawUser) => {
    if (!rawUser) return null;

    let profilePic = rawUser.profilePicture;
    if (profilePic && !profilePic.startsWith('http') && !profilePic.startsWith('blob:')) {
      profilePic = `${API_BASE}${profilePic.startsWith('/') ? '' : '/'}${profilePic}`;
    }

    return { ...rawUser, profilePicture: profilePic || null };
  };

  // Load from cache (fast UI) — runs once
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(normalizeUser(parsed));
        setIsAuthenticated(true);
      } catch (e) {
        console.warn('[localStorage parse error]', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Verify auth once on mount
  useEffect(() => {
    const verifyAuth = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/auth/profile');
        const freshUser = normalizeUser(res.data);

        // Only update if different (prevents loop)
        if (JSON.stringify(freshUser) !== JSON.stringify(user)) {
          setUser(freshUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      } catch (err) {
        // Only clear on real failure
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []); // empty deps = run once

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const profileRes = await api.get('/api/auth/profile');
      const freshUser = normalizeUser(profileRes.data);
      setUser(freshUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(freshUser));
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Login failed' };
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post('/api/auth/register', data);
      const profileRes = await api.get('/api/auth/profile');
      const freshUser = normalizeUser(profileRes.data);
      setUser(freshUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(freshUser));
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      toast.success('Logged out successfully');
    } catch (err) {
      console.warn('[Logout failed]', err);
      toast.error('Logout failed, but signed out locally');
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (formData) => {
    try {
      await api.patch('/api/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const profileRes = await api.get('/api/auth/profile');
      const freshUser = normalizeUser(profileRes.data);
      setUser(freshUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(freshUser));
      toast.success('Profile updated successfully');
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      throw msg;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
        api,
        API_BASE,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};