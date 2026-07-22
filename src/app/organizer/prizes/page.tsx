'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { useOrganizer } from '@/providers/OrganizerProvider';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { Gift, Check } from 'lucide-react';
import Link from 'next/link';

export default function PrizesHubPage() {
  const { managedTournaments, prizeDistributions, calculatePrizeDistribution, approvePrizeDistribution, creditDemoPrizes } = useOrganizer();

  const handleCalculate = (tourId: string) => {
    calculatePrizeDistribution(tourId);
    alert('Prize ledger calculated.');
    window.location.reload();
  };

  const handleApprove = (tourId: string) => {
    approvePrizeDistribution(tourId);
    alert('Prize ledger approved.');
    window.location.reload();
  };

  const handleCredit = (tourId: string) => {
    try {
      creditDemoPrizes(tourId);
      alert('Demo prizes successfully credited!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Payout failed.');
    }
  };

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Gift className="h-6 w-6 text-secondary" />
            Prize Distribution ledger Audit
          </h1>
          <p className="text-xs text-muted">
            Configure placement payout percentages, calculate winners splits, and approve simulated demo credits.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted">Tournament Payout Records</h3>
          {managedTournaments.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">No tournaments managed.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {managedTournaments.map((t) => {
                const dist = prizeDistributions.find((p) => p.tournamentId === t.id);
                return (
                  <div 
                    key={t.id}
                    className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold"
                  >
                    <div>
                      <span className="font-extrabold text-foreground text-xs block">{t.title}</span>
                      <span className="text-[10px] text-muted block mt-0.5">
                        Prize Pool: ₹{t.prizePool} | Status: <span className="font-bold text-secondary">{dist ? dist.status : 'NOT_READY'}</span>
                      </span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      {!dist && (
                        <button
                          onClick={() => handleCalculate(t.id)}
                          className="px-3.5 py-2 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-lg text-[10px]"
                        >
                          Calculate Ledger
                        </button>
                      )}
                      {dist && dist.status === 'CALCULATED' && (
                        <button
                          onClick={() => handleApprove(t.id)}
                          className="px-3.5 py-2 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-lg text-[10px]"
                        >
                          Approve Distribution
                        </button>
                      )}
                      {dist && dist.status === 'APPROVED' && (
                        <button
                          onClick={() => handleCredit(t.id)}
                          className="px-3.5 py-2 bg-success/15 hover:bg-success/25 border border-success/30 text-success font-extrabold rounded-lg text-[10px]"
                        >
                          Credit Demo Winnings
                        </button>
                      )}
                      {dist && dist.status === 'CREDITED' && (
                        <span className="flex items-center gap-1 text-[10px] text-success font-extrabold uppercase border border-success/20 bg-success/5 px-3 py-1.5 rounded-lg">
                          <Check className="h-3.5 w-3.5" />
                          Credited successfully
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </OrganizerShell>
  );
}
