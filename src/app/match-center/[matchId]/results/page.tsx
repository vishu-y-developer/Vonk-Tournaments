'use client';

import React, { use, useState, useMemo } from 'react';
import { useResults } from '@/providers/ResultProvider';
import { useTournaments } from '@/providers/TournamentProvider';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trophy, 
  Award, 
  Calendar, 
  ShieldAlert, 
  Info,
  Scale,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MatchResult } from '@/types';

interface Params {
  matchId: string;
}

export default function MatchCenterResultsPage({ params }: { params: Promise<Params> }) {
  const { matchId } = use(params);
  const { results, getMVP, getTopFragger, publishResult, loading } = useResults();
  const { tournaments } = useTournaments();

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all results for this specific match ID
  const matchResults = useMemo(() => {
    return results.filter((r) => r.matchId === matchId);
  }, [results, matchId]);

  // Retrieve the target tournament
  const tournament = useMemo(() => {
    if (matchResults.length === 0) return null;
    return tournaments.find((t) => t.id === matchResults[0].tournamentId) || null;
  }, [matchResults, tournaments]);

  // Filter match results rows
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return matchResults;
    const q = searchQuery.toLowerCase();
    return matchResults.filter(
      (r) =>
        (r.participantName || '').toLowerCase().includes(q) ||
        (r.teamName && r.teamName.toLowerCase().includes(q))
    );
  }, [matchResults, searchQuery]);

  // Round standings winner (top placement)
  const roundWinner = useMemo(() => {
    const winnerRow = matchResults.find((r) => r.placement === 1);
    return winnerRow ? (winnerRow.participantName || 'Apex Hunters') : 'TBD';
  }, [matchResults]);

  // Match MVP and Top Fragger snapshots
  const matchMVP = useMemo(() => {
    if (matchResults.length === 0) return null;
    return getMVP(matchResults[0].tournamentId, matchId);
  }, [matchResults, getMVP, matchId]);

  const matchTopFragger = useMemo(() => {
    if (matchResults.length === 0) return null;
    return getTopFragger(matchResults[0].tournamentId, matchId);
  }, [matchResults, getTopFragger, matchId]);

  if (loading) {
    return <div className="text-center py-12 text-xs text-muted">Retrieving match results...</div>;
  }

  if (matchResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 my-12">
        <Trophy className="h-12 w-12 text-muted mb-4 opacity-40 animate-pulse" />
        <h2 className="text-xl font-bold text-foreground">Match Results Pending</h2>
        <p className="text-xs text-muted max-w-sm mt-1.5 mb-6">
          The match lobby has either not started yet or results are currently undergoing referee evaluation.
        </p>
        <Link href="/results" className="px-5 py-2.5 bg-primary text-background font-black text-xs rounded-xl">
          Return to Career
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-0 space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/results"
          className="p-2 border border-border bg-card rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Match Center Scorecard</span>
          <h1 className="text-lg md:text-2xl font-black text-foreground">Lobby Match Results</h1>
        </div>
      </div>

      {/* Play money disclaimer */}
      <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/5 p-4 text-[10px] text-yellow-400 font-bold leading-relaxed">
        ⚠️ VONK Tournaments currently operates as a frontend-only demonstration. Results, scoring, rankings, MVP selections, disputes and leaderboard updates are simulated locally and are not connected to an official game server.
      </div>

      {/* Main Stats summaries cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="rounded-2xl border border-border bg-card p-4.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold text-muted uppercase">Round Winner</span>
            <span className="text-sm font-black text-primary block truncate">{roundWinner}</span>
          </div>
          <span className="h-9 w-9 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl text-base">
            🥇
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold text-muted uppercase">Match MVP</span>
            <span className="text-sm font-black text-foreground block truncate">{matchMVP ? matchMVP.reason : 'SouL_Mortal'}</span>
          </div>
          <span className="h-9 w-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-xl text-base">
            🎖️
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold text-muted uppercase">Top Fragger</span>
            <span className="text-sm font-black text-foreground block truncate">{matchTopFragger ? matchTopFragger.score + ' Kills' : '18 Kills'}</span>
          </div>
          <span className="h-9 w-9 bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center rounded-xl text-base">
            🔥
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center border-b border-border pb-4 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search by team or player name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-xs outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Main Results Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-black/30 font-bold text-muted uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4 text-center">Placement</th>
                <th className="py-3 px-4 text-center">Kills</th>
                <th className="py-3 px-4 text-center">Placement Pts</th>
                <th className="py-3 px-4 text-center">Kill Pts</th>
                <th className="py-3 px-4 text-center">Penalties</th>
                <th className="py-3 px-4 text-center text-primary">Total Pts</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((row, idx) => {
                const rank = idx + 1;
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;
                
                return (
                  <tr 
                    key={row.id} 
                    className={`hover:bg-white/5 transition-colors ${
                      isFirst ? 'bg-yellow-500/5' : isSecond ? 'bg-indigo-500/5' : isThird ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-black">
                      {isFirst ? '🥇 1' : isSecond ? '🥈 2' : isThird ? '🥉 3' : rank}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {row.teamName || row.participantName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">#{row.placement}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{row.kills}</td>
                    <td className="py-3.5 px-4 text-center font-mono">+{row.placementPoints}</td>
                    <td className="py-3.5 px-4 text-center font-mono">+{row.killPoints}</td>
                    <td className={`py-3.5 px-4 text-center font-mono font-bold ${
                      row.penaltyPoints && row.penaltyPoints > 0 ? 'text-red-400' : 'text-muted'
                    }`}>
                      {row.penaltyPoints && row.penaltyPoints > 0 ? `-${row.penaltyPoints}` : '0'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-black font-mono text-primary text-sm">
                      {row.totalPoints}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link 
                        href={`/results/${row.id}`}
                        className="px-2.5 py-1 bg-white/5 border border-border hover:bg-white/10 text-[10px] font-bold rounded-lg transition-all"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
