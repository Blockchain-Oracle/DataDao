import { useState, useEffect } from "react";

export function useCountdown(deadline: number) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const difference = deadline - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / 86400),
        hours: Math.floor((difference % 86400) / 3600),
        minutes: Math.floor((difference % 3600) / 60),
        seconds: difference % 60,
        expired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return timeLeft;
}
