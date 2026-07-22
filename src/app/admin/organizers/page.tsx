'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useAdmin as useAdminPlatform } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { UserCheck, Check, Ban, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrganizersPage() {
  const { organizers, approveOrganizer, suspendOrganizer } = useAdminPlatform();

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-success" />
            Organizer Verification & Moderation
          </h1>
          <p className="text-xs text-muted">
            Audit tournament host organizations, verify organizer profiles, and manage platform broadcasting rights.
          </p>
        </div>

        <div className="overflow-x-auto border border-card-border rounded-xl bg-card-bg/15">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-card-border bg-card-bg/30 text-[9px] uppercase font-black text-muted tracking-wider">
                <th className="p-3">Organization</th>
                <th className="p-3">Host Display Name</th>
                <th className="p-3">Established</th>
                <th className="p-3">Verification Status</th>
                <th className="p-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((org) => (
                <tr key={org.id} className="border-b border-card-border hover:bg-card-bg/20 transition-colors">
                  <td className="p-3 font-extrabold text-foreground">{org.organizationName}</td>
                  <td className="p-3 font-bold text-muted">{org.displayName}</td>
                  <td className="p-3 font-mono">{org.establishedYear}</td>
                  <td className="p-3">
                    <UserStatusBadge status={org.isVerified ? 'ACTIVE' : 'SUSPENDED'} />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href="/admin/tournaments"
                        className="px-3 py-1.5 border border-card-border bg-card-bg text-xs font-bold text-muted hover:text-foreground rounded-lg"
                      >
                        View Hosted Tournaments
                      </Link>
                      {org.isVerified ? (
                        <button
                          onClick={() => suspendOrganizer(org.id, 'Verification revoked by admin.')}
                          className="px-3 py-1.5 bg-danger/15 hover:bg-danger/25 border border-danger/30 text-danger text-[10px] font-extrabold rounded-lg"
                        >
                          Revoke Verification
                        </button>
                      ) : (
                        <button
                          onClick={() => approveOrganizer(org.id)}
                          className="px-3 py-1.5 bg-success/15 hover:bg-success/25 border border-success/30 text-success text-[10px] font-extrabold rounded-lg"
                        >
                          Verify Organizer
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
