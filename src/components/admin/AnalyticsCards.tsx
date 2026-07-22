'use client';

import React from 'react';
import { PlatformAnalyticsOverview } from '@/types';
import { TrendingUp, Users, Shield, Trophy, Activity } from 'lucide-react';

export const AnalyticsCards: React.FC<{ analytics: PlatformAnalyticsOverview }> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl border border-card-border bg-card-bg/25 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted">
          <span>Active Users & Teams</span>
          <Users className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl font-black font-mono text-foreground">{analytics.totalPlayers + analytics.totalTeams}</span>
        <span className="text-[9px] text-muted">{analytics.totalPlayers} Players, {analytics.totalTeams} Teams</span>
      </div>

      <div className="p-4 rounded-xl border border-card-border bg-card-bg/25 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted">
          <span>Total Prize Pool Pool Value</span>
          <Trophy className="h-4 w-4 text-gradient-prize" />
        </div>
        <span className="text-2xl font-black font-mono text-foreground">₹{analytics.totalPrizePayouts}</span>
        <span className="text-[9px] text-muted">Across {analytics.totalTournaments} tournaments</span>
      </div>

      <div className="p-4 rounded-xl border border-card-border bg-card-bg/25 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted">
          <span>Disputes & Moderation</span>
          <Activity className="h-4 w-4 text-warning" />
        </div>
        <span className="text-2xl font-black font-mono text-foreground">{analytics.pendingDisputes} Pending</span>
        <span className="text-[9px] text-muted">{analytics.totalReports} active reports</span>
      </div>
    </div>
  );
};

export default AnalyticsCards;
