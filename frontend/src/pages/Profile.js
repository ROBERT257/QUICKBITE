import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CameraIcon,
  MailIcon,
  PhoneIcon,
  LocationMarkerIcon,
  CalendarIcon
} from '@heroicons/react/outline';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gradient">My Profile</h1>
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
    </div>
  );
};

export default Profile;
