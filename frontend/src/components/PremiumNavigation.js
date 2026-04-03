import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  ShoppingBagIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  MenuIcon,
  XIcon,
  SparklesIcon,
  ChipIcon,
  ArrowRightIcon
} from '@heroicons/react/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import PremiumAIChat from './PremiumAIChat';

const PremiumNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const { user, isAuthenticated, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    // Just navigate to login without calling logout
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const navItems = [
    { 
      name: 'Home', 
      icon: HomeIcon, 
      path: '/',
      description: 'Return to homepage',
      showWhenAuthenticated: false  // Only show when not logged in
    },
    { 
      name: 'Menu', 
      icon: ShoppingBagIcon, 
      path: '/menu',
      description: 'Browse our delicious menu'
    },
    { 
      name: 'Orders', 
      icon: ShoppingBagIcon, 
      path: '/orders',
      description: 'View your order history',
      requiresAuth: true
    },
    { 
      name: 'Profile', 
      icon: UserIcon, 
      path: '/profile',
      description: 'Manage your account',
      requiresAuth: true
    }
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Main Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <Link to="/" className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">QuickBite</h1>
                  <p className="text-xs text-white/60">Delicious Moments</p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                if (item.requiresAuth && !isAuthenticated) return null;
                if (item.showWhenAuthenticated === false && isAuthenticated) return null;
                
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="relative group"
                  >
                    <motion.div
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'glass-morphism text-white'
                          : 'text-white/70 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </motion.div>
                    
                    {/* Tooltip */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 glass-morphism rounded-lg text-xs text-white/80 whitespace-nowrap pointer-events-none"
                    >
                      {item.description}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* AI Chat Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAIChat(true)}
                className="relative p-2 rounded-full glass-morphism text-white/80 hover:text-white transition-all"
              >
                <ChipIcon className="w-5 h-5" />
                <motion.div
                  className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>

              {/* User Actions */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg glass-morphism">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-white">
                        {user?.first_name || user?.username}
                      </p>
                      <p className="text-xs text-white/60 capitalize">
                        {user?.role || 'Customer'}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg glass-morphism text-white/80 hover:text-white transition-all font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-glow px-4 py-2 text-sm font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 max-w-full glass-card p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">QuickBite</h2>
                    <p className="text-xs text-white/60">Menu</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <div className="space-y-2">
                {navItems.map((item) => {
                  if (item.requiresAuth && !isAuthenticated) return null;
                  if (item.showWhenAuthenticated === false && isAuthenticated) return null;
                  
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'glass-morphism text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-white/50">{item.description}</p>
                      </div>
                      {isActive && (
                        <motion.div
                          className="w-2 h-2 bg-blue-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile User Actions */}
              <div className="mt-8 pt-8 border-t border-white/10">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-lg glass-morphism">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {user?.first_name || user?.username}
                        </p>
                        <p className="text-sm text-white/60 capitalize">
                          {user?.role || 'Customer'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 rounded-lg glass-morphism text-white/80 hover:text-white transition-all font-medium text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full btn-glow py-3 font-medium text-center"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Component */}
      <AnimatePresence>
        {showAIChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAIChat(false)}
            className="fixed inset-0 z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      <PremiumAIChat onClose={() => setShowAIChat(false)} />
    </>
  );
};

export default PremiumNavigation;
