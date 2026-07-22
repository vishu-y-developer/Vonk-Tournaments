'use client';

import React, { use, useState, useMemo, useEffect } from 'react';
import { useResults } from '@/providers/ResultProvider';
import { useTournaments } from '@/providers/TournamentProvider';
import { useLeaderboardFilters } from '@/hooks/useLeaderboardFilters';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trophy, 
  Award, 
  Calendar, 
  Search, 
  Info,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { TournamentStanding } from '@/types';

interface Params {
  slug: string;
}

export default function TournamentLeaderboardPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  const { standings, getMVP, recalculateStandings, loading } = useResults();
  const { getTournamentBySlug } = useTournaments();

  const [activeTab, setActiveTab] = useState<'OVERALL' | 'STATS'>('OVERALL');
  
  // Simulated Live Leaderboard playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRound, setPlaybackRound] = useState(1);

  // Find corresponding tournament
  const tournament = getTournamentBySlug(slug);

  // Tournament standings overall
  const overallStandings = useMemo(() => {
    if (!tournament) return [];
    return standings.filter((s) => s.tournamentId === tournament.id);
  }, [standings, tournament]);

  // Seeding simulated round snapshot states
  const round1Snapshot: TournamentStanding[] = useMemo(() => {
    if (!tournament) return [];
    return [
      {
        tournamentId: tournament.id,
        participantId: 'team-soul',
        rank: 1,
        rankChange: 0,
        matchesPlayed: 1,
        totalKills: 18,
        totalPlacementPoints: 15,
        totalKillPoints: 18,
        totalBonusPoints: 0,
        totalPenaltyPoints: 0,
        totalPoints: 33,
        averagePlacement: 1,
        bestPlacement: 1,
        wins: 1,
        podiumFinishes: 1,
        qualificationStatus: 'WINNER',
        updatedAt: new Date().toISOString(),
        isDemo: true
      },
      {
        tournamentId: tournament.id,
        participantId: 'team-godl',
        rank: 2,
        rankChange: 0,
        matchesPlayed: 1,
        totalKills: 15,
        totalPlacementPoints: 12,
        totalKillPoints: 15,
        totalBonusPoints: 0,
        totalPenaltyPoints: 0,
        totalPoints: 27,
        averagePlacement: 2,
        bestPlacement: 2,
        wins: 0,
        podiumFinishes: 1,
        qualificationStatus: 'RUNNER_UP',
        updatedAt: new Date().toISOString(),
        isDemo: true
      },
      {
        tournamentId: tournament.id,
        participantId: 'team-user',
        rank: 3,
        rankChange: 0,
        matchesPlayed: 1,
        totalKills: 8,
        totalPlacementPoints: 10,
        totalKillPoints: 8,
        totalBonusPoints: 0,
        totalPenaltyPoints: 0,
        totalPoints: 18,
        averagePlacement: 3,
        bestPlacement: 3,
        wins: 0,
        podiumFinishes: 1,
        qualificationStatus: 'THIRD_PLACE',
        updatedAt: new Date().toISOString(),
        isDemo: true
      }
    ];
  }, [tournament]);

  const round2Snapshot: TournamentStanding[] = useMemo(() => {
    if (!tournament) return [];
    return [
      {
        tournamentId: tournament.id,
        participantId: 'team-soul',
        rank: 1,
        rankChange: 0,
        matchesPlayed: 2,
        totalKills: 24,
        totalPlacementPoints: 25,
        totalKillPoints: 24,
        totalBonusPoints: 0,
        totalPenaltyPoints: 0,
        totalPoints: 49,
        averagePlacement: 2,
        bestPlacement: 1,
        wins: 1,
        podiumFinishes: 2,
        qualificationStatus: 'WINNER',
        updatedAt: new Date().toISOString(),
        isDemo: true
      },
      {
        tournamentId: tournament.id,
        participantId: 'team-godl',
        rank: 2,
        rankChange: 0,
        matchesPlayed: 2,
        totalKills: 27,
        totalPlacementPoints: 27,
        totalKillPoints: 27,
        totalBonusPoints: 0,
        totalPenaltyPoints: 0,
        totalPoints: 54, // takes lead on total points
        averagePlacement: 1.5,
        bestPlacement: 1,
        wins: 1,
        podiumFinishes: 2,
        qualificationStatus: 'WINNER',
        updatedAt: new Date().toISOString(),
        isDemo: true
      },
      {
        tournamentId: tournament.id,
        participantId: 'team-user',
        rank: 3,
        rankChange: 0,
        matchesPlayed: 2,
        totalKills: 18,
        totalPlacementPoints: 22,
        totalKillPoints: 18,
        totalBonusPoints: 0,
        totalPenaltyPoints: 1,
        totalPoints: 39,
        averagePlacement: 2.5,
        bestPlacement: 2,
        wins: 0,
        podiumFinishes: 2,
        qualificationStatus: 'THIRD_PLACE',
        updatedAt: new Date().toISOString(),
        isDemo: true
      }
    ];
  }, [tournament]);

  const simulatedStandings = useMemo(() => {
    return playbackRound === 1 ? round1Snapshot : round2Snapshot;
  }, [playbackRound, round1Snapshot, round2Snapshot]);

  const {
    searchQuery,
    setSearchQuery,
    qualificationFilter,
    setQualificationFilter,
    sortBy,
    setSortBy,
    standings: filteredStandings
  } = useLeaderboardFilters(isPlaying ? simulatedStandings : overallStandings);

  // Winner Podium placements
  const topThree = useMemo(() => {
    const sorted = [...overallStandings].sort((a, b) => a.rank - b.rank);
    return {
      first: sorted.find((s) => s.rank === 1) || null,
      second: sorted.find((s) => s.rank === 2) || null,
      third: sorted.find((s) => s.rank === 3) || null,
    };
  }, [overallStandings]);

  if (loading) {
    return <div className="text-center py-12 text-xs text-muted">Loading leaderboard standings...</div>;
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 my-12">
        <AlertTriangle className="h-12 w-12 text-muted mb-4 opacity-40" />
        <h2 className="text-xl font-bold text-foreground">Tournament Not Found</h2>
        <p className="text-xs text-muted max-w-sm mt-1.5 mb-6">
          The standings details are not available for this tournament slug name.
        </p>
        <Link href="/tournaments" className="px-5 py-2.5 bg-primary text-background font-black text-xs rounded-xl">
          Return to Arenas
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-0 space-y-6">
      {/* Back button header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/tournaments/${slug}`}
          className="p-2 border border-border bg-card rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Tournament Leaderboard</span>
          <h1 className="text-lg md:text-2xl font-black text-foreground">Official Standings</h1>
        </div>
      </div>

      {/* Play money disclaimer */}
      <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/5 p-4 text-[10px] text-yellow-400 font-bold leading-relaxed">
        ⚠️ VONK Tournaments currently operates as a frontend-only demonstration. Standings, placement ranks, and player contribution scores are compiled locally from mock ledger entries.
      </div>

      {/* Winner Podium */}
      {overallStandings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-4xl mx-auto items-end">
          
          {/* Second Place Podium */}
          {topThree.second && (
            <div className="flex flex-col items-center bg-card border border-border p-5 rounded-2xl md:h-52 justify-end order-2 md:order-1 relative">
              <span className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black tracking-wider uppercase">
                🥈 Runner-Up
              </span>
              <div className="h-12 w-12 rounded-xl bg-slate-900 border-2 border-indigo-400/50 flex items-center justify-center text-lg mb-2">
                🥈
              </div>
              <h3 className="text-xs font-black truncate max-w-[120px]">{topThree.second.participantId === 'team-godl' ? 'GodLike Esports' : topThree.second.participantId}</h3>
              <span className="font-mono text-muted text-[10px] mt-1">{topThree.second.totalPoints} Pts • {topThree.second.totalKills} Kills</span>
            </div>
          )}

          {/* First Place Podium */}
          {topThree.first && (
            <div className="flex flex-col items-center bg-gradient-to-b from-yellow-500/10 to-card border-2 border-yellow-400 p-6 rounded-2xl md:h-60 justify-end order-1 md:order-2 relative shadow-[0_8px_32px_rgba(251,191,36,0.1)]">
              <span className="absolute -top-3.5 px-3.5 py-1 rounded-full bg-yellow-400 text-background text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Winner</span>
              </span>
              <div className="h-16 w-16 rounded-xl bg-slate-900 border-2 border-yellow-400 flex items-center justify-center text-2xl mb-2">
                👑
              </div>
              <h3 className="text-sm font-black truncate max-w-[150px]">{topThree.first.participantId === 'team-soul' ? 'Team SouL' : topThree.first.participantId}</h3>
              <span className="font-mono text-primary text-xs mt-1 font-bold">{topThree.first.totalPoints} Pts • {topThree.first.totalKills} Kills</span>
            </div>
          )}

          {/* Third Place Podium */}
          {topThree.third && (
            <div className="flex flex-col items-center bg-card border border-border p-5 rounded-2xl md:h-48 justify-end order-3 relative">
              <span className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black tracking-wider uppercase">
                🥉 3rd Place
              </span>
              <div className="h-10 w-10 rounded-xl bg-slate-900 border-2 border-primary/50 flex items-center justify-center text-lg mb-2">
                🥉
              </div>
              <h3 className="text-xs font-black truncate max-w-[120px]">{topThree.third.participantId === 'team-user' ? 'Apex Hunters' : topThree.third.participantId}</h3>
              <span className="font-mono text-muted text-[10px] mt-1">{topThree.third.totalPoints} Pts • {topThree.third.totalKills} Kills</span>
            </div>
          )}

        </div>
      )}

      {/* Simulated Live Playback Control Panel */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4.5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="space-y-0.5 text-center sm:text-left">
          <span className="text-[9px] font-black uppercase text-primary tracking-wider flex items-center gap-1 justify-center sm:justify-start">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span>Simulated Leaderboard Playback</span>
          </span>
          <p className="text-[11px] text-muted-foreground">
            Watch standing changes and rank movements live between rounds 1 and 2.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 bg-primary text-background font-black text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Play Live Demo</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setPlaybackRound(1);
            }}
            className="p-1.5 border border-border bg-card hover:bg-white/5 text-muted hover:text-foreground rounded-xl transition-all"
            title="Reset playback"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERALL')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'OVERALL' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Overall Standings
        </button>
        <button
          onClick={() => setActiveTab('STATS')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'STATS' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Scoring System & Rules
        </button>
      </div>

      {/* Overall Tab Pane */}
      {activeTab === 'OVERALL' && (
        <div className="space-y-4">
          
          {/* Filters and search layout */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search team or player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-xs outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={qualificationFilter}
                onChange={(e) => setQualificationFilter(e.target.value)}
                className="rounded-xl border border-border bg-card py-2 px-3 text-xs outline-none focus:border-primary"
              >
                <option value="ALL">All Qualifications</option>
                <option value="WINNER">Winners Only</option>
                <option value="ADVANCING">Advancing Teams</option>
                <option value="ELIMINATED">Eliminated Teams</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-border bg-card py-2 px-3 text-xs outline-none focus:border-primary"
              >
                <option value="RANK">Sort by Rank</option>
                <option value="KILLS">Sort by Kills</option>
                <option value="TOTAL_POINTS">Sort by Points</option>
              </select>
            </div>
          </div>

          {/* Standings table */}
          {filteredStandings.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted border border-dashed border-border rounded-2xl bg-card/10">
              No standing records match this filter or search query.
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-black/30 font-bold text-muted uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-4 text-center">Change</th>
                      <th className="py-3 px-4">Participant Name</th>
                      <th className="py-3 px-4 text-center">Matches</th>
                      <th className="py-3 px-4 text-center">Wins</th>
                      <th className="py-3 px-4 text-center">Placement Pts</th>
                      <th className="py-3 px-4 text-center">Kill Pts</th>
                      <th className="py-3 px-4 text-center text-primary">Total Pts</th>
                      <th className="py-3 px-4 text-right">Qualification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredStandings.map((row) => {
                      const isClimbed = row.rankChange > 0;
                      const isDropped = row.rankChange < 0;
                      const displayName = row.participantId === 'team-soul' 
                        ? 'Team SouL' 
                        : row.participantId === 'team-godl' 
                          ? 'GodLike Esports' 
                          : row.participantId === 'team-user'
                            ? 'Apex Hunters'
                            : row.participantId;
                            
                      return (
                        <tr key={row.participantId} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 text-center font-black">{row.rank}</td>
                          <td className="py-3.5 px-4 text-center">
                            {isClimbed ? (
                              <span className="inline-flex items-center gap-0.5 text-green-400 font-bold font-mono">
                                <TrendingUp className="h-3 w-3" />
                                <span>+{row.rankChange}</span>
                              </span>
                            ) : isDropped ? (
                              <span className="inline-flex items-center gap-0.5 text-red-400 font-bold font-mono">
                                <TrendingDown className="h-3 w-3" />
                                <span>{row.rankChange}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-muted font-bold">
                                <Minus className="h-3 w-3" />
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-foreground">{displayName}</td>
                          <td className="py-3.5 px-4 text-center font-mono">{row.matchesPlayed}</td>
                          <td className="py-3.5 px-4 text-center font-mono">{row.wins}</td>
                          <td className="py-3.5 px-4 text-center font-mono">+{row.totalPlacementPoints}</td>
                          <td className="py-3.5 px-4 text-center font-mono">+{row.totalKillPoints}</td>
                          <td className="py-3.5 px-4 text-center font-black font-mono text-primary text-sm">
                            {row.totalPoints}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                              row.qualificationStatus === 'WINNER' || row.qualificationStatus === 'ADVANCING'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : row.qualificationStatus === 'ON_BUBBLE'
                                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {row.qualificationStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Rules Tab Pane */}
      {activeTab === 'STATS' && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 text-xs">
          <h3 className="text-sm font-black uppercase text-foreground tracking-wider border-b border-border/40 pb-2">Active Scoring Rules</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
            <div className="space-y-3">
              <span className="font-bold text-primary block">Standard BGMI Match Point Rules</span>
              <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground">
                <li>Kill Points: <strong className="text-foreground">1 point per registered kill</strong> directly added to team points.</li>
                <li>Drop Lowest Round: <strong className="text-foreground">Disabled</strong> (All round aggregates are summed up).</li>
                <li>Referees Penalties: Any поздний check-in or unsportsmanlike behavior incurs up to a <strong className="text-foreground">5-point deduction</strong>.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="font-bold text-primary block">Tie-Breaker Rule Hierarchy</span>
              <ol className="list-decimal pl-4 space-y-1.5 text-muted-foreground font-mono text-[11px]">
                <li>Total Aggregate Points</li>
                <li>Total Placement Points</li>
                <li>Total Kills count</li>
                <li>Single highest round placement</li>
                <li>Deterministic participant ID fallback</li>
              </ol>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
