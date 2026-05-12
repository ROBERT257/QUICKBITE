import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiUsers, FiShoppingCart, FiSettings, FiTrendingUp, FiPackage, FiDollarSign, FiClock, FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiCheck, FiCheckCircle, FiX, FiMenu, FiLogOut, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import UniformLayout from '../components/UniformLayout';

const AdminDashboard = () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://roelog.pythonanywhere.com';
  
  const [activeSection, setActiveSection] = useState('overview');
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    status: 'Available'
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Customer',
    status: 'Active'
  });

  // Real data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeFoods: 0,
    pendingOrders: 0,
    todayRevenue: 0
  });

  const [users, setUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: FiHome },
    { id: 'foods', label: 'Food Management', icon: FiPackage },
    { id: 'users', label: 'User Management', icon: FiUsers },
    { id: 'orders', label: 'Order Management', icon: FiShoppingCart },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(darkMode ? 'Light mode enabled' : 'Dark mode enabled');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    toast.success('Logged out successfully');
    // In real app, redirect to login
  };

  // Real API Functions
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFoods = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token exists:', !!token);
      console.log('Fetching from:', `${API_BASE_URL}/api/menu/items/`);
      
      const response = await fetch(`${API_BASE_URL}/api/menu/items/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched foods data:', data);
        const foodsData = data.results || data;
        console.log('Setting foods:', foodsData);
        console.log('Number of foods:', foodsData.length);
        setFoods(foodsData);
      } else {
        console.error('Failed to fetch foods:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Try without authentication as fallback
        console.log('Trying without authentication...');
        const fallbackResponse = await fetch(`${API_BASE_URL}/api/menu/items/`);
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          const foodsData = data.results || data;
          console.log('Fallback - Setting foods:', foodsData);
          setFoods(foodsData);
        }
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Fetching orders from:', `${API_BASE_URL}/api/orders/dashboard_orders/`);
      console.log('Token exists:', !!token);
      
      const response = await fetch(`${API_BASE_URL}/api/orders/dashboard_orders/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Orders response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders data received:', data);
        setOrders(data.results || data);
      } else {
        console.error('Failed to fetch orders:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Try without authentication as fallback
        console.log('Trying orders without authentication...');
        const fallbackResponse = await fetch(`${API_BASE_URL}/api/orders/dashboard_orders/`);
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          console.log('Fallback orders data:', data);
          setOrders(data.results || data);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  
  // Handler Functions for Food Management
  const handleToggleFoodStatus = async (food) => {
    try {
      const token = localStorage.getItem('access_token');
      const newStatus = !food.is_available;
      
      const response = await fetch(`${API_BASE_URL}/api/menu/items/${food.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...food,
          is_available: newStatus
        })
      });

      if (response.ok) {
        toast.success(`${food.name} is now ${newStatus ? 'Available' : 'Out of Stock'}!`);
        fetchFoods(); // Refresh data
        fetchStats(); // Refresh stats
      } else {
        toast.error('Failed to update food status');
      }
    } catch (error) {
      toast.error('Error updating food status');
    }
  };

  const handleEditFood = async (food) => {
    setSelectedFood(food);
    setNewFood({
      name: food.name,
      price: food.price,
      description: food.description || '',
      image: food.image || '',
      status: food.is_available ? 'Available' : 'Out of Stock'
    });
    setIsEditMode(true);
    setShowFoodModal(true);
  };

  const handleDeleteFood = async (food) => {
    if (window.confirm(`Are you sure you want to delete ${food.name}?`)) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/api/menu/items/${food.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success(`${food.name} deleted successfully!`);
          fetchFoods(); // Refresh data
          fetchStats(); // Refresh stats
        } else {
          toast.error('Failed to delete food item');
        }
      } catch (error) {
        toast.error('Error deleting food item');
      }
    }
  };

  const handleAddFood = () => {
    setSelectedFood(null);
    setNewFood({
      name: '',
      price: '',
      description: '',
      image: '',
      status: 'Available'
    });
    setIsEditMode(false);
    setShowFoodModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': case 'Available': return 'text-green-400';
      case 'Inactive': case 'Out of Stock': return 'text-red-400';
      case 'Pending': return 'text-yellow-400';
      case 'Preparing': return 'text-blue-400';
      case 'Delivered': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const handleSaveFood = async () => {
    if (!newFood.name || !newFood.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const formData = new FormData();
      formData.append('name', newFood.name);
      formData.append('price', newFood.price);
      formData.append('description', newFood.description || 'Delicious food item');
      formData.append('is_available', newFood.status === 'Available');
      formData.append('preparation_time', '15'); // Default 15 minutes
      formData.append('spice_level', 'mild'); // Default spice level

      // Add image if provided
      if (newFood.image && typeof newFood.image !== 'string') {
        formData.append('image', newFood.image);
      }

      console.log('Submitting food data:', {
        name: newFood.name,
        price: newFood.price,
        description: newFood.description,
        is_available: newFood.status === 'Available',
        preparation_time: '15',
        spice_level: 'mild'
      });

      let response;
      if (isEditMode && selectedFood) {
        // Update existing food
        response = await fetch(`${API_BASE_URL}/api/menu/items/${selectedFood.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else {
        // Add new food
        response = await fetch(`${API_BASE_URL}/api/menu/items/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      }

      console.log('Response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Food created/updated:', result);
        toast.success(`${newFood.name} ${isEditMode ? 'updated' : 'added'} successfully!`);
        setShowFoodModal(false);
        fetchFoods(); // Refresh data
        fetchStats(); // Refresh stats
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        toast.error(`Failed to ${isEditMode ? 'update' : 'add'} food item: ${errorText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Error ${isEditMode ? 'updating' : 'adding'} food item`);
    } finally {
      setSubmitting(false);
    }

    // Reset form
    setNewFood({
      name: '',
      category: 'Burgers',
      price: '',
      description: '',
      image: '',
      status: 'Available'
    });
    setIsEditMode(false);
    setSelectedFood(null);
  };

  // Real API User Functions
  const handleAddUser = () => {
    setSelectedUser(null);
    setNewUser({
      name: '',
      email: '',
      role: 'Customer',
      status: 'Active'
    });
    setIsEditMode(false);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      let response;
      
      if (isEditMode && selectedUser) {
        // Update existing user
        response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: newUser.email,
            first_name: newUser.name.split(' ')[0],
            last_name: newUser.name.split(' ')[1] || '',
            role: newUser.role.toLowerCase(),
            is_active: newUser.status === 'Active'
          })
        });
      } else {
        // Add new user
        response = await fetch(`${API_BASE_URL}/api/admin/users/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: newUser.email.split('@')[0],
            email: newUser.email,
            first_name: newUser.name.split(' ')[0],
            last_name: newUser.name.split(' ')[1] || '',
            role: newUser.role.toLowerCase(),
            is_active: newUser.status === 'Active'
          })
        });
      }

      if (response.ok) {
        toast.success(`${newUser.name} ${isEditMode ? 'updated' : 'added'} successfully!`);
        setShowUserModal(false);
        fetchUsers(); // Refresh data
        fetchStats(); // Refresh stats
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'add'} user`);
      }
    } catch (error) {
      toast.error(`Error ${isEditMode ? 'updating' : 'adding'} user`);
    } finally {
      setSubmitting(false);
    }

    // Reset form
    setNewUser({
      name: '',
      email: '',
      role: 'Customer',
      status: 'Active'
    });
    setIsEditMode(false);
    setSelectedUser(null);
  };

  const handleEditUser = async (user) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.is_active ? 'Active' : 'Inactive'
    });
    setIsEditMode(true);
    setShowUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newUser.email,
          first_name: newUser.name.split(' ')[0],
          last_name: newUser.name.split(' ')[1] || '',
          role: newUser.role.toLowerCase(),
          is_active: newUser.status === 'Active'
        })
      });

      if (response.ok) {
        toast.success(`${newUser.name} updated successfully!`);
        setShowUserModal(false);
        fetchUsers(); // Refresh data
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      toast.error('Error updating user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success(`${user.name} deleted successfully!`);
          fetchUsers(); // Refresh data
          fetchStats(); // Refresh stats
        } else {
          toast.error('Failed to delete user');
        }
      } catch (error) {
        toast.error('Error deleting user');
      }
    }
  };

  // Real API Order Functions
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Updating order status:', { orderId, newStatus, tokenExists: !!token });
      
      // Map frontend status to backend status
      const statusMapping = {
        'Pending': 'pending',
        'Preparing': 'preparing', 
        'Delivered': 'delivered'
      };
      
      const backendStatus = statusMapping[newStatus] || newStatus.toLowerCase();
      console.log('Backend status mapping:', { newStatus, backendStatus });
      
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/update_status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: backendStatus })
      });

      console.log('Update status response:', response.status, response.statusText);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Update response data:', responseData);
        toast.success(`Order ${orderId} status updated to ${newStatus}!`);
        fetchOrders(); // Refresh data
        fetchStats(); // Refresh stats
      } else {
        const errorText = await response.text();
        console.error('Update status error:', response.status, errorText);
        toast.error(`Failed to update order status: ${response.status}`);
      }
    } catch (error) {
      console.error('Update status exception:', error);
      toast.error('Error updating order status');
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchFoods(),
          fetchUsers(),
          fetchOrders()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Real-time order polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(); // Refresh orders every 5 seconds
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSection]); // Only poll when on orders section

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} bg-opacity-10 border ${color.replace('text-', 'border-')}`}>
        {status}
      </span>
    );
  };

  return (
    <UniformLayout title="Admin Dashboard" showSidebar={true}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-30 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className="p-6">

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                    : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`w-full p-3 rounded-lg transition-all duration-200 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {darkMode ? '🌞' : '🌙'}
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-full p-3 rounded-lg transition-all duration-200 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-red-400' : 'bg-gray-100 hover:bg-gray-200 text-red-600'
            }`}
          >
            <FiLogOut className="w-5 h-5 mr-2" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        
        {/* Content Area */}
        <main className="p-6">
          {activeSection === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'blue' },
                  { label: 'Total Orders', value: stats.totalOrders, icon: FiShoppingCart, color: 'green' },
                  { label: 'Total Revenue', value: `KSh ${stats.totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'yellow' },
                  { label: 'Active Foods', value: stats.activeFoods, icon: FiPackage, color: 'purple' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.color === 'blue' ? 'bg-blue-500' : stat.color === 'green' ? 'bg-green-500' : stat.color === 'yellow' ? 'bg-yellow-500' : 'bg-purple-500'}`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <FiTrendingUp className={`w-5 h-5 ${stat.color === 'blue' ? 'text-blue-500' : stat.color === 'green' ? 'text-green-500' : stat.color === 'yellow' ? 'text-yellow-500' : 'text-purple-500'}`} />
                    </div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</h3>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Orders</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{order.customer}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{Array.isArray(order.items) ? order.items.length : 0} items • ${order.total}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{order.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Revenue Overview</h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Today's Revenue</span>
                        <FiDollarSign className="w-4 h-4 text-green-500" />
                      </div>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>KSh {stats.todayRevenue.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Orders</span>
                        <FiClock className="w-4 h-4 text-yellow-500" />
                      </div>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.pendingOrders}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeSection === 'foods' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Food Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddFood}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium flex items-center"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Add New Food
                </motion.button>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative">
                  <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <input
                    type="text"
                    placeholder="Search foods..."
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>
              </div>

              {/* Debug Info */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 mb-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Debug: Foods count = {foods.length}, Loading = {loading.toString()}
                </p>
                <details className="mt-2">
                  <summary className={`text-sm cursor-pointer ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>View foods data</summary>
                  <pre className={`text-xs mt-2 p-2 rounded ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'} overflow-auto max-h-40`}>
                    {JSON.stringify(foods, null, 2)}
                  </pre>
                </details>
              </div>

              {/* Foods Table */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Food</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Price</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Orders</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {foods.map((food, index) => (
                        <motion.tr
                          key={food.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                        >
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            <div className="flex items-center">
                              {food.image ? (
                                <img 
                                  src={food.image} 
                                  alt={food.name}
                                  className="w-10 h-10 rounded-lg object-cover mr-3"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center mr-3">
                                  <FiPackage className="w-5 h-5 text-gray-600" />
                                </div>
                              )}
                              <span className="font-medium">{food.name}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-800'}`}>KSh {food.price}</td>
                          <td className={`px-6 py-4 whitespace-nowrap`}>{getStatusBadge(food.is_available ? 'Available' : 'Out of Stock')}</td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>-</td>
                          <td className={`px-6 py-4 whitespace-nowrap`}>
                            <div className="flex items-center space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleToggleFoodStatus(food)}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  darkMode ? 'hover:bg-gray-600 text-yellow-400' : 'hover:bg-gray-100 text-yellow-600'
                                }`}
                              >
                                {food.is_available ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditFood(food)}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  darkMode ? 'hover:bg-gray-600 text-green-400' : 'hover:bg-gray-100 text-green-600'
                                }`}
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteFood(food)}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
                                }`}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Order Management</h2>
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium flex items-center"
                  >
                    <FiRefreshCw className="w-5 h-5 mr-2" />
                    Refresh Orders
                  </motion.button>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Orders</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{order.user_name || order.order_number}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{Array.isArray(order.items) ? order.items.length : 0} items • ${order.total_amount}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {['Pending', 'Preparing', 'Delivered'].map((status) => (
                              <motion.button
                                key={status}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdateOrderStatus(order.id, status)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                  order.status === status
                                    ? status === 'Pending'
                                      ? 'bg-yellow-500 text-white'
                                      : status === 'Preparing'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-green-500 text-white'
                                    : darkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {status}
                              </motion.button>
                            ))}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              darkMode ? 'hover:bg-gray-600 text-green-400' : 'hover:bg-gray-100 text-green-600'
                            }`}
                          >
                            <FiCheckCircle className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeSection === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>User Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddUser}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium flex items-center"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Add New User
                </motion.button>
              </div>

              {/* Users Table */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>User</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Role</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Join Date</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {users.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                        >
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                {user.name.charAt(0)}
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</td>
                          <td className={`px-6 py-4 whitespace-nowrap`}>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                              user.role === 'Vendor' ? 'bg-blue-100 text-blue-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap`}>{getStatusBadge(user.status)}</td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.joinDate}</td>
                          <td className={`px-6 py-4 whitespace-nowrap`}>
                            <div className="flex items-center space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  darkMode ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                                }`}
                              >
                                <FiEye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  darkMode ? 'hover:bg-gray-600 text-green-400' : 'hover:bg-gray-100 text-green-600'
                                }`}
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
                                }`}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Add/Edit Food Modal */}
      {showFoodModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}
          >
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {isEditMode ? 'Edit Food' : 'Add New Food'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                <input
                  type="text"
                  value={newFood.name}
                  onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="Food name"
                />
              </div>
                            <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</label>
                <input
                  type="number"
                  value={newFood.price}
                  onChange={(e) => setNewFood({...newFood, price: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                <select
                  value={newFood.status}
                  onChange={(e) => setNewFood({...newFood, status: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                >
                  <option>Available</option>
                  <option>Out of Stock</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setNewFood({ ...newFood, image: e.target.files[0] });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800"
                />
                {newFood.image && typeof newFood.image !== 'string' && (
                  <img
                    src={URL.createObjectURL(newFood.image)}
                    alt="Preview"
                    className="mt-2 w-24 h-24 object-cover rounded-lg border"
                  />
                )}
                {typeof newFood.image === 'string' && newFood.image && (
                  <img
                    src={newFood.image}
                    alt="Preview"
                    className="mt-2 w-24 h-24 object-cover rounded-lg border"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFoodModal(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveFood}
                disabled={submitting}
                className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Saving...' : (isEditMode ? 'Update' : 'Add') + ' Food'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}
          >
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {isEditMode ? 'Edit User' : 'Add New User'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="User name"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                >
                  <option>Customer</option>
                  <option>Admin</option>
                  <option>Vendor</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserModal(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveUser}
                disabled={submitting}
                className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Saving...' : (isEditMode ? 'Update' : 'Add') + ' User'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </UniformLayout>
  );
};

export default AdminDashboard;
