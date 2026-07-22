'use client';

import React, { useMemo } from 'react';
import { useOrganizer } from '@/providers/OrganizerProvider';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { BarChart2, TrendingUp, Users, Trophy, Gift, ArrowRight } from 'lucide-react';

export default function AnalyticsPage() {
  const { managedTournaments } = useOrganizer();

  const metrics = useMemo(() => {
    const total = managedTournaments.length;
    const prizeSum = managedTournaments.reduce((sum, t) => sum + (t.prizePool || 0), 0);
    const entryFeeSum = managedTournaments.reduce((sum, t) => sum + (t.entryFee || 0), 0);
    const slotsFilled = managedTournaments.reduce((sum, t) => sum + (t.registeredParticipants || 0), 0);

    return {
      total,
      prizeSum,
      avgEntryFee: total > 0 ? Math.round(entryFeeSum / total) : 0,
      slotsFilled
    };
  }, [managedTournaments]);

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-secondary" />
            Organizer Analytics dashboard
          </h1>
          <p className="text-xs text-muted">
            Track slot fill ratios, audit registration conversions, and audit ledger prizes payouts.
          </p>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-card-border bg-card-bg/25 flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted">
              <span>Managed Tournaments</span>
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl font-black font-mono tracking-tight text-foreground">
              {metrics.total}
            </h3>
            <span className="text-[9px] text-muted">Drafts and live structures combined</span>
          </div>

          <div className="p-4 rounded-xl border border-card-border bg-card-bg/25 flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted">
              <span>Demo Prize Pools Split</span>
              <Gift className="h-4 w-4 text-gradient-prize" />
            </div>
            <h3 className="text-2xl font-black font-mono tracking-tight text-foreground">
              ₹{metrics.prizeSum}
            </h3>
            <span className="text-[9px] text-muted">Total allocated value pool</span>
          </div>

          <div className="p-4 rounded-xl border border-card-border bg-card-bg/25 flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted">
              <span>Average Entry Fees</span>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </div>
            <h3 className="text-2xl font-black font-mono tracking-tight text-foreground">
              ₹{metrics.avgEntryFee}
            </h3>
            <span className="text-[9px] text-muted">Per tournament average fee</span>
          </div>

          <div className="p-4 rounded-xl border border-card-border bg-card-bg/25 flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted">
              <span>Total Slots Booked</span>
              <Users className="h-4 w-4 text-secondary" />
            </div>
            <h3 className="text-2xl font-black font-mono tracking-tight text-foreground">
              {metrics.slotsFilled}
            </h3>
            <span className="text-[9px] text-muted">Combined confirmed registrations</span>
          </div>
        </div>

        {/* Static graphical indicators */}
        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/15 flex flex-col gap-4">
          <h4 className="text-xs font-extrabold text-foreground uppercase">Audience Engagement split</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 border border-card-border p-4 rounded-xl">
              <span className="text-[9px] text-muted uppercase">Slot Utilization Ratio</span>
              <span className="text-xl font-bold font-mono">85%</span>
              <div className="w-full bg-card-bg h-2 rounded-full overflow-hidden border border-card-border mt-1">
                <div className="bg-secondary h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-2 border border-card-border p-4 rounded-xl">
              <span className="text-[9px] text-muted uppercase">Registration Conversions</span>
              <span className="text-xl font-bold font-mono">92%</span>
              <div className="w-full bg-card-bg h-2 rounded-full overflow-hidden border border-card-border mt-1">
                <div className="bg-success h-full rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrganizerShell>
  );
}
