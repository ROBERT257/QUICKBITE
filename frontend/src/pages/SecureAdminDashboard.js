import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiPackage, 
  FiTrendingUp, 
  FiDollarSign,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiEye,
  FiCheck,
  FiClock,
  FiTruck,
  FiX,
  FiMenu,
  FiLogOut,
  FiRefreshCw,
  FiLock,
  FiUser,
  FiStar,
  FiList,
  FiGrid,
  FiDownload,
  FiEyeOff,
  FiCopy,
  FiImage,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import realtimeService from '../services/realtime';
import QuickBiteLogo from '../components/QuickBiteLogo';

const SecureAdminDashboard = () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('food');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    featured: 0,
    categories: 0,
    totalRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    spice_level: 1,
    preparation_time: 15,
    is_available: true,
    is_featured: false,
    image: null
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated as admin
    const checkAdminAuth = () => {
      const token = localStorage.getItem('access_token');
      const userType = localStorage.getItem('user_type');
      
      if (!token || userType !== 'admin') {
        navigate('/login');
        return false;
      }
      return true;
    };

    if (!checkAdminAuth()) {
      return;
    }

    fetchData();

    // Subscribe to real-time order updates
    const unsubscribe = realtimeService.subscribeToOrders((updatedOrders) => {
      console.log('AdminDashboard: Real-time update received', updatedOrders.length, 'orders');
      setOrders(Array.isArray(updatedOrders) ? updatedOrders : []);
      fetchStats(); // Fetch real-time analytics data
    });

    // Listen for custom order notifications
    const handleOrderNotification = (event) => {
      const { message, type } = event.detail;
      if (type === 'new_order') {
        toast.success(message, {
          duration: 5000,
          icon: '📦'
        });
      }
    };

    window.addEventListener('orderNotification', handleOrderNotification);

    return () => {
      unsubscribe();
      window.removeEventListener('orderNotification', handleOrderNotification);
    };
  }, [navigate]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchMenuItems(),
        fetchCategories(),
        fetchOrders()
      ]);
      fetchStats();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/menu/items/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.results || data);
      } else {
        toast.error('Failed to fetch menu items');
      }
    } catch (error) {
      toast.error('Error fetching menu items');
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/menu/categories/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categories fetched:', data);
        const categoriesArray = Array.isArray(data) ? data : [];
        
        // If no categories from API, add default ones
        if (categoriesArray.length === 0) {
          const defaultCategories = [
            { id: 'burgers', name: 'Burgers' },
            { id: 'pizza', name: 'Pizza' },
            { id: 'drinks', name: 'Drinks' },
            { id: 'desserts', name: 'Desserts' },
            { id: 'snacks', name: 'Snacks' }
          ];
          console.log('Using default categories:', defaultCategories);
          setCategories(defaultCategories);
        } else {
          setCategories(categoriesArray);
        }
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Try admin-specific endpoint first
      let response = await fetch(`${API_BASE_URL}/api/orders/admin_orders/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // If admin endpoint fails, fallback to regular orders
      if (!response.ok) {
        console.log('Admin endpoint failed, trying regular orders endpoint');
        response = await fetch(`${API_BASE_URL}/api/orders/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      } else {
        console.error('Failed to fetch orders:', response.status);
        setOrders([]);
        setLoading(false);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
      setOrders([]);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStats({
        total: Array.isArray(menuItems) ? menuItems.length : 0,
        available: Array.isArray(menuItems) ? menuItems.filter(item => item.is_available).length : 0,
        featured: Array.isArray(menuItems) ? menuItems.filter(item => item.is_featured).length : 0,
        categories: Array.isArray(categories) ? categories.length : 0,
        totalRevenue: 284750,
        todayOrders: Array.isArray(orders) ? orders.filter(order => {
          const orderDate = new Date(order.created_at).toDateString();
          const today = new Date().toDateString();
          return orderDate === today;
        }).length : 0,
        pendingOrders: Array.isArray(orders) ? orders.filter(order => order.status !== 'delivered').length : 0,
        completedOrders: Array.isArray(orders) ? orders.filter(order => order.status === 'delivered').length : 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('username');
    localStorage.removeItem('is_authenticated');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Admin updating order:', { orderId, newStatus });
      
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/update_status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      console.log('Update response:', response.status);

      if (response.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        // Trigger real-time update
        realtimeService.triggerOrderCheck();
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        toast.error(`Failed to update: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.preparation_time || formData.preparation_time <= 0) {
      toast.error('Please enter valid preparation time');
      return;
    }
    
    setSubmitting(true);
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      } else if (key !== 'image') {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem('access_token');
      const url = editingItem 
        ? `${API_BASE_URL}/api/menu/${editingItem.id}/`
        : `${API_BASE_URL}/api/menu/`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
        fetchMenuItems();
        fetchStats();
        setShowAddForm(false);
        setEditingItem(null);
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.detail || 'Failed to save item';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Error saving item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      spice_level: item.spice_level,
      preparation_time: item.preparation_time,
      is_available: item.is_available,
      is_featured: item.is_featured,
      image: null
    });
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/api/menu/${itemId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          toast.success('Item deleted successfully!');
          fetchMenuItems();
          fetchStats();
        } else {
          toast.error('Failed to delete item');
        }
      } catch (error) {
        toast.error('Error deleting item');
      }
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/menu/${item.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          is_available: !item.is_available
        })
      });
      
      if (response.ok) {
        toast.success(`Item ${item.is_available ? 'unavailable' : 'available'}!`);
        fetchMenuItems();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const toggleFeatured = async (item) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/menu/${item.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          is_featured: !item.is_featured
        })
      });
      
      if (response.ok) {
        toast.success(`Item ${item.is_featured ? 'unfeatured' : 'featured'}!`);
        fetchMenuItems();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const handleBulkAction = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    if (bulkAction === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
        try {
          const token = localStorage.getItem('access_token');
          await Promise.all(
            selectedItems.map(id => 
              fetch(`${API_BASE_URL}/api/menu/${id}/`, { 
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
            )
          );
          toast.success(`${selectedItems.length} items deleted successfully!`);
          fetchMenuItems();
          fetchStats();
          setSelectedItems([]);
          setBulkAction('');
        } catch (error) {
          toast.error('Error deleting items');
        }
      }
    } else if (bulkAction === 'available' || bulkAction === 'unavailable') {
      try {
        const token = localStorage.getItem('access_token');
        await Promise.all(
          selectedItems.map(id => 
            fetch(`${API_BASE_URL}/api/menu/${id}/`, {
              method: 'PUT',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
              },
              body: JSON.stringify({ is_available: bulkAction === 'available' })
            })
          )
        );
        toast.success(`${selectedItems.length} items marked as ${bulkAction}!`);
        fetchMenuItems();
        fetchStats();
        setSelectedItems([]);
        setBulkAction('');
      } catch (error) {
        toast.error('Error updating items');
      }
    } else if (bulkAction === 'featured' || bulkAction === 'unfeatured') {
      try {
        const token = localStorage.getItem('access_token');
        await Promise.all(
          selectedItems.map(id => 
            fetch(`${API_BASE_URL}/api/menu/${id}/`, {
              method: 'PUT',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
              },
              body: JSON.stringify({ is_featured: bulkAction === 'featured' })
            })
          )
        );
        toast.success(`${selectedItems.length} items ${bulkAction}!`);
        fetchMenuItems();
        fetchStats();
        setSelectedItems([]);
        setBulkAction('');
      } catch (error) {
        toast.error('Error updating items');
      }
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (!Array.isArray(filteredItems)) return;
    
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const duplicateItem = async (item) => {
    try {
      const token = localStorage.getItem('access_token');
      const duplicatedData = {
        name: `${item.name} (Copy)`,
        description: item.description,
        category: item.category,
        price: item.price,
        spice_level: item.spice_level,
        preparation_time: item.preparation_time,
        is_available: false,
        is_featured: false,
        image: null
      };

      const response = await fetch(`${API_BASE_URL}/api/menu/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(duplicatedData)
      });

      if (response.ok) {
        toast.success('Item duplicated successfully!');
        fetchMenuItems();
        fetchStats();
      }
    } catch (error) {
      toast.error('Error duplicating item');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(menuItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'menu-items.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Data exported successfully!');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      spice_level: 1,
      preparation_time: 15,
      is_available: true,
      is_featured: false,
      image: null
    });
  };

  const filteredItems = Array.isArray(menuItems) ? menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  // Modern order status stages for admin
  const getOrderStages = (status) => {
    const stages = [
      { key: 'pending', label: 'Order Received', color: 'yellow', icon: FiClock },
      { key: 'preparing', label: 'Preparing', color: 'blue', icon: FiPackage },
      { key: 'ready', label: 'Ready for Pickup', color: 'purple', icon: FiCheck },
      { key: 'delivering', label: 'Out for Delivery', color: 'orange', icon: FiTruck },
      { key: 'delivered', label: 'Delivered', color: 'green', icon: FiCheck }
    ];
    
    const currentIndex = stages.findIndex(stage => stage.key === status);
    return stages.map((stage, index) => ({
      ...stage,
      completed: index < currentIndex,
      current: index === currentIndex,
      upcoming: index > currentIndex
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'preparing': return 'text-blue-400';
      case 'ready': return 'text-purple-400';
      case 'delivering': return 'text-orange-400';
      case 'delivered': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'preparing': return <FiPackage className="w-4 h-4" />;
      case 'ready': return <FiCheck className="w-4 h-4" />;
      case 'delivering': return <FiTruck className="w-4 h-4" />;
      case 'delivered': return <FiCheck className="w-4 h-4" />;
      case 'cancelled': return <FiX className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Loading secure admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Debug Info */}
      <div className="fixed top-20 right-4 z-50 p-4 bg-black/80 rounded-lg text-white text-xs max-w-xs">
        <div className="font-bold mb-2">Admin Debug Info:</div>
        <div>Orders: {orders.length}</div>
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User Type: {localStorage.getItem('user_type')}</div>
        <div>Token: {localStorage.getItem('access_token') ? 'Exists' : 'Missing'}</div>
        {orders.length > 0 && (
          <div className="mt-2 border-t border-white/20 pt-2">
            <div className="font-bold">First Order:</div>
            <div>ID: {orders[0]?.id}</div>
            <div>Status: {orders[0]?.status}</div>
            <div>Customer: {orders[0]?.customer_name}</div>
          </div>
        )}
      </div>
      
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-lg border-b border-white/10 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiLock className="w-5 h-5 text-green-400" />
              <QuickBiteLogo variant="neon" size="medium" />
            </div>
            <div className="flex space-x-1 bg-black/40 backdrop-blur-lg p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-neon-blue to-purple-500 text-white shadow-lg shadow-neon-blue/50'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiShoppingCart className="w-5 h-5" />
                <span>Order Management</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'stats'
                    ? 'bg-gradient-to-r from-neon-blue to-purple-500 text-white shadow-lg shadow-neon-blue/50'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiTrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('food')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'food'
                    ? 'bg-gradient-to-r from-neon-blue to-purple-500 text-white shadow-lg shadow-neon-blue/50'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiPackage className="w-5 h-5" />
                <span>Menu Management</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiUser className="w-4 h-4 text-white/60" />
              <span className="text-white/80 text-sm">Admin</span>
            </div>
            <button
              onClick={() => {
                console.log('Current token:', localStorage.getItem('admin_token'));
                console.log('Is admin:', localStorage.getItem('is_admin'));
              }}
              className="text-white/60 hover:text-white text-xs px-2 py-1 rounded border border-white/20"
              title="Debug: Check tokens"
            >
              Debug
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('is_admin');
                localStorage.removeItem('admin_user');
                navigate('/admin-login');
              }}
              className="text-white/60 hover:text-white text-xs px-2 py-1 rounded border border-white/20"
              title="Clear tokens and re-login"
            >
              Re-Login
            </button>
            <button
              onClick={handleLogout}
              className="text-white/60 hover:text-white"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'food' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold text-white mb-2">Food Management</h2>
                <p className="text-white/70">Manage your menu items, categories, and pricing</p>
              </motion.div>
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                <div className="premium-card p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Total Items</p>
                      <p className="text-2xl font-bold text-gradient">{menuItems?.length || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center animate-pulse">
                      <FiPackage className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Available</p>
                      <p className="text-2xl font-bold text-green-400">{menuItems?.filter(item => item.is_available).length || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center animate-pulse">
                      <FiCheck className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Featured</p>
                      <p className="text-2xl font-bold text-purple-400">{menuItems?.filter(item => item.is_featured).length || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center animate-pulse">
                      <FiStar className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Categories</p>
                      <p className="text-2xl font-bold text-orange-400">{categories.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center animate-pulse">
                      <FiFilter className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Revenue</p>
                      <p className="text-neon-green font-bold text-lg">KSh {stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center animate-pulse">
                      <FiDollarSign className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Today Orders</p>
                      <p className="text-blue-400 font-bold text-lg">{stats.todayOrders}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center animate-pulse">
                      <FiShoppingCart className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Search and Actions */}
              <div className="premium-card p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="glass-input w-full pl-10 pr-4 py-3"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="glass-input px-4 py-3"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="glass-input px-4 py-3 flex items-center space-x-2"
                    >
                      {viewMode === 'grid' ? <FiList className="w-4 h-4" /> : <FiGrid className="w-4 h-4" />}
                      <span>{viewMode === 'grid' ? 'List' : 'Grid'}</span>
                    </button>
                    
                    <button
                      onClick={exportData}
                      className="glass-input px-4 py-3 flex items-center space-x-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span>Export</span>
                    </button>

                    <button
                      onClick={() => {
                        fetchMenuItems();
                        fetchStats();
                        toast.success('Data refreshed!');
                      }}
                      className="glass-input px-4 py-3 flex items-center space-x-2"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>

                    <button
                      onClick={() => setShowAddForm(true)}
                      className="btn-glow flex items-center space-x-2 px-6 py-3 text-lg font-semibold shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <FiPlus className="w-5 h-5" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Menu Items Grid/List */}
              {filteredItems.length === 0 ? (
                <div className="premium-card p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiPackage className="w-10 h-10 text-white/50" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Menu Items Found</h3>
                  <p className="text-white/70 mb-6">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Get started by adding your first menu item'}
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-glow inline-flex items-center space-x-2 px-8 py-4 text-lg font-semibold shadow-xl hover:scale-105 transition-all duration-300 animate-pulse"
                  >
                    <FiPlus className="w-6 h-6" />
                    <span>Add Your First Item</span>
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="premium-card overflow-hidden group"
                    >
                      {/* Checkbox for bulk selection */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-4 h-4 rounded"
                        />
                      </div>

                      <div className="relative h-48 bg-gradient-to-br from-white/10 to-white/5">
                        {item.image && (
                          <img
                            src={item.image.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        )}
                        <div className="absolute top-2 right-2 flex space-x-2">
                          {item.is_featured && (
                            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                              Featured
                            </span>
                          )}
                          {item.is_available ? (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Available
                            </span>
                          ) : (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-2 truncate">{item.name}</h3>
                        <p className="text-white/70 text-sm mb-3 line-clamp-2">{item.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-bold text-neon-green">KSh {item.price}</span>
                          <div className="flex items-center space-x-2 text-white/60 text-sm">
                            <FiClock className="w-4 h-4" />
                            <span>{item.preparation_time}min</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < item.spice_level ? 'text-red-500' : 'text-white/20'}>
                                🌶️
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => toggleAvailability(item)}
                              className={`p-2 rounded-lg transition-all ${
                                item.is_available 
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                              title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                            >
                              {item.is_available ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => toggleFeatured(item)}
                              className={`p-2 rounded-lg transition-all ${
                                item.is_featured 
                                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' 
                                  : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                              }`}
                              title={item.is_featured ? 'Unmark featured' : 'Mark featured'}
                            >
                              <FiStar className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => duplicateItem(item)}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                              title="Duplicate item"
                            >
                              <FiCopy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                              title="Edit item"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                              title="Delete item"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="premium-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left p-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.length === filteredItems.length}
                              onChange={selectAllItems}
                              className="w-4 h-4 rounded"
                            />
                          </th>
                          <th className="text-left p-4 text-white/70">Image</th>
                          <th className="text-left p-4 text-white/70">Name</th>
                          <th className="text-left p-4 text-white/70">Category</th>
                          <th className="text-left p-4 text-white/70">Price</th>
                          <th className="text-left p-4 text-white/70">Status</th>
                          <th className="text-left p-4 text-white/70">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-white/5 hover:bg-white/5"
                          >
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleItemSelection(item.id)}
                                className="w-4 h-4 rounded"
                              />
                            </td>
                            <td className="p-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-lg overflow-hidden">
                                {item.image ? (
                                  <img
                                    src={item.image.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FiImage className="w-6 h-6 text-white/30" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <h4 className="text-white font-medium">{item.name}</h4>
                                <p className="text-white/50 text-sm truncate max-w-xs">{item.description}</p>
                              </div>
                            </td>
                            <td className="p-4 text-white/70">{item.category}</td>
                            <td className="p-4">
                              <span className="text-neon-green font-bold">KSh {item.price}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                {item.is_featured && (
                                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                                    Featured
                                  </span>
                                )}
                                {item.is_available ? (
                                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    Available
                                  </span>
                                ) : (
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    Unavailable
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => toggleAvailability(item)}
                                  className={`p-2 rounded-lg transition-all ${
                                    item.is_available 
                                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                  }`}
                                  title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                                >
                                  {item.is_available ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                                  title="Edit item"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                                  title="Delete item"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold text-white mb-2">Order Management</h2>
                <p className="text-white/70">Track and manage customer orders in real-time</p>
              </motion.div>
              <div className="space-y-6">
              <div className="premium-card p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <FiShoppingCart className="w-6 h-6 mr-3 text-neon-blue" />
                  Order Management & Delivery Tracking
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="premium-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Pending Orders</p>
                        <p className="text-2xl font-bold text-yellow-400">{stats.pendingOrders}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <FiClock className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="premium-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Completed Orders</p>
                        <p className="text-2xl font-bold text-green-400">{stats.completedOrders}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <FiCheck className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="premium-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Today's Orders</p>
                        <p className="text-2xl font-bold text-blue-400">{stats.todayOrders}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <FiShoppingCart className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="premium-card overflow-hidden">
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="premium-card p-8 text-center">
                        <FiPackage className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">No Orders Yet</h3>
                        <p className="text-white/60">Orders will appear here when customers place them</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="premium-card p-6"
                        >
                          {/* Order Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">#{order.id}</span>
                              </div>
                              <div>
                                <h3 className="text-white font-bold">{order.customer_name}</h3>
                                <div className="flex items-center space-x-2 text-white/60 text-sm">
                                  <FiPhone className="w-3 h-3" />
                                  <span>{order.customer_phone}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold text-xl">KSh {order.total_amount}</p>
                              <span className={`text-sm font-semibold ${getStatusColor(order.status)}`}>
                                {order.status.replace('-', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Modern Progress Tracker */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-semibold">Order Progress</h4>
                              <span className="text-white/60 text-sm">
                                {new Date(order.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getOrderStages(order.status).map((stage, index) => {
                                const Icon = stage.icon;
                                return (
                                  <div key={stage.key} className="flex items-center">
                                    <div className={`
                                      w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                      ${stage.completed ? 'bg-green-500' : stage.current ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}
                                    `}>
                                      <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    {index < getOrderStages(order.status).length - 1 && (
                                      <div className={`
                                        w-8 h-0.5 transition-all duration-300
                                        ${stage.completed ? 'bg-green-500' : 'bg-gray-600'}
                                      `}></div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              {getOrderStages(order.status).map((stage) => (
                                <span key={stage.key} className={`
                                  text-xs font-medium
                                  ${stage.completed ? 'text-green-400' : stage.current ? 'text-blue-400' : 'text-gray-500'}
                                `}>
                                  {stage.label}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Order Details & Actions */}
                          <div className="border-t border-white/10 pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-white/60 text-sm mb-1">Items:</p>
                                <p className="text-white text-sm">
                                  {order.items?.map(item => item.menu_item?.name).join(', ') || 'No items'}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-white/60 text-sm">
                                  <div className="flex items-center space-x-1">
                                    <FiMapPin className="w-3 h-3" />
                                    <span>{order.delivery_address}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Modern Action Buttons */}
                              <div className="flex items-center space-x-2">
                                {order.status === 'pending' && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2"
                                  >
                                    <FiPackage className="w-4 h-4" />
                                    <span>Start Preparing</span>
                                  </motion.button>
                                )}
                                {order.status === 'preparing' && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateOrderStatus(order.id, 'ready')}
                                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all flex items-center space-x-2"
                                  >
                                    <FiCheck className="w-4 h-4" />
                                    <span>Mark Ready</span>
                                  </motion.button>
                                )}
                                {order.status === 'ready' && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateOrderStatus(order.id, 'delivering')}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center space-x-2"
                                  >
                                    <FiTruck className="w-4 h-4" />
                                    <span>Start Delivery</span>
                                  </motion.button>
                                )}
                                {order.status === 'delivering' && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center space-x-2"
                                  >
                                    <FiCheck className="w-4 h-4" />
                                    <span>Mark Delivered</span>
                                  </motion.button>
                                )}
                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center space-x-2"
                                  >
                                    <FiX className="w-4 h-4" />
                                    <span>Cancel</span>
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            </>
          )}

          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-2">Statistics & Analytics</h2>
              <p className="text-white/70">Monitor your business performance and insights</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="premium-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <FiPackage className="w-6 h-6 mr-2 text-neon-blue" />
                    Menu Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Total Menu Items</span>
                      <span className="text-white font-bold text-lg">{menuItems?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Available Items</span>
                      <span className="text-green-400 font-bold text-lg">{menuItems?.filter(item => item.is_available).length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Featured Items</span>
                      <span className="text-purple-400 font-bold text-lg">{menuItems?.filter(item => item.is_featured).length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Categories</span>
                      <span className="text-orange-400 font-bold text-lg">{categories.length}</span>
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <FiShoppingCart className="w-6 h-6 mr-2 text-neon-blue" />
                    Order Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Today Orders</span>
                      <span className="text-blue-400 font-bold text-lg">{stats.todayOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Pending Orders</span>
                      <span className="text-yellow-400 font-bold text-lg">{stats.pendingOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Completed Orders</span>
                      <span className="text-green-400 font-bold text-lg">{stats.completedOrders}</span>
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <FiDollarSign className="w-6 h-6 mr-2" />
                    Financial Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Total Revenue</span>
                      <span className="text-neon-green font-bold text-lg">KSh {stats.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Avg Order Value</span>
                      <span className="text-white font-bold text-lg">KSh {Math.round(stats.totalRevenue / (stats.todayOrders || 1))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <FiShoppingCart className="w-6 h-6 mr-3 text-neon-blue" />
                  Order Management & Delivery Tracking
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="premium-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Pending Orders</p>
                        <p className="text-2xl font-bold text-yellow-400">{stats.pendingOrders}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <FiClock className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="premium-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Completed Orders</p>
                        <p className="text-2xl font-bold text-green-400">{stats.completedOrders}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <FiCheck className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="premium-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Today Orders</p>
                        <p className="text-2xl font-bold text-blue-400">{stats.todayOrders}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <FiShoppingCart className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="premium-card overflow-hidden">
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <FiShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
                        <p className="text-white/60">Orders will appear here when customers place them</p>
                      </div>
                    ) : (
                      orders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-white mb-1">Order #{order.id}</h3>
                              <p className="text-white/60 text-sm">
                                Customer: {order.customer_name || 'Guest'}
                              </p>
                              <p className="text-white/60 text-sm">
                                Phone: {order.customer_phone || 'N/A'}
                              </p>
                              <p className="text-white/60 text-sm">
                                Address: {order.delivery_address || 'N/A'}
                              </p>
                              <p className="text-white/60 text-sm">
                                Placed: {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-2xl font-bold ${getStatusColor(order.status)}`}>
                                {order.status.toUpperCase()}
                              </span>
                              <p className="text-white/60 text-sm mt-1">
                                Total: KSh {order.total_amount || order.total || 0}
                              </p>
                            </div>
                          </div>

                          {/* Order Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              {getOrderStages(order.status).map((stage, index) => (
                                <div key={stage.key} className="flex items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    stage.completed ? 'bg-green-500' : 
                                    stage.current ? 'bg-blue-500' : 'bg-gray-600'
                                  }`}>
                                    <stage.icon className="w-4 h-4 text-white" />
                                  </div>
                                  {index < getOrderStages(order.status).length - 1 && (
                                    <div className={`w-8 h-1 mx-2 ${
                                      stage.completed ? 'bg-green-500' : 'bg-gray-600'
                                    }`} />
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-white/60">
                              {getOrderStages(order.status).map((stage) => (
                                <span key={stage.key} className="text-center">
                                  {stage.label}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-4">
                            <h4 className="text-white font-medium mb-2">Order Items:</h4>
                            <div className="space-y-2">
                              {Array.isArray(order.items) ? order.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex justify-between text-white/80 text-sm">
                                  <span>{item.name} x {item.quantity}</span>
                                  <span>KSh {item.price * item.quantity}</span>
                                </div>
                              )) : (
                                <p className="text-white/60 text-sm">No items details available</p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                              >
                                <FiPackage className="w-4 h-4 mr-1 inline" />
                                Start Preparing
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                              >
                                <FiCheck className="w-4 h-4 mr-1 inline" />
                                Mark Ready
                              </button>
                            )}
                            {order.status === 'ready' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'delivering')}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
                              >
                                <FiTruck className="w-4 h-4 mr-1 inline" />
                                Start Delivery
                              </button>
                            )}
                            {order.status === 'delivering' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                              >
                                <FiCheck className="w-4 h-4 mr-1 inline" />
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Add Item Form Modal */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowAddForm(false);
                setEditingItem(null);
                resetForm();
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-card w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl border-2 border-neon-blue/30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        resetForm();
                      }}
                      className="text-white/60 hover:text-white"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="glass-input w-full px-4 py-3"
                          placeholder="Enter item name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="glass-input w-full px-4 py-3"
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Price (KSh) *
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="glass-input w-full px-4 py-3"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Preparation Time (minutes) *
                        </label>
                        <input
                          type="number"
                          value={formData.preparation_time}
                          onChange={(e) => setFormData({...formData, preparation_time: parseInt(e.target.value)})}
                          className="glass-input w-full px-4 py-3"
                          placeholder="15"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Spice Level
                        </label>
                        <select
                          value={formData.spice_level}
                          onChange={(e) => setFormData({...formData, spice_level: parseInt(e.target.value)})}
                          className="glass-input w-full px-4 py-3"
                        >
                          <option value={1}>Mild 🌶️</option>
                          <option value={2}>Medium 🌶️🌶️</option>
                          <option value={3}>Hot 🌶️🌶️🌶️</option>
                          <option value={4}>Very Hot 🌶️🌶️🌶️🌶️</option>
                          <option value={5}>Extra Hot 🌶️🌶️🌶️🌶️🌶️</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Image
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="glass-input w-full px-4 py-3"
                          />
                          {formData.image && (
                            <div className="mt-2 text-sm text-green-400 flex items-center">
                              <FiCheck className="w-4 h-4 mr-1" />
                              Image selected: {formData.image.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="glass-input w-full px-4 py-3 h-32 resize-none"
                        placeholder="Describe your menu item..."
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-6">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_available}
                          onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-white/70 font-medium">Available</span>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-white/70 font-medium">Featured item</span>
                      </label>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingItem(null);
                          resetForm();
                        }}
                        className="px-6 py-3 text-white/70 hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-glow px-8 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{editingItem ? 'Updating...' : 'Adding...'}</span>
                          </>
                        ) : (
                          <>
                            <FiPlus className="w-5 h-5" />
                            <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SecureAdminDashboard;
