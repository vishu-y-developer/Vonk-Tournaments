'use client';

import React from 'react';
import { Gamepad2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 gap-3">
      <div className="w-10 h-10 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary animate-pulse">
        <Gamepad2 className="h-5 w-5 animate-spin" />
      </div>
      <span className="text-xs font-mono font-bold text-muted">Loading VONK View...</span>
    </div>
  );
}
