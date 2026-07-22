'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { Trophy, Search, Filter, Plus, Trash2, Check, Ban, Eye } from 'lucide-react';
import { TournamentStatus } from '@/types';

export default function AdminTournamentsPage() {
  const { tournaments, changeTournamentStatus, deleteDemoTournament } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.game.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tournaments, search, statusFilter]);

  const handleStatusChange = (id: string, status: TournamentStatus) => {
    if (confirm(`Set tournament status to ${status}?`)) {
      changeTournamentStatus(id, status, 'Admin override.');
      alert('Status updated.');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this demo tournament permanently from storage?')) {
      deleteDemoTournament(id);
      alert('Tournament deleted.');
    }
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              <Trophy className="h-6 w-6 text-secondary" />
              Global Tournament Control Center
            </h1>
            <p className="text-xs text-muted">
              Override tournament states, publish draft brackets, cancel matches, and delete demo structures.
            </p>
          </div>
          <Link
            href="/organizer/tournaments/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-all shadow-md glow-secondary"
          >
            <Plus className="h-4 w-4" />
            Create Tournament
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by title or game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card-bg/40 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card-bg/50 border border-card-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="REGISTRATION_OPEN">Registration Open</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Tournaments Table */}
        <div className="overflow-x-auto border border-card-border rounded-xl bg-card-bg/15">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-card-border bg-card-bg/30 text-[9px] uppercase font-black text-muted tracking-wider">
                <th className="p-3">Title</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Status</th>
                <th className="p-3">Slots Filled</th>
                <th className="p-3">Prize Pool</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTournaments.map((t) => (
                <tr key={t.id} className="border-b border-card-border hover:bg-card-bg/20 transition-colors">
                  <td className="p-3 font-extrabold text-foreground">{t.title}</td>
                  <td className="p-3 text-muted">{t.mode}</td>
                  <td className="p-3">
                    <UserStatusBadge status={t.status} />
                  </td>
                  <td className="p-3 font-mono">{t.registeredParticipants} / {t.maxParticipants}</td>
                  <td className="p-3 font-mono font-bold text-gradient-prize">₹{t.prizePool}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Link
                        href={`/organizer/tournaments/${t.id}`}
                        className="p-1.5 rounded-lg border border-card-border bg-card-bg text-muted hover:text-foreground"
                        title="Manage Panel"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {t.status === 'DRAFT' && (
                        <button
                          onClick={() => handleStatusChange(t.id, 'REGISTRATION_OPEN')}
                          className="p-1.5 rounded-lg border border-success/30 bg-success/10 text-success"
                          title="Publish"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}

                      {t.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleStatusChange(t.id, 'CANCELLED')}
                          className="p-1.5 rounded-lg border border-danger/30 bg-danger/10 text-danger"
                          title="Cancel"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg border border-danger/30 bg-danger/10 text-danger"
                        title="Delete Demo Tournament"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
