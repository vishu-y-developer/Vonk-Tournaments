'use client';

import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export const DemoAdminNotice: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary shrink-0" />
        <span>
          <strong>Admin Control Mode:</strong> Frontend simulation with live local persistence. All moderation actions, wallet adjustments, and status transitions affect local demo data immediately.
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[10px] font-extrabold uppercase bg-primary/20 px-2.5 py-1 rounded-full text-primary border border-primary/30">
        <Sparkles className="h-3 w-3" />
        Demo Admin Active
      </div>
    </div>
  );
};

export default DemoAdminNotice;
