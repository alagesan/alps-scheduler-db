import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('jwt_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          // Validate token with backend
          const response = await api.get('/auth/validate', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.valid) {
            setUser(JSON.parse(userData));
            // Set default auth header for all requests
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            // Token invalid, clear storage
            logout();
          }
        } catch (err) {
          console.error('Token validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (googleCredential) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/google', { token: googleCredential });

      const { token, email, name, picture, role, status } = response.data;

      const userData = { email, name, picture, role, status };

      // Store token and user data
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));

      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      setLoading(false);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
  };

  const isAdmin = () => {
    return user?.role?.toLowerCase() === 'admin';
  };

  const isStaff = () => {
    return user?.role?.toLowerCase() === 'staff';
  };

  const canAccessRoute = (route) => {
    if (!user) return false;

    // Admin can access everything
    if (isAdmin()) return true;

    // Staff can only access home
    if (isStaff()) {
      const staffAllowedRoutes = ['/', '/home'];
      return staffAllowedRoutes.includes(route);
    }

    return false;
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isStaff,
    canAccessRoute,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
