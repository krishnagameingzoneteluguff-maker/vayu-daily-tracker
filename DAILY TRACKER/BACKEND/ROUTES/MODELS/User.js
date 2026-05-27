import { db } from '../config/firebase.js';

const usersCollection = db.collection('users');

export const User = {
  async create(uid, userData) {
    const user = {
      uid,
      email: userData.email,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        theme: 'dark',
        notifications: true,
        focusDuration: 25,
        breakDuration: 5,
      },
      stats: {
        totalFocusTime: 0,
        totalTasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    };

    await usersCollection.doc(uid).set(user);
    return user;
  },

  async findById(uid) {
    const doc = await usersCollection.doc(uid).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async update(uid, updates) {
    updates.updatedAt = new Date().toISOString();
    await usersCollection.doc(uid).update(updates);
    return this.findById(uid);
  },

  async updateStats(uid, stats) {
    const userRef = usersCollection.doc(uid);
    await userRef.update({
      stats,
      updatedAt: new Date().toISOString(),
    });
  },
};
