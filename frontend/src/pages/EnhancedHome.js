import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTrendingUp, FiClock, FiShield, FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SmartRecommendations from '../components/SmartRecommendations';
import ChatAssistant from '../components/ChatAssistant';
import EnhancedHero from '../components/EnhancedHero';

const FeatureCard = ({ title, description, icon: Icon, gradient, to, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group"
    >
      <Link to={to} className="block h-full">
        <div className="premium-card h-full p-8 text-center group-hover:border-neon-blue/30 transition-all duration-500">
          <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 neon-blue-glow`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-neon-blue transition-colors">
            {title}
          </h3>
          <p className="text-white/70 text-lg leading-relaxed mb-6">
            {description}
          </p>
          <div className="flex items-center justify-center space-x-2 text-neon-blue group-hover:space-x-3 transition-all">
            <span className="font-medium">Explore</span>
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const StatCard = ({ number, label, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ scale: 1.1 }}
      className="text-center"
    >
      <div className="premium-card p-6 group-hover:neon-blue-glow transition-all duration-300">
        <div className={`w-16 h-16 bg-gradient-to-br from-neon-blue to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="text-4xl font-bold text-gradient mb-2">{number}</div>
        <div className="text-white/70 text-sm uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  );
};

const EnhancedHome = () => {
  const handleSearch = (searchResults) => {
    window.location.href = '/menu';
  };

  return (
    <div className="min-h-screen">
      <EnhancedHero onSearch={handleSearch} />

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gradient mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-white/70 mb-12 max-w-3xl mx-auto">
              Join the growing community of food lovers who trust QuickBite for delicious meals delivered fast
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard 
              number="50+" 
              label="Menu Items" 
              icon={FiTrendingUp} 
              delay={0.1}
            />
            <StatCard 
              number="4.8" 
              label="Average Rating" 
              icon={FiZap} 
              delay={0.2}
            />
            <StatCard 
              number="15min" 
              label="Avg Delivery" 
              icon={FiClock} 
              delay={0.3}
            />
            <StatCard 
              number="100%" 
              label="Food Safety" 
              icon={FiShield} 
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gradient mb-4">
              Why Choose QuickBite?
            </h2>
            <p className="text-xl text-white/70 mb-16 max-w-3xl mx-auto">
              Experience the future of food ordering with cutting-edge technology and exceptional service
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Smart Recommendations"
              description="AI-powered suggestions based on your taste preferences and order history"
              icon={FiZap}
              gradient="from-blue-500 to-cyan-500"
              to="/menu"
              delay={0.1}
            />
            <FeatureCard
              title="Natural Language Search"
              description="Search for food using everyday language. Just say what you're craving for"
              icon={FiTrendingUp}
              gradient="from-purple-500 to-pink-500"
              to="/menu"
              delay={0.2}
            />
            <FeatureCard
              title="AI Food Assistant"
              description="Get instant help from our AI concierge for meal recommendations and order support"
              icon={FiClock}
              gradient="from-green-500 to-emerald-500"
              to="/menu"
              delay={0.3}
            />
            <FeatureCard
              title="Premium Quality"
              description="Restaurant-grade meals prepared with fresh ingredients and delivered with care"
              icon={FiShield}
              gradient="from-orange-500 to-red-500"
              to="/menu"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      <section className="py-20">
        <SmartRecommendations />
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="premium-card p-12 neon-blue-glow"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers enjoying AI-powered food delivery
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/menu"
                className="btn-glow group px-8 py-4 text-lg"
              >
                <span>Start Ordering</span>
                <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 text-lg text-white/80 hover:text-white border border-white/20 rounded-lg transition-all duration-300"
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <ChatAssistant />
    </div>
  );
};

export default EnhancedHome;
