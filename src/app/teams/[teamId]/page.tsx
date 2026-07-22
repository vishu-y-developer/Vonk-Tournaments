'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTeams } from '@/providers/TeamProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useRegistrations } from '@/providers/RegistrationProvider';
import { useResults } from '@/providers/ResultProvider';
import { TeamRole } from '@/types';
import { ArrowLeft, Users, Shield, Trophy, Activity, Award, Calendar, Check, Send, AlertTriangle } from 'lucide-react';

export default function TeamProfile() {
  const { teamId } = useParams() as { teamId: string };
  const router = useRouter();
  const { user } = useAuth();
  const { teams, submitJoinRequest, myTeam } = useTeams();
  const { registrations } = useRegistrations();
  const { results, standings } = useResults();

  const [preferredRole, setPreferredRole] = useState<TeamRole>('Assaulter');
  const [applied, setApplied] = useState(false);

  // Lookup matched team
  const team = useMemo(() => {
    return teams.find((t) => t.id === teamId) || null;
  }, [teams, teamId]);

  const teamRegistrations = useMemo(() => {
    if (!team) return [];
    return registrations.filter((r) => r.teamId === team.id && r.status !== 'CANCELLED' && r.status !== 'REFUNDED');
  }, [registrations, team]);

  const teamResults = useMemo(() => {
    if (!team) return [];
    return results.filter((r) => r.teamId === team.id);
  }, [results, team]);

  const latestTeamResult = useMemo(() => {
    return teamResults.length > 0 ? teamResults[0] : null;
  }, [teamResults]);

  const latestTeamStanding = useMemo(() => {
    if (!team) return null;
    return standings.find((s) => s.teamId === team.id || s.participantId === team.id) || null;
  }, [standings, team]);

  if (!team) {
    return (
      <div className="max-w-xl mx-auto w-full pb-20 px-4 md:px-0 pt-12 text-center flex flex-col items-center justify-center gap-3">
        <span className="text-3xl">⚠️</span>
        <h2 className="text-sm font-black text-foreground">SQUAD NOT FOUND</h2>
        <p className="text-xs text-muted">No squad details matches this identifier code.</p>
        <Link href="/teams" className="text-xs font-bold text-primary hover:underline mt-2">
          Return to Arena
        </Link>
      </div>
    );
  }

  const isMyTeam = myTeam?.id === team.id;
  const isFull = team.members.length >= 5;

  const handleApply = () => {
    if (!user) return;
    if (myTeam) {
      alert('You are already in a team. Leave your team first.');
      return;
    }
    const res = submitJoinRequest(team.id, preferredRole);
    if (res.success) {
      alert(`Join request submitted to "${team.name}"!`);
      setApplied(true);
    } else {
      alert(res.error || 'Failed to submit request.');
    }
  };

  // Safe checks for privacy settings
  const privacy = team.privacySettings || {
    publicTeam: true,
    showStats: true,
    allowJoinRequests: true,
    inviteOnly: false,
    showHistory: true,
    showCharacterIds: true,
    showOnlineStatus: true,
  };

  return (
    <div className="flex flex-col gap-6 pb-20 px-4 md:px-0 pt-4 text-left">
      {/* Back button */}
      <Link href="/teams" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground w-fit transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Arena</span>
      </Link>

      {/* Team Cover Banner */}
      <div className="relative rounded-3xl border border-card-border bg-[#0d0d12] overflow-hidden">
        <div className="h-32 md:h-44 w-full bg-slate-950 relative">
          {team.bannerUrl ? (
            <img src={team.bannerUrl} alt="Cover Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-card-bg via-[#0c0d12] to-secondary/10 opacity-70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] to-transparent" />
        </div>

        {/* Profile Card Overlay */}
        <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12 relative z-10">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl border-4 border-[#08080c] bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
            ) : (
              <Users className="h-8 w-8 text-muted opacity-40" />
            )}
          </div>

          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight">{team.name}</h2>
              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {team.readinessStatus}
              </span>
            </div>
            <p className="text-[10px] text-muted font-bold font-mono">Short Name: {team.shortName} • {team.motto || 'Climbing to victory!'}</p>
          </div>

          {/* Quick Apply panel */}
          {!isMyTeam && privacy.allowJoinRequests && !isFull && (
            <div className="shrink-0 flex items-center gap-2 bg-[#08080c] border border-card-border p-2 rounded-xl">
              <select
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value as TeamRole)}
                className="bg-[#0a0a0f] border border-card-border rounded-lg px-2.5 py-1.5 text-[10px] text-foreground focus:outline-none"
              >
                <option value="Assaulter">Assaulter</option>
                <option value="Sniper">Sniper</option>
                <option value="Support">Support</option>
                <option value="IGL">IGL</option>
                <option value="Substitute">Substitute</option>
              </select>
              <button
                onClick={handleApply}
                disabled={applied || !!myTeam}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-background text-[10px] font-black uppercase rounded-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
              >
                {applied ? <Check className="h-3 w-3" /> : <Send className="h-3 w-3" />}
                <span>{applied ? 'Sent' : 'Apply'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid panels */}
      {!privacy.publicTeam && !isMyTeam ? (
        <div className="p-12 border border-card-border rounded-2xl text-center bg-card-bg/5 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🔒</span>
          <h3 className="text-xs font-black text-foreground">PRIVATE SQUAD</h3>
          <p className="text-[10px] text-muted">This squad is set to private. Roster and statistics are hidden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Bio, meta info, stats */}
          <div className="flex flex-col gap-6">
            {/* Bio & Details */}
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4 text-left">
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted">Squad Profile</span>
              <p className="text-xs text-muted leading-relaxed">
                {team.bio || 'No squad bio available.'}
              </p>
              <div className="border-t border-card-border/50 pt-3 flex flex-col gap-2 text-xs font-bold text-muted">
                <div className="flex justify-between">
                  <span>Region:</span>
                  <span className="text-foreground">{team.region}</span>
                </div>
                <div className="flex justify-between">
                  <span>Language:</span>
                  <span className="text-foreground">{team.language}</span>
                </div>
                <div className="flex justify-between">
                  <span>Preferred Map:</span>
                  <span className="text-foreground">{team.preferredMap}</span>
                </div>
                <div className="flex justify-between">
                  <span>Skill Tier:</span>
                  <span className="text-foreground">{team.skillLevel}</span>
                </div>
              </div>
            </div>

            {/* Public Stats Panel */}
            {privacy.showStats && (
              <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4 text-left">
                <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-primary" />
                  Performance Metrics
                </span>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl">
                    <p className="text-[8px] font-bold text-muted uppercase">Matches</p>
                    <p className="text-base font-black text-foreground font-mono">{team.stats.matches}</p>
                  </div>
                  <div className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl">
                    <p className="text-[8px] font-bold text-primary uppercase">Wins</p>
                    <p className="text-base font-black text-primary font-mono">{team.stats.wins}</p>
                  </div>
                  <div className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl">
                    <p className="text-[8px] font-bold text-secondary uppercase">Total Kills</p>
                    <p className="text-base font-black text-secondary font-mono">{team.stats.kills}</p>
                  </div>
                  <div className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl">
                    <p className="text-[8px] font-bold text-gradient-prize uppercase">Prize Money</p>
                    <p className="text-base font-black text-gradient-prize font-mono">₹{team.stats.prizeWon || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Columns: Roster Grid, History & Achievements */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Squad performance standings panel */}
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center border-b border-card-border/40 pb-3">
                <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-primary" />
                  Squad Tournament Performance
                </span>
                
                {latestTeamStanding && (
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-green-500/10 text-green-400 border-green-500/20`}>
                    Status: {latestTeamStanding.qualificationStatus}
                  </span>
                )}
              </div>

              {latestTeamResult ? (
                <div className="space-y-4 text-xs">
                  {/* Grid summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 bg-black/25 border border-card-border rounded-xl space-y-0.5">
                      <span className="text-[8px] font-bold text-muted uppercase">Latest Match Place</span>
                      <span className="font-extrabold text-foreground block font-mono">#{latestTeamResult.placement}</span>
                    </div>
                    <div className="p-2.5 bg-black/25 border border-card-border rounded-xl space-y-0.5">
                      <span className="text-[8px] font-bold text-muted uppercase">Latest Kills</span>
                      <span className="font-extrabold text-foreground block font-mono">{latestTeamResult.kills}</span>
                    </div>
                    <div className="p-2.5 bg-black/25 border border-card-border rounded-xl space-y-0.5">
                      <span className="text-[8px] font-bold text-muted uppercase">Total Points</span>
                      <span className="font-black text-primary block font-mono">{latestTeamResult.totalPoints} Pts</span>
                    </div>
                    <div className="p-2.5 bg-black/25 border border-card-border rounded-xl space-y-0.5">
                      <span className="text-[8px] font-bold text-muted uppercase">Standings Rank</span>
                      {latestTeamStanding ? (
                        <span className="font-extrabold text-foreground block font-mono">Rank #{latestTeamStanding.rank}</span>
                      ) : (
                        <span className="font-extrabold text-foreground block font-mono">TBD</span>
                      )}
                    </div>
                  </div>

                  {/* Member contributions */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-muted tracking-wider block">Member Kills Contribution Ledger</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {team.members.map((member, idx) => {
                        const shares = [0.4, 0.3, 0.2, 0.1, 0.0];
                        const share = shares[idx] || 0.1;
                        const memberKills = Math.round((latestTeamResult.kills || 0) * share);
                        
                        return (
                          <div key={member.playerId} className="flex justify-between items-center p-2 bg-black/20 border border-card-border/60 rounded-lg">
                            <span className="font-bold text-foreground truncate max-w-[120px]">{member.inGameName}</span>
                            <span className="font-mono text-muted">{memberKills} Kills ({Math.round(share * 100)}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* View Leaderboard button */}
                  <Link
                    href={`/results/${latestTeamResult.id}`}
                    className="w-full py-2 bg-primary hover:bg-yellow-500 text-background font-black text-xs text-center rounded-lg transition-all block uppercase"
                  >
                    View Scorecard Breakdown details
                  </Link>

                </div>
              ) : (
                <div className="text-center py-6 text-[11px] text-muted border border-dashed border-card-border rounded-xl bg-card-bg/20">
                  No active tournament scorecards found for this squad. Register and log results to view contributions.
                </div>
              )}
            </div>

            {/* Roster Cards */}
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4 text-left">
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Active Roster ({team.members.length}/5)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.members.map((member) => (
                  <div
                    key={member.playerId}
                    className="p-3.5 rounded-xl border border-card-border bg-[#0a0a0f] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-10 w-10 rounded-lg bg-slate-900 border border-card-border/80 flex items-center justify-center">
                        <span className="text-base">👤</span>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                          {member.inGameName}
                          {member.role === 'Captain' && (
                            <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 text-[8px] font-black uppercase tracking-wider rounded">
                              Cap
                            </span>
                          )}
                          {member.role === 'Co-Captain' && (
                            <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-wider rounded">
                              Co-Cap
                            </span>
                          )}
                        </h4>
                        {privacy.showCharacterIds && (
                          <span className="text-[9px] font-bold text-muted font-mono">{member.characterId}</span>
                        )}
                        <span className="text-[9px] font-bold text-primary/80 uppercase mt-0.5">Role: {member.role}</span>
                      </div>
                    </div>

                    {privacy.showOnlineStatus && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Team Registrations */}
            {isMyTeam && (
              <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4 text-left">
                <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-primary" />
                  Upcoming Team Registrations ({teamRegistrations.length})
                </span>

                {teamRegistrations.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted">
                    This team is not registered for any active tournament.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {teamRegistrations.map((reg) => (
                      <div key={reg.id} className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl flex justify-between items-center text-xs">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-foreground">{reg.tournamentTitle}</span>
                          <span className="text-[9px] text-muted font-bold font-mono">Reg ID: {reg.id}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-primary font-black">
                            {reg.slotNumber ? `Slot #${reg.slotNumber}` : 'Waitlist'}
                          </span>
                          <Link 
                            href={`/registrations/${reg.id}`}
                            className="text-[9px] text-muted hover:text-foreground font-black uppercase mt-0.5 tracking-wider"
                          >
                            View Receipt &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Achievements */}
            {team.achievements && team.achievements.length > 0 && (
              <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4 text-left">
                <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" />
                  Unlocked Achievements ({team.achievements.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {team.achievements.map((ach) => (
                    <div key={ach.id} className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl flex items-start gap-3">
                      <span className="text-xl shrink-0 mt-0.5">{ach.badge}</span>
                      <div className="flex flex-col text-left">
                        <h4 className="text-xs font-bold text-foreground">{ach.title}</h4>
                        <p className="text-[10px] text-muted mt-0.5 leading-tight">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tournament History */}
            {privacy.showHistory && team.tournamentHistory.length > 0 && (
              <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4 text-left">
                <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  Tournament History
                </span>
                <div className="flex flex-col gap-2.5">
                  {team.tournamentHistory.map((hist, idx) => (
                    <div key={idx} className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl flex justify-between items-center text-xs">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-foreground">{hist.tournamentTitle}</span>
                        <span className="text-[9px] text-muted uppercase font-mono">{new Date(hist.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col text-right font-mono font-bold">
                        <span className="text-primary">Placement: #{hist.placement}</span>
                        <span className="text-gradient-prize text-[10px]">Winnings: ₹{hist.winnings || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
