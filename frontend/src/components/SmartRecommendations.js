import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiTrendingUp, FiClock, FiArrowRight, FiUser } from 'react-icons/fi';
import { aiAPI } from '../services/api';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

const RecommendationSection = ({ title, items, icon: Icon, gradient }) => {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-neon-blue" />
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        <Link 
          to="/menu" 
          className="text-neon-blue hover:text-blue-400 transition-colors flex items-center space-x-1 text-sm"
        >
          <span>See all</span>
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 w-64"
          >
            <Link to={`/menu?item=${item.id}`} className="block">
              <div className="glass-card overflow-hidden group cursor-pointer">
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={item.image && (item.image.startsWith('http') ? item.image : `http://localhost:8000/media/${item.image}`) || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Price Badge */}
                  <div className="absolute top-2 right-2 bg-neon-green text-black px-2 py-1 rounded-full text-xs font-bold">
                    KSh {item.price}
                  </div>
                  
                  {/* Featured Badge */}
                  {item.is_featured && (
                    <div className="absolute top-2 left-2 bg-neon-yellow text-black px-2 py-1 rounded-full text-xs font-bold">
                      <FiStar className="w-3 h-3 inline mr-1" />
                      Featured
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h4 className="text-white font-semibold group-hover:text-neon-blue transition-colors truncate">
                    {item.name}
                  </h4>
                  <p className="text-white/60 text-sm truncate mt-1">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/70 text-xs">{item.category_name}</span>
                    <div className="flex items-center space-x-1 text-xs text-white/60">
                      <FiClock className="w-3 h-3" />
                      <span>{item.preparation_time}min</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const SmartRecommendations = () => {
  const { data: recommendations, isLoading, error } = useQuery(
    'ai-recommendations',
    aiAPI.getRecommendations,
    {
      staleTime: 1000 * 60 * 15, // 15 minutes
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-4">Recommended for You</h2>
        </div>
        <div className="space-y-8">
          {[1, 2, 3].map((section) => (
            <div key={section} className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-5 h-5 bg-white/20 rounded animate-pulse" />
                <div className="w-32 h-6 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="flex space-x-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="w-64 glass-card h-64 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-3xl font-bold text-gradient mb-4">Recommended for You</h2>
        <p className="text-white/70">Unable to load recommendations. Please try again later.</p>
      </div>
    );
  }

  const data = recommendations?.data;

  return (
    <div className="py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gradient mb-4">Recommended for You</h2>
        <p className="text-white/70 text-lg">Personalized suggestions based on your preferences</p>
      </motion.div>

      <div className="space-y-8">
        {/* Personalized Recommendations */}
        {data?.personalized && data.personalized.length > 0 && (
          <RecommendationSection
            title="Recommended for You"
            items={data.personalized}
            icon={FiUser}
            gradient="from-purple-500 to-pink-500"
          />
        )}

        {/* Popular Items */}
        {data?.popular && data.popular.length > 0 && (
          <RecommendationSection
            title="Trending Now"
            items={data.popular}
            icon={FiTrendingUp}
            gradient="from-orange-500 to-red-500"
          />
        )}

        {/* Time-based Recommendations */}
        {data?.time_based && data.time_based.length > 0 && (
          <RecommendationSection
            title="Perfect for Now"
            items={data.time_based}
            icon={FiClock}
            gradient="from-blue-500 to-cyan-500"
          />
        )}
      </div>
    </div>
  );
};

export default SmartRecommendations;
