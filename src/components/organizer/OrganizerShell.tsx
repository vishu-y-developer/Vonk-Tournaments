'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useOrganizer } from '@/providers/OrganizerProvider';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Sword, 
  CheckSquare, 
  AlertTriangle, 
  Gift, 
  BarChart2, 
  Megaphone, 
  Settings, 
  Menu, 
  X, 
  ChevronRight, 
  Info, 
  User, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ROUTES } from '@/constants';

interface SidebarLink {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
}

export const OrganizerShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, setRole, user } = useAuth();
  const { organizer, seedOrganizerData, resetOrganizerData } = useOrganizer();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Authorization Check
  if (role !== 'Organizer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-danger/10 border border-danger/35 flex items-center justify-center mb-6 animate-bounce">
          <ShieldAlert className="h-8 w-8 text-danger" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-3">
          Organizer Access Denied
        </h1>
        <p className="text-muted text-sm md:text-base max-w-md mb-8 leading-relaxed">
          You are currently in <span className="font-bold text-gradient uppercase">{role}</span> Mode.
          Switch to <span className="font-bold text-gradient-secondary">Organizer</span> Mode to manage tournaments, edit matches, review player disputes, and allocate prizes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
          <button
            onClick={() => {
              setRole('Organizer');
              window.location.reload();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-secondary hover:bg-secondary/95 text-white font-bold rounded-xl text-sm transition-all hover:shadow-lg glow-secondary"
          >
            Switch to Organizer Mode
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link
            href={ROUTES.HOME}
            className="flex-1 flex items-center justify-center px-5 py-3 bg-card-bg hover:bg-card-hover-border border border-card-border rounded-xl text-xs font-semibold text-muted hover:text-foreground transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const links: SidebarLink[] = [
    { label: 'Dashboard', path: '/organizer', icon: LayoutDashboard },
    { label: 'Tournaments', path: '/organizer/tournaments', icon: Trophy },
    { label: 'Registrations', path: '/organizer/registrations', icon: Users },
    { label: 'Matches', path: '/organizer/matches', icon: Sword },
    { label: 'Results', path: '/organizer/results', icon: CheckSquare },
    { label: 'Disputes', path: '/organizer/disputes', icon: AlertTriangle },
    { label: 'Prizes', path: '/organizer/prizes', icon: Gift },
    { label: 'Analytics', path: '/organizer/analytics', icon: BarChart2 },
    { label: 'Announcements', path: '/organizer/announcements', icon: Megaphone },
    { label: 'Settings', path: '/organizer/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#08080c] relative">
      {/* Play-Money Notice Banner */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-secondary/15 border-b border-secondary/25 py-2 px-4 flex items-center gap-2 text-[10px] md:text-xs text-secondary-text justify-center">
        <Info className="h-3.5 w-3.5 flex-shrink-0 text-secondary" />
        <span className="font-semibold text-center">
          VONK Tournaments currently operates as a frontend-only demonstration. Organizer actions, tournament publishing, registrations, match credentials, results, prizes and analytics are simulated locally.
        </span>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-card-border bg-[#0d0d13]/70 backdrop-blur-md pt-14 pb-6 px-4">
        {/* Profile Card Header */}
        <div className="flex items-center gap-3 p-3 mb-6 rounded-xl border border-card-border bg-card-bg/40">
          <div className="w-10 h-10 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center">
            <User className="h-5 w-5 text-secondary" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate">
              {organizer?.name || 'VONK Esports'}
            </h4>
            <span className="text-[10px] text-secondary-text font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
              Organizer Mode
            </span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.path || pathname?.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-secondary/15 text-secondary border border-secondary/25'
                    : 'text-muted hover:text-foreground hover:bg-card-bg/45 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-secondary' : 'text-muted'}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-secondary" />}
              </Link>
            );
          })}
        </nav>

        {/* Developer Sandbox Controls */}
        <div className="border-t border-card-border mt-6 pt-4 flex flex-col gap-2">
          <span className="text-[9px] uppercase font-bold text-muted tracking-wider">
            Demo Sandbox
          </span>
          <button
            onClick={() => {
              seedOrganizerData();
              alert('Organizer seed data loaded!');
              window.location.reload();
            }}
            className="w-full text-left px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/15 text-secondary text-[11px] font-bold transition-colors"
          >
            Seed Demo Tournaments
          </button>
          <button
            onClick={() => {
              resetOrganizerData();
              alert('Organizer workspace reset.');
              window.location.reload();
            }}
            className="w-full text-left px-3 py-1.5 rounded-lg bg-danger/10 hover:bg-danger/15 text-danger text-[11px] font-bold transition-colors"
          >
            Clear Local Workspace
          </button>
        </div>
      </aside>

      {/* Mobile Nav Top Bar */}
      <div className="md:hidden flex items-center justify-between border-b border-card-border bg-[#0d0d13]/90 pt-14 pb-3 px-4 w-full">
        <span className="font-extrabold text-sm text-gradient-secondary flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4" />
          VONK Organizer
        </span>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 rounded-lg border border-card-border bg-card-bg text-foreground hover:text-secondary transition-all"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile Drawer Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay background */}
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />
          {/* Content panel */}
          <div className="relative flex flex-col w-64 max-w-xs bg-[#0d0d13] border-r border-card-border p-5 pt-14 h-full">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-card-border bg-card-bg text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-6 border-b border-card-border pb-3">
              <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center">
                <User className="h-4 w-4 text-secondary" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-foreground truncate">{organizer?.name}</h5>
                <span className="text-[9px] text-secondary font-bold">Organizer Mode</span>
              </div>
            </div>
            <nav className="flex-1 flex flex-col gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.path || pathname?.startsWith(link.path + '/');
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-secondary/15 text-secondary'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Viewport content area */}
      <main className="flex-1 flex flex-col pt-14 md:pt-14 px-4 md:px-8 pb-12 overflow-y-auto">
        <div className="mt-8 md:mt-4 w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default OrganizerShell;
