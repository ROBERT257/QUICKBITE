import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiUpload, FiImage, FiDollarSign, FiClock, FiStar, FiCheck, FiX, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminFoodManager = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/menu/');
      const data = await response.json();
      setMenuItems(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch menu items');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories/');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      
      // Create preview for selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [imagePreview, setImagePreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      } else if (key !== 'image') {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const url = editingItem 
        ? `http://localhost:8000/api/menu/${editingItem.id}/`
        : 'http://localhost:8000/api/menu/';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend,
        headers: {
          // Don't set Content-Type for FormData
        }
      });

      if (response.ok) {
        toast.success(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
        fetchMenuItems();
        setShowAddForm(false);
        setEditingItem(null);
        resetForm();
      } else {
        toast.error('Failed to save item');
      }
    } catch (error) {
      toast.error('Error saving item');
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/menu/${itemId}/`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          toast.success('Item deleted successfully!');
          fetchMenuItems();
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
      const response = await fetch(`http://localhost:8000/api/menu/${item.id}/`, {
        method: 'PUT',
        headers: {
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
      }
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      spice_level: item.spice_level === 'mild' ? 1 : 
                item.spice_level === 'medium' ? 2 : 
                item.spice_level === 'hot' ? 3 : 
                item.spice_level === 'extra_hot' ? 4 : 1,
      preparation_time: item.preparation_time,
      is_available: item.is_available,
      is_featured: item.is_featured,
      image: null
    });
    setImagePreview(item.image || null);
    setShowAddForm(true);
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
    setImagePreview(null);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: menuItems.length,
    available: menuItems.filter(item => item.is_available).length,
    featured: menuItems.filter(item => item.is_featured).length,
    categories: categories.length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-skeleton w-full max-w-4xl h-96 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">Food Management</h1>
          <p className="text-white/70">Manage your menu items, categories, and pricing</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="premium-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Items</p>
                <p className="text-3xl font-bold text-gradient">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Available</p>
                <p className="text-3xl font-bold text-green-400">{stats.available}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <FiCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="premium-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Featured</p>
                <p className="text-3xl font-bold text-purple-400">{stats.featured}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FiStar className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="premium-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Categories</p>
                <p className="text-3xl font-bold text-orange-400">{stats.categories}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <FiFilter className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="premium-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
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

            <button
              onClick={() => setShowAddForm(true)}
              className="btn-glow flex items-center space-x-2 px-6 py-3"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="premium-card overflow-hidden"
            >
              <div className="relative h-48 bg-gradient-to-br from-white/10 to-white/5">
                {item.image && (
                  <img
                    src={item.image.startsWith('http') ? item.image : `http://localhost:8000${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
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
                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                <p className="text-white/70 text-sm mb-3 truncate">{item.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-neon-green">KSh {item.price}</span>
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
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleAvailability(item)}
                      className={`p-2 rounded-lg transition-all ${
                        item.is_available 
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {item.is_available ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 mb-2">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="glass-input w-full px-4 py-3"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="glass-input w-full px-4 py-3"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="glass-input w-full px-4 py-3"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/70 mb-2">Price (KSh)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="glass-input w-full px-4 py-3"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-2">Prep Time (min)</label>
                      <input
                        type="number"
                        value={formData.preparation_time}
                        onChange={(e) => setFormData({...formData, preparation_time: e.target.value})}
                        className="glass-input w-full px-4 py-3"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-2">Spice Level</label>
                      <select
                        value={formData.spice_level}
                        onChange={(e) => setFormData({...formData, spice_level: parseInt(e.target.value)})}
                        className="glass-input w-full px-4 py-3"
                      >
                        <option value={1}>Mild</option>
                        <option value={2}>Medium</option>
                        <option value={3}>Hot</option>
                        <option value={4}>Very Hot</option>
                        <option value={5}>Extra Hot</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 mb-2">Image</label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="glass-input w-full px-4 py-3"
                        />
                        
                        {/* Image Preview */}
                        {(imagePreview || (editingItem && editingItem.image)) && (
                          <div className="relative">
                            <img 
                              src={imagePreview || editingItem.image} 
                              alt="Preview" 
                              className="w-full h-48 object-cover rounded-lg border-2 border-white/20"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setFormData({...formData, image: null});
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.is_available}
                          onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-white/70">Available</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-white/70">Featured</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
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
                      className="btn-glow px-6 py-3"
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFoodManager;
