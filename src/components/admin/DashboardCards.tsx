'use client';

import React from 'react';
import { Users, Shield, Trophy, Sword, Wallet, AlertTriangle, Flag, Activity } from 'lucide-react';
import { PlatformAnalyticsOverview } from '@/types';

export const DashboardCards: React.FC<{ analytics: PlatformAnalyticsOverview }> = ({ analytics }) => {
  const cards = [
    { label: 'Total Players', value: analytics.totalPlayers, icon: Users, color: 'text-primary' },
    { label: 'Total Teams', value: analytics.totalTeams, icon: Shield, color: 'text-secondary' },
    { label: 'Total Organizers', value: analytics.totalOrganizers, icon: Activity, color: 'text-success' },
    { label: 'Total Tournaments', value: analytics.totalTournaments, icon: Trophy, color: 'text-secondary' },
    { label: 'Live Tournaments', value: analytics.activeTournaments, icon: Activity, color: 'text-primary' },
    { label: 'Registrations', value: analytics.totalRegistrations, icon: Users, color: 'text-success' },
    { label: 'Matches', value: analytics.totalMatches, icon: Sword, color: 'text-secondary' },
    { label: 'Published Results', value: analytics.totalResults, icon: Trophy, color: 'text-primary' },
    { label: 'Pending Disputes', value: analytics.pendingDisputes, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Demo Prize Credits', value: `₹${analytics.totalPrizePayouts}`, icon: Wallet, color: 'text-gradient-prize' },
    { label: 'Reports', value: analytics.totalReports, icon: Flag, color: 'text-danger' },
    { label: 'Platform Activity', value: 'Active', icon: Activity, color: 'text-success' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div 
            key={c.label}
            className="p-4 rounded-xl border border-card-border bg-card-bg/25 flex flex-col gap-2 hover:border-card-hover-border transition-all"
          >
            <div className="flex justify-between items-center text-[10px] uppercase font-extrabold text-muted">
              <span>{c.label}</span>
              <Icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <span className="text-xl md:text-2xl font-black font-mono tracking-tight text-foreground">
              {c.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
