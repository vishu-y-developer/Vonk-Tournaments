'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useTeams } from '@/providers/TeamProvider';
import { TeamRole } from '@/types';
import { ArrowLeft, Users, Send, Search, CheckCircle2, ShieldX } from 'lucide-react';

export default function JoinTeam() {
  const router = useRouter();
  const { user } = useAuth();
  const { teams, joinTeam, submitJoinRequest, myTeam } = useTeams();

  const [code, setCode] = useState('');
  const [preferredRole, setPreferredRole] = useState<TeamRole>('Assaulter');
  const [searched, setSearched] = useState(false);

  // Lookup matched team client-side
  const matchedTeam = useMemo(() => {
    if (!code.trim()) return null;
    return teams.find((t) => t.code.toUpperCase().trim() === code.toUpperCase().trim()) || null;
  }, [code, teams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const handleJoinOrRequest = () => {
    if (!user) return;
    if (myTeam) {
      alert('You are already in a team. Leave your team first.');
      return;
    }
    if (!matchedTeam) return;

    // Check if team is full
    if (matchedTeam.members.length >= 5) {
      alert('This team is full.');
      return;
    }

    // Auto-approval simulation check:
    // If team is public and doesn't require invitation, join immediately
    if (matchedTeam.privacySettings?.allowJoinRequests === false) {
      alert('This team is invite-only.');
      return;
    }

    // Simulate join requests or direct joins:
    if (!matchedTeam.privacySettings?.inviteOnly) {
      // Direct join
      const res = joinTeam(matchedTeam.code);
      if (res.success) {
        alert(`Successfully joined "${matchedTeam.name}"!`);
        router.push('/teams');
      } else {
        alert(res.error || 'Failed to join team.');
      }
    } else {
      // Join request submit
      const res = submitJoinRequest(matchedTeam.id, preferredRole);
      if (res.success) {
        alert(`Join request submitted to "${matchedTeam.name}"! Wait for captain approval.`);
        router.push('/teams');
      } else {
        alert(res.error || 'Failed to submit request.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto w-full pb-20 px-4 md:px-0 pt-4 text-left flex flex-col gap-6">
      {/* Back button */}
      <Link href="/teams" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground w-fit transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Arena</span>
      </Link>

      <div className="flex flex-col gap-1 border-b border-card-border pb-4">
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">Join a Team</h1>
        <p className="text-xs text-muted">Enter a unique team invitation code to request entry.</p>
      </div>

      {myTeam && (
        <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 text-xs text-secondary flex items-start gap-3">
          <ShieldX className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-extrabold uppercase">Already in a team</p>
            <p className="mt-1 leading-relaxed">
              You are currently in **{myTeam.name}**. You must leave your current team from the dashboard before joining a new one.
            </p>
          </div>
        </div>
      )}

      {/* Code Entry Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. VONK-7K4P2Q"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setSearched(false);
          }}
          disabled={!!myTeam}
          className="flex-1 bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none uppercase font-mono tracking-wider disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!code.trim() || !!myTeam}
          className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
        </button>
      </form>

      {/* MATCH PREVIEW PANEL */}
      {searched && (
        <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {matchedTeam ? (
            <div className="rounded-2xl border border-card-border bg-[#0c0c11] overflow-hidden">
              {/* Header preview */}
              <div className="p-5 border-b border-card-border flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-900 border border-card-border flex items-center justify-center shrink-0">
                  {matchedTeam.logoUrl ? (
                    <img src={matchedTeam.logoUrl} alt={matchedTeam.name} className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-5 w-5 text-muted opacity-30" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="text-xs font-black text-foreground">{matchedTeam.name}</h3>
                  <span className="text-[9px] font-extrabold uppercase text-primary mt-0.5">{matchedTeam.type} • {matchedTeam.skillLevel}</span>
                </div>
              </div>

              {/* Roster preview */}
              <div className="p-5 flex flex-col gap-4 text-left text-xs">
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-muted tracking-wider">Current Roster ({matchedTeam.members.length}/5)</span>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {matchedTeam.members.map((m) => (
                      <div key={m.playerId} className="flex justify-between text-foreground/80">
                        <span>{m.inGameName}</span>
                        <span className="text-muted font-bold text-[10px]">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-card-border/50 pt-4">
                  <label className="text-[9px] font-extrabold uppercase text-muted tracking-wider">Preferred Roster Role</label>
                  <select
                    value={preferredRole}
                    onChange={(e) => setPreferredRole(e.target.value as TeamRole)}
                    className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Co-Captain">Co-Captain</option>
                    <option value="Assaulter">Assaulter</option>
                    <option value="Sniper">Sniper</option>
                    <option value="Support">Support</option>
                    <option value="IGL">IGL</option>
                    <option value="Substitute">Substitute</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleJoinOrRequest}
                  className="w-full py-3 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  <span>Join Roster</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-card-border bg-card-bg/20 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-xs font-black text-foreground">INVALID CODE</h3>
              <p className="text-[10px] text-muted">No active squad found matching this code. Double-check uppercase letters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
