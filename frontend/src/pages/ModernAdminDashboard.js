import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiUsers, FiShoppingCart, FiSettings, FiTrendingUp, FiPackage, FiDollarSign, FiClock, FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiCheck, FiX, FiMenu, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock data - replace with real API calls
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalOrders: 3582,
    totalRevenue: 45678.90,
    activeFoods: 156,
    pendingOrders: 47,
    todayRevenue: 2341.50
  });

  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Customer', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-10' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Customer', status: 'Inactive', joinDate: '2024-02-01' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Vendor', status: 'Active', joinDate: '2024-01-20' },
  ]);

  const [foods, setFoods] = useState([
    { id: 1, name: 'Classic Burger', category: 'Burgers', price: 12.99, status: 'Available', image: '🍔', orders: 234 },
    { id: 2, name: 'Cheese Pizza', category: 'Pizza', price: 18.99, status: 'Available', image: '🍕', orders: 189 },
    { id: 3, name: 'Chicken Wings', category: 'Appetizers', price: 8.99, status: 'Out of Stock', image: '🍗', orders: 156 },
    { id: 4, name: 'Caesar Salad', category: 'Salads', price: 7.99, status: 'Available', image: '🥗', orders: 98 },
    { id: 5, name: 'Chocolate Shake', category: 'Desserts', price: 4.99, status: 'Available', image: '🥤', orders: 267 },
  ]);

  const [orders, setOrders] = useState([
    { id: 1, customer: 'John Doe', items: 3, total: 45.97, status: 'Pending', time: '2 mins ago' },
    { id: 2, customer: 'Jane Smith', items: 2, total: 37.98, status: 'Preparing', time: '5 mins ago' },
    { id: 3, customer: 'Mike Johnson', items: 5, total: 89.95, status: 'Delivered', time: '15 mins ago' },
    { id: 4, customer: 'Sarah Wilson', items: 1, total: 12.99, status: 'Pending', time: '1 min ago' },
  ]);

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

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} bg-opacity-10 border ${color.replace('text-', 'border-')}`}>
        {status}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-30 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              Q
            </div>
            <span className={`ml-3 text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>QuickBite Admin</span>
          </div>

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
        </div>

        <div className="absolute bottom-20 left-6 right-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className={`w-full p-3 rounded-lg transition-all duration-200 ${
              darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <FiLogOut className="w-5 h-5 mr-2" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <FiMenu className="w-5 h-5" />
              </motion.button>
              <h1 className={`ml-4 text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <FiSearch className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <FiFilter className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
            </div>
          </div>
        </header>

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
                  { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'yellow' },
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
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{order.items} items • ${order.total}</p>
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
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>${stats.todayRevenue.toLocaleString()}</p>
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
                <select className={`px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-purple-500`}>
                  <option>All Categories</option>
                  <option>Burgers</option>
                  <option>Pizza</option>
                  <option>Appetizers</option>
                  <option>Salads</option>
                  <option>Desserts</option>
                </select>
              </div>

              {/* Foods Table */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Food</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category</th>
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
                              <span className="text-2xl mr-3">{food.image}</span>
                              <span className="font-medium">{food.name}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{food.category}</td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-800'}`}>${food.price}</td>
                          <td className={`px-6 py-4 whitespace-nowrap`}>{getStatusBadge(food.status)}</td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{food.orders}</td>
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
    </div>
  );
};

export default AdminDashboard;
