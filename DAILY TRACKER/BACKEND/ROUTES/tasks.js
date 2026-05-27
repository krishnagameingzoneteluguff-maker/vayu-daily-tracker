import express from 'express';
import { Task } from '../models/Task.js';
import { Streak } from '../models/Streak.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all tasks for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, category, date } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (category) filters.category = category;
    if (date) filters.scheduledDate = date;

    const tasks = await Task.findByUser(req.user.uid, filters);
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// Get today's tasks
router.get('/today', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await Task.findByUser(req.user.uid, { scheduledDate: today });
    res.json({ tasks });
  } catch (error) {
    console.error('Get today tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// Create task
router.post('/', verifyToken, async (req, res) => {
  try {
    const task = await Task.create(req.user.uid, req.body);
    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.userId !== req.user.uid) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await Task.update(req.params.id, req.body);

    // Update streak if task completed
    if (req.body.status === 'completed' && task.status !== 'completed') {
      await Streak.recordActivity(req.user.uid, 'tasks');
    }

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.userId !== req.user.uid) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get task stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const stats = await Task.getStats(req.user.uid, start, end);
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
