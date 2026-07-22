'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useAdmin } from '@/providers/AdminProvider';
import DemoAdminNotice from './DemoAdminNotice';
import {
  LayoutDashboard,
  Users,
  Shield,
  Trophy,
  Sword,
  CheckSquare,
  Wallet,
  AlertTriangle,
  Flag,
  Megaphone,
  BarChart2,
  Settings,
  Layers,
  Menu,
  X,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, setRole } = useAuth();
  const { seedAdminData, resetAdminData, refreshData } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminNavLinks = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Players', href: '/admin/players', icon: Users },
    { label: 'Teams', href: '/admin/teams', icon: Shield },
    { label: 'Organizers', href: '/admin/organizers', icon: UserCheck },
    { label: 'Tournaments', href: '/admin/tournaments', icon: Trophy },
    { label: 'Registrations', href: '/admin/registrations', icon: Layers },
    { label: 'Matches', href: '/admin/matches', icon: Sword },
    { label: 'Results', href: '/admin/results', icon: CheckSquare },
    { label: 'Wallets', href: '/admin/wallets', icon: Wallet },
    { label: 'Reports', href: '/admin/reports', icon: Flag },
    { label: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
    { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // Role Gate Check
  if (role !== 'Admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 my-12">
        <div className="w-full max-w-md p-8 rounded-2xl border border-card-border bg-card-bg/40 text-center flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-danger/15 flex items-center justify-center text-danger">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Admin Access Denied</h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              You are currently viewing VONK Tournaments in <strong>{role}</strong> mode. Switch to <strong>Admin Mode</strong> to access platform moderation and management control panels.
            </p>
          </div>
          <button
            onClick={() => {
              setRole('Admin');
              window.location.reload();
            }}
            className="w-full py-3 bg-secondary hover:bg-secondary/95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all glow-secondary"
          >
            Switch to Admin Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen py-4">
      {/* Top Banner Notice */}
      <div className="mb-4 px-2 sm:px-0">
        <DemoAdminNotice />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-3 p-4 rounded-2xl border border-card-border bg-card-bg/25 sticky top-20">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-extrabold text-xs text-foreground uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded">
              v1.0
            </span>
          </div>

          <nav className="flex flex-col gap-1 my-1">
            {adminNavLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary/20 text-primary border border-primary/30 font-bold'
                      : 'text-muted hover:text-foreground hover:bg-card-bg/50'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Dev Controls inside sidebar */}
          <div className="mt-4 pt-3 border-t border-card-border flex flex-col gap-2">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">
              Demo Admin Sandbox
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  seedAdminData();
                  alert('Demo admin data seeded!');
                }}
                className="flex-1 py-1.5 px-2 bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Seed Data
              </button>
              <button
                onClick={() => {
                  resetAdminData();
                  alert('Demo admin data reset!');
                }}
                className="flex-1 py-1.5 px-2 bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Trigger */}
        <div className="lg:hidden flex items-center justify-between p-3.5 bg-card-bg/30 border border-card-border rounded-xl">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-extrabold text-xs uppercase text-foreground">Admin Navigation</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg border border-card-border bg-card-bg text-muted"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Slide Drawer */}
        {mobileOpen && (
          <div className="lg:hidden p-4 rounded-xl border border-card-border bg-card-bg/95 flex flex-col gap-2">
            {adminNavLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold ${
                    active ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Main Admin Viewport */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}
