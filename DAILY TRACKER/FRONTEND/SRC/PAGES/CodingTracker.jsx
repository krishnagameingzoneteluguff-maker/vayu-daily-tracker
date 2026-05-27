import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Plus,
  Trophy,
  Target,
  Zap,
  ExternalLink,
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import { codingService } from '../services/trackerService';
import toast from 'react-hot-toast';

const difficultyConfig = {
  easy: { label: 'Easy', color: 'text-green-400', bg: 'bg-green-500/20' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  hard: { label: 'Hard', color: 'text-red-400', bg: 'bg-red-500/20' },
};

const topicsList = [
  'arrays', 'strings', 'linkedLists', 'trees', 'graphs',
  'dp', 'sorting', 'searching', 'backtracking', 'greedy',
];

const platformsList = ['leetcode', 'codeforces', 'hackerrank'];

export default function CodingTracker() {
  const [progress, setProgress] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    difficulty: 'easy',
    topic: 'arrays',
    platform: 'leetcode',
    link: '',
    notes: '',
    timeSpent: 30,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progressRes, problemsRes] = await Promise.all([
        codingService.getProgress(),
        codingService.getProblems({ limit: 20 }),
      ]);
      setProgress(progressRes.progress);
      setProblems(problemsRes.problems || []);
    } catch (error) {
      console.error('Error loading coding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logProblem = async (e) => {
    e.preventDefault();
    try {
      await codingService.logProblem(formData);
      toast.success('Problem logged!');
      setShowForm(false);
      setFormData({
        name: '',
        difficulty: 'easy',
        topic: 'arrays',
        platform: 'leetcode',
        link: '',
        notes: '',
        timeSpent: 30,
      });
      loadData();
    } catch (error) {
      toast.error('Failed to log problem');
    }
  };

  const totalProblems = progress?.totalProblems || 0;
  const dailyGoal = progress?.dailyGoal || 3;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Coding Tracker</h1>
          <p className="text-dark-400 mt-1">Track your DSA progress</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Log Problem
        </button>
      </div>

      {/* Log Problem Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Log Solved Problem</h2>
          <form onSubmit={logProblem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-dark-400 text-sm mb-2">Problem Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Two Sum"
                required
              />
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">Difficulty</label>
              <div className="flex gap-2">
                {Object.entries(difficultyConfig).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: key })}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                      formData.difficulty === key
                        ? `${config.bg} ${config.color}`
                        : 'bg-dark-800 text-dark-400'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">Topic</label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 capitalize"
              >
                {topicsList.map((topic) => (
                  <option key={topic} value={topic} className="capitalize">
                    {topic.replace(/([A-Z])/g, ' $1').trim()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 capitalize"
              >
                {platformsList.map((platform) => (
                  <option key={platform} value={platform} className="capitalize">
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">Link (optional)</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="[leetcode.com](https://leetcode.com/)"
              />
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">
                Time Spent: {formData.timeSpent} mins
              </label>
              <input
                type="range"
                min={5}
                max={180}
                step={5}
                value={formData.timeSpent}
                onChange={(e) =>
                  setFormData({ ...formData, timeSpent: parseInt(e.target.value) })
                }
                className="w-full accent-green-500"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
              >
                Log Problem
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{totalProblems}</p>
          <p className="text-dark-400 text-sm">Total Solved</p>
        </motion.div>

        {Object.entries(difficultyConfig).map(([key, config], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
            className="glass-card p-6 text-center"
          >
            <p className={`text-3xl font-bold ${config.color}`}>
              {progress?.problemsSolved?.[key] || 0}
            </p>
            <p className="text-dark-400 text-sm">{config.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Topics Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Topics Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicsList.map((topic) => {
            const topicData = progress?.topics?.[topic] || { solved: 0, total: 50 };
            const percentage = Math.round((topicData.solved / topicData.total) * 100);

            return (
              <div key={topic} className="p-4 bg-dark-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white capitalize">
                    {topic.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-green-400 text-sm font-medium">
                    {topicData.solved}/{topicData.total}
                  </span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Problems */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Recent Problems</h2>
        <div className="space-y-3">
          {problems.map((problem, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <Code2 className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">{problem.name}</p>
                  <p className="text-dark-400 text-sm capitalize">
                    {problem.topic.replace(/([A-Z])/g, ' $1').trim()} • {problem.platform}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    difficultyConfig[problem.difficulty]?.bg
                  } ${difficultyConfig[problem.difficulty]?.color}`}
                >
                  {difficultyConfig[problem.difficulty]?.label}
                </span>
                {problem.link && (
                  <a
                    href={problem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
          {problems.length === 0 && (
            <p className="text-center text-dark-400 py-8">No problems logged yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
