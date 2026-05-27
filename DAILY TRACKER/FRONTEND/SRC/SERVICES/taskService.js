import { api } from './authService';

export const taskService = {
  async getTasks(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/tasks?${params}`);
    return response.data;
  },

  async getTodayTasks() {
    const response = await api.get('/tasks/today');
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(taskId, updates) {
    const response = await api.put(`/tasks/${taskId}`, updates);
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  async getStats(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await api.get(`/tasks/stats?${params}`);
    return response.data;
  },
};
