import { api } from './authService';

export const upscService = {
  async getProgress() {
    const response = await api.get('/upsc/progress');
    return response.data;
  },

  async updateSubject(subject, data) {
    const response = await api.put(`/upsc/subjects/${subject}`, data);
    return response.data;
  },

  async logSession(sessionData) {
    const response = await api.post('/upsc/sessions', sessionData);
    return response.data;
  },

  async getSessions(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/upsc/sessions?${params}`);
    return response.data;
  },
};

export const codingService = {
  async getProgress() {
    const response = await api.get('/coding/progress');
    return response.data;
  },

  async logProblem(problemData) {
    const response = await api.post('/coding/problems', problemData);
    return response.data;
  },

  async getProblems(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/coding/problems?${params}`);
    return response.data;
  },

  async updatePlatform(platform, data) {
    const response = await api.put(`/coding/platforms/${platform}`, data);
    return response.data;
  },
};

export const fitnessService = {
  async getProgress() {
    const response = await api.get('/fitness/progress');
    return response.data;
  },

  async updateGoals(goals) {
    const response = await api.put('/fitness/goals', goals);
    return response.data;
  },

  async logWorkout(workoutData) {
    const response = await api.post('/fitness/workouts', workoutData);
    return response.data;
  },

  async getWorkouts(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/fitness/workouts?${params}`);
    return response.data;
  },

  async logDaily(data) {
    const response = await api.post('/fitness/daily', data);
    return response.data;
  },

  async getDailyHistory(days = 30) {
    const response = await api.get(`/fitness/daily?days=${days}`);
    return response.data;
  },
};

export const focusService = {
  async startSession(data) {
    const response = await api.post('/focus/start', data);
    return response.data;
  },

  async endSession(sessionId, data) {
    const response = await api.put(`/focus/${sessionId}/end`, data);
    return response.data;
  },

  async getHistory(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/focus/history?${params}`);
    return response.data;
  },

  async getStats(days = 7) {
    const response = await api.get(`/focus/stats?days=${days}`);
    return response.data;
  },
};

export const userService = {
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  async getSettings() {
    const response = await api.get('/user/settings');
    return response.data;
  },

  async updateSettings(settings) {
    const response = await api.put('/user/settings', settings);
    return response.data;
  },

  async getStreaks() {
    const response = await api.get('/user/streaks');
    return response.data;
  },

  async getDashboard() {
    const response = await api.get('/user/dashboard');
    return response.data;
  },
};
