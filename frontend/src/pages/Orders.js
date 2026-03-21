import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCartIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  EyeIcon,
  RefreshIcon
} from '@heroicons/react/outline';
import { ordersAPI } from '../services/api';
import { useQuery } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch orders from multiple sources
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Try API first
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const response = await fetch('http://localhost:8000/api/orders/', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const apiOrders = await response.json();
              setOrders(apiOrders);
              setIsLoading(false);
              return;
            }
          } catch (apiError) {
            console.log('API not available, using localStorage');
          }
        }
        
        // Fallback to localStorage
        const localOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
        setOrders(localOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, refreshKey]);

  const refreshOrders = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Orders refreshed');
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-yellow-400';
      case 'confirmed': return 'text-blue-400';
      case 'preparing': return 'text-orange-400';
      case 'ready': return 'text-purple-400';
      case 'delivering': return 'text-indigo-400';
      case 'delivered': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <ClockIcon className="w-5 h-5" />;
      case 'confirmed': return <CheckCircleIcon className="w-5 h-5" />;
      case 'preparing': return <ClockIcon className="w-5 h-5" />;
      case 'ready': return <CheckCircleIcon className="w-5 h-5" />;
      case 'delivering': return <TruckIcon className="w-5 h-5" />;
      case 'delivered': return <CheckCircleIcon className="w-5 h-5" />;
      case 'cancelled': return <XCircleIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getOrderProgress = (status) => {
    const progressSteps = {
      'pending': 1,
      'confirmed': 2,
      'preparing': 3,
      'ready': 4,
      'delivering': 5,
      'delivered': 6,
      'cancelled': 0
    };
    return progressSteps[status] || 1;
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white/70 mt-4">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-4">
            <h1 className="text-4xl font-bold mb-4 text-gradient">My Orders</h1>
            <button
              onClick={refreshOrders}
              className="p-2 glass-card rounded-full hover:scale-105 transition-transform"
              title="Refresh Orders"
            >
              <RefreshIcon className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-xl text-white/80">Track and manage your orders</p>
        </motion.div>

        {orders?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="glass-card p-12 max-w-md mx-auto">
              <ShoppingCartIcon className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">No Orders Yet</h3>
              <p className="text-white/70 mb-6">
                You haven't placed any orders yet. Start exploring our menu and place your first order!
              </p>
              <a
                href="/menu"
                className="btn-glow inline-flex items-center space-x-2"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>Browse Menu</span>
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {orders?.map((order, index) => (
              <motion.div
                key={order.id}
                variants={itemVariants}
                className="glass-card p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        Order #{order.order_number || order.id}
                      </h3>
                      <div className={`flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium">
                          {formatStatus(order.status)}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm">
                      Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                    
                    {/* Order Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-neon-blue to-neon-green h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(getOrderProgress(order.status) / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60">
                          {getOrderProgress(order.status)}/6
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-white/60">Total Amount</p>
                      <p className="text-2xl font-bold text-neon-green">
                        KSh {order.total_amount}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="btn-glow p-3 rounded-full"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                {selectedOrder?.id === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-white/20 pt-6 mt-6"
                  >
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Order Items */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Order Items</h4>
                        <div className="space-y-3">
                          {(order.items || []).map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center justify-between p-3 glass-morphism rounded-lg">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=50'} 
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div>
                                  <p className="text-white font-medium">{item.name}</p>
                                  <p className="text-white/60 text-sm">KSh {item.price} x {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-neon-green font-semibold">
                                KSh {item.price * item.quantity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Information */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Order Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-white/60">Customer Name</p>
                            <p className="text-white">{order.customer_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Delivery Address</p>
                            <p className="text-white">{order.delivery_address}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Phone Number</p>
                            <p className="text-white">{order.customer_phone || order.phone_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Payment Method</p>
                            <p className="text-white capitalize">
                              {order.payment_method?.replace('_', ' ') || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Current Status</p>
                            <div className={`flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="capitalize">{formatStatus(order.status)}</span>
                            </div>
                          </div>
                          {order.special_instructions && (
                            <div>
                              <p className="text-sm text-white/60">Special Instructions</p>
                              <p className="text-white">{order.special_instructions}</p>
                            </div>
                          )}
                          {order.delivery_time && (
                            <div>
                              <p className="text-sm text-white/60">Delivery Time</p>
                              <p className="text-white">
                                {new Date(order.delivery_time).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 p-4 glass-morphism rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between text-white/80">
                              <span>Subtotal:</span>
                              <span>KSh {order.subtotal || order.total_amount}</span>
                            </div>
                            <div className="flex justify-between text-white/80">
                              <span>Delivery Fee:</span>
                              <span>KSh {order.delivery_fee || 150}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/20">
                              <span>Total:</span>
                              <span className="text-neon-green">KSh {order.total_amount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Orders;
