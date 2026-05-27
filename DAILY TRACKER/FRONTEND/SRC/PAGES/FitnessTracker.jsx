import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Flame,
  Droplets,
  Footprints,
  Moon,
  Plus,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import { fitnessService } from '../services/trackerService';
import toast from 'react-hot-toast';

const workoutTypes = [
  'Strength',
  'Cardio',
  'HIIT',
  'Yoga',
  'Running',
  'Cycling',
  'Swimming',
  'Other',
];

export default function FitnessTracker() {
  const [progress, setProgress] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [workoutForm, setWorkoutForm] = useState({
    type: 'Strength',
    duration: 30,
    calories: 200,
    notes: '',
  });
  const [dailyForm, setDailyForm] = useState({
    weight: '',
    water: 0,
    steps: 0,
    sleep: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progressRes, workoutsRes, dailyRes] = await Promise.all([
        fitnessService.getProgress(),
        fitnessService.getWorkouts({ limit: 10 }),
        fitnessService.getDailyHistory(7),
      ]);
      setProgress(progressRes.progress);
      setWorkouts(workoutsRes.workouts || []);
      setDailyData(dailyRes.daily || []);
    } catch (error) {
      console.error('Error loading fitness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logWorkout = async (e) => {
    e.preventDefault();
    try {
      await fitnessService.logWorkout(workoutForm);
      toast.success('Workout logged!');
      setWorkoutForm({ type: 'Strength', duration: 30, calories: 200, notes: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to log workout');
    }
  };

  const logDaily = async (e) => {
    e.preventDefault();
    try {
      await fitnessService.logDaily(dailyForm);
      toast.success('Daily metrics saved!');
      loadData();
    } catch (error) {
      toast.error('Failed to save metrics');
    }
  };

  const todayData = dailyData[0] || {};
  const goals = progress?.goals || { dailySteps: 10000, dailyWater: 8 };

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
        <h1 className="text-2xl font-bold text-white">Fitness Tracker</h1>
        <p className="text-dark-400 mt-1">Track your health and fitness journey</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'workouts', 'daily'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-purple-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-dark-400 text-sm">Total Workouts</p>
                <p className="text-2xl font-bold text-white">
                  {progress?.stats?.totalWorkouts || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-dark-400 text-sm">Total Minutes</p>
                <p className="text-2xl font-bold text-white">
                  {progress?.stats?.totalMinutes || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-dark-400 text-sm">Today's Water</p>
                <p className="text-2xl font-bold text-white">
                  {todayData.water || 0}/{goals.dailyWater} cups
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Footprints className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-dark-400 text-sm">Today's Steps</p>
                <p className="text-2xl font-bold text-white">
                  {(todayData.steps || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Workouts Tab */}
      {activeTab === 'workouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Log Workout</h2>
            <form onSubmit={logWorkout} className="space-y-4">
              <div>
                <label className="block text-dark-400 text-sm mb-2">Workout Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {workoutTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setWorkoutForm({ ...workoutForm, type })}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        workoutForm.type === type
                          ? 'bg-purple-500 text-white'
                          : 'bg-dark-800 text-dark-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-400 text-sm mb-2">
                    Duration: {workoutForm.duration} mins
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={workoutForm.duration}
                    onChange={(e) =>
                      setWorkoutForm({ ...workoutForm, duration: parseInt(e.target.value) })
                    }
                    className="w-full accent-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-400 text-sm mb-2">
                    Calories: {workoutForm.calories}
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={50}
                    value={workoutForm.calories}
                    onChange={(e) =>
                      setWorkoutForm({ ...workoutForm, calories: parseInt(e.target.value) })
                    }
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-400 text-sm mb-2">Notes</label>
                <textarea
                  value={workoutForm.notes}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={2}
                  placeholder="How was your workout?"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
              >
                Log Workout
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Recent Workouts</h2>
            <div className="space-y-3">
              {workouts.map((workout, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-dark-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{workout.type}</p>
                    <p className="text-dark-400 text-sm">
                      {workout.duration} mins • {workout.calories} cal
                    </p>
                  </div>
                  <span className="text-dark-500 text-sm">
                    {new Date(workout.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {workouts.length === 0 && (
                <p className="text-center text-dark-400 py-8">No workouts logged yet</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Daily Tab */}
      {activeTab === 'daily' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 max-w-lg"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Log Daily Metrics</h2>
          <form onSubmit={logDaily} className="space-y-4">
            <div>
              <label className="block text-dark-400 text-sm mb-2">Weight (kg)</label>
              <input
                type="number"
                value={dailyForm.weight}
                onChange={(e) => setDailyForm({ ...dailyForm, weight: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="70"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">
                Water: {dailyForm.water} cups
              </label>
              <input
                type="range"
                min={0}
                max={15}
                value={dailyForm.water}
                onChange={(e) =>
                  setDailyForm({ ...dailyForm, water: parseInt(e.target.value) })
                }
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">Steps</label>
              <input
                type="number"
                value={dailyForm.steps}
                onChange={(e) =>
                  setDailyForm({ ...dailyForm, steps: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="10000"
              />
            </div>

            <div>
              <label className="block text-dark-400 text-sm mb-2">
                Sleep: {dailyForm.sleep} hours
              </label>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={dailyForm.sleep}
                onChange={(e) =>
                  setDailyForm({ ...dailyForm, sleep: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
            >
              Save Daily Metrics
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
