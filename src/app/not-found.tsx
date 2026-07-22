'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center gap-6">
      <div className="w-16 h-16 rounded-3xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
        <Gamepad2 className="h-8 w-8" />
      </div>

      <div className="max-w-md flex flex-col gap-2">
        <span className="text-xs font-mono font-bold text-secondary uppercase tracking-widest">
          404 — Page Not Found
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">
          Match Room Lost
        </h1>
        <p className="text-xs text-muted leading-relaxed">
          The requested page, tournament slug, or custom-room ID does not exist or has been removed.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/search"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs shadow-md glow-secondary"
        >
          <Search className="h-4 w-4" /> Search Platform
        </Link>
        <Link
          href="/tournaments"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-card-bg border border-card-border hover:bg-card-bg/60 text-foreground font-extrabold rounded-xl text-xs"
        >
          <Home className="h-4 w-4 text-muted" /> Explore Tournaments
        </Link>
      </div>
    </div>
  );
}
