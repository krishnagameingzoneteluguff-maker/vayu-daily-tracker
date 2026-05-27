import express from 'express';
import { db } from '../config/firebase.js';
import { Streak } from '../models/Streak.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const fitnessCollection = db.collection('fitness_progress');

// Get fitness progress
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const doc = await fitnessCollection.doc(req.user.uid).get();

    if (!doc.exists) {
      const defaultProgress = {
        currentWeight: null,
        targetWeight: null,
        height: null,
        goals: {
          dailySteps: 10000,
          weeklyWorkouts: 5,
          dailyCalories: 2000,
          dailyWater: 8,
        },
        stats: {
          totalWorkouts: 0,
          totalMinutes: 0,
          currentWeekWorkouts: 0,
        },
        measurements: [],
      };

      await fitnessCollection.doc(req.user.uid).set(defaultProgress);
      return res.json({ progress: defaultProgress });
    }

    res.json({ progress: doc.data() });
  } catch (error) {
    console.error('Get fitness progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Update fitness goals
router.put('/goals', verifyToken, async (req, res) => {
  try {
    const { dailySteps, weeklyWorkouts, dailyCalories, dailyWater } = req.body;

    await fitnessCollection.doc(req.user.uid).update({
      goals: { dailySteps, weeklyWorkouts, dailyCalories, dailyWater },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update goals error:', error);
    res.status(500).json({ error: 'Failed to update goals' });
  }
});

// Log workout
router.post('/workouts', verifyToken, async (req, res) => {
  try {
    const { type, duration, exercises, calories, notes } = req.body;

    const workoutsCollection = db.collection('fitness_workouts');
    const workout = {
      userId: req.user.uid,
      type,
      duration,
      exercises: exercises || [],
      calories: calories || 0,
      notes: notes || '',
      date: new Date().toISOString(),
    };

    await workoutsCollection.add(workout);

    // Update stats
    const progressRef = fitnessCollection.doc(req.user.uid);
    const progressDoc = await progressRef.get();
    const progress = progressDoc.data();

    await progressRef.update({
      'stats.totalWorkouts': (progress.stats?.totalWorkouts || 0) + 1,
      'stats.totalMinutes': (progress.stats?.totalMinutes || 0) + duration,
    });

    await Streak.recordActivity(req.user.uid, 'fitness');

    res.status(201).json({ workout });
  } catch (error) {
    console.error('Log workout error:', error);
    res.status(500).json({ error: 'Failed to log workout' });
  }
});

// Get workout history
router.get('/workouts', verifyToken, async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 30 } = req.query;
    const workoutsCollection = db.collection('fitness_workouts');

    let query = workoutsCollection.where('userId', '==', req.user.uid);

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query
      .orderBy('date', 'desc')
      .limit(parseInt(limit))
      .get();

    const workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ workouts });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to get workouts' });
  }
});

// Log daily metrics (weight, water, steps, etc.)
router.post('/daily', verifyToken, async (req, res) => {
  try {
    const { weight, water, steps, calories, sleep } = req.body;
    const date = new Date().toISOString().split('T')[0];

    const dailyCollection = db.collection('fitness_daily');
    const docId = `${req.user.uid}_${date}`;

    await dailyCollection.doc(docId).set({
      userId: req.user.uid,
      date,
      weight: weight || null,
      water: water || 0,
      steps: steps || 0,
      calories: calories || 0,
      sleep: sleep || 0,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    if (weight) {
      await fitnessCollection.doc(req.user.uid).update({
        currentWeight: weight,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Log daily error:', error);
    res.status(500).json({ error: 'Failed to log daily metrics' });
  }
});

// Get daily metrics history
router.get('/daily', verifyToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dailyCollection = db.collection('fitness_daily');

    const snapshot = await dailyCollection
      .where('userId', '==', req.user.uid)
      .orderBy('date', 'desc')
      .limit(parseInt(days))
      .get();

    const daily = snapshot.docs.map(doc => doc.data());
    res.json({ daily });
  } catch (error) {
    console.error('Get daily error:', error);
    res.status(500).json({ error: 'Failed to get daily metrics' });
  }
});

export default router;
