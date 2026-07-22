'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { useOrganizer } from '@/providers/OrganizerProvider';
import { localDisputeRepository } from '@/repositories/local/local-dispute-repository';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { AlertTriangle, Check, X } from 'lucide-react';

export default function DisputesPage() {
  const { resolveDispute } = useOrganizer();

  const disputes = useMemo(() => {
    return localDisputeRepository.getAll();
  }, []);

  const handleResolve = (id: string, decision: 'ACCEPTED' | 'REJECTED') => {
    const notes = prompt(`Enter resolution notes for dispute ${id}:`, `Decision resolved.`);
    if (notes) {
      resolveDispute(id, decision, notes);
      alert(`Dispute ${decision.toLowerCase()} successfully.`);
      window.location.reload();
    }
  };

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-secondary" />
            Fair-Play Disputes Center
          </h1>
          <p className="text-xs text-muted">
            Audit contestant appeals, review evidence snapshots, and apply score revision corrections.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted">Contestant Disputes Ledger</h3>
          {disputes.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted border border-dashed border-card-border rounded-xl bg-card-bg/5">
              No active disputes logged.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {disputes.map((d) => (
                <div 
                  key={d.id}
                  className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-card-bg/25 transition-all text-xs font-semibold"
                >
                  <div className="flex flex-col">
                    <span className="font-extrabold text-foreground text-xs block">
                      Dispute Appeal: {d.reason}
                    </span>
                    <p className="text-[11px] text-muted italic my-1">
                      &quot;{d.description}&quot;
                    </p>
                    <span className="text-[10px] text-muted block">
                      Submitted By: player-{d.submittedBy} | Status: <span className="font-bold text-secondary">{d.status}</span>
                    </span>
                  </div>

                  {d.status === 'OPEN' && (
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleResolve(d.id, 'REJECTED')}
                        className="px-3 py-1.5 bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger font-extrabold rounded-lg"
                      >
                        Reject Appeal
                      </button>
                      <button
                        onClick={() => handleResolve(d.id, 'ACCEPTED')}
                        className="px-3 py-1.5 bg-success/10 hover:bg-success/20 border border-success/25 text-success font-extrabold rounded-lg"
                      >
                        Accept & Correct
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </OrganizerShell>
  );
}
