import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  ClockIcon, 
  FireIcon,
  FilterIcon,
  SearchIcon
} from '@heroicons/react/outline';
import { menuAPI } from '../services/api';
import { useQuery } from 'react-query';

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const { data: categories } = useQuery('categories', menuAPI.getCategories);
  
  const { data: menuItems, isLoading } = useQuery(
    ['menuItems', { category: selectedCategory !== 'all' ? selectedCategory : '', search: searchTerm, ordering: sortBy }],
    menuAPI.getMenuItems
  );

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-gradient">Our Menu</h1>
          <p className="text-xl text-white/80">Discover our delicious selection of meals</p>
        </motion.div>

        {/* Filters and Search */}
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
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
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
                {categories?.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
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

        {/* Menu Items Grid */}
        {isLoading ? (
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
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {menuItems?.data?.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-6 hover:shadow-glow transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  // Add to cart logic here
                  console.log('Add to cart:', item);
                }}
              >
                {/* Item Image */}
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {item.is_featured && (
                      <div className="bg-neon-yellow text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <StarIcon className="w-3 h-3" />
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
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-neon-blue transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-white/60">{item.category_name}</p>
                  </div>
                  
                  <p className="text-white/70 text-sm line-clamp-2">
                    {item.description}
                  </p>

                  {/* Item Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white/80">{item.average_rating || 4.5}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-white/60">
                        <ClockIcon className="w-4 h-4" />
                        <span>{item.preparation_time}min</span>
                      </div>
                    </div>
                    {item.calories && (
                      <div className="flex items-center space-x-1 text-white/60">
                        <FireIcon className="w-4 h-4" />
                        <span>{item.calories} cal</span>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button className="w-full btn-glow py-3 flex items-center justify-center space-x-2 group-hover:scale-105 transition-transform">
                    <span>Add to Cart</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {!isLoading && menuItems?.data?.length === 0 && (
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
      </div>
    </div>
  );
};

export default Menu;
