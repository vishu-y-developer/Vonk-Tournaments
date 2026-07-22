'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const ConnectionIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialTimer = setTimeout(() => {
      setIsOnline(navigator.onLine);
    }, 0);

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div className="fixed top-16 md:top-20 left-1/2 -translate-x-1/2 z-[90] transition-all">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md border ${
          isOnline
            ? 'bg-primary/20 text-primary border-primary/30'
            : 'bg-danger/20 text-danger border-danger/30'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-3.5 w-3.5" />
            <span>Connection Restored</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5 animate-pulse" />
            <span>Offline Mode Active</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionIndicator;
