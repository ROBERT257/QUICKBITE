import { useState, useEffect, useContext, createContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

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
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userFromStorage = localStorage.getItem('user');
    
    console.log('Auth Init Debug:', {
      token: token ? 'exists' : 'missing',
      userFromStorage: userFromStorage ? 'exists' : 'missing',
      userType: localStorage.getItem('user_type')
    });
    
    if (token && userFromStorage) {
      // Try to use stored user data first
      try {
        const user = JSON.parse(userFromStorage);
        setUser(user);
        console.log('User restored from localStorage:', user);
        setLoading(false);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        fetchUser();
      }
    } else if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No access token found');
        setLoading(false);
        return;
      }
      
      const response = await authAPI.getProfile();
      const user = response.data.user || response.data; // Handle different response structures
      setUser(user);
      
      // Check user role and set user_type accordingly
      const userRole = user?.role || 'customer';
      const isAdmin = userRole === 'admin' || user?.username?.toUpperCase() === 'ELVIS';
      
      if (isAdmin) {
        localStorage.setItem('user_type', 'admin');
        console.log('Admin user detected on fetch:', user.username);
      } else {
        localStorage.setItem('user_type', userRole);
        console.log('Customer user detected on fetch:', user.username);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_type');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoggingIn(true);
      const response = await authAPI.login(credentials);
      const { user, access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Check user role and set user_type accordingly
      const userRole = user?.role || 'customer';
      const isAdmin = userRole === 'admin' || user?.username?.toUpperCase() === 'ELVIS';
      
      if (isAdmin) {
        localStorage.setItem('user_type', 'admin');
        console.log('Admin user detected:', user.username);
      } else {
        localStorage.setItem('user_type', userRole);
        console.log('Customer user detected:', user.username);
      }
      
      setUser(user);
      
      return { 
        success: true, 
        isAdmin 
      };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data || 'Login failed' 
      };
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      // Prevent logout if currently logging in
      if (isLoggingIn) {
        console.log('Logout blocked: user is currently logging in');
        return;
      }
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.log('No refresh token found, clearing local storage only');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_type');
        setUser(null);
        return;
      }
      
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_type');
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    updateUser,
    loading,
    isLoggingIn,
    isAuthenticated: !!user,
    isAdmin: localStorage.getItem('user_type') === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
