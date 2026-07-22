'use client';

import React from 'react';
import { LifeBuoy, Sparkles } from 'lucide-react';

export const DemoSupportNotice: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
      <div className="flex items-center gap-2">
        <LifeBuoy className="h-4 w-4 text-primary shrink-0" />
        <span>
          <strong>Simulated Support Center:</strong> Support tickets, FAQs, help articles, and automated replies are provided locally as part of the VONK frontend demonstration.
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[10px] font-extrabold uppercase bg-primary/20 px-2.5 py-1 rounded-full border border-primary/30">
        <Sparkles className="h-3 w-3" />
        Demo Help System
      </div>
    </div>
  );
};

export default DemoSupportNotice;
