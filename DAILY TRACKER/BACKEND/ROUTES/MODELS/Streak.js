import { db } from '../config/firebase.js';

const streaksCollection = db.collection('streaks');

export const Streak = {
  async getOrCreate(userId, type) {
    const docId = `${userId}_${type}`;
    const doc = await streaksCollection.doc(docId).get();

    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }

    const streak = {
      userId,
      type,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      history: [],
      createdAt: new Date().toISOString(),
    };

    await streaksCollection.doc(docId).set(streak);
    return { id: docId, ...streak };
  },

  async recordActivity(userId, type, date = new Date().toISOString().split('T')[0]) {
    const docId = `${userId}_${type}`;
    const streak = await this.getOrCreate(userId, type);

    const lastDate = streak.lastActivityDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = streak.currentStreak;

    if (lastDate === date) {
      // Already recorded today
      return streak;
    } else if (lastDate === yesterdayStr) {
      // Consecutive day
      newStreak += 1;
    } else if (!lastDate || lastDate < yesterdayStr) {
      // Streak broken, start fresh
      newStreak = 1;
    }

    const updates = {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActivityDate: date,
      history: [...streak.history.slice(-365), { date, streak: newStreak }],
    };

    await streaksCollection.doc(docId).update(updates);
    return { id: docId, ...streak, ...updates };
  },

  async getAll(userId) {
    const snapshot = await streaksCollection
      .where('userId', '==', userId)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};
