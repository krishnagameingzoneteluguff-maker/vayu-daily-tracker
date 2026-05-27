import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Bell,
  BellOff,
  Clock,
  Coffee,
  Save,
  RotateCcw,
} from 'lucide-react';
import { userService } from '../services/trackerService';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { refreshUserData } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    focusDuration: 25,
    breakDuration: 5,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await userService.getSettings();
      if (response.settings) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateSettings(settings);
      await refreshUserData();
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setSettings({
      theme: 'dark',
      notifications: true,
      focusDuration: 25,
      breakDuration: 5,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 mt-1">Customize your experience</p>
      </div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.theme === 'dark' ? (
              <Moon className="w-5 h-5 text-primary-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
            <div>
              <p className="text-white font-medium">Theme</p>
              <p className="text-dark-400 text-sm">Choose your preferred theme</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSettings({ ...settings, theme: 'light' })}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                settings.theme === 'light'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-dark-400'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setSettings({ ...settings, theme: 'dark' })}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-dark-400'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.notifications ? (
              <Bell className="w-5 h-5 text-green-400" />
            ) : (
              <BellOff className="w-5 h-5 text-dark-400" />
            )}
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-dark-400 text-sm">Get notified about your tasks and focus sessions</p>
            </div>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, notifications: !settings.notifications })
            }
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.notifications ? 'bg-green-500' : 'bg-dark-600'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.notifications ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Focus Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Focus Mode</h2>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-white font-medium">Focus Duration</p>
                <p className="text-dark-400 text-sm">Default focus session length</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={settings.focusDuration}
                onChange={(e) =>
                  setSettings({ ...settings, focusDuration: parseInt(e.target.value) })
                }
                className="flex-1 accent-primary-500"
              />
              <span className="text-white font-medium w-20 text-right">
                {settings.focusDuration} min
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <Coffee className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Break Duration</p>
                <p className="text-dark-400 text-sm">Default break length</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={settings.breakDuration}
                onChange={(e) =>
                  setSettings({ ...settings, breakDuration: parseInt(e.target.value) })
                }
                className="flex-1 accent-green-500"
              />
              <span className="text-white font-medium w-20 text-right">
                {settings.breakDuration} min
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4"
      >
        <button
          onClick={resetDefaults}
          className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.div>
    </div>
  );
}
