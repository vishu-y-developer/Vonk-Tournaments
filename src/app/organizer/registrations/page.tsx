'use client';

import React, { useState, useMemo } from 'react';
import { useOrganizer } from '@/providers/OrganizerProvider';
import { localRegistrationRepository } from '@/repositories/local/local-registration-repository';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { Users, Search, Filter, Check, X, ShieldAlert } from 'lucide-react';
import { RegistrationRejectionReason } from '@/types';

export default function GlobalRegistrationsPage() {
  const { approveRegistration, rejectRegistration } = useOrganizer();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const registrations = useMemo(() => {
    return localRegistrationRepository.getAll();
  }, []);

  const filtered = useMemo(() => {
    return registrations.filter((reg) => {
      const matchSearch = (reg.teamName || '').toLowerCase().includes(search.toLowerCase()) || 
                          (reg.tournamentTitle || '').toLowerCase().includes(search.toLowerCase()) ||
                          reg.playerId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || reg.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [registrations, search, statusFilter]);

  const handleApprove = (id: string) => {
    if (confirm('Approve registration?')) {
      approveRegistration(id);
      alert('Approved successfully!');
      window.location.reload();
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('Rejection reason:\nINCOMPLETE_PROFILE | RULE_VIOLATION | INVALID_GAME_ID', 'INCOMPLETE_PROFILE');
    if (reason) {
      rejectRegistration(id, reason as RegistrationRejectionReason, 'Roster review failed');
      alert('Rejected.');
      window.location.reload();
    }
  };

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-secondary" />
            Global Registrations Ledger
          </h1>
          <p className="text-xs text-muted">
            Manage registrations status, audit player profiles, check team levels, and confirm entry fee payments.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by team, player, tournament..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card-bg/40 border border-card-border rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary/40 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card-bg/50 border border-card-border rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="ALL">All States</option>
              <option value="PENDING">Pending approval</option>
              <option value="CONFIRMED">Confirmed Slots</option>
              <option value="REJECTED">Rejected</option>
              <option value="WAITLISTED">Waitlisted</option>
            </select>
          </div>
        </div>

        {/* Grid List */}
        {filtered.length === 0 ? (
          <div className="p-16 rounded-2xl border border-dashed border-card-border bg-card-bg/5 text-center flex flex-col items-center justify-center gap-2">
            <Users className="h-8 w-8 text-muted/30" />
            <span className="text-xs font-bold text-muted">No registration rosters found.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((reg) => (
              <div 
                key={reg.id}
                className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-card-bg/25 transition-all text-xs font-semibold"
              >
                <div>
                  <span className="font-extrabold text-foreground text-xs block">
                    {reg.teamName || 'Solo Player'}
                  </span>
                  <span className="text-[10px] text-muted block mt-0.5">
                    Tournament: {reg.tournamentTitle} | Entry Fee: ₹{reg.entryFeePaid}
                  </span>
                  <span className="text-[10px] text-muted font-mono block">
                    Status: <span className="font-bold text-secondary">{reg.status}</span> | ID: {reg.id}
                  </span>
                </div>

                {reg.status === 'PENDING' && (
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleReject(reg.id)}
                      className="px-3.5 py-2 bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger font-extrabold rounded-lg"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(reg.id)}
                      className="px-3.5 py-2 bg-success/10 hover:bg-success/20 border border-success/25 text-success font-extrabold rounded-lg"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </OrganizerShell>
  );
}
