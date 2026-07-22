'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { Sword, Key, Calendar } from 'lucide-react';

export default function AdminMatchesPage() {
  const { matches } = useAdmin();

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Sword className="h-6 w-6 text-secondary" />
            Global Matches Overview
          </h1>
          <p className="text-xs text-muted">
            Inspect scheduled round matches, review lobby room credentials release timeline, and audit check-ins.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {matches.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted border border-dashed border-card-border rounded-xl">
              No matches scheduled platform-wide.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-card-border bg-card-bg/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Sword className="h-5 w-5 text-secondary" />
                    <div className="flex flex-col">
                      <span className="font-extrabold text-foreground text-sm">Match #{m.id}</span>
                      <span className="text-[10px] text-muted">
                        Starts: {new Date(m.startTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <UserStatusBadge status={m.roomIdReleased ? 'CREDENTIALS RELEASED' : 'PENDING RELEASE'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
