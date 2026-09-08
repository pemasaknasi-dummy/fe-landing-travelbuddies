import { useEffect, useState } from "react";

const DURATION = 11 * 60 * 60; // 11 jam dalam detik

export const useLoopingCountdown = () => {
  const [secondsLeft, setSecondsLeft] = useState(DURATION);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return DURATION; // reset ke 11 jam
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return {
    hours,
    minutes,
    seconds,
  };
};
