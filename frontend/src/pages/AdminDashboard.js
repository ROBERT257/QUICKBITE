import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCartIcon, 
  UsersIcon,
  TrendingUpIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/outline';
import { ordersAPI, menuAPI } from '../services/api';
import { useQuery } from 'react-query';

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery('adminOrders', () => ordersAPI.getOrders());
  const { data: menuItems } = useQuery('adminMenuItems', menuAPI.getMenuItems);

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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      refetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const calculateStats = () => {
    if (!orders?.data) return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 };
    
    const totalOrders = orders.data.length;
    const totalRevenue = orders.data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const pendingOrders = orders.data.filter(order => order.status === 'pending').length;
    const deliveredOrders = orders.data.filter(order => order.status === 'delivered').length;
    
    return { totalOrders, totalRevenue, pendingOrders, deliveredOrders };
  };

  const stats = calculateStats();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUpIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingCartIcon },
    { id: 'menu', name: 'Menu Items', icon: UsersIcon },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-gradient">Admin Dashboard</h1>
          <p className="text-xl text-white/80">Manage your restaurant operations</p>
        </motion.div>

        {/* Stats Cards */}
        {selectedTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-4 gap-6 mb-8"
          >
            {[
              {
                name: 'Total Orders',
                value: stats.totalOrders,
                icon: ShoppingCartIcon,
                color: 'text-neon-blue'
              },
              {
                name: 'Total Revenue',
                value: `KSh ${stats.totalRevenue.toFixed(2)}`,
                icon: CurrencyDollarIcon,
                color: 'text-neon-green'
              },
              {
                name: 'Pending Orders',
                value: stats.pendingOrders,
                icon: ClockIcon,
                color: 'text-yellow-400'
              },
              {
                name: 'Delivered Orders',
                value: stats.deliveredOrders,
                icon: CheckCircleIcon,
                color: 'text-green-400'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.name}
                variants={itemVariants}
                className="glass-card p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">{stat.name}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-white/40" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-white/20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all duration-300 ${
                  selectedTab === tab.id
                    ? 'border-neon-blue text-white'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Orders Tab */}
          {selectedTab === 'orders' && (
            <div className="space-y-6">
              {ordersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                  <p className="text-white/70 mt-4">Loading orders...</p>
                </div>
              ) : (
                orders?.data?.map((order) => (
                  <motion.div
                    key={order.id}
                    variants={itemVariants}
                    className="glass-card p-6 hover:shadow-glow transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="mb-4 lg:mb-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            Order #{order.order_number}
                          </h3>
                          <div className={`flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="text-sm font-medium">
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <p className="text-white/60 text-sm">
                          {order.user?.first_name} {order.user?.last_name} • {order.user?.email}
                        </p>
                        <p className="text-white/60 text-sm">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
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
                              {order.items?.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center justify-between p-3 glass-morphism rounded-lg">
                                  <div>
                                    <p className="text-white font-medium">{item.menu_item?.name}</p>
                                    <p className="text-white/60 text-sm">KSh {item.price} x {item.quantity}</p>
                                  </div>
                                  <p className="text-neon-green font-semibold">
                                    KSh {item.subtotal || item.price * item.quantity}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Management */}
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-4">Order Management</h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-white/60">Current Status</p>
                                <div className={`flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  <span className="font-medium capitalize">{order.status}</span>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-white/60 mb-2">Update Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {['confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'].map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => updateOrderStatus(order.id, status)}
                                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                        order.status === status
                                          ? 'bg-white/20 text-white'
                                          : 'glass-morphism text-white/80 hover:bg-white/10'
                                      }`}
                                    >
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-white/60">Delivery Address</p>
                                <p className="text-white">{order.delivery_address}</p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-white/60">Phone Number</p>
                                <p className="text-white">{order.phone_number}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Menu Items Tab */}
          {selectedTab === 'menu' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems?.data?.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="glass-card p-6 hover:scale-105 transition-transform duration-300"
                >
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} 
                    alt={item.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
                  <p className="text-white/70 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-neon-green font-bold">KSh {item.price}</p>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      item.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  {item.is_featured && (
                    <div className="mt-2">
                      <span className="text-neon-yellow text-sm">⭐ Featured</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
