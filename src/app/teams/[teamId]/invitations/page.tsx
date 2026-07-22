'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTeams } from '@/providers/TeamProvider';
import { useAuth } from '@/providers/AuthProvider';
import { TeamRole } from '@/types';
import { ArrowLeft, Search, Plus, Send, X, Clock, CheckCircle } from 'lucide-react';

export default function OutboundInvitations() {
  const { teamId } = useParams() as { teamId: string };
  const { user } = useAuth();
  const { myTeam, sendInvitation, cancelInvitation, invitations } = useTeams();

  const [searchQuery, setSearchQuery] = useState('');
  const [preferredRole, setPreferredRole] = useState<TeamRole>('Assaulter');

  // Hardcoded mock free agent database for simulation
  const mockFreeAgents = useMemo(() => {
    return [
      { id: 'mock-agent-1', inGameName: 'VONK⚡Assaulter', level: 'Gold', kd: 3.12, winRate: 15 },
      { id: 'mock-agent-2', inGameName: 'VONK⚡IGL', level: 'Platinum', kd: 4.89, winRate: 30 },
      { id: 'mock-agent-3', inGameName: 'VONK⚡Scout', level: 'Crown', kd: 5.25, winRate: 28 },
      { id: 'mock-agent-4', inGameName: 'VONK⚡Mamba', level: 'Diamond', kd: 3.84, winRate: 20 },
      { id: 'mock-agent-5', inGameName: 'VONK⚡Regaltos', level: 'Ace', kd: 6.12, winRate: 35 },
    ];
  }, []);

  // Filter agents by search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return mockFreeAgents.filter((agent) =>
      agent.inGameName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, mockFreeAgents]);

  if (!user || !myTeam || myTeam.id !== teamId) {
    return (
      <div className="max-w-xl mx-auto w-full pb-20 px-4 md:px-0 pt-12 text-center">
        <h2 className="text-sm font-black text-foreground">NOT AUTHORIZED</h2>
      </div>
    );
  }

  const handleSendInvite = (playerId: string, playerName: string) => {
    const res = sendInvitation({ playerId, playerName, role: preferredRole });
    if (res.success) {
      alert(`Invitation sent to ${playerName} as ${preferredRole}.`);
      setSearchQuery('');
    } else {
      alert(res.error || 'Failed to send invitation.');
    }
  };

  const handleCancelInvite = (id: string, name: string) => {
    if (confirm(`Are you sure you want to cancel the invitation for ${name}?`)) {
      const res = cancelInvitation(id);
      if (res.success) {
        alert('Invitation cancelled.');
      } else {
        alert(res.error || 'Failed to cancel invitation.');
      }
    }
  };

  // Sent invitations for this team
  const outboundInvs = invitations.filter((inv) => inv.teamId === myTeam.id);

  return (
    <div className="flex flex-col gap-6 pb-20 px-4 md:px-0 pt-4 text-left">
      {/* Back button */}
      <Link href="/teams" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground w-fit transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Arena</span>
      </Link>

      <div className="flex flex-col gap-1 border-b border-card-border pb-4">
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <Send className="h-6 w-6 text-primary" />
          Outbound Squad Invitations
        </h1>
        <p className="text-xs text-muted">Recruit free agents by searching and sending role-specific invites.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Search agent */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="rounded-2xl border border-card-border bg-card-bg/25 p-5 flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase text-foreground">Find Free Agents</h3>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Type agent name (e.g. VONK)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-card-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <select
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value as TeamRole)}
                className="bg-[#0a0a0f] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none shrink-0"
              >
                <option value="Co-Captain">Co-Captain</option>
                <option value="Assaulter">Assaulter</option>
                <option value="Sniper">Sniper</option>
                <option value="Support">Support</option>
                <option value="IGL">IGL</option>
                <option value="Substitute">Substitute</option>
              </select>
            </div>

            {/* Matching search list */}
            {searchQuery.trim() && (
              <div className="flex flex-col gap-3 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {filteredAgents.length > 0 ? (
                  filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="p-3.5 rounded-xl border border-card-border bg-[#0a0a0f] flex justify-between items-center gap-3 text-left"
                    >
                      <div className="flex flex-col gap-1">
                        <h4 className="text-xs font-black text-foreground">{agent.inGameName}</h4>
                        <span className="text-[9px] text-muted font-bold font-mono">
                          Level: {agent.level} • K/D: {agent.kd} • Win Rate: {agent.winRate}%
                        </span>
                      </div>
                      <button
                        onClick={() => handleSendInvite(agent.id, agent.inGameName)}
                        className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-background font-black text-[10px] uppercase rounded-lg transition-colors flex items-center gap-1 touch-target"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Invite</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted text-center py-4 bg-muted-bg/10 rounded-xl">No matching free agents found.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active outbound invitations status */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-card-border bg-card-bg/25 p-5 flex flex-col gap-4 text-left">
            <h3 className="text-xs font-black uppercase text-foreground">Outbound Log</h3>
            <div className="flex flex-col gap-3">
              {outboundInvs.length > 0 ? (
                outboundInvs.map((inv) => (
                  <div key={inv.id} className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-foreground">{inv.playerName}</span>
                      <span className="text-[9px] text-muted uppercase font-bold">Role: {inv.role}</span>
                      <span className="text-[9px] font-bold font-mono mt-0.5 text-primary flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {inv.status}
                      </span>
                    </div>

                    {inv.status === 'Pending' && (
                      <button
                        onClick={() => handleCancelInvite(inv.id, inv.playerName)}
                        className="p-1 text-danger hover:text-danger/80 transition-colors"
                        title="Cancel Invitation"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted text-center py-4 bg-muted-bg/10 rounded-xl">No outbound invitations sent.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
