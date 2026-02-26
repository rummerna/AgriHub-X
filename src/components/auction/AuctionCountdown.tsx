import { useState, useEffect } from "react";

interface AuctionCountdownProps {
  endTime: string;
  compact?: boolean;
  onEnd?: () => void;
}

const AuctionCountdown = ({ endTime, compact, onEnd }: AuctionCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const ms = new Date(endTime).getTime() - Date.now();
      if (ms <= 0) {
        setTimeLeft("Ended");
        onEnd?.();
        return;
      }

      const days = Math.floor(ms / 86400000);
      const hours = Math.floor((ms % 86400000) / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);

      if (compact) {
        if (days > 0) setTimeLeft(`${days}d ${hours}h left`);
        else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m left`);
        else setTimeLeft(`${minutes}m ${seconds}s left`);
      } else {
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);
        setTimeLeft(parts.join(" ") + " remaining");
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime, compact, onEnd]);

  return <span>{timeLeft}</span>;
};

export default AuctionCountdown;
