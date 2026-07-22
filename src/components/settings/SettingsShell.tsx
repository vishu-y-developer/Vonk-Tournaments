'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DemoSettingsNotice from './DemoSettingsNotice';
import {
  User,
  Palette,
  Bell,
  Lock,
  Eye,
  Globe,
  Gamepad2,
  Database,
  Info,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Profile Settings', href: '/profile', icon: User },
    { label: 'Appearance', href: '/settings/appearance', icon: Palette },
    { label: 'Notifications', href: '/settings/notifications', icon: Bell },
    { label: 'Privacy', href: '/settings/privacy', icon: Lock },
    { label: 'Accessibility', href: '/settings/accessibility', icon: Eye },
    { label: 'Language & Region', href: '/settings/language-region', icon: Globe },
    { label: 'Gameplay', href: '/settings/gameplay', icon: Gamepad2 },
    { label: 'Data & Storage', href: '/settings/data', icon: Database },
    { label: 'Legal & About', href: '/settings/about', icon: Info },
    { label: 'Readiness & Diagnostics', href: '/settings/readiness', icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col min-h-screen py-4">
      <div className="mb-4">
        <DemoSettingsNotice />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Settings Navigation Sidebar */}
        <aside className="lg:col-span-3 p-4 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-2">
          <span className="text-xs uppercase font-black tracking-wider text-muted px-2 mb-1">
            Settings Hub
          </span>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-secondary/20 text-secondary border border-secondary/30 font-bold'
                      : 'text-muted hover:text-foreground hover:bg-card-bg/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content Viewport */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}
