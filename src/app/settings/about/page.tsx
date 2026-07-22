'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import SettingsShell from '@/components/settings/SettingsShell';
import { Info, ShieldCheck, Sparkles, Trophy } from 'lucide-react';

export default function LegalAboutSettingsPage() {
  return (
    <SettingsShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Info className="h-5 w-5 text-secondary" />
            Legal & About VONK Tournaments
          </h1>
          <p className="text-xs text-muted">
            Platform architecture disclosures, phase completion roadmap, and demo terms.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary font-black text-xl">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">VONK Tournaments</h2>
              <p className="text-xs text-secondary font-bold">Compete. Conquer. Win.</p>
              <span className="text-[10px] text-muted font-mono">Frontend Demo Version 11.0.0</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-xs text-muted leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 text-secondary font-extrabold">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>100% Frontend-Only Demonstration Notice</span>
            </div>
            <p>
              VONK Tournaments is built as a 100% frontend-only Next.js App Router application. All authentication, payments, wallets, notifications, support tickets, team rosters, and result scorecards are executed and persisted strictly within local browser storage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-card-border bg-card-bg/40 flex flex-col gap-1">
              <span className="font-extrabold text-foreground">No Real Payments</span>
              <p className="text-muted leading-relaxed">
                No real money, UPI, banking gateway, or currency exchanges take place. Wallet balances and prizes are simulated demo credits.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-card-border bg-card-bg/40 flex flex-col gap-1">
              <span className="font-extrabold text-foreground">No Game Affiliation</span>
              <p className="text-muted leading-relaxed">
                VONK Tournaments is an independent custom-room tournament platform demonstration and is not affiliated with KRAFTON or BGMI.
              </p>
            </div>
          </div>

          <div className="border-t border-card-border/50 pt-4 flex flex-col gap-2">
            <h3 className="text-xs font-extrabold uppercase text-foreground">Phase Completion Progress</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 1: Core Shell</div>
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 2: Tournament Engine</div>
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 3: Player Profile</div>
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 4: Team System</div>
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 5: Demo Wallet</div>
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 6: Registration</div>
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 7: Match Center</div>
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 8: Results & Scoring</div>
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 9: Organizer System</div>
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 10: Admin Dashboard</div>
              <div className="p-2 rounded bg-success/15 border border-success/30 text-success font-bold">✓ Phase 11: Support & Settings</div>
            </div>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}
