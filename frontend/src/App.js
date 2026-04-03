import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import PremiumNavigation from './components/PremiumNavigation';
import PremiumAIChat from './components/PremiumAIChat';
import PremiumAuth from './pages/PremiumAuth';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './pages/Order';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/SecureAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

const RedirectByRole = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/profile', { replace: true });
    }
  }, [isAdmin, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen relative">
            <PremiumNavigation />
            <PremiumAIChat />
            <main className="pt-16">
              <Routes>
                <Route path="/login" element={<PremiumAuth isLogin={true} />} />
                <Route path="/signup" element={<PremiumAuth isLogin={false} />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/order" element={<Order />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <RedirectByRole />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                },
              }}
            />
          </div>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
