'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { STORAGE_KEYS } from '@/constants';
import { browserStorage } from '@/lib/storage/browser-storage';
import { Trophy, Sparkles, X, Check, Shield, UserCheck, Settings } from 'lucide-react';

export const FirstRunOnboarding: React.FC = () => {
  const { role, setRole } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = browserStorage.getItem<boolean>(STORAGE_KEYS.ONBOARDING_STATE, false);
    if (!dismissed) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    browserStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, true);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="p-8 rounded-3xl border border-secondary/40 bg-card-bg max-w-lg w-full flex flex-col gap-6 shadow-2xl relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-muted hover:text-foreground hover:bg-card-bg/60"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Welcome to VONK</h2>
            <span className="text-xs text-secondary font-extrabold">Compete. Conquer. Win.</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-xs text-muted leading-relaxed space-y-2">
          <div className="flex items-center gap-1.5 text-secondary font-extrabold">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>100% Frontend Demonstration Architecture</span>
          </div>
          <p>
            VONK Tournaments runs entirely in your browser using local storage. Tournaments, registrations, wallets, matches, scorecards, organizer controls, and admin moderation are simulated locally.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase text-foreground">Select Active Demo Role:</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Player', 'Organizer', 'Admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-extrabold capitalize transition-all ${
                  role === r
                    ? 'border-secondary bg-secondary/20 text-secondary'
                    : 'border-card-border bg-card-bg/40 text-muted hover:text-foreground'
                }`}
              >
                <span>{r}</span>
                {role === r && <Check className="h-3.5 w-3.5 text-secondary" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full py-3 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs shadow-md glow-secondary"
        >
          Explore VONK Tournaments
        </button>
      </div>
    </div>
  );
};

export default FirstRunOnboarding;
