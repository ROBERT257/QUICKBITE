import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiStar, 
  FiClock, 
  FiFilter,
  FiSearch,
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArrowRight
} from 'react-icons/fi';
import { menuAPI } from '../services/api';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Menu = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState({});
  const [showCartSummary, setShowCartSummary] = useState(false);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories', 
    () => menuAPI.getCategories().then(res => res.data)
  );
  
  // Fetch menu items
  const { data: menuItems, isLoading: menuLoading } = useQuery(
    ['menuItems', { category: selectedCategory !== 'all' ? selectedCategory : '', search: searchTerm, ordering: sortBy }],
    () => menuAPI.getMenuItems({
      category: selectedCategory !== 'all' ? selectedCategory : '', 
      search: searchTerm, 
      ordering: sortBy
    }).then(res => res.data)
  );

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
    toast.success(`${item.name} added to cart!`);
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[item.id] > 1) {
        newCart[item.id]--;
      } else {
        delete newCart[item.id];
      }
      return newCart;
    });
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const getCartTotal = () => {
    if (!menuItems) return 0;
    return Object.entries(cart).reduce((total, [itemId, count]) => {
      const item = menuItems.find(item => item.id === parseInt(itemId));
      return total + (item ? parseFloat(item.price) * count : 0);
    }, 0);
  };

  const clearCart = () => {
    setCart({});
    toast.success('Cart cleared');
  };

  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed');
      navigate('/login');
      return;
    }
    
    if (getCartCount() === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Store cart in localStorage for checkout page
    const cartData = Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(item => item.id === parseInt(itemId));
      return {
        ...item,
        quantity
      };
    });
    
    localStorage.setItem('checkout_cart', JSON.stringify(cartData));
    navigate('/order');
  };

  const getSpiceLevelColor = (level) => {
    switch(level) {
      case 'mild': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hot': return 'text-orange-400';
      case 'extra_hot': return 'text-red-500';
      default: return 'text-green-400';
    }
  };

  const getSpiceLevelText = (level) => {
    switch(level) {
      case 'mild': return '🌶️';
      case 'medium': return '🌶️🌶️';
      case 'hot': return '🌶️🌶️🌶️';
      case 'extra_hot': return '🌶️🌶️🌶️🌶️';
      default: return '🌶️';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gradient mb-4">Our Menu</h1>
          <p className="text-white/70 text-lg">Discover delicious food made with fresh ingredients</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search for food..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass-input w-full"
              >
                <option value="all">All Categories</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-input w-full"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="-created_at">Newest First</option>
                <option value="preparation_time">Preparation Time</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {(menuLoading || categoriesLoading) && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card p-6">
                <div className="animate-pulse">
                  <div className="bg-white/20 h-48 rounded-lg mb-4"></div>
                  <div className="bg-white/20 h-6 rounded mb-2"></div>
                  <div className="bg-white/20 h-4 rounded mb-2"></div>
                  <div className="bg-white/20 h-8 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Menu Items Grid */}
        {!menuLoading && !categoriesLoading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {menuItems?.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Item Image */}
                <div className="relative overflow-hidden">
                  <img 
                    src={item.image && (item.image.startsWith('http') ? item.image : `http://localhost:8000/media/${item.image}`) || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                    alt={item.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {item.is_featured && (
                      <div className="bg-neon-yellow text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <FiStar className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${getSpiceLevelColor(item.spice_level)}`}>
                      {getSpiceLevelText(item.spice_level)} {item.spice_level}
                    </div>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-2 right-2 bg-neon-green text-black px-3 py-1 rounded-full text-sm font-bold">
                    KSh {item.price}
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-neon-blue transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-white/60">{item.category_name}</p>
                  </div>
                  
                  <p className="text-white/70 text-sm truncate">
                    {item.description}
                  </p>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-4 h-4" />
                      <span>{item.preparation_time} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiStar className="w-4 h-4 text-neon-yellow" />
                      <span>{item.average_rating || '4.5'}</span>
                    </div>
                  </div>

                  {/* Cart Controls */}
                  <div className="flex items-center justify-between">
                    {cart[item.id] ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item);
                          }}
                          className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-semibold w-8 text-center">
                          {cart[item.id]}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="w-8 h-8 rounded-full bg-neon-green text-black flex items-center justify-center hover:bg-green-500 transition-colors"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        className="flex-1 bg-neon-blue text-black px-4 py-2 rounded-full font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {!menuLoading && !categoriesLoading && (!menuItems || menuItems.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="glass-card p-12 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-white mb-4">No items found</h3>
              <p className="text-white/70 mb-6">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                  setSortBy('name');
                }}
                className="btn-glow"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Cart Summary */}
        {getCartCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 glass-card p-6 max-w-sm z-40"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <FiShoppingCart className="w-5 h-5 mr-2" />
                Cart Summary
              </h3>
              <button
                onClick={() => setShowCartSummary(!showCartSummary)}
                className="text-white/60 hover:text-white"
              >
                {showCartSummary ? 'Hide' : 'Show'}
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-white/80">
                <span>Items ({getCartCount()})</span>
                <span>KSh {getCartTotal()}</span>
              </div>
              
              {showCartSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-white/20 pt-3 space-y-2 max-h-48 overflow-y-auto"
                >
                  {Object.entries(cart).map(([itemId, count]) => {
                    const item = menuItems?.find(item => item.id === parseInt(itemId));
                    if (!item) return null;
                    return (
                      <div key={itemId} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="text-white truncate">{item.name}</p>
                          <p className="text-white/60">KSh {item.price} x {count}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item)}
                          className="text-red-400 hover:text-red-300 ml-2"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}
              
              <div className="flex space-x-2 pt-2 border-t border-white/20">
                <button
                  onClick={clearCart}
                  className="flex-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-full text-sm font-medium hover:bg-red-500/30 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={proceedToCheckout}
                  className="flex-1 bg-neon-green text-black px-3 py-2 rounded-full text-sm font-medium hover:bg-green-500 transition-colors flex items-center justify-center"
                >
                  Checkout
                  <FiArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Menu;
