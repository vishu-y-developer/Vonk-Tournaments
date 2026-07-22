'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import AnalyticsCards from '@/components/admin/AnalyticsCards';
import { BarChart2, TrendingUp, Users, Activity } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { analytics } = useAdmin();

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            Platform Analytics & Health
          </h1>
          <p className="text-xs text-muted">
            Aggregated system performance metrics, user engagement conversions, and simulated prize volume statistics.
          </p>
        </div>

        <AnalyticsCards analytics={analytics} />

        {/* Operational activity chart breakdown */}
        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/15 flex flex-col gap-4">
          <h4 className="text-xs font-extrabold text-foreground uppercase">Platform Activity Over Time</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {analytics.platformActivityOverTime.map((stat) => (
              <div key={stat.date} className="p-4 rounded-xl border border-card-border bg-card-bg/30 flex flex-col gap-2">
                <span className="text-[10px] text-muted font-bold uppercase">{stat.date}</span>
                <span className="text-xl font-black font-mono text-primary">{stat.registrations} Regs</span>
                <span className="text-[10px] text-muted">{stat.tournaments} Hosted Tournaments</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
