'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTeams } from '@/providers/TeamProvider';
import { useAuth } from '@/providers/AuthProvider';
import { TeamType, TeamRole } from '@/types';
import { Users, Search, Filter, ShieldAlert, ArrowRight } from 'lucide-react';

export default function DiscoverTeams() {
  const { user } = useAuth();
  const { teams, submitJoinRequest, myTeam } = useTeams();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');

  // Submit join request modal / selector
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [preferredRole, setPreferredRole] = useState<TeamRole>('Assaulter');

  // Filter logic
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            team.shortName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'ALL' || team.type === typeFilter;
      const matchesLevel = levelFilter === 'ALL' || team.skillLevel === levelFilter;
      const matchesRegion = regionFilter === 'ALL' || team.region === regionFilter;
      return matchesSearch && matchesType && matchesLevel && matchesRegion;
    });
  }, [teams, searchQuery, typeFilter, levelFilter, regionFilter]);

  const handleApply = (teamId: string) => {
    if (!user) return;
    if (myTeam) {
      alert('You are already in a team. Leave your team first.');
      return;
    }
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    if (team.members.length >= 5) {
      alert('This roster is full.');
      return;
    }

    const res = submitJoinRequest(teamId, preferredRole);
    if (res.success) {
      alert(`Join request submitted to "${team.name}"! Wait for captain approval.`);
      setSelectedTeamId(null);
    } else {
      alert(res.error || 'Failed to submit request.');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 px-4 md:px-0 pt-4 text-left">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-card-border pb-4">
        <h1 className="text-xl md:text-3xl font-black tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          SQUAD RECRUITMENTS
        </h1>
        <p className="text-xs text-muted">
          Browse active teams recruiting players for upcoming scrims and custom lobbies.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl border border-card-border bg-card-bg/20 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search teams by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-card-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-foreground focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0a0a0f] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Squad">Squad</option>
            <option value="Duo">Duo</option>
            <option value="TDM 2v2">TDM 2v2</option>
            <option value="TDM 4v4">TDM 4v4</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-[#0a0a0f] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Pro">Pro Elite</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-[#0a0a0f] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
          >
            <option value="ALL">All Regions</option>
            <option value="India">India</option>
            <option value="Global">Global</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => {
          const isFull = team.members.length >= 5;
          return (
            <div
              key={team.id}
              className="rounded-2xl border border-card-border bg-[#0d0d12] hover:border-card-hover-border transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 flex flex-col gap-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-900 border border-card-border flex items-center justify-center shrink-0">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-5 w-5 text-muted opacity-30" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xs font-black text-foreground hover:text-primary transition-colors">
                      <Link href={`/teams/${team.id}`}>{team.name}</Link>
                    </h3>
                    <span className="text-[9px] font-bold text-muted uppercase font-mono mt-0.5">{team.shortName}</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
                  {team.bio || 'This team has not written a bio yet.'}
                </p>

                {/* Team meta indicators */}
                <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase mt-1">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{team.type}</span>
                  <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">{team.skillLevel}</span>
                  <span className="px-2 py-0.5 rounded bg-muted-bg text-muted">{team.region}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-card-border/60 bg-card-bg/15 flex justify-between items-center gap-4">
                <span className="text-[10px] font-bold text-muted">
                  Roster: <span className={isFull ? 'text-danger' : 'text-primary'}>{team.members.length}/5</span>
                </span>

                <div className="flex gap-2">
                  <Link
                    href={`/teams/${team.id}`}
                    className="px-3 py-2 bg-card-bg hover:bg-card-bg/80 border border-card-border text-foreground text-[10px] font-extrabold rounded-lg transition-colors touch-target"
                  >
                    View Profile
                  </Link>

                  {myTeam?.id === team.id ? (
                    <span className="px-3 py-2 bg-muted-bg text-muted text-[10px] font-black uppercase rounded-lg">
                      My Squad
                    </span>
                  ) : isFull ? (
                    <span className="px-3 py-2 bg-danger/10 text-danger text-[10px] font-black uppercase rounded-lg">
                      Full
                    </span>
                  ) : (
                    <div>
                      {selectedTeamId === team.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={preferredRole}
                            onChange={(e) => setPreferredRole(e.target.value as TeamRole)}
                            className="bg-[#0a0a0f] border border-card-border rounded-lg px-2 py-1 text-[9px] text-foreground focus:outline-none"
                          >
                            <option value="Assaulter">Assaulter</option>
                            <option value="Sniper">Sniper</option>
                            <option value="Support">Support</option>
                            <option value="IGL">IGL</option>
                            <option value="Substitute">Substitute</option>
                          </select>
                          <button
                            onClick={() => handleApply(team.id)}
                            className="px-2.5 py-1.5 bg-primary hover:bg-primary/90 text-background font-black text-[9px] uppercase tracking-wider rounded-lg transition-all"
                          >
                            Send
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (myTeam) {
                              alert('You are already in a team. Leave your team first.');
                              return;
                            }
                            setSelectedTeamId(team.id);
                          }}
                          className="px-3 py-2 bg-primary hover:bg-primary/95 text-background text-[10px] font-black uppercase rounded-lg transition-all touch-target"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="py-12 border border-card-border rounded-2xl text-center bg-card-bg/5 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">📭</span>
          <h3 className="text-xs font-black text-foreground">NO SQUADS RECRUITING</h3>
          <p className="text-[10px] text-muted">Try adjusting filters or check back later.</p>
        </div>
      )}
    </div>
  );
}
