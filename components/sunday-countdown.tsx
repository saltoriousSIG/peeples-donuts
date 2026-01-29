import { useState, useEffect } from "react";

interface SundayCountdownProps {
  compact?: boolean;
}

const SundayCountdown: React.FC<SundayCountdownProps> = ({ compact = false }) => {
  const getCountdown = (): string => {
    const now = new Date();
    const dayOfWeek = now.getDay();

    const daysUntilSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0);

    const diff = nextSunday.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (compact) {
      return `${days}d ${hours}h`;
    }
    return `${days}D ${hours}H ${minutes}M`;
  };

  const [countdown, setCountdown] = useState<string>(getCountdown());

  useEffect(() => {
    const interval: NodeJS.Timeout = setInterval(() => {
      setCountdown(getCountdown());
    }, 60000);

    return () => clearInterval(interval);
  }, [compact]);

  return <span>{countdown}</span>;
};

export default SundayCountdown;
export { SundayCountdown };
