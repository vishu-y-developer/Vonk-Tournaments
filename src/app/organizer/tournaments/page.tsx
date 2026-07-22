'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useOrganizer } from '@/providers/OrganizerProvider';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { 
  Trophy, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Copy, 
  Trash2, 
  Ban, 
  Check, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Tournament, TournamentStatus } from '@/types';

export default function OrganizerTournamentsPage() {
  const { 
    managedTournaments, 
    duplicateTournament, 
    changeTournamentStatus 
  } = useOrganizer();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [formatFilter, setFormatFilter] = useState<string>('ALL');

  // Filtered List
  const filtered = useMemo(() => {
    return managedTournaments.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.game && t.game.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter || 
                          (statusFilter === 'PUBLISHED' && (t.status === 'REGISTRATION_OPEN' || t.status === 'Registration Open'));
      const matchFormat = formatFilter === 'ALL' || t.mode === formatFilter;
      return matchSearch && matchStatus && matchFormat;
    });
  }, [managedTournaments, search, statusFilter, formatFilter]);

  const handleDuplicate = (id: string) => {
    if (confirm('Duplicate this tournament layout, participation settings, and scoring system?')) {
      const copy = duplicateTournament(id);
      if (copy) {
        alert(`Duplicated successfully: "${copy.title}"`);
      }
    }
  };

  const handleStatusChange = (id: string, status: TournamentStatus) => {
    const term = status === 'CANCELLED' ? 'cancel' : status === 'REGISTRATION_OPEN' ? 'publish' : status.toLowerCase();
    if (confirm(`Are you sure you want to ${term} this tournament?`)) {
      try {
        changeTournamentStatus(id, status);
        alert(`Tournament status updated to ${status}.`);
      } catch (err: any) {
        alert(err.message || 'Action failed.');
      }
    }
  };

  // Status badge styling helper
  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'DRAFT':
      case 'Draft':
        return 'bg-muted/20 text-muted border-muted/30';
      case 'REGISTRATION_OPEN':
      case 'Registration Open':
        return 'bg-success/20 text-success border-success/30';
      case 'REGISTRATION_CLOSED':
      case 'Registration Closed':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'LIVE':
      case 'Live':
        return 'bg-secondary/20 text-secondary border-secondary/30 animate-pulse';
      case 'COMPLETED':
      case 'Completed':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'CANCELLED':
      case 'Cancelled':
        return 'bg-danger/20 text-danger border-danger/30';
      default:
        return 'bg-card-bg text-foreground border-card-border';
    }
  };

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-2">
              <Trophy className="h-6 w-6 text-secondary" />
              Tournament Management
            </h1>
            <p className="text-xs text-muted">
              Publish Drafts, clone seasonal structures, and review participant slots configuration.
            </p>
          </div>
          <Link
            href="/organizer/tournaments/create"
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-all hover:scale-[1.02] shadow-md glow-secondary"
          >
            <Plus className="h-4 w-4" />
            Create Tournament
          </Link>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name, game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card-bg/40 border border-card-border rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary/40 transition-colors"
            />
          </div>

          {/* Status select dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted hidden sm:inline" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card-bg/50 border border-card-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-secondary/30 transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="REGISTRATION_OPEN">Registration Open</option>
              <option value="LIVE">Live</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Mode/Format select dropdown */}
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-card-bg/50 border border-card-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-secondary/30 transition-colors"
            >
              <option value="ALL">All Formats</option>
              <option value="Solo">Solo</option>
              <option value="Duo">Duo</option>
              <option value="Squad">Squad</option>
              <option value="TDM 4v4">TDM 4v4</option>
            </select>
          </div>
        </div>

        {/* Tournaments Grid/Table list */}
        {filtered.length === 0 ? (
          <div className="p-16 rounded-2xl border border-dashed border-card-border bg-card-bg/5 text-center flex flex-col items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-muted/30" />
            <h3 className="text-sm font-extrabold text-foreground uppercase">No Tournaments Found</h3>
            <p className="text-xs text-muted max-w-xs leading-relaxed">
              No matching records for chosen filters. Seed default data or start with the creationStepper.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Dense Table */}
            <div className="hidden lg:block overflow-hidden border border-card-border bg-card-bg/15 rounded-xl">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-card-border bg-card-bg/25 text-[10px] uppercase font-black text-muted tracking-wider">
                    <th className="p-4">Tournament details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Format</th>
                    <th className="p-4">Slots booked</th>
                    <th className="p-4">Entry fee</th>
                    <th className="p-4">Prize pool</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr 
                      key={t.id}
                      className="border-b border-card-border hover:bg-card-bg/15 transition-all text-xs font-semibold"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-foreground text-xs hover:text-secondary transition-colors">
                            <Link href={`/organizer/tournaments/${t.id}`}>{t.title}</Link>
                          </span>
                          <span className="text-[10px] text-muted font-normal mt-0.5">ID: {t.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold tracking-wide ${getStatusStyle(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted">{t.mode} ({t.perspective})</td>
                      <td className="p-4 font-mono">
                        {t.registeredParticipants} / {t.maxParticipants}
                      </td>
                      <td className="p-4 font-mono text-gradient-prize">
                        {t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}
                      </td>
                      <td className="p-4 font-mono text-foreground">₹{t.prizePool}</td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link
                            href={`/organizer/tournaments/${t.id}`}
                            className="p-1.5 rounded-lg border border-card-border bg-card-bg/40 text-muted hover:text-foreground transition-all"
                            title="Manage Panel"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          
                          {/* Publish/Draft Actions */}
                          {(t.status === 'DRAFT' || t.status === 'Draft') && (
                            <button
                              onClick={() => handleStatusChange(t.id, 'REGISTRATION_OPEN')}
                              className="p-1.5 rounded-lg border border-success/30 bg-success/10 text-success hover:bg-success/20 transition-all"
                              title="Publish Live"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}

                          {t.status !== 'CANCELLED' && t.status !== 'Cancelled' && t.status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusChange(t.id, 'CANCELLED')}
                              className="p-1.5 rounded-lg border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 transition-all"
                              title="Cancel"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDuplicate(t.id)}
                            className="p-1.5 rounded-lg border border-card-border bg-card-bg/40 text-muted hover:text-foreground transition-all"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {filtered.map((t) => (
                <div 
                  key={t.id}
                  className="p-4 rounded-xl border border-card-border bg-card-bg/20 flex flex-col gap-4 hover:border-card-hover-border transition-all"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col">
                      <Link 
                        href={`/organizer/tournaments/${t.id}`}
                        className="font-extrabold text-foreground hover:text-secondary text-xs truncate max-w-[160px]"
                      >
                        {t.title}
                      </Link>
                      <span className="text-[9px] text-muted">ID: {t.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[8px] font-extrabold ${getStatusStyle(t.status)}`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-y border-card-border py-2.5 text-center">
                    <div>
                      <span className="text-[9px] text-muted block">Format</span>
                      <span className="text-xs text-foreground font-bold">{t.mode}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted block">Slots</span>
                      <span className="text-xs text-foreground font-bold font-mono">
                        {t.registeredParticipants}/{t.maxParticipants}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted block">Prize Pool</span>
                      <span className="text-xs text-gradient-prize font-bold font-mono">₹{t.prizePool}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted">
                      Fee: {t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/organizer/tournaments/${t.id}`}
                        className="px-3 py-1.5 rounded-lg border border-card-border bg-card-bg text-xs font-bold text-muted hover:text-foreground"
                      >
                        Manage
                      </Link>
                      <button
                        onClick={() => handleDuplicate(t.id)}
                        className="p-1.5 rounded-lg border border-card-border bg-card-bg text-muted"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </OrganizerShell>
  );
}
