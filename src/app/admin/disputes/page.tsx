'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { useOrganizer } from '@/providers/OrganizerProvider';
import { localDisputeRepository } from '@/repositories/local/local-dispute-repository';
import AdminShell from '@/components/admin/AdminShell';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { AlertTriangle, Check, X } from 'lucide-react';

export default function AdminDisputesPage() {
  const { resolveDispute } = useOrganizer();

  const disputes = useMemo(() => {
    return localDisputeRepository.getAll();
  }, []);

  const handleResolve = (id: string, decision: 'ACCEPTED' | 'REJECTED') => {
    const notes = prompt(`Enter admin resolution notes for dispute ${id}:`, `Admin override decision.`);
    if (notes) {
      resolveDispute(id, decision, notes);
      alert(`Dispute ${decision.toLowerCase()} successfully.`);
      window.location.reload();
    }
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-warning" />
            Platform Disputes Resolution Panel
          </h1>
          <p className="text-xs text-muted">
            Overrule tournament match disputes, review contestant proof evidence, and correct score revisions.
          </p>
        </div>

        {disputes.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted border border-dashed border-card-border rounded-xl">
            No active disputes logged.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-card-border bg-card-bg/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold"
              >
                <div className="flex flex-col">
                  <span className="font-extrabold text-foreground text-xs block">
                    Dispute: {d.reason}
                  </span>
                  <p className="text-[11px] text-muted italic my-1">
                    &quot;{d.description}&quot;
                  </p>
                  <span className="text-[10px] text-muted block">
                    Submitted By: player-{d.submittedBy} | Status: <UserStatusBadge status={d.status} />
                  </span>
                </div>

                {d.status === 'OPEN' && (
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleResolve(d.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-danger/15 hover:bg-danger/25 border border-danger/30 text-danger font-extrabold rounded-lg text-[10px]"
                    >
                      Reject Appeal
                    </button>
                    <button
                      onClick={() => handleResolve(d.id, 'ACCEPTED')}
                      className="px-3 py-1.5 bg-success/15 hover:bg-success/25 border border-success/30 text-success font-extrabold rounded-lg text-[10px]"
                    >
                      Accept Appeal
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
