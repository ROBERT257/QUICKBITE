import React from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiShoppingCart, FiUser, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { FiLogIn, FiUserPlus, FiTrendingUp, FiPackage, FiUsers, FiShoppingBag } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const UniformLayout = ({ children, title, showSidebar = true }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(true);

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        { id: 'home', name: 'Home', icon: FiHome, path: '/' },
        { id: 'login', name: 'Login', icon: FiLogIn, path: '/login' },
        { id: 'signup', name: 'Sign Up', icon: FiUserPlus, path: '/signup' }
      ];
    }

    const baseItems = user?.role === 'admin' 
      ? [
          { id: 'dashboard', name: 'Dashboard', icon: FiTrendingUp, path: '/admin' },
          { id: 'foods', name: 'Food Management', icon: FiPackage, path: '/admin' },
          { id: 'users', name: 'User Management', icon: FiUsers, path: '/admin' },
          { id: 'orders', name: 'Orders', icon: FiShoppingCart, path: '/admin' },
        ]
      : user?.role === 'chef'
      ? [
          { id: 'dashboard', name: 'Dashboard', icon: FiTrendingUp, path: '/chef' },
          { id: 'orders', name: 'Orders', icon: FiShoppingCart, path: '/chef' },
        ]
      : [
          { id: 'menu', name: 'Menu', icon: FiShoppingBag, path: '/menu' }, // Primary for regular users
        ];

    return [
      ...baseItems,
      { id: 'orders', name: 'My Orders', icon: FiShoppingCart, path: '/orders' },
      { id: 'profile', name: 'Profile', icon: FiUser, path: '/profile' }, // Dashboard features here
    ];
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: -300 }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-800/90 backdrop-blur-lg border-gray-700' : 'bg-white/90 backdrop-blur-lg border-gray-200'} border-b shadow-sm`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and Menu Toggle */}
          <div className="flex items-center space-x-4">
            {showSidebar && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
              >
                {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            )}
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <FiShoppingCart className="text-white text-xl" />
              </div>
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                QuickBite
              </span>
            </Link>
          </div>

          {/* Page Title */}
          <div className="flex-1 text-center">
            <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {title || (user?.role === 'customer' ? 'QuickBite Delicious Moments' : 'QuickBite')}
            </h1>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
            >
              {darkMode ? '🌙' : '☀️'}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {user?.name || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'} transition-colors`}
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Content */}
          <motion.aside
            className={`fixed left-0 top-16 bottom-0 w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r z-30 lg:translate-x-0`}
            variants={sidebarVariants}
            animate={sidebarOpen ? 'open' : 'closed'}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <nav className="p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? darkMode
                              ? 'bg-orange-600 text-white'
                              : 'bg-orange-100 text-orange-600'
                            : darkMode
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.aside>
        </>
      )}

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${showSidebar ? 'lg:ml-64' : ''}`}>
        <motion.div
          className="p-4 lg:p-8"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default UniformLayout;
