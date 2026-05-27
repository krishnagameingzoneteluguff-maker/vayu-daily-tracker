import express from 'express';
import { User } from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register/sync user after Firebase auth
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { displayName, photoURL } = req.body;

    let user = await User.findById(uid);

    if (!user) {
      user = await User.create(uid, { email, displayName, photoURL });
    }

    res.json({ user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
