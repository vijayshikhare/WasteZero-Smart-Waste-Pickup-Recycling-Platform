// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Public API instance (no credentials needed for public endpoints)
export const publicApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const api = useMemo(
    () =>
      axios.create({
        baseURL: API_BASE,
        withCredentials: true,           // Crucial: sends httpOnly cookies automatically
        headers: { 'Content-Type': 'application/json' },
      }),
    []
  );

  // Global 401 response interceptor – only logout if we thought we were logged in
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          if (isAuthenticated) {
            console.warn('[Auth] 401 detected → forcing logout');
            toast.error('Session expired. Please log in again.', { duration: 6000 });
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
          }
          // Silent fail on initial/unauthenticated requests
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [api, isAuthenticated]);

  // Normalize user – especially profile picture URLs
  const normalizeUser = (raw) => {
    if (!raw) return null;

    let profilePicture = raw.profilePicture;
    if (profilePicture && !profilePicture.startsWith('http') && !profilePicture.startsWith('blob:')) {
      profilePicture = `${API_BASE}${profilePicture.startsWith('/') ? '' : '/'}${profilePicture}`;
    }

    return { ...raw, profilePicture: profilePicture || null };
  };

  // 1. Fast UI: restore from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized = normalizeUser(parsed);
        setUser(normalized);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.warn('Invalid user data in localStorage → cleared');
      localStorage.removeItem('user');
    }
  }, []);

  // 2. Server truth check on mount (fixes reload 401 / stale state)
  useEffect(() => {
    const verifyAuth = async () => {
      setLoading(true);
      try {
        // Use api instance with credentials to check auth status
        const { data } = await api.get('/api/auth/profile');
        const freshUser = normalizeUser(data);

        setUser(freshUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch (err) {
        // 401 is expected for unauthenticated users – but try token fallback
        if (err.response?.status === 401) {
          const storedToken = localStorage.getItem('authToken');
          if (storedToken) {
            // set Authorization header and retry once
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            try {
              const { data: d2 } = await api.get('/api/auth/profile');
              const freshUser2 = normalizeUser(d2);
              setUser(freshUser2);
              setIsAuthenticated(true);
              localStorage.setItem('user', JSON.stringify(freshUser2));
              return;
            } catch (err2) {
              // fallback to unauthenticated state
              delete api.defaults.headers.common['Authorization'];
              localStorage.removeItem('authToken');
            }
          }
        } else if (err.response?.status >= 500) {
          console.error('[Auth verify failed]', err.message);
          toast.error('Cannot connect to server');
        }

        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [api]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });

      // If server returned token (fallback), store and set header
      if (res.data?.token) {
        localStorage.setItem('authToken', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }

      // Sync profile immediately after successful login
      const { data } = await api.get('/api/auth/profile');
      const freshUser = normalizeUser(data);

      setUser(freshUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(freshUser));

      toast.success('Logged in successfully!');
      return freshUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      throw new Error(message);
    }
  };

  // NEW: Dedicated method for OTP verification flow
  const verifyOtp = async (email, otpCode) => {
    try {
      const res = await api.post('/api/auth/verify-otp', {
        email,
        otp: otpCode,
      });

      if (res.data?.token) {
        localStorage.setItem('authToken', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }

      // Critical: fetch profile right after verify to activate session
      const { data } = await api.get('/api/auth/profile');
      const freshUser = normalizeUser(data);

      setUser(freshUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(freshUser));

      toast.success('OTP verified! Welcome back.');
      return freshUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      toast.error(message);
      throw new Error(message);
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post('/api/auth/register', data);

      if (res.data?.token) {
        localStorage.setItem('authToken', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }

      // Assuming register auto-logs in (common pattern)
      const { data: profile } = await api.get('/api/auth/profile');
      const freshUser = normalizeUser(profile);

      setUser(freshUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(freshUser));

      toast.success('Registered and logged in successfully!');
      return freshUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      toast.success('Logged out successfully');
    } catch (err) {
      console.warn('[Logout failed on server]', err);
      toast.error('Server logout failed, but signed out locally');
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

      // Refresh after update
      const { data } = await api.get('/api/auth/profile');
      const freshUser = normalizeUser(data);

      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));

      toast.success('Profile updated successfully!');
      return freshUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      throw new Error(message);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      login,
      verifyOtp,          // ← NEW – use this in Login/OTP component
      register,
      logout,
      updateProfile,
      api,
      API_BASE,
    }),
    [user, isAuthenticated, loading, api]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};