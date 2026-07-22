'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTeams } from '@/providers/TeamProvider';
import { useAuth } from '@/providers/AuthProvider';
import { TeamRole } from '@/types';
import { ArrowLeft, Users, Shield, UserMinus, Star, Lock, Unlock, Grid, List } from 'lucide-react';

export default function RosterManagement() {
  const { teamId } = useParams() as { teamId: string };
  const router = useRouter();
  const { user } = useAuth();
  const { myTeam, kickMember, transferCaptaincy, assignRole, setRosterLock } = useTeams();

  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedRolePlayer, setSelectedRolePlayer] = useState<string | null>(null);

  // Validate authorization
  if (!user || !myTeam || myTeam.id !== teamId) {
    return (
      <div className="max-w-xl mx-auto w-full pb-20 px-4 md:px-0 pt-12 text-center">
        <h2 className="text-sm font-black text-foreground">NOT AUTHORIZED</h2>
        <p className="text-xs text-muted">You are not a member of this team or not logged in.</p>
      </div>
    );
  }

  const isCaptain = myTeam.captainId === user.id;
  const myMemberRecord = myTeam.members.find((m) => m.playerId === user.id);
  const isCoCaptain = myMemberRecord?.role === 'Co-Captain';

  if (!isCaptain && !isCoCaptain) {
    return (
      <div className="max-w-xl mx-auto w-full pb-20 px-4 md:px-0 pt-12 text-center">
        <h2 className="text-sm font-black text-foreground">ACCESS DENIED</h2>
        <p className="text-xs text-muted">Only the Captain or Co-Captain can manage the roster.</p>
        <Link href="/teams" className="text-xs text-primary hover:underline mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleKick = (playerId: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the squad?`)) {
      const res = kickMember(playerId);
      if (res.success) {
        alert(`${name} was removed from the squad.`);
      } else {
        alert(res.error || 'Failed to remove member.');
      }
    }
  };

  const handleTransfer = (playerId: string, name: string) => {
    if (confirm(`DANGER: Are you sure you want to transfer Captaincy to "${name}"? You will lose Captain permissions.`)) {
      const res = transferCaptaincy(playerId);
      if (res.success) {
        alert(`Captaincy successfully transferred to ${name}.`);
        router.push('/teams');
      } else {
        alert(res.error || 'Failed to transfer captaincy.');
      }
    }
  };

  const handleAssignRole = (playerId: string, role: TeamRole) => {
    const res = assignRole(playerId, role);
    if (res.success) {
      alert(`Role updated successfully.`);
      setSelectedRolePlayer(null);
    } else {
      alert(res.error || 'Failed to update role.');
    }
  };

  const handleToggleLock = () => {
    const isLocked = myTeam.readinessStatus === 'Locked';
    if (confirm(`Are you sure you want to ${isLocked ? 'unlock' : 'lock'} the roster?`)) {
      const res = setRosterLock(!isLocked);
      if (!res.success) alert(res.error || 'Failed to set roster lock.');
    }
  };

  const rolesList: TeamRole[] = [
    'Co-Captain',
    'Assaulter',
    'Sniper',
    'Support',
    'IGL',
    'Entry Fragger',
    'Scout',
    'Substitute',
    'Member'
  ];

  return (
    <div className="flex flex-col gap-6 pb-20 px-4 md:px-0 pt-4 text-left">
      {/* Back button */}
      <Link href="/teams" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground w-fit transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Arena</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-card-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Roster Control Panel
          </h1>
          <p className="text-xs text-muted">Manage roles, kick members, or lock rosters before scrims.</p>
        </div>

        {/* Lock control & view switchers */}
        <div className="flex items-center gap-2">
          {isCaptain && (
            <button
              onClick={handleToggleLock}
              className="px-3.5 py-2 rounded-xl bg-card-bg hover:bg-card-bg/85 border border-card-border text-foreground text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 touch-target"
            >
              {myTeam.readinessStatus === 'Locked' ? (
                <>
                  <Unlock className="h-4 w-4 text-primary" />
                  <span>Unlock Roster</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-secondary" />
                  <span>Lock Roster</span>
                </>
              )}
            </button>
          )}

          <div className="flex bg-[#0a0a0f] border border-card-border p-1 rounded-xl">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-card-bg text-primary' : 'text-muted'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-card-bg text-primary' : 'text-muted'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {myTeam.readinessStatus === 'Locked' && (
        <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 text-xs text-secondary flex items-start gap-3">
          <Lock className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-extrabold uppercase">Roster Locked</p>
            <p className="mt-1 leading-relaxed">
              The squad roster is currently locked. Roster transfers, kicks, and role re-assignments are blocked until the captain unlocks the roster.
            </p>
          </div>
        </div>
      )}

      {/* ROSTER VIEWS */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myTeam.members.map((member) => {
            const isSelf = member.playerId === user.id;
            const isMemberCap = member.role === 'Captain';
            return (
              <div
                key={member.playerId}
                className="p-5 rounded-2xl border border-card-border bg-[#0d0d12] flex flex-col gap-4 text-left justify-between"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-card-border flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                        {member.inGameName}
                        {isMemberCap && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 text-[8px] font-black uppercase rounded">
                            Cap
                          </span>
                        )}
                        {member.role === 'Co-Captain' && (
                          <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase rounded">
                            Co-Cap
                          </span>
                        )}
                      </h4>
                      <span className="text-[9px] font-bold text-muted font-mono">{member.characterId}</span>
                      <span className="text-[10px] text-primary/80 uppercase font-bold mt-1">Role: {member.role}</span>
                    </div>
                  </div>
                </div>

                {/* Member actions overlay */}
                {!isSelf && !isMemberCap && myTeam.readinessStatus !== 'Locked' && (
                  <div className="border-t border-card-border/50 pt-3 flex flex-wrap gap-2 justify-end">
                    {/* Role assign dropdown toggle */}
                    {selectedRolePlayer === member.playerId ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          onChange={(e) => handleAssignRole(member.playerId, e.target.value as TeamRole)}
                          className="bg-[#0a0a0f] border border-card-border rounded-lg px-2.5 py-1.5 text-[10px] text-foreground focus:outline-none"
                          defaultValue={member.role}
                        >
                          <option value="" disabled>Select Role</option>
                          {rolesList.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setSelectedRolePlayer(null)}
                          className="px-2 py-1.5 bg-card-bg hover:bg-card-bg/85 border border-card-border rounded-lg text-muted text-[10px] font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedRolePlayer(member.playerId)}
                          className="px-2.5 py-1.5 bg-card-bg hover:bg-card-bg/80 border border-card-border text-foreground text-[10px] font-bold rounded-lg transition-all"
                        >
                          Change Role
                        </button>

                        {isCaptain && (
                          <button
                            onClick={() => handleTransfer(member.playerId, member.inGameName)}
                            className="p-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 rounded-lg transition-all flex items-center justify-center touch-target"
                            title="Promote to Captain"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleKick(member.playerId, member.inGameName)}
                          className="p-1.5 bg-danger/10 text-danger border border-danger/15 hover:bg-danger/20 rounded-lg transition-all flex items-center justify-center touch-target"
                          title="Kick Member"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT LIST VIEW */
        <div className="rounded-2xl border border-card-border bg-[#0d0d12] overflow-hidden">
          <div className="flex flex-col">
            {myTeam.members.map((member, idx) => {
              const isSelf = member.playerId === user.id;
              const isMemberCap = member.role === 'Captain';
              return (
                <div
                  key={member.playerId}
                  className={`p-3.5 flex justify-between items-center text-xs text-left border-card-border ${
                    idx < myTeam.members.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted font-mono w-5">#{idx + 1}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        {member.inGameName}
                        {isMemberCap && <span className="text-[8px] px-1 bg-yellow-400/10 text-yellow-400 font-extrabold uppercase rounded">Cap</span>}
                      </span>
                      <span className="text-[9px] text-muted">{member.characterId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-2 py-0.5 rounded bg-muted-bg text-muted font-bold text-[9px] uppercase">
                      {member.role}
                    </span>

                    {!isSelf && !isMemberCap && myTeam.readinessStatus !== 'Locked' && (
                      <div className="flex gap-2">
                        {isCaptain && (
                          <button
                            onClick={() => handleTransfer(member.playerId, member.inGameName)}
                            className="p-1.5 text-yellow-400 hover:bg-yellow-400/10 rounded-lg"
                            title="Make Captain"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleKick(member.playerId, member.inGameName)}
                          className="p-1.5 text-danger hover:bg-danger/10 rounded-lg"
                          title="Remove player"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
