"use client";

import { useEffect, useState } from "react";

export const useCountdown = (
  createdAt: string,
  status?: string,
  expiryDateOrDuration?: string | number | null
) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!createdAt || (status !== "PENDING" && status !== "PARTIAL")) return;

    const calculateTimeLeft = () => {
      const created = new Date(createdAt).getTime();
      const now = new Date().getTime();

      const isDev =
        process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_NEXT_ENV === "development" ||
        process.env.NEXT_ENV === "development";

      const defaultExpiryMinutes = isDev ? 3 : 45;

      let expiry = created + defaultExpiryMinutes * 60 * 1000;

      if (typeof expiryDateOrDuration === "string" && expiryDateOrDuration) {
        const parsedExpiry = new Date(expiryDateOrDuration).getTime();
        if (!isNaN(parsedExpiry)) {
          expiry = parsedExpiry;
        }
      } else if (typeof expiryDateOrDuration === "number" && expiryDateOrDuration > 0) {
        expiry = created + expiryDateOrDuration * 1000;
      }

      const difference = expiry - now;

      return difference > 0 ? difference : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt, status, expiryDateOrDuration]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");
  const formattedTime = `${formattedMinutes}:${formattedSeconds}`;

  return {
    minutes,
    seconds,
    formattedMinutes,
    formattedSeconds,
    formattedTime,
    isExpired: timeLeft <= 0,
    totalSeconds: Math.floor(timeLeft / 1000),
  };
};
