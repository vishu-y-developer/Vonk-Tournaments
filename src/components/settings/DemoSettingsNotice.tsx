'use client';

import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

export const DemoSettingsNotice: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-secondary/10 border border-secondary/25 text-secondary text-xs font-semibold">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-secondary shrink-0" />
        <span>
          <strong>User Preferences:</strong> Appearance, privacy, accessibility, gameplay defaults, and local data backups are saved to your browser&apos;s localStorage.
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[10px] font-extrabold uppercase bg-secondary/20 px-2.5 py-1 rounded-full border border-secondary/30">
        <Sparkles className="h-3 w-3" />
        Local Settings Active
      </div>
    </div>
  );
};

export default DemoSettingsNotice;
