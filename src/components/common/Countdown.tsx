'use client';

import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownProps {
  targetDate: string;
  onExpire?: () => void;
  prefix?: string;
  className?: string;
}

export const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  onExpire,
  prefix = 'Starts in',
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mountTimer = setTimeout(() => {
      setMounted(true);
    }, 0);

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        onExpire?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
    };
  }, [targetDate, onExpire]);

  if (!mounted) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-muted ${className}`}>
        <Timer className="h-3.5 w-3.5" />
        <span>Loading countdown...</span>
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-bold text-danger ${className}`}>
        <Timer className="h-3.5 w-3.5" />
        <span>LIVE / COMPLETED</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-xs font-bold ${className}`}>
      <Timer className="h-3.5 w-3.5 text-primary" />
      <span className="text-muted mr-1">{prefix}:</span>
      <span className="font-mono text-foreground bg-card-bg/85 px-1.5 py-0.5 rounded border border-card-border">
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {timeLeft.hours.toString().padStart(2, '0')}h{' '}
        {timeLeft.minutes.toString().padStart(2, '0')}m{' '}
        {timeLeft.seconds.toString().padStart(2, '0')}s
      </span>
    </div>
  );
};

export default Countdown;
