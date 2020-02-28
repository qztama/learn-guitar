import { useState, useEffect } from 'react';

const INTERVAL = 500;

function useTimer(initTimeRemaining: number, autoStart = false) {
  const [timeRemaining, setTimeRemaining] = useState<number>(initTimeRemaining * 1000);
  const [intervalId, setIntervalId] = useState<null | number>(null);

  function setupInterval() {
    let start = Date.now();

    setIntervalId(
      setInterval(() => {
        const now = Date.now();
        const dt = now - start;
        setTimeRemaining(timeRemaining => (timeRemaining - dt <= 0 ? 0 : timeRemaining - dt));
        start = now;
      }, INTERVAL),
    );
  }

  useEffect(() => {
    if (autoStart) {
      setupInterval();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return {
    seconds: Math.ceil(timeRemaining / 1000),
    resume: () => {
      setupInterval();
    },
    pause: () => {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    },
    restart: () => setTimeRemaining(initTimeRemaining),
  };
}

export default useTimer;
