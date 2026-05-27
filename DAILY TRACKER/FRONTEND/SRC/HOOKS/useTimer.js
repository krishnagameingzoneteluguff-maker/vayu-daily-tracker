import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(initialMinutes = 25) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(initialMinutes * 60);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((minutes = initialMinutes) => {
    setIsRunning(false);
    setTimeLeft(minutes * 60);
    setTotalTime(minutes * 60);
    startTimeRef.current = null;
  }, [initialMinutes]);

  const setDuration = useCallback((minutes) => {
    setTimeLeft(minutes * 60);
    setTotalTime(minutes * 60);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getElapsedMinutes = useCallback(() => {
    return Math.round((totalTime - timeLeft) / 60);
  }, [totalTime, timeLeft]);

  return {
    timeLeft,
    isRunning,
    progress,
    formattedTime: formatTime(timeLeft),
    start,
    pause,
    reset,
    setDuration,
    getElapsedMinutes,
    isComplete: timeLeft === 0,
  };
}
