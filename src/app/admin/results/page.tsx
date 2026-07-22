'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { CheckSquare, Trash2, RotateCcw } from 'lucide-react';

export default function AdminResultsPage() {
  const { results, removeDemoResult, recalculateLeaderboard } = useAdmin();

  const handleRemove = (id: string) => {
    if (confirm('Delete this demo result entry permanently?')) {
      removeDemoResult(id);
      alert('Result removed.');
    }
  };

  const handleRecalculate = (tournamentId: string) => {
    recalculateLeaderboard(tournamentId);
    alert('Leaderboard standings recalculated!');
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Global Match Results & Leaderboards
          </h1>
          <p className="text-xs text-muted">
            Inspect match placement scorecards, delete invalid demo results, and trigger leaderboard recalculations.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {results.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted border border-dashed border-card-border rounded-xl">
              No match results scorecards recorded.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-xl border border-card-border bg-card-bg/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold"
                >
                  <div className="flex flex-col">
                    <span className="font-extrabold text-foreground text-xs">
                      {res.participantName || 'Apex Team'} - {res.roundId || 'Round 1'}
                    </span>
                    <span className="text-[10px] text-muted font-mono">
                      Rank #{res.placement} | Kills: {res.kills} | Points: {res.totalPoints} | Tour: {res.tournamentId}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRecalculate(res.tournamentId)}
                      className="px-3 py-1.5 border border-card-border bg-card-bg text-muted hover:text-foreground text-[10px] font-extrabold rounded-lg flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Recalculate Standings
                    </button>
                    <button
                      onClick={() => handleRemove(res.id)}
                      className="p-1.5 rounded-lg border border-danger/30 bg-danger/10 text-danger"
                      title="Remove Result"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
