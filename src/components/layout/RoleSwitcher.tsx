'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types';
import { ShieldAlert, RefreshCw, Database, Eye, X } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { role, setRole, resetAllData, seedAllData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roles: UserRole[] = ['Guest', 'Player', 'Organizer', 'Admin'];

  const getRoleColor = (r: UserRole) => {
    switch (r) {
      case 'Guest':
        return 'bg-muted text-foreground';
      case 'Player':
        return 'bg-primary/20 text-primary border border-primary/30';
      case 'Organizer':
        return 'bg-secondary/20 text-secondary border border-secondary/30';
      case 'Admin':
        return 'bg-danger/20 text-danger border border-danger/30';
      default:
        return 'bg-card-bg text-foreground';
    }
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col items-end">
      {isOpen ? (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-card-border bg-card-bg/95 backdrop-blur-md glow-secondary shadow-2xl w-60 mb-2 transition-all">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-secondary" />
              Demo Controls
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-foreground transition-colors p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Role selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-muted uppercase">Select Active Role:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setIsOpen(false);
                    // Force refresh layout and links
                    window.location.reload();
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all text-center ${
                    role === r
                      ? getRoleColor(r)
                      : 'bg-background hover:bg-card-hover-border border border-card-border text-foreground/80'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Database actions */}
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-card-border">
            <span className="text-[10px] font-bold text-muted uppercase">Database Actions:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to seed default mock tournaments and profile data? This will overwrite current storage.')) {
                    seedAllData();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-secondary hover:bg-secondary/90 text-white rounded-lg text-xs font-bold transition-all"
              >
                <Database className="h-3 w-3" />
                Seed DB
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all local storage?')) {
                    resetAllData();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30 rounded-lg text-xs font-bold transition-all"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-full font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 touch-target"
      >
        <Eye className="h-4 w-4 animate-pulse" />
        <span>Mock Role: {role}</span>
      </button>
    </div>
  );
};

export default RoleSwitcher;
