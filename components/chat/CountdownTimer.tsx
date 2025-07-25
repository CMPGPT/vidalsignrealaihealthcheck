
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  className?: string;
  expiryTime: Date;
  onExpire?: () => void;
}

const CountdownTimer = ({ className, expiryTime, onExpire }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 24,
    minutes: 0,
    seconds: 0,
  });
  const [isExpiring, setIsExpiring] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = expiryTime.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        onExpire?.();
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      // Set warning state when less than 1 hour remains
      if (difference <= 60 * 60 * 1000) {
        setIsExpiring(true);
      }
      
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, onExpire]);

  const formatTimeUnit = (unit: number): string => {
    return unit < 10 ? `0${unit}` : `${unit}`;
  };

  return (
    <div className={cn("flex items-center space-x-2", isExpiring ? "text-destructive" : "text-muted-foreground", className)}>
      <Clock className="h-4 w-4" />
      <div className="text-sm font-medium transition-colors">
        <span className="tabular-nums">{formatTimeUnit(timeLeft.hours)}</span>:
        <span className="tabular-nums">{formatTimeUnit(timeLeft.minutes)}</span>:
        <span className="tabular-nums">{formatTimeUnit(timeLeft.seconds)}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
