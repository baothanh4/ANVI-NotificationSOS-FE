import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Fetch full user profile from backend
          const profile = await axiosClient.get('/users/profile');
          setUser({ ...profile, token });
        } catch (e) {
          console.error('Failed to fetch profile', e);
          const decoded = parseJwt(token);
          if (decoded && decoded.sub) {
            setUser({ token, id: decoded.sub });
          } else {
            setUser({ token });
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (phone, password) => {
    const res = await axiosClient.post('/auth/login', { phoneOrEmail: phone, password });
    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);
    
    // Fetch full profile after login
    try {
      const profile = await axiosClient.get('/users/profile');
      setUser({ ...profile, token: res.accessToken });
    } catch (e) {
      const decoded = parseJwt(res.accessToken);
      setUser({ token: res.accessToken, id: decoded?.sub });
    }
  };

  const register = async (data) => {
    const res = await axiosClient.post('/auth/register', data);
    return res;
  };

  const updateProfile = async (data) => {
    const updatedUser = await axiosClient.put('/users/profile', data);
    setUser(prev => ({ ...prev, ...updatedUser }));
    return updatedUser;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

