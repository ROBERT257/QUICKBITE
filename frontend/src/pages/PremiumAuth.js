import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  MailIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeOffIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/outline';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PremiumAuth = ({ isLogin = true }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  // Floating particles background
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10
    }));
    setParticles(newParticles);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!isLogin) {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!formData.firstName || formData.firstName.length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
      }
      
      if (!formData.lastName || formData.lastName.length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const endpoint = isLogin ? '/api/auth/login/' : '/api/auth/register/';
      const payload = isLogin 
        ? { username: formData.username, password: formData.password }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            password_confirm: formData.confirmPassword,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            role: formData.role
          };
      
      let API_BASE_URL = process.env.REACT_APP_API_URL || 'https://roelog.pythonanywhere.com';
      // Remove trailing /api if present to avoid duplication
      API_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
      
      console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);
      console.log('Payload:', payload);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Check user role and redirect accordingly
          // Try different possible role field names from backend
          const userRole = data.user?.role || data.user?.user_type || data.user?.type || data.role || 'customer';
          const username = (data.user?.username || '').toLowerCase();
          
          // Check role from backend OR use username as fallback
          const isAdmin = userRole === 'admin' || username === 'elvis' || username === 'admin' || username.includes('admin');
          const isChef = userRole === 'chef' || username.includes('chef');
          
          console.log('=== LOGIN DEBUG ===');
          console.log('Full response:', data);
          console.log('User object:', data.user);
          console.log('Detected role:', userRole);
          console.log('Username:', username);
          console.log('isAdmin:', isAdmin);
          console.log('isChef:', isChef);
          console.log('===================');
          
          if (isAdmin) {
            toast.success('Welcome Admin! 🎉');
            localStorage.setItem('user_type', 'admin');
            window.location.href = '/admin';
          } else if (isChef) {
            toast.success('Welcome Chef! 👨‍🍳');
            localStorage.setItem('user_type', 'chef');
            window.location.href = '/chef';
          } else {
            toast.success('Welcome back! 🎉');
            localStorage.setItem('user_type', 'customer');
            window.location.href = '/profile';
          }
        } else {
          if (formData.role === 'chef') {
            toast.success('Chef account created! Please login to access your dashboard. 👨‍🍳');
          } else {
            toast.success('Account created successfully! 🎉');
          }
          navigate('/login');
        }
      } else {
        // Handle API errors
        if (typeof data === 'object') {
          const apiErrors = {};
          Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
              apiErrors[key] = data[key][0];
            } else {
              apiErrors[key] = data[key];
            }
          });
          setErrors(apiErrors);
        } else {
          toast.error(isLogin ? 'Login failed. Please try again.' : 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputVariants = {
    focused: { scale: 1.02, borderColor: '#4facfe' },
    blur: { scale: 1, borderColor: 'rgba(255, 255, 255, 0.15)' }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Subtle Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 15}%`,
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="premium-card p-8 relative overflow-hidden"
        >
          {/* Subtle Glow Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-5 blur-sm" />
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8 relative"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-white/70 text-sm">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Join us and start your delicious journey'
              }
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <AnimatePresence>
              {Object.entries(errors).map(([field, error]) => (
                error && (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )
              ))}
            </AnimatePresence>

            {/* Username Field */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField('')}
                placeholder="Username"
                className={`glass-input w-full px-4 py-4 rounded-xl transition-all duration-300 ${
                  errors.username ? 'border-red-400' : ''
                }`}
                disabled={isLoading}
              />
            </motion.div>

            {/* Email Field (Register Only) */}
            {!isLogin && (
              <motion.div
                className="relative"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.1 }}
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Email Address"
                  className={`glass-input w-full px-4 py-4 rounded-xl transition-all duration-300 ${
                    errors.email ? 'border-red-400' : ''
                  }`}
                  disabled={isLoading}
                />
              </motion.div>
            )}

            {/* Name Fields (Register Only) */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField('')}
                    placeholder="First Name"
                    className={`glass-input w-full px-4 py-4 rounded-xl transition-all duration-300 ${
                      errors.firstName ? 'border-red-400' : ''
                    }`}
                    disabled={isLoading}
                  />
                </motion.div>
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Last Name"
                    className={`glass-input w-full px-4 py-4 rounded-xl transition-all duration-300 ${
                      errors.lastName ? 'border-red-400' : ''
                    }`}
                    disabled={isLoading}
                  />
                </motion.div>
              </div>
            )}

            {/* Password Field */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Password"
                  className={`glass-input w-full px-4 pr-12 py-4 rounded-xl transition-all duration-300 ${
                    errors.password ? 'border-red-400' : ''
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password Field (Register Only) */}
            {!isLogin && (
              <motion.div
                className="relative"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Confirm Password"
                    className={`glass-input w-full px-4 pr-12 py-4 rounded-xl transition-all duration-300 ${
                      errors.confirmPassword ? 'border-red-400' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Phone Field (Register Only) */}
            {!isLogin && (
              <motion.div
                variants={inputVariants}
                animate={focusedField === 'phone' ? 'focused' : 'blur'}
                className="relative"
                initial={{ opacity: 0, height: 0 }}
                transition={{ delay: 0.5 }}
              >
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Phone Number (Optional)"
                  className="glass-input w-full px-4 py-4 rounded-xl transition-all duration-300"
                  disabled={isLoading}
                />
              </motion.div>
            )}

            {/* Role Selection - Only for Signup */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <label className="text-white/70 text-sm mb-2 block">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
                    className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      formData.role === 'customer'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-white/20 text-white/60 hover:border-white/40'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-lg mb-1">👤</span>
                      <span className="text-sm font-medium">Customer</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'chef' }))}
                    className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      formData.role === 'chef'
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-white/20 text-white/60 hover:border-white/40'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-lg mb-1">👨‍🍳</span>
                      <span className="text-sm font-medium">Chef</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="btn-glow w-full py-4 text-lg font-semibold relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </motion.button>

            {/* Toggle Auth Mode */}
            <div className="text-center pt-4">
              <p className="text-white/70 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Link 
                  to={isLogin ? "/signup" : "/login"}
                  className="text-gradient font-semibold ml-2 hover:opacity-80 transition-opacity"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Link>
              </p>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumAuth;
