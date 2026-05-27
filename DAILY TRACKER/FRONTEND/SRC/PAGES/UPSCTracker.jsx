import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Clock,
  Award,
  Plus,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import { upscService } from '../services/trackerService';
import toast from 'react-hot-toast';

const subjectConfig = {
  polity: { label: 'Polity', color: '#3b82f6' },
  history: { label: 'History', color: '#f59e0b' },
  geography: { label: 'Geography', color: '#22c55e' },
  economy: { label: 'Economy', color: '#8b5cf6' },
  science: { label: 'Science & Tech', color: '#ec4899' },
  environment: { label: 'Environment', color: '#14b8a6' },
  currentAffairs: { label: 'Current Affairs', color: '#f97316' },
};

export default function UPSCTracker() {
  const [progress, setProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionForm, setSessionForm] = useState({
    subject: 'polity',
    duration: 60,
    type: 'study',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progressRes, sessionsRes] = await Promise.all([
        upscService.getProgress(),
        upscService.getSessions({ limit: 10 }),
      ]);
      setProgress(progressRes.progress);
      setSessions(sessionsRes.sessions || []);
    } catch (error) {
      console.error('Error loading UPSC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logSession = async (e) => {
    e.preventDefault();
    try {
      await upscService.logSession(sessionForm);
      toast.success('Session logged');
      loadData();
      setSessionForm({ ...sessionForm, notes: '' });
    } catch (error) {
      toast.error('Failed to log session');
    }
  };

  const updateSubjectProgress = async (subject, newCompleted) => {
    try {
      await upscService.updateSubject(subject, { completed: newCompleted });
      loadData();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const calculateOverallProgress = () => {
    if (!progress?.subjects) return 0;
    const subjects = Object.values(progress.subjects);
    const total = subjects.reduce((sum, s) => sum + (s.completed / s.total) * 100, 0);
    return Math.round(total / subjects.length);
  };

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
        <h1 className="text-2xl font-bold text-white">UPSC Preparation</h1>
        <p className="text-dark-400 mt-1">Track your civil services exam preparation</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'subjects', 'log'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 flex flex-col items-center"
          >
            <h2 className="text-lg font-semibold text-white mb-6">Overall Progress</h2>
            <ProgressRing progress={calculateOverallProgress()} size={180} strokeWidth={14}>
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{calculateOverallProgress()}%</p>
                <p className="text-dark-400 text-sm">Complete</p>
              </div>
            </ProgressRing>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-dark-300">Tests Completed</span>
                </div>
                <span className="text-white font-bold">{progress?.testsCompleted || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-dark-300">Answers Written</span>
                </div>
                <span className="text-white font-bold">{progress?.answersWritten || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-dark-300">Revisions Done</span>
                </div>
                <span className="text-white font-bold">{progress?.revisionsDone || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Recent Sessions</h2>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-dark-800/50 rounded-lg">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: subjectConfig[session.subject]?.color }}
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm capitalize">{session.subject}</p>
                    <p className="text-dark-500 text-xs">{session.duration} mins</p>
                  </div>
                  <span className="text-dark-400 text-xs capitalize">{session.type}</span>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-dark-400 text-center py-4">No sessions yet</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(subjectConfig).map(([key, config]) => {
            const subject = progress?.subjects?.[key] || { completed: 0, total: 100 };
            const percentage = Math.round((subject.completed / subject.total) * 100);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">{config.label}</h3>
                  <span
                    className="text-sm font-bold"
                    style={{ color: config.color }}
                  >
                    {percentage}%
                  </span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={subject.completed}
                    onChange={(e) => updateSubjectProgress(key, parseInt(e.target.value))}
                    className="flex-1 accent-primary-500"
                  />
                  <span className="text-dark-400 text-sm w-20 text-right">
                    {subject.completed}/{subject.total}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Log Session Tab */}
      {activeTab === 'log' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 max-w-lg"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Log Study Session</h2>
          <form onSubmit={logSession} className="space-y-4">
            <div>
              <label className="block text-dark-400 text-sm mb-2">Subject</label>
              <select
                value={sessionForm.subject}
                onChange={(e) => setSessionForm({ ...sessionForm, subject: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Object.entries(subjectConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">Session Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['study', 'revision', 'test', 'answer_writing'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSessionForm({ ...sessionForm, type })}
                    className={`p-3 rounded-xl capitalize font-medium transition-colors ${
                      sessionForm.type === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-400 hover:text-white'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">
                Duration: {sessionForm.duration} minutes
              </label>
              <input
                type="range"
                min={15}
                max={240}
                step={15}
                value={sessionForm.duration}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) })
                }
                className="w-full accent-primary-500"
              />
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">Notes (optional)</label>
              <textarea
                value={sessionForm.notes}
                onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={3}
                placeholder="What did you cover?"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Log Session
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
