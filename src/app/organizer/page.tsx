'use client';

import React from 'react';
import Link from 'next/link';
import { useOrganizer } from '@/providers/OrganizerProvider';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { 
  Trophy, 
  Users, 
  Sword, 
  CheckSquare, 
  AlertTriangle, 
  Gift, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Settings,
  Calendar,
  Activity,
  Play,
  ArrowRight
} from 'lucide-react';

export default function OrganizerDashboardPage() {
  const { organizerSummary, organizerActivities, managedTournaments } = useOrganizer();

  const stats = [
    { label: 'Total Tournaments', value: organizerSummary?.totalTournaments || 0, icon: Trophy, color: 'text-primary' },
    { label: 'Draft Tournaments', value: organizerSummary?.draftTournaments || 0, icon: Trophy, color: 'text-muted' },
    { label: 'Published Live', value: organizerSummary?.publishedTournaments || 0, icon: Trophy, color: 'text-secondary' },
    { label: 'Registrations', value: organizerSummary?.totalRegistrations || 0, icon: Users, color: 'text-primary' },
    { label: 'Pending Approvals', value: organizerSummary?.pendingApprovals || 0, icon: Users, color: 'text-warning' },
    { label: 'Upcoming Matches', value: organizerSummary?.upcomingMatches || 0, icon: Sword, color: 'text-secondary' },
    { label: 'Open Disputes', value: organizerSummary?.openDisputes || 0, icon: AlertTriangle, color: 'text-danger' },
    { label: 'Prize Pool Pool', value: `₹${organizerSummary?.demoPrizeObligations || 0}`, icon: Gift, color: 'text-gradient-prize' }
  ];

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase">
              Organizer Control Center
            </h1>
            <p className="text-xs text-muted">
              Configure tournaments brackets, seed match schedules, approve participants teams, and audit ledger transactions logs.
            </p>
          </div>
          <Link
            href="/organizer/tournaments/create"
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-all hover:scale-[1.02] shadow-md glow-secondary"
          >
            <Plus className="h-4 w-4" />
            Create Tournament
          </Link>
        </div>

        {/* Dashboard Grid Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="p-4 rounded-xl border border-card-border bg-card-bg/30 flex flex-col gap-3 group hover:border-card-hover-border transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted">
                    {stat.label}
                  </span>
                  <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
                </div>
                <h3 className="text-xl md:text-2xl font-black font-mono tracking-tight text-foreground group-hover:scale-[1.01] transition-transform">
                  {stat.value}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Layout split: Quick Actions & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Quick actions box */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              Quick Shortcuts
            </h3>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/organizer/tournaments/create"
                className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-card-bg/20 hover:bg-card-bg hover:border-secondary/35 transition-all text-xs font-bold text-foreground"
              >
                <span>Create Tournament Draft</span>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
              <Link
                href="/organizer/registrations"
                className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-card-bg/20 hover:bg-card-bg hover:border-secondary/35 transition-all text-xs font-bold text-foreground"
              >
                <span>Audit Pending Team Approvals</span>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
              <Link
                href="/organizer/matches"
                className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-card-bg/20 hover:bg-card-bg hover:border-secondary/35 transition-all text-xs font-bold text-foreground"
              >
                <span>Configure Matches & Rooms</span>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
              <Link
                href="/organizer/results"
                className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-card-bg/20 hover:bg-card-bg hover:border-secondary/35 transition-all text-xs font-bold text-foreground"
              >
                <span>Audit Round Scoresheets</span>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
              <Link
                href="/organizer/analytics"
                className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-card-bg/20 hover:bg-card-bg hover:border-secondary/35 transition-all text-xs font-bold text-foreground"
              >
                <span>Audience Metrics Analytics</span>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            </div>
          </div>

          {/* Activities list timeline */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Recent Organizer Activity Logs
            </h3>
            
            {organizerActivities.length === 0 ? (
              <div className="p-12 rounded-xl border border-dashed border-card-border bg-card-bg/10 text-center flex flex-col items-center justify-center gap-2">
                <Activity className="h-8 w-8 text-muted/30" />
                <span className="text-xs font-bold text-muted">No recent operations logs.</span>
                <span className="text-[10px] text-muted">Create a tournament draft or audit results to log activity.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {organizerActivities.slice(0, 5).map((act) => (
                  <div 
                    key={act.id}
                    className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex flex-col gap-1 hover:bg-card-bg/25 transition-all"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-extrabold text-foreground tracking-wide">
                        {act.title}
                      </span>
                      <span className="text-[9px] font-mono text-muted">
                        {new Date(act.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Demo Action Panel */}
        <div className="p-6 rounded-2xl border border-secondary/20 bg-secondary/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
              <Play className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                Demo Organizer Simulation Controls
              </h4>
              <p className="text-[10px] text-muted">
                Add mock check-ins, resolve open disputes, or trigger automated prize credits for local testing.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/organizer/tournaments"
              className="px-4.5 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Manage Tournaments List</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </OrganizerShell>
  );
}
