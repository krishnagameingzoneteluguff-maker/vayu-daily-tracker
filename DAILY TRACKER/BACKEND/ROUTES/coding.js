import express from 'express';
import { db } from '../config/firebase.js';
import { Streak } from '../models/Streak.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const codingCollection = db.collection('coding_progress');

// Get coding progress
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const doc = await codingCollection.doc(req.user.uid).get();

    if (!doc.exists) {
      const defaultProgress = {
        problemsSolved: {
          easy: 0,
          medium: 0,
          hard: 0,
        },
        totalProblems: 0,
        platforms: {
          leetcode: { solved: 0, username: '' },
          codeforces: { solved: 0, username: '' },
          hackerrank: { solved: 0, username: '' },
        },
        topics: {
          arrays: { solved: 0, total: 50 },
          strings: { solved: 0, total: 40 },
          linkedLists: { solved: 0, total: 30 },
          trees: { solved: 0, total: 40 },
          graphs: { solved: 0, total: 35 },
          dp: { solved: 0, total: 50 },
          sorting: { solved: 0, total: 20 },
          searching: { solved: 0, total: 20 },
          backtracking: { solved: 0, total: 25 },
          greedy: { solved: 0, total: 25 },
        },
        contestsParticipated: 0,
        dailyGoal: 3,
      };

      await codingCollection.doc(req.user.uid).set(defaultProgress);
      return res.json({ progress: defaultProgress });
    }

    res.json({ progress: doc.data() });
  } catch (error) {
    console.error('Get coding progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Log solved problem
router.post('/problems', verifyToken, async (req, res) => {
  try {
    const { name, difficulty, topic, platform, link, notes, timeSpent } = req.body;

    const problemsCollection = db.collection('coding_problems');
    const problem = {
      userId: req.user.uid,
      name,
      difficulty,
      topic,
      platform,
      link: link || '',
      notes: notes || '',
      timeSpent: timeSpent || 0,
      solvedAt: new Date().toISOString(),
    };

    await problemsCollection.add(problem);

    // Update progress
    const progressRef = codingCollection.doc(req.user.uid);
    const progressDoc = await progressRef.get();
    const progress = progressDoc.data();

    const updates = {
      totalProblems: (progress.totalProblems || 0) + 1,
      [`problemsSolved.${difficulty}`]: (progress.problemsSolved?.[difficulty] || 0) + 1,
      [`topics.${topic}.solved`]: (progress.topics?.[topic]?.solved || 0) + 1,
      [`platforms.${platform}.solved`]: (progress.platforms?.[platform]?.solved || 0) + 1,
    };

    await progressRef.update(updates);
    await Streak.recordActivity(req.user.uid, 'coding');

    res.status(201).json({ problem, progress: { ...progress, ...updates } });
  } catch (error) {
    console.error('Log problem error:', error);
    res.status(500).json({ error: 'Failed to log problem' });
  }
});

// Get problem history
router.get('/problems', verifyToken, async (req, res) => {
  try {
    const { topic, difficulty, platform, limit = 50 } = req.query;
    const problemsCollection = db.collection('coding_problems');

    let query = problemsCollection.where('userId', '==', req.user.uid);

    if (topic) query = query.where('topic', '==', topic);
    if (difficulty) query = query.where('difficulty', '==', difficulty);
    if (platform) query = query.where('platform', '==', platform);

    const snapshot = await query
      .orderBy('solvedAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const problems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ problems });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Failed to get problems' });
  }
});

// Update platform username
router.put('/platforms/:platform', verifyToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const { username } = req.body;

    await codingCollection.doc(req.user.uid).update({
      [`platforms.${platform}.username`]: username,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update platform error:', error);
    res.status(500).json({ error: 'Failed to update platform' });
  }
});

export default router;
