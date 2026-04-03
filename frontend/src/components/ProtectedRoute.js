import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  // Debug logging
  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    isAdmin,
    adminOnly,
    loading,
    userType: localStorage.getItem('user_type'),
    accessToken: localStorage.getItem('access_token') ? 'exists' : 'missing',
    userFromStorage: localStorage.getItem('user'),
    userObject: user
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('Admin route accessed but user is not admin, redirecting to profile');
    return <Navigate to="/profile" replace />;
  }

  console.log('ProtectedRoute: All checks passed, rendering children');
  return children;
};

export default ProtectedRoute;
