import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiClock, FiStar, FiShoppingCart, FiPlus, FiMinus, FiCheck, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { menuAPI, aiAPI } from '../services/api';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SmartSearchBar from '../components/SmartSearchBar';
import realtimeService from '../services/realtime';

const EnhancedMenu = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState({});
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewItems, setShowNewItems] = useState({});

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories', 
    () => menuAPI.getCategories().then(res => res.data)
  );
  
  // Fetch menu items
  const { data: menuItems, isLoading: menuLoading } = useQuery(
    ['menuItems', { category: selectedCategory !== 'all' ? selectedCategory : '', ordering: sortBy }],
    () => menuAPI.getMenuItems({
      category: selectedCategory !== 'all' ? selectedCategory : '', 
      ordering: sortBy
    }).then(res => res.data),
    {
      enabled: !searchResults // Only fetch if no search results
    }
  );

  // Real-time updates for chef status changes
  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToMenuItems((updatedItems) => {
      // Show notification for newly ready items
      updatedItems.forEach(item => {
        if (item.chef_status === 'ready' && !showNewItems[item.id]) {
          setShowNewItems(prev => ({ ...prev, [item.id]: true }));
          toast.success(`${item.name} is now ready to order!`, {
            icon: ' Chef Ready',
            duration: 4000
          });
          
          // Hide the "new" indicator after 5 seconds
          setTimeout(() => {
            setShowNewItems(prev => ({ ...prev, [item.id]: false }));
          }, 5000);
        }
      });
    });

    return unsubscribe;
  }, [showNewItems]);

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
    }).filter(Boolean);

    localStorage.setItem('cart', JSON.stringify(cartData));
    navigate('/checkout');
  };

  const handleAISearch = (searchData) => {
    setSearchResults(searchData.items);
    setSearchQuery(searchData.query);
    setSelectedCategory('all');
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSearchQuery('');
  };

  const displayItems = searchResults || menuItems;

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

        {/* Smart Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SmartSearchBar onSearch={handleAISearch} />
        </motion.div>

        {/* Search Results Header */}
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-6 flex items-center justify-between"
          >
            <div>
              <h3 className="text-white font-semibold">
                Search Results for "{searchQuery}"
              </h3>
              <p className="text-white/60 text-sm">
                Found {searchResults.length} items
              </p>
            </div>
            <button
              onClick={clearSearch}
              className="text-white/60 hover:text-white transition-colors flex items-center space-x-1"
            >
              <FiX className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </motion.div>
        )}

        {/* Filters (hidden during search) */}
        {!searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-8"
          >
            <div className="grid md:grid-cols-2 gap-4">
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
        )}

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
        {!menuLoading && !categoriesLoading && displayItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                    {item.chef_status === 'ready' && (
                      <AnimatePresence>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1"
                        >
                          <FiCheck className="w-3 h-3" />
                          <span>Ready to Order</span>
                        </motion.div>
                      </AnimatePresence>
                    )}
                    {item.is_featured && (
                      <div className="bg-neon-yellow text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <FiStar className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                    {showNewItems[item.id] && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 animate-pulse"
                      >
                        <FiTrendingUp className="w-3 h-3" />
                        <span>Just Ready!</span>
                      </motion.div>
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
        {!menuLoading && !categoriesLoading && (!displayItems || displayItems.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="glass-card p-12 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-white mb-4">
                {searchQuery ? 'No results found' : 'No items available'}
              </h3>
              <p className="text-white/70 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms or browse our menu.'
                  : 'Try adjusting your filters to find what you\'re looking for.'
                }
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSortBy('name');
                  clearSearch();
                }}
                className="btn-glow"
              >
                {searchQuery ? 'Clear Search' : 'Clear Filters'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Sticky Checkout Button */}
        <AnimatePresence>
          {getCartCount() > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed top-24 right-6 z-40 glass-card p-4 max-w-xs shadow-2xl border border-green-500/30"
            >
              {/* Cart Preview */}
              <div className="mb-3">
                <h3 className="text-white font-semibold mb-2 text-sm">Your Cart</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(cart).slice(0, 3).map(([itemId, quantity]) => {
                    const item = displayItems?.find(item => item.id === parseInt(itemId));
                    return item ? (
                      <div key={itemId} className="flex justify-between text-white/70 text-xs">
                        <span>{item.name} x{quantity}</span>
                        <span>KSh {parseFloat(item.price) * quantity}</span>
                      </div>
                    ) : null;
                  })}
                  {Object.keys(cart).length > 3 && (
                    <div className="text-white/50 text-xs italic">...and {Object.keys(cart).length - 3} more</div>
                  )}
                </div>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={proceedToCheckout}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-black px-4 py-3 rounded-full font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/50 flex items-center justify-center space-x-2"
              >
                <FiShoppingCart className="w-4 h-4" />
                <span>Checkout</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {getCartCount()}
                </span>
              </button>
              
              {/* Total */}
              <div className="mt-2 text-center">
                <span className="text-white/70 text-sm">Total: </span>
                <span className="text-green-400 font-bold">KSh {getCartTotal()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedMenu;
