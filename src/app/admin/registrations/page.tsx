'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { Layers, Check, X, ShieldAlert } from 'lucide-react';

export default function AdminRegistrationsPage() {
  const { registrations, forceConfirmRegistration } = useAdmin();

  const handleForceConfirm = (id: string) => {
    if (confirm('Force confirm this registration slot and payment status?')) {
      forceConfirmRegistration(id);
      alert('Registration force confirmed.');
    }
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-secondary" />
            Global Registrations Ledger
          </h1>
          <p className="text-xs text-muted">
            Platform-wide roster registrations audit, force confirmation overrides, and entry fee payment status management.
          </p>
        </div>

        <div className="overflow-x-auto border border-card-border rounded-xl bg-card-bg/15">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-card-border bg-card-bg/30 text-[9px] uppercase font-black text-muted tracking-wider">
                <th className="p-3">Team / Player</th>
                <th className="p-3">Tournament</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3 font-mono">Entry Fee</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b border-card-border hover:bg-card-bg/20 transition-colors">
                  <td className="p-3 font-extrabold text-foreground">{reg.teamName || reg.playerId}</td>
                  <td className="p-3 text-muted">{reg.tournamentTitle}</td>
                  <td className="p-3">
                    <UserStatusBadge status={reg.status} />
                  </td>
                  <td className="p-3 font-bold text-success">{reg.paymentStatus}</td>
                  <td className="p-3 font-mono text-gradient-prize">₹{reg.entryFeePaid}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {reg.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleForceConfirm(reg.id)}
                          className="px-3 py-1.5 bg-success/15 hover:bg-success/25 border border-success/30 text-success text-[10px] font-extrabold rounded-lg"
                        >
                          Force Confirm
                        </button>
                      )}
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
