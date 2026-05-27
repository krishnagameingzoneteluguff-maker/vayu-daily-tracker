import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Flame,
  Target,
  TrendingUp,
  BookOpen,
  Code2,
  Dumbbell,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
import { taskService } from '../services/taskService';
import { userService } from '../services/trackerService';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tasksRes, dashboardRes] = await Promise.all([
        taskService.getTodayTasks(),
        userService.getDashboard(),
      ]);

      setTasks(tasksRes.tasks || []);
      setStats(dashboardRes.stats || {});
      setStreaks(dashboardRes.streaks || {});
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const quickLinks = [
    { path: '/upsc', label: 'UPSC', icon: BookOpen, color: 'from-orange-500 to-orange-700' },
    { path: '/coding', label: 'Coding', icon: Code2, color: 'from-green-500 to-green-700' },
    { path: '/fitness', label: 'Fitness', icon: Dumbbell, color: 'from-purple-500 to-purple-700' },
    { path: '/focus', label: 'Focus', icon: Clock, color: 'from-blue-500 to-blue-700' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Tasks"
          value={`${completedTasks}/${tasks.length}`}
          subtitle="tasks completed"
          icon={CheckCircle2}
          color="primary"
        />
        <StatCard
          title="Focus Time"
          value={`${stats?.totalFocusTime || 0}m`}
          subtitle="today"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Current Streak"
          value={streaks?.tasks?.current || 0}
          subtitle="days"
          icon={Flame}
          color="orange"
        />
        <StatCard
          title="Weekly Progress"
          value={`${Math.round(taskProgress)}%`}
          subtitle="on track"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Today's Progress</h2>
          <div className="flex justify-center mb-6">
            <ProgressRing progress={taskProgress} size={160} strokeWidth={12}>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{Math.round(taskProgress)}%</p>
                <p className="text-dark-400 text-sm">Complete</p>
              </div>
            </ProgressRing>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' : 'bg-dark-500'
                  }`}
                />
                <span
                  className={`flex-1 text-sm ${
                    task.status === 'completed'
                      ? 'text-dark-400 line-through'
                      : 'text-white'
                  }`}
                >
                  {task.title}
                </span>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-dark-400 py-4">No tasks for today</p>
            )}
          </div>
          <Link
            to="/planner"
            className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium"
          >
            View All Tasks
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Active Streaks</h2>
          <div className="space-y-4">
            {Object.entries(streaks).map(([type, data]) => (
              <div
                key={type}
                className="p-4 bg-dark-800/50 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">{type}</p>
                    <p className="text-dark-400 text-sm">
                      Best: {data.longest} days
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-400">
                    {data.current}
                  </p>
                  <p className="text-dark-500 text-xs">days</p>
                </div>
              </div>
            ))}
            {Object.keys(streaks).length === 0 && (
              <div className="text-center py-8">
                <Flame className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">Start tracking to build streaks!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Quick Access</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="p-4 bg-dark-800/50 rounded-xl hover:bg-dark-700/50 transition-colors group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium">{link.label}</p>
              </Link>
            ))}
          </div>

          {/* Daily Goals Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl border border-primary-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary-400" />
              <h3 className="font-medium text-white">Daily Goals</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Focus</span>
                <span className="text-white">2h / 4h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Problems</span>
                <span className="text-white">1 / 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Reading</span>
                <span className="text-white">30m / 1h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Exercise</span>
                <span className="text-white">0 / 30m</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
