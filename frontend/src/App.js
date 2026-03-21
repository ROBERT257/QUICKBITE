import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './pages/Order';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminDashboard from './pages/ModernAdminDashboard';
import AdminTest from './pages/AdminTest';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/menu",
    element: <Menu />
  },
  {
    path: "/order",
    element: <Order />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/admin-test",
    element: <AdminTest />
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>
  },
  {
    path: "/orders",
    element: <ProtectedRoute><Orders /></ProtectedRoute>
  },
  {
    path: "/admin-secure",
    element: <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
  },
  {
    path: "/admin",
    element: <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
  }
]);

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}>
          <div className="min-h-screen relative">
            <Navbar />
            <Routes>
              {/* No need to define routes here, they are defined in the router */}
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  maxWidth: '400px'
                }
              }}
            />
          </div>
        </RouterProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
