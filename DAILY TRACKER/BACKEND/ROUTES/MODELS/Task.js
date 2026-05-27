import { db } from '../config/firebase.js';

const tasksCollection = db.collection('tasks');

export const Task = {
  async create(userId, taskData) {
    const task = {
      userId,
      title: taskData.title,
      description: taskData.description || '',
      category: taskData.category || 'general',
      priority: taskData.priority || 'medium',
      status: 'pending',
      dueDate: taskData.dueDate || null,
      scheduledDate: taskData.scheduledDate || new Date().toISOString().split('T')[0],
      estimatedTime: taskData.estimatedTime || 30,
      actualTime: 0,
      tags: taskData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };

    const docRef = await tasksCollection.add(task);
    return { id: docRef.id, ...task };
  },

  async findByUser(userId, filters = {}) {
    let query = tasksCollection.where('userId', '==', userId);

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters.scheduledDate) {
      query = query.where('scheduledDate', '==', filters.scheduledDate);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async findById(taskId) {
    const doc = await tasksCollection.doc(taskId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async update(taskId, updates) {
    updates.updatedAt = new Date().toISOString();
    
    if (updates.status === 'completed' && !updates.completedAt) {
      updates.completedAt = new Date().toISOString();
    }

    await tasksCollection.doc(taskId).update(updates);
    return this.findById(taskId);
  },

  async delete(taskId) {
    await tasksCollection.doc(taskId).delete();
    return { success: true };
  },

  async getStats(userId, startDate, endDate) {
    const snapshot = await tasksCollection
      .where('userId', '==', userId)
      .where('scheduledDate', '>=', startDate)
      .where('scheduledDate', '<=', endDate)
      .get();

    const tasks = snapshot.docs.map(doc => doc.data());
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      byCategory: tasks.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {}),
    };
  },
};
