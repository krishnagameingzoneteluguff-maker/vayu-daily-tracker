import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Timer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import ProgressRing from '../components/ProgressRing';
import { focusService } from '../services/trackerService';
import toast from 'react-hot-toast';

const presets = [
  { label: 'Pomodoro', work: 25, break: 5 },
  { label: 'Long Focus', work: 50, break: 10 },
  { label: 'Quick', work: 15, break: 3 },
];

export default function FocusMode() {
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [activePreset, setActivePreset] = useState(presets[0]);
  const [sessionId, setSessionId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState(null);

  const timer = useTimer(activePreset.work);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (timer.isComplete && sessionId) {
      handleSessionComplete();
    }
  }, [timer.isComplete]);

  const loadStats = async () => {
    try {
      const response = await focusService.getStats(7);
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const startSession = async () => {
    try {
      const response = await focusService.startSession({
        duration: mode === 'work' ? activePreset.work : activePreset.break,
        type: mode === 'work' ? 'pomodoro' : 'break',
      });
      setSessionId(response.session.id);
      timer.start();
    } catch (error) {
      toast.error('Failed to start session');
    }
  };

  const handleSessionComplete = async () => {
    if (!sessionId) return;

    try {
      await focusService.endSession(sessionId, {
        actualDuration: timer.getElapsedMinutes(),
        completed: true,
      });

      if (soundEnabled) {
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      }

      toast.success(mode === 'work' ? 'Focus session complete! Take a break.' : 'Break over! Ready to focus?');

      // Switch mode
      if (mode === 'work') {
        setMode('break');
        timer.setDuration(activePreset.break);
      } else {
        setMode('work');
        timer.setDuration(activePreset.work);
      }

      setSessionId(null);
      loadStats();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handlePause = () => {
    timer.pause();
  };

  const handleReset = async () => {
    if (sessionId) {
      try {
        await focusService.endSession(sessionId, {
          actualDuration: timer.getElapsedMinutes(),
          completed: false,
          interrupted: true,
        });
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
    timer.reset(mode === 'work' ? activePreset.work : activePreset.break);
    setSessionId(null);
  };

  const switchPreset = (preset) => {
    setActivePreset(preset);
    timer.reset(mode === 'work' ? preset.work : preset.break);
    setSessionId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Focus Mode</h1>
        <p className="text-dark-400 mt-1">Stay focused, stay productive</p>
      </div>

      {/* Timer Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        {/* Mode Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setMode('work');
              timer.reset(activePreset.work);
              setSessionId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              mode === 'work'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            <Brain className="w-5 h-5" />
            Focus
          </button>
          <button
            onClick={() => {
              setMode('break');
              timer.reset(activePreset.break);
              setSessionId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              mode === 'break'
                ? 'bg-green-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            <Coffee className="w-5 h-5" />
            Break
          </button>
        </div>

        {/* Timer Display */}
        <div className="flex justify-center mb-8">
          <ProgressRing
            progress={timer.progress}
            size={280}
            strokeWidth={12}
            color={mode === 'work' ? '#0ea5e9' : '#22c55e'}
          >
            <div className="text-center">
              <p className="text-6xl font-bold text-white font-mono">
                {timer.formattedTime}
              </p>
              <p className="text-dark-400 mt-2 capitalize">
                {mode === 'work' ? 'Focus Time' : 'Break Time'}
              </p>
            </div>
          </ProgressRing>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!timer.isRunning ? (
            <button
              onClick={startSession}
              className="w-16 h-16 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center transition-colors"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="w-16 h-16 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center transition-colors"
            >
              <Pause className="w-8 h-8 text-white" />
            </button>
          )}
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-full bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-12 h-12 rounded-full bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-dark-400" />
            )}
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => switchPreset(preset)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activePreset.label === preset.label
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                  : 'bg-dark-800 text-dark-400 hover:text-white border border-transparent'
              }`}
            >
              {preset.label} ({preset.work}/{preset.break})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="glass-card p-6 text-center">
            <Timer className="w-8 h-8 text-primary-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
            <p className="text-dark-400 text-sm">Sessions this week</p>
          </div>
          <div className="glass-card p-6 text-center">
            <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalMinutes}</p>
            <p className="text-dark-400 text-sm">Minutes focused</p>
          </div>
          <div className="glass-card p-6 text-center">
            <Coffee className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.averageSession}</p>
            <p className="text-dark-400 text-sm">Avg session (min)</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
