import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Debug logging
  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    isAdmin,
    adminOnly,
    loading,
    userType: localStorage.getItem('user_type')
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('Redirecting non-admin to user page');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
