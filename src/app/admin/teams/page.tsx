'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import ModerationDialog from '@/components/admin/ModerationDialog';
import { Shield, Search, Filter, RotateCcw } from 'lucide-react';

export default function AdminTeamsPage() {
  const { teams, suspendTeam, restoreTeam } = useAdmin();
  const [search, setSearch] = useState('');
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState<string | null>(null);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tag.toLowerCase().includes(search.toLowerCase())
    );
  }, [teams, search]);

  const handleSuspend = (reason: string) => {
    if (targetTeamId) {
      suspendTeam(targetTeamId, reason);
      alert(`Team ${targetTeamId} suspended.`);
    }
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-secondary" />
            Squad & Team Management
          </h1>
          <p className="text-xs text-muted">
            Moderate registered esports rosters, captain designations, readiness statuses, and roster limits.
          </p>
        </div>

        {/* Toolbar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search by team name or clan tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card-bg/40 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
          />
        </div>

        {/* Teams Table */}
        <div className="overflow-x-auto border border-card-border rounded-xl bg-card-bg/15">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-card-border bg-card-bg/30 text-[9px] uppercase font-black text-muted tracking-wider">
                <th className="p-3">Team Name</th>
                <th className="p-3">Clan Tag</th>
                <th className="p-3">Status</th>
                <th className="p-3">Members Roster</th>
                <th className="p-3">Stats (Matches/Wins)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((t) => (
                <tr key={t.id} className="border-b border-card-border hover:bg-card-bg/20 transition-colors">
                  <td className="p-3 font-extrabold text-foreground">{t.name}</td>
                  <td className="p-3 font-mono font-bold text-secondary">[{t.tag}]</td>
                  <td className="p-3">
                    <UserStatusBadge status={t.readinessStatus} />
                  </td>
                  <td className="p-3 text-muted">
                    {t.members.length} Players
                  </td>
                  <td className="p-3 font-mono">
                    {t.stats.matches} M / {t.stats.wins} W
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {t.readinessStatus === 'Locked' ? (
                        <button
                          onClick={() => restoreTeam(t.id)}
                          className="px-3 py-1 bg-success/15 hover:bg-success/25 border border-success/30 text-success text-[10px] font-extrabold rounded-lg"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setTargetTeamId(t.id);
                            setSuspendDialogOpen(true);
                          }}
                          className="px-3 py-1 bg-danger/15 hover:bg-danger/25 border border-danger/30 text-danger text-[10px] font-extrabold rounded-lg"
                        >
                          Suspend Roster
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ModerationDialog
          isOpen={suspendDialogOpen}
          title="Suspend Team Roster"
          actionName="Suspend Roster"
          onConfirm={handleSuspend}
          onClose={() => setSuspendDialogOpen(false)}
        />
      </div>
    </AdminShell>
  );
}
