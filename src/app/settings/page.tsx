'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Link from 'next/link';
import SettingsShell from '@/components/settings/SettingsShell';
import { 
  Palette, 
  Bell, 
  Lock, 
  Eye, 
  Globe, 
  Gamepad2, 
  Database, 
  Info,
  ArrowRight
} from 'lucide-react';

export default function SettingsHubPage() {
  const cards = [
    { title: 'Appearance', desc: 'Theme, compact layouts, and contrast', href: '/settings/appearance', icon: Palette },
    { title: 'Notifications', desc: 'Alert categories and delivery preferences', href: '/settings/notifications', icon: Bell },
    { title: 'Privacy', desc: 'Match history, balance, and profile visibility', href: '/settings/privacy', icon: Lock },
    { title: 'Accessibility', desc: 'Reduced motion, larger text, card views', href: '/settings/accessibility', icon: Eye },
    { title: 'Language & Region', desc: 'Language preview, timezone, and date format', href: '/settings/language-region', icon: Globe },
    { title: 'Gameplay', desc: 'Game defaults, preferred mode, and auto-open cards', href: '/settings/gameplay', icon: Gamepad2 },
    { title: 'Data & Storage', desc: 'Local storage summary, export JSON, and reset', href: '/settings/data', icon: Database },
    { title: 'Legal & About', desc: 'VONK version, demo disclosure, and phase roadmap', href: '/settings/about', icon: Info },
  ];

  return (
    <SettingsShell>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
            User Preferences & System Settings
          </h1>
          <p className="text-xs text-muted">
            Configure local UI themes, notification preferences, accessibility, and local storage data backups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="p-5 rounded-2xl border border-card-border bg-card-bg/25 hover:bg-card-bg/50 flex flex-col gap-2 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-xs">{c.title}</h3>
                    <p className="text-[11px] text-muted">{c.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-secondary mt-2">
                  Configure <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </SettingsShell>
  );
}
