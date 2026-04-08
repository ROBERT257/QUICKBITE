import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheck, 
  FiClock, 
  FiAlertCircle,
  FiShoppingCart,
  FiTrendingUp,
  FiPackage,
  FiRefreshCw,
  FiLogOut,
  FiUser
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import realtimeService from '../services/realtime';
import QuickBiteLogo from '../components/QuickBiteLogo';

const ChefDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated as chef
    const token = localStorage.getItem('access_token');
    const userType = localStorage.getItem('user_type');
    
    if (!token || userType !== 'chef') {
      navigate('/login');
      return;
    }

    fetchData();

    // Subscribe to real-time updates
    const unsubscribeOrders = realtimeService.subscribeToOrders((updatedOrders) => {
      setOrders(Array.isArray(updatedOrders) ? updatedOrders : []);
    });

    return () => {
      unsubscribeOrders();
    };
  }, [navigate]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch menu items
      const menuResponse = await fetch(`${API_BASE_URL}/api/menu/items/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setMenuItems(Array.isArray(menuData.results) ? menuData.results : menuData);
      }

      // Fetch orders
      const ordersResponse = await fetch(`${API_BASE_URL}/api/orders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const updateItemStatus = async (itemId, newStatus) => {
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/menu/${itemId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          is_available: newStatus === 'ready',
          chef_status: newStatus 
        })
      });

      if (response.ok) {
        setMenuItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, is_available: newStatus === 'ready', chef_status: newStatus }
            : item
        ));
        
        toast.success(`Item marked as ${newStatus}!`);
        realtimeService.triggerOrderCheck(); // Trigger real-time update
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'preparing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return <FiCheck className="w-4 h-4" />;
      case 'preparing': return <FiClock className="w-4 h-4" />;
      default: return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'preparing': return 'Preparing';
      default: return 'Not Ready';
    }
  };

  // Calculate summary stats
  const readyItems = menuItems.filter(item => item.chef_status === 'ready').length;
  const preparingItems = menuItems.filter(item => item.chef_status === 'preparing').length;
  const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'preparing').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Loading Chef Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <QuickBiteLogo variant="neon" size="medium" />
            <h1 className="text-2xl font-bold text-white">Chef Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiUser className="w-4 h-4 text-white/60" />
              <span className="text-white/80 text-sm">Chef</span>
            </div>
            <button
              onClick={fetchData}
              className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
              title="Refresh"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_type');
                navigate('/login');
              }}
              className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Summary Panel */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Ready Items</p>
                <p className="text-3xl font-bold">{readyItems}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiCheck className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Preparing</p>
                <p className="text-3xl font-bold">{preparingItems}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiClock className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Pending Orders</p>
                <p className="text-3xl font-bold">{pendingOrders}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiShoppingCart className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Status Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{item.name}</h3>
                    <p className="text-white/60 text-sm">KSh {item.price}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(item.chef_status)}`}>
                    {getStatusIcon(item.chef_status)}
                    <span className="text-white text-xs font-medium">
                      {getStatusText(item.chef_status)}
                    </span>
                  </div>
                </div>

                {/* Quick Status Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateItemStatus(item.id, 'not_ready')}
                    disabled={updating[item.id]}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      item.chef_status === 'not_ready'
                        ? 'bg-gray-600 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    } disabled:opacity-50`}
                  >
                    Not Ready
                  </button>
                  <button
                    onClick={() => updateItemStatus(item.id, 'preparing')}
                    disabled={updating[item.id]}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      item.chef_status === 'preparing'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    } disabled:opacity-50`}
                  >
                    Preparing
                  </button>
                  <button
                    onClick={() => updateItemStatus(item.id, 'ready')}
                    disabled={updating[item.id]}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      item.chef_status === 'ready'
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    } disabled:opacity-50`}
                  >
                    Ready
                  </button>
                </div>

                {updating[item.id] && (
                  <div className="mt-2 text-center">
                    <div className="inline-flex items-center text-green-400 text-sm">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400 mr-2"></div>
                      Updating...
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
