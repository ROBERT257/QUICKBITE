import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHome, FiPackage, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const EnhancedNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Update cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    setCartCount(count);
  }, [location]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/menu', label: 'Menu', icon: FiPackage },
    { path: '/order', label: 'Orders', icon: FiShoppingCart },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-lg border-b border-white/10' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-purple-500 rounded-lg flex items-center justify-center neon-blue-glow">
                <span className="text-black font-bold text-lg">Q</span>
              </div>
              <span className="text-xl font-bold text-gradient group-hover:scale-105 transition-transform">
                QuickBite
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'bg-white/10 text-white neon-blue-glow'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                  {link.path === '/menu' && cartCount > 0 && (
                    <span className="ml-2 bg-neon-green text-black text-xs px-2 py-1 rounded-full font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                <FiSearch className="w-5 h-5" />
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="hidden sm:block font-medium">{user.username}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 glass-card premium-card animate-slideInFromTop">
                      <div className="p-4 space-y-2">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          <FiUser className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          <FiPackage className="w-4 h-4" />
                          <span>My Orders</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-white/10 transition-all duration-300"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="btn-glow text-sm px-4 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-white/80 hover:text-white border border-white/20 rounded-lg transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 glass-card">
            <div className="flex flex-col h-full p-4 space-y-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-lg">Q</span>
                  </div>
                  <span className="text-xl font-bold text-gradient">
                    QuickBite
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'bg-white/10 text-white neon-blue-glow'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium text-lg">{link.label}</span>
                  {link.path === '/menu' && cartCount > 0 && (
                    <span className="ml-auto bg-neon-green text-black text-xs px-2 py-1 rounded-full font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              ))}

              {!user && (
                <div className="mt-8 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full btn-glow text-center py-3"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-4 py-3 text-center text-white/80 hover:text-white border border-white/20 rounded-lg transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default EnhancedNavbar;
