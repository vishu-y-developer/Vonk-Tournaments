'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useSupport } from '@/providers/SupportProvider';
import DemoSupportNotice from '@/components/support/DemoSupportNotice';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { Activity, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PlatformStatusPage() {
  const { platformStatus } = useSupport();

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">
      <DemoSupportNotice />

      <Link href="/support" className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Support Hub
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-success" />
            Platform System Status
          </h1>
          <p className="text-xs text-muted">
            Simulated frontend service health monitoring and local system status.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-black">
          <CheckCircle2 className="h-4 w-4" />
          All Services Operational
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-4">
        <span className="text-xs font-mono text-muted">
          Last Updated: {new Date(platformStatus.updatedAt).toLocaleString()}
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platformStatus.services.map((s) => (
            <div
              key={s.name}
              className="p-4 rounded-xl border border-card-border bg-card-bg/40 flex justify-between items-center"
            >
              <div className="flex flex-col">
                <span className="font-extrabold text-foreground text-xs">{s.name}</span>
                <span className="text-[10px] text-muted font-mono">Response latency: {s.latencyMs}ms</span>
              </div>
              <UserStatusBadge status={s.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
