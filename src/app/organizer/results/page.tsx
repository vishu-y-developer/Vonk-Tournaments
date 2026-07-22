'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { useOrganizer } from '@/providers/OrganizerProvider';
import { localResultRepository } from '@/repositories/local/local-result-repository';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { CheckSquare, Check, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ResultsHubPage() {
  const { managedTournaments, publishResult } = useOrganizer();

  const results = useMemo(() => {
    return localResultRepository.getAll();
  }, [managedTournaments]);

  const handlePublish = (id: string) => {
    if (confirm('Are you sure you want to publish these match results? Standings will update.')) {
      try {
        publishResult(id);
        alert('Results published successfully!');
        window.location.reload();
      } catch (err: any) {
        alert(err.message || 'Failed to publish.');
      }
    }
  };

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-secondary" />
            Results & Scorecard Center
          </h1>
          <p className="text-xs text-muted">
            Enter placement statistics, review draft cards, correct errors, and publish scores to recalculate leaderboards.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted">Match Scorecards Checklist</h3>
          {results.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted border border-dashed border-card-border rounded-xl bg-card-bg/5">
              No results scorecards found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((res) => (
                <div 
                  key={res.id}
                  className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-card-bg/25 transition-all text-xs font-semibold"
                >
                  <div className="flex flex-col">
                    <span className="font-extrabold text-foreground text-xs block">
                      {res.participantName || 'Apex Roster'} - Round: {res.roundId || 'Round 1'}
                    </span>
                    <span className="text-[10px] text-muted block mt-0.5">
                      Tournament ID: {res.tournamentId} | Status: <span className="font-bold text-secondary">{res.status}</span>
                    </span>
                    <span className="text-[10px] text-muted block font-mono">
                      Rank #{res.placement} | Kills: {res.kills} | Points: {res.totalPoints}
                    </span>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Link
                      href={`/organizer/tournaments/${res.tournamentId}`}
                      className="px-3 py-1.5 rounded-lg border border-card-border bg-card-bg text-[10px] font-bold text-muted hover:text-foreground transition-all"
                    >
                      Manage Panel
                    </Link>
                    {res.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublish(res.id)}
                        className="px-3 py-1.5 bg-success/15 hover:bg-success/25 border border-success/30 text-success rounded-lg text-[10px] font-extrabold"
                      >
                        Publish Scores
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </OrganizerShell>
  );
}
