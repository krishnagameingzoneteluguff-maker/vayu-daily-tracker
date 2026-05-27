import express from 'express';
import { db } from '../config/firebase.js';
import { Streak } from '../models/Streak.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const focusCollection = db.collection('focus_sessions');

// Start focus session
router.post('/start', verifyToken, async (req, res) => {
  try {
    const { duration, taskId, type = 'pomodoro' } = req.body;

    const session = {
      userId: req.user.uid,
      taskId: taskId || null,
      type,
      plannedDuration: duration,
      actualDuration: 0,
      status: 'active',
      startedAt: new Date().toISOString(),
      endedAt: null,
      interrupted: false,
    };

    const docRef = await focusCollection.add(session);
    res.status(201).json({ session: { id: docRef.id, ...session } });
  } catch (error) {
    console.error('Start focus error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// End focus session
router.put('/:id/end', verifyToken, async (req, res) => {
  try {
    const { actualDuration, completed, interrupted } = req.body;

    const sessionRef = focusCollection.doc(req.params.id);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists || sessionDoc.data().userId !== req.user.uid) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updates = {
      actualDuration,
      status: completed ? 'completed' : 'ended',
      interrupted: interrupted || false,
      endedAt: new Date().toISOString(),
    };

    await sessionRef.update(updates);

    if (completed) {
      await Streak.recordActivity(req.user.uid, 'focus');
    }

    res.json({ session: { id: req.params.id, ...sessionDoc.data(), ...updates } });
  } catch (error) {
    console.error('End focus error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Get focus history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;

    let query = focusCollection
      .where('userId', '==', req.user.uid)
      .where('status', 'in', ['completed', 'ended']);

    const snapshot = await query
      .orderBy('startedAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ sessions });
  } catch (error) {
    console.error('Get focus history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Get focus stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const snapshot = await focusCollection
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'completed')
      .where('startedAt', '>=', startDate.toISOString())
      .get();

    const sessions = snapshot.docs.map(doc => doc.data());

    const stats = {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
      averageSession: sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0) / sessions.length)
        : 0,
      byDay: {},
    };

    // Group by day
    sessions.forEach(session => {
      const day = session.startedAt.split('T')[0];
      if (!stats.byDay[day]) {
        stats.byDay[day] = { sessions: 0, minutes: 0 };
      }
      stats.byDay[day].sessions += 1;
      stats.byDay[day].minutes += session.actualDuration || 0;
    });

    res.json({ stats });
  } catch (error) {
    console.error('Get focus stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
