import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AdminTest = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  console.log('AdminTest Debug:', {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    token: localStorage.getItem('access_token'),
    userType: localStorage.getItem('user_type')
  });

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Admin Authentication Test</h2>
      <p><strong>User:</strong> {JSON.stringify(user, null, 2)}</p>
      <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'YES' : 'NO'}</p>
      <p><strong>Is Admin:</strong> {isAdmin ? 'YES' : 'NO'}</p>
      <p><strong>User Type:</strong> {localStorage.getItem('user_type') || 'NOT_SET'}</p>
      <p><strong>Token:</strong> {localStorage.getItem('access_token')?.substring(0, 20)}...</p>
      <hr />
      <p>If you see this page, the basic routing and authentication are working.</p>
      <p>Next step: Try accessing <a href="/admin-secure">/admin-secure</a></p>
    </div>
  );
};

export default AdminTest;
