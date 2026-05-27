import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Camera, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { userService } from '../services/trackerService';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, userData, refreshUserData } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: '',
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || user?.displayName || '',
        photoURL: userData.photoURL || user?.photoURL || '',
      });
    }
  }, [userData, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.updateProfile(formData);
      await refreshUserData();
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-dark-400 mt-1">Manage your account settings</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center overflow-hidden">
              {formData.photoURL ? (
                <img
                  src={formData.photoURL}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {(formData.displayName || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-white font-semibold mt-4">{formData.displayName || 'User'}</p>
          <p className="text-dark-400 text-sm">{user?.email}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-dark-400 text-sm mb-2">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-dark-400 text-sm mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-dark-400 cursor-not-allowed"
              />
            </div>
            <p className="text-dark-500 text-xs mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-dark-400 text-sm mb-2">Photo URL</label>
            <input
              type="url"
              value={formData.photoURL}
              onChange={(e) =>
                setFormData({ ...formData, photoURL: e.target.value })
              }
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="[example.com](https://example.com/photo.jpg)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Account Info</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-dark-700">
            <span className="text-dark-400">Account Created</span>
            <span className="text-white">
              {userData?.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-dark-700">
            <span className="text-dark-400">Total Tasks Completed</span>
            <span className="text-white">{userData?.stats?.totalTasksCompleted || 0}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-dark-400">Total Focus Time</span>
            <span className="text-white">{userData?.stats?.totalFocusTime || 0} minutes</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
