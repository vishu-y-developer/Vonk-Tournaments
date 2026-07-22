'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Link from 'next/link';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import DashboardCards from '@/components/admin/DashboardCards';
import AuditTable from '@/components/admin/AuditTable';
import ReportCard from '@/components/admin/ReportCard';
import { 
  Users, 
  Shield, 
  Trophy, 
  Flag, 
  Megaphone, 
  Settings, 
  Activity, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { analytics, auditLogs, reports, resolveReport } = useAdmin();

  const openReports = reports.filter((r) => r.status === 'OPEN' || r.status === 'REVIEWING');

  const quickActions = [
    { label: 'Manage Players', href: '/admin/players', icon: Users, color: 'border-primary/30 text-primary' },
    { label: 'Manage Organizers', href: '/admin/organizers', icon: Shield, color: 'border-secondary/30 text-secondary' },
    { label: 'Manage Tournaments', href: '/admin/tournaments', icon: Trophy, color: 'border-success/30 text-success' },
    { label: 'Moderate Reports', href: '/admin/reports', icon: Flag, color: 'border-danger/30 text-danger' },
    { label: 'Platform Announcements', href: '/admin/announcements', icon: Megaphone, color: 'border-warning/30 text-warning' },
    { label: 'Platform Settings', href: '/admin/settings', icon: Settings, color: 'border-primary/30 text-primary' },
  ];

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Platform Overview Dashboard
            </h1>
            <p className="text-xs text-muted">
              Global administration, moderation oversight, platform activity audit, and system limits control.
            </p>
          </div>
        </div>

        {/* Dashboard Metrics Grid */}
        <DashboardCards analytics={analytics} />

        {/* Quick Action Shortcuts */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold text-muted tracking-wider">
            Quick Administrative Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((act) => {
              const Icon = act.icon;
              return (
                <Link
                  key={act.label}
                  href={act.href}
                  className={`p-3.5 rounded-xl border bg-card-bg/20 hover:bg-card-bg/40 flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02] ${act.color}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-extrabold">{act.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Open Reports & Recent Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Open Reports */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase font-extrabold text-foreground tracking-wider flex items-center gap-1.5">
                <Flag className="h-4 w-4 text-danger" />
                Moderation Queue ({openReports.length})
              </h3>
              <Link href="/admin/reports" className="text-[10px] text-muted hover:text-foreground flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {openReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted border border-dashed border-card-border rounded-xl">
                No open moderation reports.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {openReports.slice(0, 3).map((rep) => (
                  <ReportCard key={rep.id} report={rep} onResolve={resolveReport} />
                ))}
              </div>
            )}
          </div>

          {/* Audit Logs */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase font-extrabold text-foreground tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-primary" />
                Recent System Audit Logs
              </h3>
            </div>
            <AuditTable logs={auditLogs.slice(0, 5)} />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
