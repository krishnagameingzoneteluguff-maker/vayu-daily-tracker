import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Check,
  Trash2,
  Calendar,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { taskService } from '../services/taskService';
import toast from 'react-hot-toast';

const priorities = {
  low: { label: 'Low', color: 'bg-green-500', textColor: 'text-green-400' },
  medium: { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  high: { label: 'High', color: 'bg-red-500', textColor: 'text-red-400' },
};

const categories = [
  { value: 'general', label: 'General' },
  { value: 'upsc', label: 'UPSC' },
  { value: 'coding', label: 'Coding' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'personal', label: 'Personal' },
];

export default function DailyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    estimatedTime: 30,
  });

  const dateStr = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    loadTasks();
  }, [dateStr]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks({ date: dateStr });
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, formData);
        toast.success('Task updated');
      } else {
        await taskService.createTask({ ...formData, scheduledDate: dateStr });
        toast.success('Task created');
      }
      setShowModal(false);
      resetForm();
      loadTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await taskService.updateTask(task.id, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      toast.success('Task deleted');
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      estimatedTime: 30,
    });
    setEditingTask(null);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      estimatedTime: task.estimatedTime,
    });
    setShowModal(true);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Planner</h1>
          <p className="text-dark-400 mt-1">
            {completedCount} of {tasks.length} tasks completed
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Date Navigation */}
      <div className="glass-card p-4 flex items-center justify-between">
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-dark-400" />
        </button>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary-400" />
          <span className="text-white font-medium">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {dateStr === new Date().toISOString().split('T')[0] && (
            <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">
              Today
            </span>
          )}
        </div>
        <button
          onClick={() => navigateDate(1)}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-dark-400" />
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <Calendar className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
            <p className="text-dark-400 mb-6">Add tasks to plan your day</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
            >
              Add Your First Task
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-card p-4 flex items-center gap-4 group ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTaskStatus(task)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500'
                      : 'border-dark-500 hover:border-green-500'
                  }`}
                >
                  {task.status === 'completed' && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Content */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => openEditModal(task)}
                >
                  <h3
                    className={`font-medium ${
                      task.status === 'completed'
                        ? 'text-dark-400 line-through'
                        : 'text-white'
                    }`}
                  >
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-dark-500 text-sm capitalize">
                      {task.category}
                    </span>
                    <span className="flex items-center gap-1 text-dark-500 text-sm">
                      <Clock className="w-3 h-3" />
                      {task.estimatedTime}m
                    </span>
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${priorities[task.priority].textColor} bg-dark-700`}
                  >
                    {priorities[task.priority].label}
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-dark-400 text-sm mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Task title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-dark-400 text-sm mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={3}
                    placeholder="Add details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark-400 text-sm mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-dark-400 text-sm mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Object.entries(priorities).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-dark-400 text-sm mb-2">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedTime: parseInt(e.target.value) || 30,
                      })
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min={5}
                    step={5}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
                  >
                    {editingTask ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
