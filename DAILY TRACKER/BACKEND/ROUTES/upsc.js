import express from 'express';
import { db } from '../config/firebase.js';
import { Streak } from '../models/Streak.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const upscCollection = db.collection('upsc_progress');

// Get UPSC progress
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const doc = await upscCollection.doc(req.user.uid).get();
    
    if (!doc.exists) {
      const defaultProgress = {
        subjects: {
          polity: { completed: 0, total: 100, notes: [] },
          history: { completed: 0, total: 100, notes: [] },
          geography: { completed: 0, total: 100, notes: [] },
          economy: { completed: 0, total: 100, notes: [] },
          science: { completed: 0, total: 100, notes: [] },
          environment: { completed: 0, total: 100, notes: [] },
          currentAffairs: { completed: 0, total: 100, notes: [] },
        },
        testsCompleted: 0,
        answersWritten: 0,
        revisionsDone: 0,
        dailyGoals: {
          studyHours: 8,
          answersToWrite: 3,
          currentAffairsPages: 10,
        },
      };
      
      await upscCollection.doc(req.user.uid).set(defaultProgress);
      return res.json({ progress: defaultProgress });
    }

    res.json({ progress: doc.data() });
  } catch (error) {
    console.error('Get UPSC progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Update subject progress
router.put('/subjects/:subject', verifyToken, async (req, res) => {
  try {
    const { subject } = req.params;
    const { completed, notes } = req.body;

    const updateData = {};
    if (completed !== undefined) {
      updateData[`subjects.${subject}.completed`] = completed;
    }
    if (notes) {
      updateData[`subjects.${subject}.notes`] = notes;
    }

    await upscCollection.doc(req.user.uid).update(updateData);
    await Streak.recordActivity(req.user.uid, 'upsc');

    const doc = await upscCollection.doc(req.user.uid).get();
    res.json({ progress: doc.data() });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Log study session
router.post('/sessions', verifyToken, async (req, res) => {
  try {
    const { subject, duration, type, notes } = req.body;

    const sessionsCollection = db.collection('upsc_sessions');
    const session = {
      userId: req.user.uid,
      subject,
      duration,
      type, // 'study', 'revision', 'test', 'answer_writing'
      notes: notes || '',
      date: new Date().toISOString(),
    };

    await sessionsCollection.add(session);
    await Streak.recordActivity(req.user.uid, 'upsc');

    // Update counters based on type
    const updateData = {};
    if (type === 'test') {
      updateData.testsCompleted = db.FieldValue?.increment(1) || 1;
    } else if (type === 'answer_writing') {
      updateData.answersWritten = db.FieldValue?.increment(1) || 1;
    } else if (type === 'revision') {
      updateData.revisionsDone = db.FieldValue?.increment(1) || 1;
    }

    if (Object.keys(updateData).length > 0) {
      await upscCollection.doc(req.user.uid).update(updateData);
    }

    res.status(201).json({ session });
  } catch (error) {
    console.error('Log session error:', error);
    res.status(500).json({ error: 'Failed to log session' });
  }
});

// Get study sessions
router.get('/sessions', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, subject } = req.query;
    const sessionsCollection = db.collection('upsc_sessions');
    
    let query = sessionsCollection.where('userId', '==', req.user.uid);
    
    if (subject) {
      query = query.where('subject', '==', subject);
    }

    const snapshot = await query.orderBy('date', 'desc').limit(100).get();
    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

export default router;
