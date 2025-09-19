import { useEffect, useState } from "react";

export const useCooldown = (cooldownSeconds: number) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const startCooldown = (seconds?: number) => {
    setTimeRemaining(seconds ?? cooldownSeconds);
  };

  return { timeRemaining, startCooldown };
};
