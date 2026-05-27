import express from 'express';
import { User } from '../models/User.js';
import { Streak } from '../models/Streak.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;
    const user = await User.update(req.user.uid, { displayName, photoURL });
    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user settings
router.get('/settings', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ settings: user.settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update user settings
router.put('/settings', verifyToken, async (req, res) => {
  try {
    const { theme, notifications, focusDuration, breakDuration } = req.body;

    const user = await User.update(req.user.uid, {
      settings: { theme, notifications, focusDuration, breakDuration },
    });

    res.json({ settings: user.settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get all streaks
router.get('/streaks', verifyToken, async (req, res) => {
  try {
    const streaks = await Streak.getAll(req.user.uid);
    res.json({ streaks });
  } catch (error) {
    console.error('Get streaks error:', error);
    res.status(500).json({ error: 'Failed to get streaks' });
  }
});

// Get dashboard stats
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid);
    const streaks = await Streak.getAll(req.user.uid);

    const streakMap = {};
    streaks.forEach(s => {
      streakMap[s.type] = {
        current: s.currentStreak,
        longest: s.longestStreak,
        lastActivity: s.lastActivityDate,
      };
    });

    res.json({
      stats: user?.stats || {},
      streaks: streakMap,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
});

export default router;
