'use client';

import React, { use, useState, useMemo } from 'react';
import { useResultDetails } from '@/hooks/useResultDetails';
import { useResults } from '@/providers/ResultProvider';
import { useTournaments } from '@/providers/TournamentProvider';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trophy, 
  Award, 
  Calendar, 
  ShieldAlert, 
  FileText, 
  History, 
  Info,
  ChevronRight,
  AlertTriangle,
  Scale
} from 'lucide-react';

interface Params {
  resultId: string;
}

export default function ResultDetailsPage({ params }: { params: Promise<Params> }) {
  const { resultId } = use(params);
  const { result, penalties, revisions, loading } = useResultDetails(resultId);
  const { disputeResult, disputes } = useResults();
  const { getTournamentById } = useTournaments();
  const { user } = useAuth();

  const [disputing, setDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Score Incorrect');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const tournament = result ? getTournamentById(result.tournamentId) : null;

  // Find existing dispute for this result
  const activeDispute = useMemo(() => {
    return disputes.find((d) => d.resultId === resultId);
  }, [disputes, resultId]);

  const handleOpenDispute = () => {
    setDisputing(true);
    setDisputeReason('Score Incorrect');
    setDisputeDesc('');
  };

  const handleConfirmDispute = () => {
    if (!result || !user) return;
    setSubmittingDispute(true);
    setTimeout(() => {
      disputeResult(result.id, user.id, disputeReason, disputeDesc);
      setSubmittingDispute(false);
      setDisputing(false);
      alert('Appeal dispute submitted successfully! Our mock moderators will review this within 15 minutes.');
    }, 800);
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-muted">Retrieving result details...</div>;
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 my-12">
        <AlertTriangle className="h-12 w-12 text-muted mb-4 opacity-40" />
        <h2 className="text-xl font-bold text-foreground">Score Record Not Found</h2>
        <p className="text-xs text-muted max-w-sm mt-1.5 mb-6">
          The result identifier does not correspond to an active tournament score record.
        </p>
        <Link href="/results" className="px-5 py-2.5 bg-primary text-background font-black text-xs rounded-xl">
          Return to Career
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-0 space-y-6">
      {/* Header back navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/results"
          className="p-2 border border-border bg-card rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Lobby Score sheet</span>
          <h1 className="text-lg md:text-2xl font-black text-foreground">Score Breakdown details</h1>
        </div>
      </div>

      {/* Main split viewport layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Main Score break sheet */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Score Breakdown details */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-border/40 pb-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                  Round: {result.roundId || 'Stage 1'}
                </span>
                <h3 className="text-base font-black text-foreground pt-1">
                  {result.teamName ? `Team: ${result.teamName}` : `Player: ${result.participantName}`}
                </h3>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[9px] font-black uppercase text-muted block">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                  result.status === 'FINAL' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : result.status === 'CORRECTED'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {result.status}
                </span>
              </div>
            </div>

            {/* Score math breakdown table */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black uppercase text-foreground tracking-wider">Point Calculation Logic</h4>
              
              <div className="rounded-xl border border-border/60 bg-black/20 p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Placement Finish:</span>
                  <span className="font-bold text-foreground">#{result.placement}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Placement Points:</span>
                  <span className="font-bold text-foreground font-mono">+{result.placementPoints || 0} Pts</span>
                </div>
                <div className="flex justify-between text-muted-foreground border-b border-border/40 pb-2">
                  <span>Kills Count ({result.kills}):</span>
                  <span className="font-bold text-foreground font-mono">+{result.killPoints || 0} Pts</span>
                </div>
                <div className="flex justify-between text-muted-foreground border-b border-border/40 pb-2">
                  <span>Bonus Rewards:</span>
                  <span className="font-bold text-green-400 font-mono">+{result.bonusPoints || 0} Pts</span>
                </div>
                <div className="flex justify-between text-muted-foreground border-b border-border/40 pb-2">
                  <span>Penalties Deductions:</span>
                  <span className="font-bold text-red-400 font-mono">-{result.penaltyPoints || 0} Pts</span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="font-black text-foreground">Total Match Points:</span>
                  <span className="font-black text-primary font-mono text-base">{result.totalPoints || 0} Pts</span>
                </div>
              </div>
            </div>

            {/* Game Telemetry metrics */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-foreground tracking-wider">Match Stats Snapshot</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-[#0a0a0f] border border-border/60 rounded-xl space-y-0.5">
                  <span className="text-[8px] font-bold text-muted uppercase">Damage Dealt</span>
                  <span className="font-bold text-foreground block font-mono">{result.damage || 0} HP</span>
                </div>
                <div className="p-3 bg-[#0a0a0f] border border-border/60 rounded-xl space-y-0.5">
                  <span className="text-[8px] font-bold text-muted uppercase">Assists</span>
                  <span className="font-bold text-foreground block font-mono">{result.assists || 0}</span>
                </div>
                <div className="p-3 bg-[#0a0a0f] border border-border/60 rounded-xl space-y-0.5">
                  <span className="text-[8px] font-bold text-muted uppercase">Survival Time</span>
                  <span className="font-bold text-foreground block font-mono">{Math.floor((result.survivalTime || 0) / 60)} min</span>
                </div>
                <div className="p-3 bg-[#0a0a0f] border border-border/60 rounded-xl space-y-0.5">
                  <span className="text-[8px] font-bold text-muted uppercase">K/D Match Share</span>
                  <span className="font-bold text-primary block font-mono">{(result.kills || 0)} Kills</span>
                </div>
              </div>
            </div>
          </div>

          {/* Penalties Issued breakdown lists */}
          {penalties.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3 text-red-400">
                <ShieldAlert className="h-4 w-4" />
                <h3 className="text-sm font-black uppercase text-foreground tracking-wider">Referees Penalties Log ({penalties.length})</h3>
              </div>

              <div className="space-y-3 text-xs">
                {penalties.map((pen) => (
                  <div key={pen.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-red-400 block">{pen.type}</span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{pen.reason}</p>
                      <span className="text-[9px] text-muted block">Issued By: {pen.issuedBy} • {new Date(pen.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-red-400 font-mono text-base">-{pen.points} Pts</span>
                      <span className="text-[8px] font-bold bg-white/5 border border-border px-1.5 py-0.5 rounded text-muted block mt-1 uppercase">
                        Status: {pen.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result Revision History */}
          {revisions.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3 text-indigo-400">
                <History className="h-4 w-4" />
                <h3 className="text-sm font-black uppercase text-foreground tracking-wider">Correction Revision History ({revisions.length})</h3>
              </div>

              <div className="space-y-4 relative pl-4 before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-[1px] before:bg-border text-xs">
                {revisions.map((rev) => (
                  <div key={rev.id} className="relative space-y-2">
                    <div className="absolute -left-[14.5px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-card" />
                    <div className="flex justify-between items-center text-[10px] text-muted font-bold">
                      <span className="text-foreground">Revision #{rev.revisionNumber}</span>
                      <span>{new Date(rev.correctedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Correction Reason: <strong className="text-foreground">{rev.reason}</strong>
                    </p>
                    <div className="rounded-lg border border-border bg-black/10 p-2.5 text-[10px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted">Previous points summary:</span>
                        <span className="font-mono">Placement: {rev.previousValues.placement} • Kills: {rev.previousValues.kills} &rarr; <span className="font-black text-red-400">{rev.previousValues.totalPoints} Pts</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Updated corrected points summary:</span>
                        <span className="font-mono">Placement: {rev.newValues.placement} • Kills: {rev.newValues.kills} &rarr; <span className="font-black text-green-400">{rev.newValues.totalPoints} Pts</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Columns: Match context details and disputes appeals */}
        <div className="space-y-4">
          
          {/* Target Tournament metadata card */}
          {tournament && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 text-xs">
              <span className="text-[10px] font-black uppercase text-muted tracking-wider block">Tournament Context</span>
              
              <div className="aspect-video w-full rounded-xl overflow-hidden relative border border-border bg-black/25">
                <img 
                  src={tournament.banner} 
                  alt="Banner" 
                  className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[8px] font-black uppercase bg-primary text-background px-1.5 py-0.5 rounded">
                    {tournament.mode}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate mt-1">{tournament.title}</h4>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted">Match Map:</span>
                  <span className="font-bold text-foreground">{tournament.map} ({tournament.perspective})</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted">Published Round:</span>
                  <span className="font-bold text-foreground">{result.roundId || 'Stage 1'}</span>
                </div>
              </div>

              <Link 
                href={`/tournaments/${tournament.slug}/leaderboard`}
                className="w-full py-2 bg-primary hover:bg-yellow-500 text-background font-black text-xs text-center rounded-lg transition-all block"
              >
                View Full Standings Leaderboard
              </Link>
            </div>
          )}

          {/* Disputes appeals widget */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3 text-primary">
              <Scale className="h-4 w-4" />
              <h3 className="text-xs font-black uppercase text-foreground tracking-wider">Score Appeals Lobby</h3>
            </div>

            {activeDispute ? (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider">Appeal Status: {activeDispute.status}</span>
                  <span className="text-[9px] text-muted">{new Date(activeDispute.submittedAt).toLocaleDateString()}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">Issue: {activeDispute.reason}</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{activeDispute.description}</p>
                </div>
                {activeDispute.resolution && (
                  <div className="pt-2 border-t border-border/60 space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-green-400 block">Resolution response:</span>
                    <p className="text-[11px] text-green-400/90 leading-relaxed font-bold">{activeDispute.resolution}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Notice something incorrect with your kills count or placements? Raise a mock dispute appeal for referees checkout.
                </p>
                <button
                  onClick={handleOpenDispute}
                  className="w-full py-2 border border-border bg-transparent text-muted hover:text-foreground text-xs font-bold text-center rounded-lg transition-all"
                >
                  Raise Dispute Appeal
                </button>
              </div>
            )}
          </div>

          {/* Play money disclaimer */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-[10px] text-muted-foreground leading-relaxed">
            <div className="flex gap-2">
              <Info className="h-4 w-4 shrink-0 text-primary" />
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Simulated Scorecard</span>
                <p>
                  Scoring points, check-in penalty logs, and appeals resolution updates are for demonstration purposes inside local browser local storage only.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Dispute Modal dialog */}
      {disputing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setDisputing(false)} />
          <div className="relative rounded-2xl border border-border bg-card p-6 max-w-sm w-full space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Submit Score Appeal Dispute</h3>
              <span className="text-[10px] text-muted font-bold">Result ID: {result.id}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted">Appeal Category</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full rounded-xl border border-border bg-black/25 py-2 px-3 outline-none"
                >
                  <option value="Score Incorrect">Kills count is incorrect</option>
                  <option value="Placement Incorrect">Placement ranking is incorrect</option>
                  <option value="Rule Violation">Opponents teaming rule violation</option>
                  <option value="Other">Other dispute reason</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted">Appeal details description</label>
                <textarea
                  placeholder="Explain the score discrepancy or rules violation..."
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  className="w-full h-20 rounded-xl border border-border bg-black/25 p-2.5 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDisputing(false)}
                className="flex-1 py-2 border border-border bg-transparent text-muted hover:text-foreground hover:bg-white/5 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={submittingDispute || !disputeDesc.trim()}
                onClick={handleConfirmDispute}
                className="flex-1 py-2 bg-primary text-background font-black text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                {submittingDispute ? 'Submitting...' : 'Send Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
