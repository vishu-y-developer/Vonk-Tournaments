'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { useTournaments } from '@/providers/TournamentProvider';

interface Params {
  slug: string;
}

export default function RegistrationSuccessPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  const { getTournamentBySlug } = useTournaments();
  const tournament = getTournamentBySlug(slug);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 space-y-6 my-8 max-w-md mx-auto rounded-2xl border border-border bg-card">
      <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase text-green-400 tracking-widest">Success Confirmation</span>
        <h1 className="text-xl font-black text-foreground">Roster Registered!</h1>
        <p className="text-xs text-muted-foreground">
          Your slot is confirmed for &quot;{tournament?.title || 'BGMI Lobbies Tournament'}&quot;.
        </p>
      </div>

      <div className="w-full rounded-xl border border-border/80 bg-black/20 p-4 text-left text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-muted">Simulated Transaction:</span>
          <span className="font-bold text-foreground text-right">Confirmed (Local Ledger)</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed pt-1.5 border-t border-border/40">
          This registration and wallet debit are simulated locally inside local browser storage for demonstrating the platform flow.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Link
          href="/registrations"
          className="w-full py-2.5 bg-primary text-background font-black text-xs rounded-xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-1"
        >
          <span>View My Registrations</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href={`/tournaments/${slug}`}
          className="w-full py-2.5 border border-border bg-transparent text-muted hover:text-foreground text-xs font-bold rounded-xl transition-all"
        >
          Return to Tournament Details
        </Link>
      </div>
    </div>
  );
}
