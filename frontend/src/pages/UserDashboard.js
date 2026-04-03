import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  ShoppingBagIcon,
  ClockIcon,
  LocationMarkerIcon,
  PhoneIcon,
  MailIcon,
  CreditCardIcon,
  ArrowRightIcon,
  StarIcon,
  TruckIcon,
  CheckCircleIcon
} from '@heroicons/react/outline';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import PremiumNavigation from '../components/PremiumNavigation';
import PremiumAIChat from '../components/PremiumAIChat';
import { ordersAPI } from '../services/api';
import realtimeService from '../services/realtime';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [showAIChat, setShowAIChat] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real user orders
  const { data: userOrders = [], isLoading: ordersLoading } = useQuery(
    'userOrders',
    async () => {
      try {
        const response = await ordersAPI.getMyOrders();
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch user orders:', error);
        return [];
      }
    }
  );

  const queryClient = useQueryClient();

  // Mutation for updating order status
  const updateOrderStatusMutation = useMutation(
    async ({ orderId, status }) => {
      try {
        const response = await ordersAPI.updateOrderStatus(orderId, status);
        return response.data;
      } catch (error) {
        console.error('Failed to update order status:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast.success('Order status updated successfully!');
        queryClient.invalidateQueries('userOrders');
      },
      onError: (error) => {
        console.error('Mutation error:', error);
        toast.error('Failed to update order status');
      }
    }
  );

  // Calculate stats from real data
  const totalOrders = userOrders?.length || 0;
  const deliveredOrders = userOrders?.filter(order => order.status === 'delivered')?.length || 0;
  const pendingOrders = userOrders?.filter(order => order.status === 'pending')?.length || 0;
  const preparingOrders = userOrders?.filter(order => order.status === 'preparing')?.length || 0;
  const deliveringOrders = userOrders?.filter(order => order.status === 'delivering')?.length || 0;
  const todayOrders = userOrders?.filter(order => {
    const orderDate = new Date(order.created_at).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  })?.length || 0;
  const avgDeliveryTime = deliveredOrders > 0 ? '35 min' : 'N/A';

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('UserDashboard: Setting up real-time subscription');
    
    const unsubscribe = realtimeService.subscribeToOrders((orders) => {
      console.log('UserDashboard: Real-time update received', orders.length, 'orders');
      
      // Update local orders with real-time data
      queryClient.setQueryData('userOrders', orders);
      
      // Show notification for status changes
      const latestOrder = orders[0];
      if (latestOrder) {
        if (latestOrder.status === 'delivering') {
          toast.success('Your order is on the way! 🚚');
        } else if (latestOrder.status === 'delivered') {
          toast.success('Your order has been delivered! 🎉');
        }
      }
    });

    return unsubscribe;
  }, [isAuthenticated, queryClient]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'orders', label: 'My Orders', icon: ShoppingBagIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-400';
      case 'preparing': return 'text-yellow-400';
      case 'on-way': return 'text-blue-400';
      case 'delivering': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-400/20';
      case 'preparing': return 'bg-yellow-400/20';
      case 'on-way': return 'bg-blue-400/20';
      case 'delivering': return 'bg-orange-400/20';
      default: return 'bg-gray-400/20';
    }
  };

  // Modern tracking stages
  const getTrackingStages = (status) => {
    const stages = [
      { key: 'pending', label: 'Order Placed', icon: ShoppingBagIcon, completed: true },
      { key: 'preparing', label: 'Preparing', icon: ClockIcon, completed: ['preparing', 'ready', 'delivering', 'delivered'].includes(status) },
      { key: 'ready', label: 'Ready', icon: CheckCircleIcon, completed: ['ready', 'delivering', 'delivered'].includes(status) },
      { key: 'delivering', label: 'On the way', icon: TruckIcon, completed: status === 'delivered' },
      { key: 'delivered', label: 'Delivered', icon: CheckCircleIcon, completed: status === 'delivered' }
    ];
    
    const currentIndex = stages.findIndex(stage => stage.key === status);
    return stages.map((stage, index) => ({
      ...stage,
      active: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <PremiumNavigation />
      <PremiumAIChat onClose={() => setShowAIChat(false)} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-gradient">{user?.first_name || 'User'}</span>!
          </h1>
          <p className="text-white/60">Here's what's happening with your QuickBite experience</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="premium-card p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{totalOrders}</h3>
            <p className="text-white/60 text-sm">Total Orders</p>
          </div>
          
          <div className="premium-card p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{deliveredOrders}</h3>
            <p className="text-white/60 text-sm">Completed Orders</p>
          </div>
          
          <div className="premium-card p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{pendingOrders}</h3>
            <p className="text-white/60 text-sm">Pending Orders</p>
          </div>
          
          <div className="premium-card p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{deliveringOrders}</h3>
            <p className="text-white/60 text-sm">On the Way</p>
          </div>
          
          <div className="premium-card p-6 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{todayOrders}</h3>
            <p className="text-white/60 text-sm">Today's Orders</p>
          </div>
          
          <div className="premium-card p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{avgDeliveryTime}</h3>
            <p className="text-white/60 text-sm">Avg. Delivery Time</p>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="premium-card p-6"
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="premium-card p-4 text-left hover:scale-105 transition-all">
                  <ShoppingBagIcon className="w-8 h-8 text-blue-400 mb-2" />
                  <h3 className="text-white font-semibold mb-1">Order Food</h3>
                  <p className="text-white/60 text-sm">Browse our menu and place your order</p>
                </button>
                <button className="premium-card p-4 text-left hover:scale-105 transition-all">
                  <ClockIcon className="w-8 h-8 text-green-400 mb-2" />
                  <h3 className="text-white font-semibold mb-1">Track Order</h3>
                  <p className="text-white/60 text-sm">Check your order status</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-white/60 text-sm">
                    {ordersLoading ? 'Loading...' : `Showing ${userOrders.length} orders`}
                  </span>
                </div>
              </div>
              {ordersLoading ? (
                <div className="premium-card p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
              ) : userOrders.length > 0 ? (
                userOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="premium-card p-6">
                    {/* Modern Order Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusBg(order.status)} animate-pulse`}></div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{order.order_number}</h3>
                          <p className="text-white/60 text-sm">{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-xl">KSh {order.total_amount}</p>
                        <span className={`text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Modern Tracking Progress */}
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-4">Order Progress</h4>
                      <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-white/20"></div>
                        
                        {/* Tracking Stages */}
                        <div className="space-y-6">
                          {getTrackingStages(order.status).map((stage, index) => {
                            const Icon = stage.icon;
                            return (
                              <div key={stage.key} className="flex items-center space-x-4 relative">
                                {/* Stage Icon */}
                                <div className={`
                                  relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                  ${stage.completed ? 'bg-green-500' : stage.current ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}
                                `}>
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                
                                {/* Stage Content */}
                                <div className="flex-1">
                                  <h5 className={`font-semibold ${stage.completed ? 'text-green-400' : stage.current ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {stage.label}
                                  </h5>
                                  {stage.current && (
                                    <p className="text-white/60 text-sm animate-pulse">
                                      {stage.key === 'delivering' ? 'Your order is on the way! 🚚' : 
                                       stage.key === 'delivered' ? 'Order has arrived! 🎉' : 
                                       'In progress...'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-white/80 text-sm mb-1">Items:</p>
                          <p className="text-white font-medium">
                            {order.items?.map(item => item.menu_item?.name).join(', ')}
                          </p>
                          {order.special_instructions && (
                            <p className="text-white/60 text-xs italic mt-2">
                              📝 Note: {order.special_instructions}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2 text-white/60 text-sm">
                          <LocationMarkerIcon className="w-4 h-4" />
                          <span>Delivery Address</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {order.status === 'delivering' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: 'delivered' })}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center space-x-2"
                              disabled={updateOrderStatusMutation.isLoading}
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Mark as Arrived</span>
                            </motion.button>
                          )}
                          <button className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
                            <TruckIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="premium-card p-8 text-center">
                  <ShoppingBagIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-white/60">Place your first order to get started!</p>
                  <button 
                    onClick={() => window.location.href = '/menu'}
                    className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Browse Menu
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white/60 text-sm">Full Name</p>
                      <p className="text-white font-semibold">
                        {user?.first_name} {user?.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MailIcon className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white/60 text-sm">Email</p>
                      <p className="text-white font-semibold">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white/60 text-sm">Phone</p>
                      <p className="text-white font-semibold">{user?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <LocationMarkerIcon className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white/60 text-sm">Default Address</p>
                      <p className="text-white font-semibold">Nairobi, Kenya</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCardIcon className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white/60 text-sm">Payment Method</p>
                      <p className="text-white font-semibold">M-Pesa / Card</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
