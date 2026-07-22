'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Database } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error silently
    console.error('Unhandled route error caught by boundary:', error);
  }, [error]);

  const handleResetData = () => {
    if (confirm('Reset VONK demo storage to clear any corrupted state?')) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('vonk:v1:')) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center gap-6">
      <div className="w-16 h-16 rounded-3xl bg-danger/15 border border-danger/30 flex items-center justify-center text-danger">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <div className="max-w-md flex flex-col gap-2">
        <span className="text-xs font-mono font-bold text-danger uppercase tracking-widest">
          Application Exception
        </span>
        <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">
          Something went wrong
        </h1>
        <p className="text-xs text-muted leading-relaxed">
          An unexpected frontend runtime error occurred while rendering this route.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => reset()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs shadow-md glow-secondary"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
        <button
          onClick={handleResetData}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-danger/20 border border-danger/40 hover:bg-danger/30 text-danger font-extrabold rounded-xl text-xs"
        >
          <Database className="h-4 w-4" /> Reset Demo Storage
        </button>
        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-card-bg border border-card-border hover:bg-card-bg/60 text-foreground font-extrabold rounded-xl text-xs"
        >
          <Home className="h-4 w-4 text-muted" /> Home
        </Link>
      </div>
    </div>
  );
}
