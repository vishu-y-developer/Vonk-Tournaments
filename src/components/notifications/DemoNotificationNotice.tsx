'use client';

import React from 'react';
import { Bell, Sparkles } from 'lucide-react';

export const DemoNotificationNotice: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-secondary/10 border border-secondary/25 text-secondary text-xs font-semibold">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-secondary shrink-0" />
        <span>
          <strong>Simulated Notifications:</strong> All alerts, match reminders, and wallet updates are generated locally from active domain events in 100% frontend demo mode.
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[10px] font-extrabold uppercase bg-secondary/20 px-2.5 py-1 rounded-full border border-secondary/30">
        <Sparkles className="h-3 w-3" />
        In-App Demo Alerts
      </div>
    </div>
  );
};

export default DemoNotificationNotice;
