import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CameraIcon,
  MailIcon,
  PhoneIcon,
  LocationMarkerIcon,
  CalendarIcon,
  ShoppingBagIcon,
  ClockIcon,
  CreditCardIcon,
  StarIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/outline';
import { useAuth } from '../hooks/useAuth';
import { authAPI, ordersAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import UniformLayout from '../components/UniformLayout';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    date_of_birth: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user orders
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

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: '',
        date_of_birth: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      
      // Add profile fields
      Object.keys(profileData).forEach(key => {
        if (profileData[key]) {
          formData.append(key, profileData[key]);
        }
      });

      // Add avatar if selected
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const response = await authAPI.updateProfile(formData);
      
      // Update user context
      updateUser({
        ...user,
        ...profileData
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UniformLayout title="User Dashboard" showSidebar={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Welcome back, {user?.first_name || 'User'}! 👋
          </h1>
          <p className="text-white/70">Manage your profile, orders, and preferences</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: ShoppingBagIcon,
              label: 'Order Food',
              description: 'Browse menu',
              link: '/menu',
              color: 'from-orange-500 to-red-500'
            },
            {
              icon: ClockIcon,
              label: 'My Orders',
              description: 'View history',
              link: '/orders',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              icon: CreditCardIcon,
              label: 'Payment',
              description: 'Manage cards',
              link: '#payment',
              color: 'from-green-500 to-emerald-500'
            },
            {
              icon: CogIcon,
              label: 'Settings',
              description: 'Preferences',
              link: '#settings',
              color: 'from-purple-500 to-pink-500'
            }
          ].map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass-card p-6 cursor-pointer hover:scale-105 transition-all duration-300"
            >
              <Link to={action.link} className="block">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">{action.label}</h3>
                <p className="text-white/60 text-sm">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-white">{userOrders.length}</p>
              </div>
              <ShoppingBagIcon className="w-8 h-8 text-orange-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Member Since</p>
                <p className="text-xl font-bold text-white">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent'}
                </p>
              </div>
              <CalendarIcon className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Account Status</p>
                <p className="text-xl font-bold text-green-400">Active</p>
              </div>
              <StarIcon className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
            <Link to="/orders" className="text-orange-400 hover:text-orange-300 flex items-center">
              View All <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
            </div>
          ) : userOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBagIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No orders yet</p>
              <Link to="/menu" className="btn-glow mt-4 inline-block">
                Order Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 glass-morphism rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <ShoppingBagIcon className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Order #{order.id}</p>
                      <p className="text-white/60 text-sm">
                        {new Date(order.created_at).toLocaleDateString()} • {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">KSh {order.total || 0}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Profile Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-glow px-6 py-2"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <div className="md:col-span-1">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 glass-morphism p-1">
                    <img 
                      src={
                        avatar 
                          ? URL.createObjectURL(avatar)
                          : user?.profile?.avatar 
                            ? user.profile.avatar 
                            : `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=4facfe&color=fff&size=128`
                      }
                      alt="Profile Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-neon-blue text-black p-2 rounded-full cursor-pointer hover:bg-neon-purple transition-colors">
                      <CameraIcon className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-white mt-4">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-white/60">@{user?.username}</p>
                <div className="mt-2 inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10">
                  <span className="text-sm text-white/80 capitalize">{user?.role}</span>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="md:col-span-2">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 mb-2 text-sm">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleChange}
                        className="glass-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2 text-sm">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleChange}
                        className="glass-input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="glass-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className="glass-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Address</label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      className="glass-input w-full h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Bio</label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      className="glass-input w-full h-24 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={profileData.date_of_birth}
                      onChange={handleChange}
                      className="glass-input w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-glow px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Full Name</p>
                        <p className="text-white">{user?.first_name} {user?.last_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MailIcon className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Email</p>
                        <p className="text-white">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Phone</p>
                        <p className="text-white">{user?.phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <LocationMarkerIcon className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Address</p>
                        <p className="text-white">{user?.address || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Member Since</p>
                        <p className="text-white">
                          {new Date(user?.date_joined).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {user?.profile?.bio && (
                    <div>
                      <p className="text-sm text-white/60 mb-2">Bio</p>
                      <p className="text-white">{user.profile.bio}</p>
                    </div>
                  )}

                  {user?.profile?.date_of_birth && (
                    <div>
                      <p className="text-sm text-white/60 mb-2">Date of Birth</p>
                      <p className="text-white">
                        {new Date(user.profile.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </UniformLayout>
  );
};

export default Profile;
