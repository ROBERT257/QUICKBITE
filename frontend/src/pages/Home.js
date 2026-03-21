import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  StarIcon,
  ClockIcon,
  TruckIcon 
} from '@heroicons/react/outline';
import { menuAPI } from '../services/api';
import { useQuery } from 'react-query';

const Home = () => {
  const { data: featuredItems, isLoading } = useQuery(
    'featuredItems',
    menuAPI.getFeaturedItems
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="animate-fade-in-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="text-gradient">Delicious Meals</span>
                <br />
                <span className="text-white">Delivered Fast</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Order from your favorite restaurants and get your food delivered hot and fresh to your doorstep. 
                Experience the future of food delivery with QuickBite.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/menu" 
                  className="btn-glow text-lg px-8 py-4 inline-flex items-center justify-center space-x-2"
                >
                  <ShoppingCartIcon className="w-6 h-6" />
                  <span>Explore Menu</span>
                </Link>
                <Link 
                  to="/order" 
                  className="glass-morphism text-lg px-8 py-4 inline-flex items-center justify-center space-x-2 hover:bg-white/20 transition-all duration-300"
                >
                  <span>Quick Order</span>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants} 
              className="animate-fade-in-right"
            >
              <div className="relative">
                <div className="glass-card p-8">
                  <img 
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                    alt="Delicious Food" 
                    className="w-full h-80 object-cover rounded-2xl shadow-2xl"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-2xl font-bold text-white">20% OFF</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="glass-card border-glow text-center py-8 px-12">
            <h2 className="text-3xl font-bold mb-4 text-gradient">
              🎉 Special Offer
            </h2>
            <p className="text-xl text-white/90 mb-6">
              <strong>20% OFF</strong> your first order! 
              <br />
              Use code: <span className="text-neon-yellow font-bold">FIRSTBITE</span>
            </p>
            <Link 
              to="/menu" 
              className="btn-glow inline-flex items-center space-x-2"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <span>Order Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gradient">How It Works</h2>
            <p className="text-xl text-white/80">Get your favorite food in 3 simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📱',
                title: 'Choose your meal',
                description: 'Browse our extensive menu and select your favorite dishes'
              },
              {
                icon: '🛒',
                title: 'Place your order',
                description: 'Add items to cart and checkout with your preferred payment method'
              },
              {
                icon: '🚴',
                title: 'Delivered to your door',
                description: 'Sit back and relax while we deliver your food hot and fresh'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                <p className="text-white/70">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gradient">Featured Items</h2>
            <p className="text-xl text-white/80">Our most popular dishes</p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
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
            <div className="grid md:grid-cols-3 gap-8">
              {featuredItems?.data?.slice(0, 6).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 hover:scale-105 transition-all duration-300 group cursor-pointer"
                  onClick={() => window.location.href = `/menu#item-${item.id}`}
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-neon-green text-black px-2 py-1 rounded-full text-xs font-bold">
                      KSh {item.price}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-neon-blue transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-white/70 text-sm mb-3 truncate">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-white/80">{item.average_rating || 4.5}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-white/60">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm">{item.preparation_time}min</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/menu" 
              className="btn-glow inline-flex items-center space-x-2"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <span>View Full Menu</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gradient">What Our Customers Say</h2>
            <p className="text-xl text-white/80">Real reviews from satisfied customers</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Sarah W.',
                comment: 'QuickBite saved me during lunch breaks! Hot and fast! The food is always fresh and the delivery is incredibly quick.',
                rating: 5
              },
              {
                name: 'Mike D.',
                comment: 'The food is always fresh. Love the burgers! The app is easy to use and the customer service is excellent.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/80 italic mb-6 text-lg">"{testimonial.comment}"</p>
                <h4 className="text-neon-blue font-semibold text-lg">{testimonial.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card border-glow p-12"
          >
            <h2 className="text-4xl font-bold mb-6 text-gradient">
              Ready to Order?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of satisfied customers and experience the best food delivery service in town.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/menu" 
                className="btn-glow text-lg px-8 py-4 inline-flex items-center justify-center space-x-2"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                <span>Order Now</span>
              </Link>
              <Link 
                to="/signup" 
                className="glass-morphism text-lg px-8 py-4 inline-flex items-center justify-center space-x-2 hover:bg-white/20 transition-all duration-300"
              >
                <span>Create Account</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
