'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useTeams } from '@/providers/TeamProvider';
import { useTournaments } from '@/providers/TournamentProvider';
import { Team, TeamInvitation } from '@/types';
import { ROUTES } from '@/constants';
import LevelBadge from '@/components/common/LevelBadge';
import {
  Users,
  Plus,
  ArrowRight,
  Shield,
  Trophy,
  Activity,
  Award,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function TeamsDashboard() {
  const { user } = useAuth();
  const {
    myTeam,
    teams,
    invitations,
    respondToInvitation,
    regenerateTeamCode,
    setRosterLock,
    leaveTeam,
    disbandTeam
  } = useTeams();

  const [copiedCode, setCopiedCode] = useState(false);

  // Filter out teams that are recruiting
  const recommendedTeams = useMemo(() => {
    return teams.filter((t) => t.id !== myTeam?.id && t.members.length < 5).slice(0, 3);
  }, [teams, myTeam]);

  // Copy code utility
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegenerateCode = () => {
    if (confirm('Are you sure you want to regenerate the invite code? The old code will become invalid.')) {
      const res = regenerateTeamCode();
      if (res.success) {
        alert(`New code generated: ${res.code}`);
      } else {
        alert(res.error || 'Could not regenerate code.');
      }
    }
  };

  const handleToggleLock = (locked: boolean) => {
    if (confirm(`Are you sure you want to ${locked ? 'lock' : 'unlock'} the roster?`)) {
      const res = setRosterLock(locked);
      if (!res.success) alert(res.error || 'Failed to update roster lock.');
    }
  };

  const handleLeaveTeam = () => {
    if (confirm('Are you sure you want to leave this team?')) {
      const res = leaveTeam();
      alert(res.message);
    }
  };

  const handleDisbandTeam = () => {
    if (confirm('DANGER: Are you sure you want to disband this team? All member records and stats will be deleted permanently!')) {
      const res = disbandTeam();
      if (res.success) {
        alert('Team disbanded successfully.');
      } else {
        alert(res.error || 'Failed to disband team.');
      }
    }
  };

  // Safe checks for user profile load
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mb-4" />
        <h2 className="text-xs font-bold text-muted">Retrieving squad details...</h2>
      </div>
    );
  }

  // --- VIEW 1: NO TEAM STATE ---
  if (!myTeam) {
    return (
      <div className="flex flex-col gap-8 pb-20 px-4 md:px-0 pt-4 text-left">
        {/* Page Header */}
        <div className="flex flex-col gap-2 border-b border-card-border pb-4">
          <h1 className="text-xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            SQUAD ARENA
          </h1>
          <p className="text-xs text-muted">
            Create a custom esports squad, invite members, or join teams via registration code.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main onboarding columns */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Split CTA cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-card-border bg-gradient-to-b from-[#111116] to-[#08080a] p-6 flex flex-col justify-between h-48 relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
                <div>
                  <h3 className="text-base font-black text-foreground mb-1.5 uppercase">Create a Team</h3>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Set up your team branding, banner colors, configure roster sizes (Duo/Squad), and recruit players.
                  </p>
                </div>
                <Link
                  href="/teams/create"
                  className="w-fit flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-xl shadow-md transition-all active:scale-95 touch-target"
                >
                  <span>Build Squad</span>
                  <Plus className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl border border-card-border bg-gradient-to-b from-[#111116] to-[#08080a] p-6 flex flex-col justify-between h-48 relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/10 transition-all" />
                <div>
                  <h3 className="text-base font-black text-foreground mb-1.5 uppercase">Join with Code</h3>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Received an invitation code? Enter the squad invite code to join your teammates directly.
                  </p>
                </div>
                <Link
                  href="/teams/join"
                  className="w-fit flex items-center gap-1.5 px-4 py-2 bg-card-bg hover:bg-card-bg/85 border border-card-border text-foreground font-black text-xs rounded-xl shadow-md transition-all active:scale-95 touch-target"
                >
                  <span>Enter Code</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </Link>
              </div>
            </div>

            {/* Teammates Invitation Inbox */}
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                Pending Team Invitations ({invitations.filter((i) => i.status === 'Pending').length})
              </span>

              {invitations.filter((i) => i.status === 'Pending').length > 0 ? (
                <div className="flex flex-col gap-3">
                  {invitations
                    .filter((i) => i.status === 'Pending')
                    .map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3.5 rounded-xl border border-card-border bg-[#0a0a0f] flex justify-between items-center gap-4 hover:border-card-hover-border transition-all"
                      >
                        <div className="flex flex-col gap-0.5 text-left">
                          <h4 className="text-xs font-black text-foreground">{inv.teamName}</h4>
                          <p className="text-[9px] text-muted font-bold uppercase mt-0.5">Invited Role: {inv.role}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              const res = respondToInvitation(inv.id, false);
                              if (res.success) alert('Invitation rejected.');
                            }}
                            className="px-3 py-1.5 bg-muted-bg hover:bg-muted-bg/80 text-muted font-extrabold text-[10px] rounded-lg transition-all touch-target"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => {
                              const res = respondToInvitation(inv.id, true);
                              if (res.success) {
                                alert(`Joined ${inv.teamName}!`);
                              } else {
                                alert(res.error || 'Failed to join.');
                              }
                            }}
                            className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-background font-black text-[10px] rounded-lg transition-all touch-target"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-muted text-center py-4 bg-muted-bg/10 rounded-xl">
                  No pending squad invitations. Ask your Captain for a code!
                </p>
              )}
            </div>

            {/* Benefits list */}
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted">Benefits of Squad Play</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-card-border bg-muted-bg/25">
                  <span className="text-base">🏆</span>
                  <h4 className="font-extrabold mt-1 text-foreground/90">Tournament Entry</h4>
                  <p className="text-[10px] text-muted mt-1 leading-tight">Must form a valid roster sizes to register BGMI scrims.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-card-border bg-muted-bg/25">
                  <span className="text-base">⚡</span>
                  <h4 className="font-extrabold mt-1 text-foreground/90">Readiness Status</h4>
                  <p className="text-[10px] text-muted mt-1 leading-tight">Locks team rosters before matches for fair gameplay validation.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-card-border bg-muted-bg/25">
                  <span className="text-base">🤝</span>
                  <h4 className="font-extrabold mt-1 text-foreground/90">Shared Wins</h4>
                  <p className="text-[10px] text-muted mt-1 leading-tight">Win simulated prize pools and track team-level contributions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Discover & Recruitments */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-card-border pb-3">
                <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-primary" />
                  Recruiting Teams
                </span>
                <Link href="/teams/discover" className="text-[10px] font-extrabold text-primary hover:underline flex items-center gap-0.5">
                  <span>View All</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {recommendedTeams.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {recommendedTeams.map((team) => (
                    <div key={team.id} className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-left">
                        <div className="h-9 w-9 rounded-lg bg-card-bg border border-card-border flex items-center justify-center shrink-0">
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
                          ) : (
                            <Users className="h-4 w-4 text-muted opacity-40" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <Link href={`/teams/${team.id}`} className="text-xs font-bold text-foreground line-clamp-1 hover:text-primary transition-colors">
                            {team.name}
                          </Link>
                          <span className="text-[8px] font-mono text-muted uppercase">Size: {team.members.length}/5</span>
                        </div>
                      </div>
                      <Link
                        href={`/teams/${team.id}`}
                        className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-black text-[9px] uppercase tracking-wider rounded-lg transition-colors touch-target"
                      >
                        Apply
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted text-center py-4 bg-muted-bg/10 rounded-xl">No teams recruiting.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: ACTIVE TEAM DASHBOARD STATE ---
  const isCaptain = myTeam.captainId === user.id;
  const myRosterMember = myTeam.members.find((m) => m.playerId === user.id);
  const isCoCaptain = myRosterMember?.role === 'Co-Captain';

  return (
    <div className="flex flex-col gap-6 pb-20 px-4 md:px-0 pt-4 text-left">
      {/* Team cover banner */}
      <div className="relative rounded-3xl border border-card-border bg-[#0d0d12] overflow-hidden">
        <div className="h-32 md:h-44 w-full bg-slate-950 relative">
          {myTeam.bannerUrl ? (
            <img src={myTeam.bannerUrl} alt="Cover Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-card-bg via-[#0c0d12] to-secondary/10 opacity-70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] to-transparent" />
        </div>

        {/* Profile Card Overlay */}
        <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12 relative z-10">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl border-4 border-[#08080c] bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
            {myTeam.logoUrl ? (
              <img src={myTeam.logoUrl} alt={myTeam.name} className="h-full w-full object-cover" />
            ) : (
              <Users className="h-8 w-8 text-muted opacity-40" />
            )}
          </div>

          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight">{myTeam.name}</h2>
              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {myTeam.readinessStatus}
              </span>
            </div>
            <p className="text-[10px] text-muted font-bold font-mono">Short Name: {myTeam.shortName} • Motto: {myTeam.motto || 'Climbing to victory!'}</p>
          </div>

          {/* Quick Actions overlay */}
          <div className="shrink-0 flex flex-wrap gap-2.5">
            <Link
              href={`/teams/${myTeam.id}/statistics`}
              className="px-3 py-2 rounded-xl bg-card-bg hover:bg-card-bg/85 border border-card-border text-foreground text-xs font-bold transition-all touch-target flex items-center gap-1.5"
            >
              <Activity className="h-4.5 w-4.5 text-primary" />
              <span>Statistics</span>
            </Link>

            {(isCaptain || isCoCaptain) && (
              <Link
                href={`/teams/${myTeam.id}/manage`}
                className="px-3 py-2 rounded-xl bg-primary hover:bg-primary/95 text-background text-xs font-black transition-all touch-target flex items-center gap-1.5"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Roster Control</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main dashboard grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team Code, actions list, achievements */}
        <div className="flex flex-col gap-6">
          {/* Team Code widget */}
          <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Invitation Code</span>
              <span className="text-[8px] font-bold text-muted uppercase">demo approval enabled</span>
            </div>
            <div className="flex items-center justify-between bg-background border border-card-border/80 rounded-xl p-3 relative overflow-hidden font-mono text-sm font-black text-foreground">
              <span>{myTeam.code}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyCode(myTeam.code)}
                  className="p-1.5 bg-card-bg hover:bg-card-bg/85 rounded-lg border border-card-border text-foreground transition-all active:scale-95 touch-target"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                {isCaptain && (
                  <button
                    onClick={handleRegenerateCode}
                    className="p-1.5 bg-card-bg hover:bg-card-bg/85 rounded-lg border border-card-border text-foreground transition-all active:scale-95 touch-target"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-secondary" />
                  </button>
                )}
              </div>
            </div>
            {isCaptain && (
              <div className="flex justify-between items-center border-t border-card-border/50 pt-3 mt-1 text-xs">
                <span className="text-muted font-bold flex items-center gap-1">
                  {myTeam.readinessStatus === 'Locked' ? <Lock className="h-3.5 w-3.5 text-secondary" /> : <Unlock className="h-3.5 w-3.5 text-primary" />}
                  Roster: {myTeam.readinessStatus === 'Locked' ? 'Locked' : 'Unlocked'}
                </span>
                <button
                  onClick={() => handleToggleLock(myTeam.readinessStatus !== 'Locked')}
                  className="text-[10px] font-extrabold text-primary hover:underline"
                >
                  Toggle Lock
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions List */}
          <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted">Quick Actions</span>
            <div className="flex flex-col gap-2.5">
              {(isCaptain || isCoCaptain) && (
                <>
                  <Link
                    href={`/teams/${myTeam.id}/requests`}
                    className="flex justify-between items-center text-xs text-foreground/80 hover:text-primary transition-all p-2 rounded-lg border border-card-border bg-muted-bg/30"
                  >
                    <span>Join Requests Inbox</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted" />
                  </Link>
                  <Link
                    href={`/teams/${myTeam.id}/invitations`}
                    className="flex justify-between items-center text-xs text-foreground/80 hover:text-primary transition-all p-2 rounded-lg border border-card-border bg-muted-bg/30"
                  >
                    <span>Invite Free Agents</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted" />
                  </Link>
                  <Link
                    href={`/teams/${myTeam.id}/settings`}
                    className="flex justify-between items-center text-xs text-foreground/80 hover:text-primary transition-all p-2 rounded-lg border border-card-border bg-muted-bg/30"
                  >
                    <span>Team settings</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted" />
                  </Link>
                </>
              )}
              {!isCaptain ? (
                <button
                  onClick={handleLeaveTeam}
                  className="w-full text-left flex justify-between items-center text-xs text-danger hover:underline transition-all p-2 rounded-lg border border-danger/10 bg-danger/5"
                >
                  <span>Leave Team</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-65" />
                </button>
              ) : (
                <button
                  onClick={handleDisbandTeam}
                  className="w-full text-left flex justify-between items-center text-xs text-danger hover:underline transition-all p-2 rounded-lg border border-danger/15 bg-danger/10 font-bold"
                >
                  <span>Disband Team</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-65" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl">
              <p className="text-[8px] font-bold text-muted uppercase">Matches</p>
              <p className="text-base font-black text-foreground font-mono">{myTeam.stats.matches}</p>
            </div>
            <div className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl">
              <p className="text-[8px] font-bold text-primary uppercase">Wins</p>
              <p className="text-base font-black text-primary font-mono">{myTeam.stats.wins}</p>
            </div>
            <div className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl">
              <p className="text-[8px] font-bold text-secondary uppercase">Total Kills</p>
              <p className="text-base font-black text-secondary font-mono">{myTeam.stats.kills}</p>
            </div>
            <div className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl">
              <p className="text-[8px] font-bold text-gradient-prize uppercase">Winnings</p>
              <p className="text-base font-black text-gradient-prize font-mono">₹{myTeam.stats.prizeWon || 0}</p>
            </div>
          </div>
        </div>

        {/* Right Columns: Roster Grid, activities timeline */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Visual Roster layout */}
          <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Squad Roster ({myTeam.members.length}/5)
              </span>
              <span className="text-[9px] font-bold text-muted uppercase">Type: {myTeam.type}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myTeam.members.map((member) => (
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
                      <span className="text-[9px] font-bold text-muted font-mono">{member.characterId}</span>
                      <span className="text-[9px] font-bold text-primary/80 uppercase mt-0.5">Role: {member.role}</span>
                    </div>
                  </div>

                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
                </div>
              ))}
            </div>
          </div>

          {/* Activities Timeline */}
          <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-primary" />
              Team Activity Timeline
            </span>

            {myTeam.activities.length > 0 ? (
              <div className="relative border-l border-card-border pl-4 flex flex-col gap-4 text-left">
                {myTeam.activities.slice(0, 4).map((act) => (
                  <div key={act.id} className="relative text-xs">
                    {/* Bullet marker */}
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-card-border bg-[#0d0d12]" />
                    <p className="font-semibold text-foreground/90">{act.description}</p>
                    <span className="text-[9px] text-muted block mt-0.5">
                      {new Date(act.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted text-center py-4 bg-muted-bg/10 rounded-xl">No team activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
