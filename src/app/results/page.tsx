'use client';

import React, { useState, useMemo } from 'react';
import { useResults } from '@/providers/ResultProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useTournaments } from '@/providers/TournamentProvider';
import Link from 'next/link';
import { Trophy, Calendar, Search, ShieldAlert, Award, FileText, ArrowRight, Shield } from 'lucide-react';
import { MatchResult } from '@/types';

export default function ResultsHubPage() {
  const { results, loading, disputes, seedResultData } = useResults();
  const { user } = useAuth();
  const { tournaments } = useTournaments();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SOLO' | 'TEAM'>('ALL');

  const getTournamentTitle = (tId: string) => {
    const t = tournaments.find((item) => item.id === tId);
    return t ? t.title : 'VONK Arena';
  };

  const getTournamentBanner = (tId: string) => {
    const t = tournaments.find((item) => item.id === tId);
    return t ? t.banner : '/images/default-banner.jpg';
  };

  // User participant results
  const myResults = useMemo(() => {
    if (!user) return [];
    
    // Find all results matching the player's ID or their team ID (from results list)
    return results.filter((r) => {
      const isPlayer = r.participantId === user.id;
      // Also match if user's team matches
      const isTeam = r.teamId && r.participantId === r.teamId;
      return isPlayer || isTeam;
    });
  }, [results, user]);

  const filtered = useMemo(() => {
    let list = [...myResults];

    if (filterType === 'SOLO') {
      list = list.filter((r) => !r.teamId);
    } else if (filterType === 'TEAM') {
      list = list.filter((r) => !!r.teamId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          (r.roundId || '').toLowerCase().includes(q) ||
          getTournamentTitle(r.tournamentId).toLowerCase().includes(q)
      );
    }

    return list;
  }, [myResults, filterType, searchQuery, tournaments]);

  return (
    <div className="py-6 px-4 md:px-0 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Career Hall of Fame</span>
          <h1 className="text-xl md:text-2xl font-black text-foreground">Performance Results</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review your historical scores, placement positions, kills achievements, and penalties record.
          </p>
        </div>

        {/* Demo trigger helper */}
        <button 
          onClick={seedResultData}
          className="px-3.5 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-black rounded-xl transition-all"
        >
          Seed Demo Results
        </button>
      </div>

      {/* Play money disclaimer */}
      <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/5 p-4 text-[10px] text-yellow-400 font-bold leading-relaxed">
        ⚠️ VONK Tournaments currently operates as a frontend-only demonstration. Results, scoring, rankings, MVP selections, disputes and leaderboard updates are simulated locally and are not connected to an official game server.
      </div>

      {/* Filter Options */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center border-b border-border pb-4">
        <div className="flex gap-1.5">
          {(['ALL', 'SOLO', 'TEAM'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-primary text-background shadow-md'
                  : 'bg-card border border-border text-muted hover:text-foreground'
              }`}
            >
              {type === 'ALL' ? 'All Matches' : type === 'SOLO' ? 'Solo Match' : 'Team Squad'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search by round or tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-xs outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Results grid list */}
      {loading ? (
        <div className="text-center py-12 text-xs text-muted">Loading career records...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/20 space-y-3">
          <Trophy className="h-10 w-10 text-muted mx-auto opacity-35" />
          <h4 className="text-sm font-bold text-foreground">No Performance Records</h4>
          <p className="text-xs text-muted max-w-sm mx-auto">
            You don&apos;t have any matched mock results seeded for your profile in the current database index. Click &quot;Seed Demo Results&quot; above to view mock profiles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((res) => {
            const isWinner = res.placement === 1;
            const isPodium = res.placement && res.placement <= 3;
            
            return (
              <div 
                key={res.id} 
                className="rounded-2xl border border-border bg-card overflow-hidden hover:border-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image overlay */}
                  <div className="h-28 w-full relative bg-black/25">
                    <img 
                      src={getTournamentBanner(res.tournamentId)} 
                      alt="Banner"
                      className="h-full w-full object-cover opacity-60" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    
                    {/* Placement badge overlay */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                        isWinner 
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          : isPodium 
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-muted/10 text-muted border-border'
                      }`}>
                        Placement #{res.placement}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase border ${
                        res.status === 'FINAL' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : res.status === 'CORRECTED'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {res.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-left space-y-0.5">
                      <span className="text-[8px] font-black uppercase text-primary tracking-wider">{res.roundId || 'Final Round'}</span>
                      <h3 className="text-sm font-bold text-white truncate">{getTournamentTitle(res.tournamentId)}</h3>
                    </div>
                  </div>

                  {/* Body values */}
                  <div className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-[#09090d] border border-border/60 rounded-xl space-y-0.5">
                        <span className="text-[8px] font-bold text-muted uppercase">Kills</span>
                        <span className="font-bold text-foreground block font-mono">{res.kills}</span>
                      </div>
                      <div className="p-2 bg-[#09090d] border border-border/60 rounded-xl space-y-0.5">
                        <span className="text-[8px] font-bold text-muted uppercase">Kills Pts</span>
                        <span className="font-bold text-foreground block font-mono">{res.killPoints}</span>
                      </div>
                      <div className="p-2 bg-[#09090d] border border-border/60 rounded-xl space-y-0.5">
                        <span className="text-[8px] font-bold text-primary uppercase">Total Pts</span>
                        <span className="font-black text-primary block font-mono">{res.totalPoints}</span>
                      </div>
                    </div>

                    {/* Penalties or revision tags */}
                    {(res.penaltyPoints && res.penaltyPoints > 0) ? (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 flex items-center justify-between text-[10px] text-red-400">
                        <span className="flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          <span>Check-in Penalties Applied:</span>
                        </span>
                        <span className="font-black font-mono">-{res.penaltyPoints} Pts</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Footer details row */}
                <div className="bg-black/10 px-4 py-3 border-t border-border flex justify-between items-center">
                  <span className="text-[9px] font-mono text-muted">ID: {res.id}</span>
                  
                  <Link 
                    href={`/results/${res.id}`}
                    className="flex items-center gap-1 text-[10px] font-black text-primary hover:text-yellow-500 transition-all uppercase"
                  >
                    <span>View Score Breakdown</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
