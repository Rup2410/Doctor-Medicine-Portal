import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState('LIGHT'); // 'LIGHT', 'DARK', 'SYSTEM'
  const [reduceMotion, setReduceMotion] = useState(false);

  // Apply Theme class (light vs dark) based on themeMode and system preference
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      let isDark = false;

      if (themeMode === 'DARK') {
        isDark = true;
      } else if (themeMode === 'LIGHT') {
        isDark = false;
      } else if (themeMode === 'SYSTEM') {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      if (reduceMotion) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }
    };

    applyTheme();

    // Listen for OS system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeMode === 'SYSTEM') applyTheme();
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [themeMode, reduceMotion]);

  useEffect(() => {
    const storedToken = localStorage.getItem('doctor_token');
    const storedUser = localStorage.getItem('doctor_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.themePreference) setThemeMode(parsed.themePreference);
        if (parsed.reduceMotion) setReduceMotion(parsed.reduceMotion);
      } catch (e) {
        localStorage.removeItem('doctor_user');
      }
    }
    setLoading(false);
  }, []);

  const refreshProfile = async () => {
    try {
      const res = await api.get('/doctors/me');
      const data = res.data;
      setUser(data);
      if (data.themePreference) setThemeMode(data.themePreference);
      if (data.reduceMotion) setReduceMotion(data.reduceMotion);
      localStorage.setItem('doctor_user', JSON.stringify(data));
      return data;
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    
    setToken(data.token);
    localStorage.setItem('doctor_token', data.token);
    
    // Fetch complete profile
    const profileRes = await api.get('/doctors/me', {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    const profile = profileRes.data;
    
    setUser(profile);
    if (profile.themePreference) setThemeMode(profile.themePreference);
    if (profile.reduceMotion) setReduceMotion(profile.reduceMotion);
    localStorage.setItem('doctor_user', JSON.stringify(profile));

    return data;
  };

  const register = async (name, email, phone, password) => {
    const response = await api.post('/auth/register', { name, email, phone, password });
    const data = response.data;
    
    setToken(data.token);
    localStorage.setItem('doctor_token', data.token);
    
    const profileRes = await api.get('/doctors/me', {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    const profile = profileRes.data;
    
    setUser(profile);
    if (profile.themePreference) setThemeMode(profile.themePreference);
    localStorage.setItem('doctor_user', JSON.stringify(profile));

    return data;
  };

  const updateTheme = async (newTheme) => {
    setThemeMode(newTheme);
    if (user) {
      const updatedUser = { ...user, themePreference: newTheme };
      setUser(updatedUser);
      localStorage.setItem('doctor_user', JSON.stringify(updatedUser));
      try {
        await api.put('/doctors/preferences', { themePreference: newTheme });
      } catch (e) {
        console.error('Failed to save theme preference to server', e);
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('doctor_token');
    localStorage.removeItem('doctor_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      loading, 
      themeMode, 
      reduceMotion,
      setReduceMotion,
      updateTheme, 
      refreshProfile, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
