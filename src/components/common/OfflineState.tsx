'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineStateProps {
  onRetry?: () => void;
}

export const OfflineState: React.FC<OfflineStateProps> = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 my-10 rounded-2xl border border-card-border bg-card-bg/40 max-w-sm mx-auto">
      <div className="p-4 rounded-full bg-danger/10 border border-danger/25 text-danger mb-4">
        <WifiOff className="h-8 w-8 animate-bounce" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">You are offline</h3>
      <p className="text-xs text-muted leading-relaxed mb-6">
        Please check your network connection and try again. VONK Tournaments requires an active connection to manage room credentials and standings.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary/90 text-background font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 touch-target"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};

export default OfflineState;
